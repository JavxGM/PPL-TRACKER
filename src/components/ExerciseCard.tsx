import { useState } from 'react'
import type { Ejercicio } from '../lib/rutina'
import { getImageUrl } from '../lib/rutina'
import './ExerciseCard.css'

export interface SetDraft {
  set_num: number
  peso_lb: string
  reps_completadas: string
}

interface Props {
  ejercicio: Ejercicio
  accentColor: string
  sets: SetDraft[]
  onChange: (sets: SetDraft[]) => void
}

function getInitials(nombre: string): string {
  const words = nombre.trim().split(/\s+/)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function ExerciseCard({ ejercicio, accentColor, sets, onChange }: Props) {
  const [imgError, setImgError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  function addSet() {
    navigator.vibrate?.(10)
    const last = sets[sets.length - 1]
    onChange([
      ...sets,
      {
        set_num: sets.length + 1,
        peso_lb: last?.peso_lb ?? '',
        reps_completadas: last?.reps_completadas ?? '',
      },
    ])
  }

  function removeSet(index: number) {
    const updated = sets
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, set_num: i + 1 }))
    onChange(updated)
  }

  function updateSet(index: number, field: keyof SetDraft, value: string) {
    const updated = sets.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    )
    onChange(updated)
  }

  return (
    <>
      <div className="exercise-card card" style={{ '--accent': accentColor } as React.CSSProperties}>
        <div className="exercise-card__header">
          <button
            className="exercise-card__img-wrap exercise-card__img-btn"
            onClick={() => setModalOpen(true)}
            type="button"
            aria-label={`Ver detalles de ${ejercicio.nombre}`}
          >
            {!imgError ? (
              <img
                src={getImageUrl(ejercicio)}
                alt={ejercicio.nombre}
                className="exercise-card__img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="exercise-card__img-fallback exercise-card__img-initials"
                style={{ background: accentColor + '22', color: accentColor }}
              >
                {getInitials(ejercicio.nombre)}
              </div>
            )}
            <div className="exercise-card__img-zoom" style={{ color: accentColor }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>
          </button>
          <div className="exercise-card__info">
            <h3>{ejercicio.nombre}</h3>
            <span className="text-muted text-sm">{sets.length} {sets.length === 1 ? 'set' : 'sets'}</span>
          </div>
        </div>

        {sets.length > 0 && (
          <div className="exercise-card__sets">
            <div className="sets-header">
              <span>Set</span>
              <span>Peso (lb)</span>
              <span>Reps</span>
              <span></span>
            </div>
            {sets.map((s, i) => (
              <div key={i} className="set-row">
                <span className="set-num" style={{ color: accentColor }}>{s.set_num}</span>
                <input
                  className="input input-number"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="2.5"
                  placeholder="0"
                  value={s.peso_lb}
                  onChange={(e) => updateSet(i, 'peso_lb', e.target.value)}
                />
                <input
                  className="input input-number"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={s.reps_completadas}
                  onChange={(e) => updateSet(i, 'reps_completadas', e.target.value)}
                />
                <button
                  className="btn-remove"
                  onClick={() => removeSet(i)}
                  aria-label="Eliminar set"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-secondary btn-sm exercise-card__add-btn"
          onClick={addSet}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar set
        </button>
      </div>

      {modalOpen && (
        <div className="ex-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="ex-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ex-modal__img-wrap">
              {!imgError ? (
                <img
                  src={getImageUrl(ejercicio)}
                  alt={ejercicio.nombre}
                  className="ex-modal__img"
                />
              ) : (
                <div
                  className="ex-modal__img-fallback"
                  style={{ background: accentColor + '22', color: accentColor }}
                >
                  {getInitials(ejercicio.nombre)}
                </div>
              )}
              <button
                className="ex-modal__close"
                onClick={() => setModalOpen(false)}
                type="button"
                aria-label="Cerrar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="ex-modal__body">
              <h2 className="ex-modal__title" style={{ color: accentColor }}>
                {ejercicio.nombre}
              </h2>

              {ejercicio.consejos && ejercicio.consejos.length > 0 && (
                <div className="ex-modal__consejos">
                  <p className="ex-modal__consejos-label">Consejos de ejecución</p>
                  <ul>
                    {ejercicio.consejos.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
