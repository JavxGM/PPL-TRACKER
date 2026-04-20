import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { NavBar } from './components/NavBar'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { WorkoutPage } from './pages/WorkoutPage'
import { HistorialPage } from './pages/HistorialPage'

// Lazy: páginas con recharts o análisis IA — se cargan solo cuando el usuario navega a ellas
const ProgresionPage = lazy(() =>
  import('./pages/ProgresionPage').then((m) => ({ default: m.ProgresionPage }))
)
const AnalisisPage = lazy(() =>
  import('./pages/AnalisisPage').then((m) => ({ default: m.AnalisisPage }))
)

function PageFallback() {
  return (
    <div className="loading-screen">
      <div className="spinner spinner-lg" style={{ borderTopColor: '#4ade80' }} />
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" style={{ borderTopColor: '#E94560' }} />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <BrowserRouter basename="/PPL-TRACKER">
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/workout" element={<WorkoutPage user={user} />} />
        <Route path="/historial" element={<HistorialPage user={user} />} />
        <Route
          path="/progresion"
          element={
            <Suspense fallback={<PageFallback />}>
              <ProgresionPage user={user} />
            </Suspense>
          }
        />
        <Route
          path="/analisis"
          element={
            <Suspense fallback={<PageFallback />}>
              <AnalisisPage user={user} />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NavBar />
    </BrowserRouter>
  )
}

export default App
