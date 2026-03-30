import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

export default function Auth({ mode = 'login' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const from = location.state?.from?.pathname || '/chat'
  const flashMessage = location.state?.message || ''
  
  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  useEffect(() => {
    setIsLogin(mode === 'login')
    setError('')
    setSuccess('')
  }, [mode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate(from, { replace: true })
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + '/chat' },
        })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then come back to log in.')
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong.'
      if (msg.includes('Invalid login')) setError('Incorrect email or password. Please try again.')
      else if (msg.includes('Email not confirmed')) setError('Please check your email and click the confirmation link before logging in.')
      else if (msg.includes('already registered')) setError('An account with this email already exists. Try logging in instead.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <span style={styles.logo}>🏛️</span>
          <span style={styles.logoText}>FedBenefitsAid</span>
        </div>
        {flashMessage && <div style={styles.flashMsg}>🔒 {flashMessage}</div>}
        <div style={styles.tabs}>
          <button onClick={() => { setIsLogin(true); setError(''); setSuccess('') }} style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}>Log In</button>
          <button onClick={() => { setIsLogin(false); setError(''); setSuccess('') }} style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}>Create Account</button>
        </div>
        <div style={styles.heading}>
          <h1 style={styles.h1}>{isLogin ? 'Welcome back' : 'Create your free account'}</h1>
          <p style={styles.sub}>{isLogin ? 'Log in to access your AI federal benefits assistant.' : 'Get free access to the AI chat. No credit card required.'}</p>
        </div>
        {success && <div style={styles.successBox}>✅ {success}</div>}
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        {!success && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.gov" required autoFocus autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder={isLogin ? '••••••••' : 'At least 8 characters'} required minLength={6} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-navy btn-full" style={{ marginTop: 8, padding: '13px 0', fontSize: '1rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Processing…</> : isLogin ? 'Log In' : 'Create Free Account'}
            </button>
          </form>
        )}
        {!success && (
          <div style={styles.switchMode}>
            {isLogin ? (<>Don't have an account?{' '}<button onClick={() => { setIsLogin(false); setError('') }} style={styles.switchLink}>Sign up free</button></>) : (<>Already have an account?{' '}<button onClick={() => { setIsLogin(true); setError('') }} style={styles.switchLink}>Log in</button></>)}
          </div>
        )}
        <div style={styles.guestNote}>
          <Link to="/reference" style={{ color: '#2563eb', fontWeight: 500 }}>Browse the free reference guide</Link>{' '}without an account
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg, #f0f4ff 0%, #f8fafc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '48px 24px' },
  card: { background: 'white', borderRadius: 20, border: '1.5px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '40px 36px', width: '100%', maxWidth: 420, flexShrink: 0 },
  logoWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  logo: { fontSize: '1.6rem' },
  logoText: { fontWeight: 800, fontSize: '1.1rem', color: '#1e3a5f' },
  flashMsg: { background: '#eff6ff', border: '1px solid #c7d7fc', borderRadius: 10, padding: '10px 14px', fontSize: '0.88rem', color: '#1e3a5f', marginBottom: 20, textAlign: 'center' },
  tabs: { display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 24 },
  tab: { flex: 1, padding: '8px 0', border: 'none', background: 'transparent', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500, color: '#64748b', cursor: 'pointer' },
  tabActive: { background: 'white', color: '#1e3a5f', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  heading: { textAlign: 'center', marginBottom: 24 },
  h1: { fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' },
  sub: { fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 },
  successBox: { background: '#ecfdf5', border: '1.5px solid #86efac', borderRadius: 10, padding: '14px 16px', fontSize: '0.9rem', color: '#065f46', marginBottom: 20, lineHeight: 1.5 },
  errorBox: { background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '12px 16px', fontSize: '0.88rem', color: '#dc2626', marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  switchMode: { textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: '#64748b' },
  switchLink: { background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem' },
  guestNote: { textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: '#94a3b8', paddingTop: 16, borderTop: '1px solid #f1f5f9' },
}
