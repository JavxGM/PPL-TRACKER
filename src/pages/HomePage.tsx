import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { getDiaHoy, RUTINA } from '../lib/rutina'
import { useSemanas } from '../hooks/useProgresion'
import { useOfflineSync } from '../hooks/useOfflineSync'
import { supabase } from '../lib/supabase'
import { DayBadge } from '../components/DayBadge'
import type { DiaRutina } from '../types/database'
import './HomePage.css'

const DIAS_SEMANA: { key: DiaRutina; label: string }[] = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
]

interface Props {
  user: User
}

export function HomePage({ user }: Props) {
  const navigate = useNavigate()
  const diaHoy = getDiaHoy()
  const { semanas, loading: loadingSemanas } = useSemanas(user.id)
  const { pendingCount } = useOfflineSync(user.id)

  async function handleLogout() {
    if (!window.confirm('¿Cerrar sesión?')) return
    await supabase.auth.signOut()
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>PPL Tracker</h2>
        <button className="btn btn-ghost" onClick={handleLogout} type="button">
          Salir
        </button>
      </div>

      <div className="page-content">
        {diaHoy ? (
          <div
            className="today-card card"
            style={{ '--accent': RUTINA[diaHoy].color } as React.CSSProperties}
            onClick={() => navigate(`/workout?dia=${diaHoy}`)}
          >
            <div className="today-card__top">
              <DayBadge dia={diaHoy} />
              <span className="today-label">Hoy</span>
            </div>
            <h2 className="today-card__title">{RUTINA[diaHoy].descripcion}</h2>
            <p className="today-card__sub">{RUTINA[diaHoy].ejercicios.length} ejercicios</p>
            <button className="btn btn-primary today-card__btn" type="button">
              Empezar workout
            </button>
          </div>
        ) : (
          <div className="rest-card card">
            <h2>Día de descanso</h2>
            <p className="text-muted text-sm">No hay entrenamiento programado hoy. Descansa y recupera.</p>
          </div>
        )}

        <div className="week-grid">
          {DIAS_SEMANA.map(({ key }) => {
            const config = RUTINA[key]
            const isToday = diaHoy === key
            return (
              <button
                key={key}
                className={`week-day card ${isToday ? 'today' : ''}`}
                style={{ '--accent': config.color } as React.CSSProperties}
                onClick={() => navigate(`/workout?dia=${key}`)}
                type="button"
              >
                <span className="week-day__label" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className="week-day__desc">{config.descripcion}</span>
              </button>
            )
          })}
        </div>

        <div className="stats-row">
          <div className="stat-card card">
            <span className="stat-card__value">
              {loadingSemanas ? '–' : semanas ?? 0}
            </span>
            <span className="stat-card__label">Semanas</span>
          </div>
          <div className="stat-card card">
            <span className="stat-card__value">
              {!loadingSemanas && (semanas ?? 0) >= 3 ? (
                <span style={{ color: '#4ade80', fontSize: '1rem' }}>Activo</span>
              ) : '–'}
            </span>
            <span className="stat-card__label">Analisis IA</span>
          </div>
        </div>

        {pendingCount > 0 && !navigator.onLine && (
          <div className="offline-banner">
            {pendingCount} {pendingCount === 1 ? 'sesion pendiente' : 'sesiones pendientes'} de sincronizar — se enviaran cuando haya conexion.
          </div>
        )}
      </div>
    </div>
  )
}
