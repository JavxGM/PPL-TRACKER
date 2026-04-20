import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useSemanas } from '../hooks/useProgresion'
import './AnalisisPage.css'

interface Props {
  user: User
}

interface AnalisisResult {
  ok: true
  analisis: string
  semanas: number
}

interface AnalisisError {
  ok: false
  error: string
}

type AnalisisResponse = AnalisisResult | AnalisisError

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

export function AnalisisPage({ user }: Props) {
  const { semanas, loading: semanasLoading } = useSemanas(user.id)
  const semanasActuales = semanas ?? 0

  const [analisis, setAnalisis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function generarAnalisis() {
    setLoading(true)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        setError('Sesión expirada. Vuelve a iniciar sesión.')
        return
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analisis-ia`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const json = (await res.json()) as AnalisisResponse

      if (!json.ok) {
        setError(json.error)
        return
      }

      setAnalisis(json.analisis)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Análisis IA</h2>
      </div>

      <div className="page-content">
        <div className="card analisis-status">
          <div className="analisis-status__icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>

          {semanasLoading ? (
            <div className="spinner" />
          ) : (
            <div className="semanas-counter">
              <span className="semanas-num" style={{ color: '#4ade80' }}>
                {semanasActuales}
              </span>
              <span className="semanas-label">
                {semanasActuales === 1 ? 'semana' : 'semanas'} de entrenamiento
              </span>
            </div>
          )}
        </div>

        {analisis ? (
          <div className="card analisis-resultado">
            <div className="analisis-resultado__header">
              <span
                className="tag"
                style={{
                  background: 'rgba(74,222,128,0.1)',
                  color: '#4ade80',
                  border: '1px solid rgba(74,222,128,0.3)',
                }}
              >
                Análisis completado
              </span>
            </div>
            <div
              className="analisis-resultado__texto"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(analisis) }}
            />
            <button
              className="btn btn-secondary btn-sm analisis-regenerar"
              onClick={generarAnalisis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Analizando...
                </>
              ) : (
                'Regenerar análisis'
              )}
            </button>
          </div>
        ) : (
          <div className="card analisis-placeholder">
            <div className="analisis-placeholder__badge">
              <span
                className="tag"
                style={{
                  background: 'rgba(74,222,128,0.1)',
                  color: '#4ade80',
                  border: '1px solid rgba(74,222,128,0.3)',
                }}
              >
                Disponible
              </span>
            </div>
            <h3>Análisis de progresión con IA</h3>
            <p className="text-muted text-sm">
              Gemini 2.5 Flash analizará tu historial completo y te dará recomendaciones
              personalizadas de carga, progresión y recuperación.
            </p>

            <div className="analisis-coming">
              <div className="analisis-coming__item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Detección de estancamientos
              </div>
              <div className="analisis-coming__item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Recomendaciones de carga
              </div>
              <div className="analisis-coming__item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Resumen de mesociclo
              </div>
            </div>

            {error && (
              <div className="analisis-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E94560" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary analisis-btn"
              onClick={generarAnalisis}
              disabled={loading || semanasLoading}
              style={{ '--accent': '#4ade80', color: '#0F1A0F' } as React.CSSProperties}
            >
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{
                      borderTopColor: '#0F1A0F',
                      borderColor: 'rgba(15,26,15,0.3)',
                    }}
                  />
                  Analizando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generar análisis
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
