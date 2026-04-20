import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useSesiones } from '../hooks/useSesiones'
import { DayBadge } from '../components/DayBadge'
import type { SesionConSets } from '../types/database'
import './HistorialPage.css'

interface Props {
  user: User
}

function formatFecha(fecha: string) {
  const [year, month, day] = fecha.split('-')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${day} ${months[parseInt(month, 10) - 1]} ${year}`
}

function SesionItem({ sesion }: { sesion: SesionConSets }) {
  const [expanded, setExpanded] = useState(false)

  const ejerciciosUnicos = Array.from(
    new Map(sesion.sets.map((s) => [s.ejercicio_id, s.ejercicio_nombre])).values()
  )

  const totalSets = sesion.sets.length
  const pesoTotal = sesion.sets.reduce((acc, s) => acc + s.peso_lb * s.reps_completadas, 0)

  return (
    <div className="sesion-item card">
      <button className="sesion-item__header" onClick={() => setExpanded((v) => !v)} type="button">
        <div className="sesion-item__meta">
          <DayBadge dia={sesion.dia} size="sm" />
          <span className="sesion-item__fecha">{formatFecha(sesion.fecha)}</span>
        </div>
        <div className="sesion-item__stats">
          <span className="text-muted text-sm">{totalSets} sets</span>
          <span className="sesion-item__chevron" data-open={expanded}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>
      </button>

      {!expanded && (
        <p className="sesion-item__preview text-muted text-sm">
          {ejerciciosUnicos.slice(0, 3).join(' · ')}
          {ejerciciosUnicos.length > 3 ? ` +${ejerciciosUnicos.length - 3}` : ''}
        </p>
      )}

      {expanded && (
        <div className="sesion-item__body">
          {sesion.notas && (
            <p className="sesion-item__notas text-sm text-muted">
              {sesion.notas}
            </p>
          )}
          <div className="sesion-item__summary text-sm text-muted">
            Volumen total: {pesoTotal.toLocaleString()} lb·rep
          </div>
          {ejerciciosUnicos.map((nombre) => {
            const setsDeEjercicio = sesion.sets.filter((s) => s.ejercicio_nombre === nombre)
            return (
              <div key={nombre} className="sesion-ejercicio">
                <p className="sesion-ejercicio__nombre">{nombre}</p>
                <div className="sesion-ejercicio__sets">
                  {setsDeEjercicio.map((s) => (
                    <span key={s.id} className="sesion-set-chip">
                      {s.peso_lb}lb × {s.reps_completadas}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function HistorialPage({ user }: Props) {
  const { sesiones, loading, error, page, hasMore, nextPage, prevPage } = useSesiones(user.id)

  return (
    <div className="page">
      <div className="page-header">
        <h2>Historial</h2>
      </div>

      <div className="page-content">
        {loading && (
          <div className="loading-screen" style={{ height: 200 }}>
            <div className="spinner spinner-lg" />
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        {!loading && sesiones.length === 0 && !error && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p>No hay sesiones registradas todavía.</p>
          </div>
        )}

        {sesiones.map((s) => (
          <SesionItem key={s.id} sesion={s} />
        ))}

        {!loading && (sesiones.length > 0 || page > 0) && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              onClick={prevPage}
              disabled={page === 0}
              type="button"
            >
              Anterior
            </button>
            <span className="text-muted text-sm">Pág. {page + 1}</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={nextPage}
              disabled={!hasMore}
              type="button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
