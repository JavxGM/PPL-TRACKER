import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface PuntoProgresion {
  fecha: string
  peso_max: number
}

interface UseProgresionReturn {
  datos: PuntoProgresion[]
  loading: boolean
  error: string | null
}

export function useProgresion(userId: string, ejercicioId: string): UseProgresionReturn {
  const [datos, setDatos] = useState<PuntoProgresion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ejercicioId) return

    setLoading(true)
    setError(null)

    supabase
      .from('sets')
      .select(`
        peso_lb,
        sesiones!inner ( fecha )
      `)
      .eq('user_id', userId)
      .eq('ejercicio_id', ejercicioId)
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
          setLoading(false)
          return
        }

        const byFecha = new Map<string, number>()

        type JoinRow = { peso_lb: number; sesiones: { fecha: string } | { fecha: string }[] }
        for (const row of (data ?? []) as unknown as JoinRow[]) {
          const sesionData = Array.isArray(row.sesiones) ? row.sesiones[0] : row.sesiones
          const fecha = sesionData?.fecha ?? ''
          if (!fecha) continue
          const current = byFecha.get(fecha) ?? 0
          if (row.peso_lb > current) {
            byFecha.set(fecha, row.peso_lb)
          }
        }

        const puntos: PuntoProgresion[] = Array.from(byFecha.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([fecha, peso_max]) => ({ fecha, peso_max }))

        setDatos(puntos)
        setLoading(false)
      })
  }, [userId, ejercicioId])

  return { datos, loading, error }
}

interface UseSemanasReturn {
  semanas: number | null
  loading: boolean
}

export function useSemanas(userId: string): UseSemanasReturn {
  const [semanas, setSemanas] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .rpc('semanas_entrenamiento', { p_user_id: userId })
      .then(({ data }) => {
        setSemanas(typeof data === 'number' ? data : 0)
        setLoading(false)
      })
  }, [userId])

  return { semanas, loading }
}
