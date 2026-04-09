import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext, Suspense, lazy } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './pages/Landing'
const Reference = lazy(() => import('./pages/Reference'))
const Chat = lazy(() => import('./pages/Chat'))
import Auth from './pages/Auth'
const Course = lazy(() => import('./pages/Course'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Calculator = lazy(() => import('./pages/Calculator'))
const Resources = lazy(() => import('./pages/Resources'))
const Admin = lazy(() => import('./pages/Admin'))
const Assessment = lazy(() => import('./pages/Assessment'))
const Calculators = lazy(() => import('./pages/Tools'))
const FEGLICalculator = lazy(() => import('./pages/FEGLICalculator'))
import Disclaimer from './pages/Disclaimer'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Consultation from './pages/Consultation'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'

// Auth context — available throughout the app
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function NotFound() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.04em', marginBottom: 12 }}>404</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Page not found</h1>
        <p style={{ color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist. Head back to the reference guide or the home page.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className="btn btn-navy">Back to Home</a>
          <a href="/reference" className="btn btn-outline">Reference Guide</a>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-dark" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null }}>
      <ErrorBoundary>
      <Navbar />
      <Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><div style={{width:40,height:40,border:'4px solid #e5e7eb',borderTop:'4px solid #7b1c2e',borderRadius:'50%',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reference" element={<Reference />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <Course />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/quiz/:topicId"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/calculators/fegli" element={<FEGLICalculator />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <Footer />
      </ErrorBoundary>
    </AuthContext.Provider>
  )
}
