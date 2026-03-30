import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Reference from './pages/Reference'
import Chat from './pages/Chat'
import Auth from './pages/Auth'
import ProtectedRoute from './components/ProtectedRoute'

// Auth context — available throughout the app
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
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
      </Routes>
    </AuthContext.Provider>
  )
}
