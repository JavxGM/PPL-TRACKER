import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { enqueue } from '../lib/offlineQueue'
import type { Sesion, SesionConSets, SetEntrenamiento, DiaRutina } from '../types/database'

const PAGE_SIZE = 20

interface UseSesionesReturn {
  sesiones: SesionConSets[]
  loading: boolean
  error: string | null
  page: number
  hasMore: boolean
  nextPage: () => void
  prevPage: () => void
  refresh: () => void
}

export function useSesiones(userId: string): UseSesionesReturn {
  const [sesiones, setSesiones] = useState<SesionConSets[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data: sesData, error: sesErr, count } = await supabase
      .from('sesiones')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('fecha', { ascending: false })
      .range(from, to)

    if (sesErr) {
      setError(sesErr.message)
      setLoading(false)
      return
    }

    const rows = (sesData ?? []) as Sesion[]

    if (rows.length === 0) {
      setSesiones([])
      setHasMore(false)
      setLoading(false)
      return
    }

    const sesionIds = rows.map((s) => s.id)

    const { data: setsData, error: setsErr } = await supabase
      .from('sets')
      .select('*')
      .in('sesion_id', sesionIds)
      .order('set_num', { ascending: true })

    if (setsErr) {
      setError(setsErr.message)
      setLoading(false)
      return
    }

    const setsMap = new Map<string, SetEntrenamiento[]>()
    for (const s of (setsData ?? []) as SetEntrenamiento[]) {
      const arr = setsMap.get(s.sesion_id) ?? []
      arr.push(s)
      setsMap.set(s.sesion_id, arr)
    }

    const merged: SesionConSets[] = rows.map((s) => ({
      ...s,
      sets: setsMap.get(s.id) ?? [],
    }))

    setSesiones(merged)
    setHasMore((count ?? 0) > to + 1)
    setLoading(false)
  }, [userId, page])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    sesiones,
    loading,
    error,
    page,
    hasMore,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(0, p - 1)),
    refresh: fetch,
  }
}

interface GuardarSesionPayload {
  userId: string
  dia: DiaRutina
  notas: string
  sets: Array<{
    ejercicio_id: string
    ejercicio_nombre: string
    set_num: number
    peso_lb: number
    reps_completadas: number
  }>
}

interface GuardarSesionResult {
  /** null = éxito, string = mensaje de error */
  error: string | null
  /** true cuando la sesión se guardó localmente por falta de conexión */
  offline: boolean
}

export async function guardarSesion(payload: GuardarSesionPayload): Promise<GuardarSesionResult> {
  const { userId, dia, notas, sets } = payload

  const fecha = new Date().toISOString().split('T')[0]
  // UUID generado en cliente — garantiza idempotencia al sincronizar
  const sesionId = crypto.randomUUID()

  // ── Sin red: guardar en IndexedDB y salir ────────────────────────────────
  if (!navigator.onLine) {
    await enqueue({
      sesion_id: sesionId,
      user_id: userId,
      fecha,
      dia,
      notas: notas || null,
      sets,
    })
    return { error: null, offline: true }
  }

  // ── Con red: intentar Supabase, fallback a IndexedDB si falla por red ───
  try {
    const { error: sesErr } = await supabase
      .from('sesiones')
      .insert({ id: sesionId, user_id: userId, fecha, dia, notas: notas || null })

    if (sesErr) {
      // Error de red del lado del cliente (fetch falló antes de llegar)
      if (isNetworkError(sesErr.message)) {
        await enqueue({
          sesion_id: sesionId,
          user_id: userId,
          fecha,
          dia,
          notas: notas || null,
          sets,
        })
        return { error: null, offline: true }
      }
      return { error: sesErr.message, offline: false }
    }

    const setsToInsert = sets.map((s) => ({
      user_id: userId,
      sesion_id: sesionId,
      ejercicio_id: s.ejercicio_id,
      ejercicio_nombre: s.ejercicio_nombre,
      set_num: s.set_num,
      peso_lb: s.peso_lb,
      reps_completadas: s.reps_completadas,
    }))

    const { error: setsErr } = await supabase.from('sets').insert(setsToInsert)

    if (setsErr) {
      // Revertir sesión y evaluar si es error de red
      await supabase.from('sesiones').delete().eq('id', sesionId)

      if (isNetworkError(setsErr.message)) {
        // La sesión ya fue revertida — guardar todo en offline queue
        await enqueue({
          sesion_id: sesionId,
          user_id: userId,
          fecha,
          dia,
          notas: notas || null,
          sets,
        })
        return { error: null, offline: true }
      }
      return { error: setsErr.message, offline: false }
    }

    return { error: null, offline: false }
  } catch (err) {
    // fetch() lanzó excepción (sin conexión, CORS total, etc.)
    await enqueue({
      sesion_id: sesionId,
      user_id: userId,
      fecha,
      dia,
      notas: notas || null,
      sets,
    })
    return { error: null, offline: true }
  }
}

/**
 * Heurística para distinguir errores de red de errores de datos.
 * Supabase no tiene un campo `type` estable en errores de red,
 * así que inspeccionamos el mensaje.
 */
function isNetworkError(message: string): boolean {
  const msg = message.toLowerCase()
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('connection') ||
    msg.includes('fetch') ||
    msg.includes('timeout')
  )
}
