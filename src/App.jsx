import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Reference from './pages/Reference'
import Chat from './pages/Chat'
import Auth from './pages/Auth'
import Calculator from './pages/Calculator'
import ProtectedRoute from './components/ProtectedRoute'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function NotFound() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.04em', marginBottom: 12 }}>404</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Page not found</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <a href="/" style={{ background: '#1e3a5f', color: '#fff', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
          Go Home
        </a>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reference" element={<Reference />} />
        <Route path="/reference/:category" element={<Reference />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthContext.Provider>
  )
}
