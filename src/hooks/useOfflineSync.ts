import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getAllPending, remove, type SesionPendienteRow } from '../lib/offlineQueue'

interface UseOfflineSyncReturn {
  /** Número de sesiones pendientes de sincronizar para este usuario. */
  pendingCount: number
}

/**
 * Monta la lógica de sincronización offline→Supabase.
 *
 * - Al montar: si hay red y hay items en la queue, los sincroniza.
 * - Escucha `window.online`: cuando se recupera la red, sincroniza la queue.
 * - Si Supabase devuelve error de datos (no de red), deja el item en la queue
 *   y loguea el error para no perder datos.
 */
export function useOfflineSync(userId: string): UseOfflineSyncReturn {
  const [pendingCount, setPendingCount] = useState(0)
  // Evita correr sincronizaciones en paralelo
  const syncingRef = useRef(false)

  const refreshCount = useCallback(async () => {
    try {
      const pending = await getAllPending(userId)
      setPendingCount(pending.length)
    } catch {
      // IndexedDB no disponible en este contexto — no crítico
    }
  }, [userId])

  const syncQueue = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return
    syncingRef.current = true

    try {
      const pending = await getAllPending(userId)
      if (pending.length === 0) {
        setPendingCount(0)
        return
      }

      for (const item of pending) {
        await syncOne(item)
      }

      // Refresca el contador tras sincronizar
      await refreshCount()
    } finally {
      syncingRef.current = false
    }
  }, [userId, refreshCount])

  useEffect(() => {
    // Carga inicial del contador
    refreshCount()

    // Si hay red al montar, intenta sincronizar inmediatamente
    if (navigator.onLine) {
      syncQueue()
    }

    // Listener para cuando se recupera la conexión
    const handleOnline = () => {
      syncQueue()
    }

    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [syncQueue, refreshCount])

  return { pendingCount }
}

// ─── Lógica de sincronización de una sesión ───────────────────────────────────

async function syncOne(item: SesionPendienteRow): Promise<void> {
  const { sesion_id, user_id, fecha, dia, notas, sets, id: queueId } = item

  // ── 1. Insertar sesión (idempotente por UUID explícito) ──────────────────
  const { error: sesErr } = await supabase
    .from('sesiones')
    .insert({ id: sesion_id, user_id, fecha, dia, notas: notas || null })

  if (sesErr) {
    // Código 23505 = unique_violation → la sesión ya existe, continúa con sets
    if (sesErr.code !== '23505') {
      console.error('[offline-sync] Error al insertar sesión:', sesErr.message, { sesion_id })
      // Deja el item en la queue para reintentar la próxima vez
      return
    }
  }

  // ── 2. Insertar sets ─────────────────────────────────────────────────────
  const setsToInsert = sets.map((s) => ({
    user_id,
    sesion_id,
    ejercicio_id: s.ejercicio_id,
    ejercicio_nombre: s.ejercicio_nombre,
    set_num: s.set_num,
    peso_lb: s.peso_lb,
    reps_completadas: s.reps_completadas,
  }))

  const { error: setsErr } = await supabase.from('sets').insert(setsToInsert)

  if (setsErr) {
    // 23505 = sets ya insertados (reintento previo parcial) → igual elimina de queue
    if (setsErr.code !== '23505') {
      console.error('[offline-sync] Error al insertar sets:', setsErr.message, { sesion_id })
      // No eliminamos de la queue — los sets fallaron, se reintentará
      // Pero la sesión ya está: en el próximo reintento el 23505 de sesión
      // será ignorado y se volverán a intentar los sets.
      return
    }
  }

  // ── 3. Eliminar de la queue solo si todo fue OK ──────────────────────────
  if (queueId !== undefined) {
    await remove(queueId)
  }
}
