import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Reference from './pages/Reference'
import Chat from './pages/Chat'
import Auth from './pages/Auth'
import Course from './pages/Course'
import Quiz from './pages/Quiz'
import Calculator from './pages/Calculator'
import Resources from './pages/Resources'
import Admin from './pages/Admin'
import Assessment from './pages/Assessment'
import Disclaimer from './pages/Disclaimer'
import ProtectedRoute from './components/ProtectedRoute'

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
      <Navbar />
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
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthContext.Provider>
  )
}
