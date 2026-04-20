import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { RUTINA } from '../lib/rutina'
import { guardarSesion } from '../hooks/useSesiones'
import { ExerciseCard } from '../components/ExerciseCard'
import { DayBadge } from '../components/DayBadge'
import type { DiaRutina } from '../types/database'
import type { SetDraft } from '../components/ExerciseCard'
import './WorkoutPage.css'

type SetsDraft = Record<string, SetDraft[]>

const DIAS_VALIDOS: DiaRutina[] = ['lun', 'mar', 'mie', 'jue', 'vie']

interface Props {
  user: User
}

export function WorkoutPage({ user }: Props) {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const diaParam = params.get('dia') as DiaRutina | null
  const dia: DiaRutina = diaParam && DIAS_VALIDOS.includes(diaParam) ? diaParam : 'lun'

  const config = RUTINA[dia]

  const [setsDraft, setSetsDraft] = useState<SetsDraft>({})
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)
  const [guardadoOffline, setGuardadoOffline] = useState(false)

  useEffect(() => {
    setSetsDraft({})
    setNotas('')
    setError(null)
    setGuardado(false)
    setGuardadoOffline(false)
  }, [dia])

  function handleSetsChange(ejercicioId: string, sets: SetDraft[]) {
    setSetsDraft((prev) => ({ ...prev, [ejercicioId]: sets }))
  }

  function buildSetsPayload() {
    const result: Array<{
      ejercicio_id: string
      ejercicio_nombre: string
      set_num: number
      peso_lb: number
      reps_completadas: number
    }> = []

    for (const ejercicio of config.ejercicios) {
      const sets = setsDraft[ejercicio.id] ?? []
      for (const s of sets) {
        const peso = parseFloat(s.peso_lb)
        const reps = parseInt(s.reps_completadas, 10)
        if (isNaN(peso) || isNaN(reps) || peso < 0 || reps < 0) continue
        result.push({
          ejercicio_id: ejercicio.id,
          ejercicio_nombre: ejercicio.nombre,
          set_num: s.set_num,
          peso_lb: peso,
          reps_completadas: reps,
        })
      }
    }

    return result
  }

  async function handleGuardar() {
    setError(null)
    const sets = buildSetsPayload()

    if (sets.length === 0) {
      setError('Agrega al menos un set antes de guardar.')
      return
    }

    setGuardando(true)

    const { error: err, offline } = await guardarSesion({
      userId: user.id,
      dia,
      notas,
      sets,
    })

    setGuardando(false)

    if (err) {
      setError(err)
    } else if (offline) {
      navigator.vibrate?.(10)
      setGuardadoOffline(true)
      // Dejamos al usuario en la página un poco más para que lea el mensaje,
      // luego lo llevamos al home (el historial no mostrará la sesión aún)
      setTimeout(() => navigate('/'), 2500)
    } else {
      navigator.vibrate?.(10)
      setGuardado(true)
      setTimeout(() => navigate('/historial'), 1500)
    }
  }

  const totalSets = Object.values(setsDraft).reduce((acc, s) => acc + s.length, 0)

  return (
    <div className="page" style={{ '--accent': config.color } as React.CSSProperties}>
      <div className="page-header">
        <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} type="button" aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 style={{ color: config.color }}>{config.descripcion}</h2>
        <DayBadge dia={dia} />
      </div>

      <div className="page-content">
        {config.ejercicios.map((ej) => (
          <ExerciseCard
            key={ej.id}
            ejercicio={ej}
            accentColor={config.color}
            sets={setsDraft[ej.id] ?? []}
            onChange={(sets) => handleSetsChange(ej.id, sets)}
          />
        ))}

        <div className="card">
          <label className="notas-label" htmlFor="notas">Notas de la sesión</label>
          <textarea
            id="notas"
            className="input notas-input"
            placeholder="Cómo te sentiste, PR alcanzado, ajustes..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
          />
        </div>

        {error && <p className="error-msg">{error}</p>}
        {guardado && <p className="success-msg">Sesion guardada. Redirigiendo...</p>}
        {guardadoOffline && (
          <p className="offline-msg">
            Guardado sin conexion — se sincronizara automaticamente cuando haya internet.
          </p>
        )}

        <div className="workout-footer">
          {totalSets > 0 && (
            <p className="workout-summary text-muted text-sm">
              {totalSets} {totalSets === 1 ? 'set registrado' : 'sets registrados'}
            </p>
          )}
          <button
            className="btn btn-primary"
            onClick={handleGuardar}
            disabled={guardando || guardado}
            type="button"
          >
            {guardando ? (
              <>
                <span className="spinner" />
                Guardando...
              </>
            ) : (
              'Guardar sesión'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
