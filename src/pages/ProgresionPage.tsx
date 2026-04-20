import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { RUTINA, getAllEjercicios } from '../lib/rutina'
import { useProgresion } from '../hooks/useProgresion'
import { ProgressChart } from '../components/ProgressChart'
import type { DiaRutina } from '../types/database'
import './ProgresionPage.css'

interface Props {
  user: User
}

const TODOS_LOS_EJERCICIOS = getAllEjercicios()

function getColorForEjercicio(ejercicioId: string): string {
  for (const config of Object.values(RUTINA)) {
    const found = config.ejercicios.find((e) => e.id === ejercicioId)
    if (found) return config.color
  }
  return '#E94560'
}

export function ProgresionPage({ user }: Props) {
  const [ejercicioId, setEjercicioId] = useState(TODOS_LOS_EJERCICIOS[0].id)
  const { datos, loading, error } = useProgresion(user.id, ejercicioId)

  const color = getColorForEjercicio(ejercicioId)
  const ejercicioNombre = TODOS_LOS_EJERCICIOS.find((e) => e.id === ejercicioId)?.nombre ?? ''

  const pesoMax = datos.length > 0 ? Math.max(...datos.map((d) => d.peso_max)) : null
  const pesoReciente = datos.length > 0 ? datos[datos.length - 1].peso_max : null
  const mejora =
    datos.length >= 2
      ? datos[datos.length - 1].peso_max - datos[datos.length - 2].peso_max
      : null

  return (
    <div className="page">
      <div className="page-header">
        <h2>Progresión</h2>
      </div>

      <div className="page-content">
        <div className="card">
          <label className="selector-label" htmlFor="ejercicio-select">Ejercicio</label>
          <select
            id="ejercicio-select"
            className="input ejercicio-select"
            value={ejercicioId}
            onChange={(e) => setEjercicioId(e.target.value)}
          >
            {(Object.keys(RUTINA) as DiaRutina[]).map((dia) => (
              <optgroup key={dia} label={`${RUTINA[dia].label} — ${RUTINA[dia].descripcion}`}>
                {RUTINA[dia].ejercicios.map((ej) => (
                  <option key={ej.id} value={ej.id}>
                    {ej.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {datos.length > 0 && (
          <div className="progresion-stats">
            <div className="stat-pill card">
              <span className="stat-pill__value" style={{ color }}>
                {pesoMax} lb
              </span>
              <span className="stat-pill__label">Máximo histórico</span>
            </div>
            <div className="stat-pill card">
              <span className="stat-pill__value" style={{ color }}>
                {pesoReciente} lb
              </span>
              <span className="stat-pill__label">Última sesión</span>
            </div>
            {mejora !== null && (
              <div className="stat-pill card">
                <span
                  className="stat-pill__value"
                  style={{ color: mejora >= 0 ? '#4ade80' : '#E94560' }}
                >
                  {mejora >= 0 ? '+' : ''}{mejora} lb
                </span>
                <span className="stat-pill__label">vs anterior</span>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <p className="chart-title">{ejercicioNombre} — Peso máximo por sesión</p>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ borderTopColor: color }} />
            </div>
          ) : error ? (
            <p className="error-msg">{error}</p>
          ) : (
            <ProgressChart datos={datos} color={color} />
          )}
        </div>
      </div>
    </div>
  )
}
