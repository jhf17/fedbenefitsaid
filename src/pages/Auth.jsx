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
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  useEffect(() => { document.title = 'Sign In | FedBenefitsAid' }, [])

  const from = location.state?.from?.pathname || '/chat'
  const flashMessage = location.state?.message || ''

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  // Sync mode prop
  useEffect(() => {
    setIsLogin(mode === 'login')
    setError('')
    setSuccess('')
  }, [mode])

  const addLeadToCRM = async (fullName, userEmail, userPhone) => {
    try {
      await fetch('/.netlify/functions/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email: userEmail, phone: userPhone, source: 'Website Signup' }),
      })
    } catch (err) {
      console.error('Failed to add lead to CRM:', err?.message || err)
      // Don't block signup — CRM lead creation is non-critical
    }
  }

  // Client-side validation
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return false
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your full name.')
      return false
    }
    if (!isLogin && phone && !/^[\d\s()+-]{7,}$/.test(phone)) {
      setError('Please enter a valid phone number.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return
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
          options: {
            emailRedirectTo: window.location.origin + '/chat',
            data: { full_name: name, phone: phone },
          },
        })
        if (error) throw error
        addLeadToCRM(name, email, phone)
        setSuccess('Account created! Check your email to confirm, then come back to log in.')
      }
    } catch (err) {
      // Make error messages more human-friendly
      const msg = err.message || 'Something went wrong.'
      if (msg.includes('Invalid login')) {
        setError('Incorrect email or password. Please try again.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before logging in.')
      } else if (msg.includes('already registered')) {
        setError('An account with this email already exists. Try logging in instead.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-auth-page="" style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <span style={styles.logoMark}>FBA</span>
          <span style={styles.logoText}>FedBenefitsAid</span>
        </div>

        {/* Flash message from redirect */}
        {flashMessage && (
          <div style={styles.flashMsg} role="status">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }}>
              <path d="M8 1.5c1.65 0 3 1.35 3 3v2.5h.5c.83 0 1.5.67 1.5 1.5v5.5c0 .83-.67 1.5-1.5 1.5H4.5c-.83 0-1.5-.67-1.5-1.5V8.5c0-.83.67-1.5 1.5-1.5H5V4.5c0-1.65 1.35-3 3-3zm0 1c-1.1 0-2 .9-2 2v2.5h4V4.5c0-1.1-.9-2-2-2z" fill="#0f172a"/>
            </svg>
            {flashMessage}
          </div>
        )}

        {/* Tab switcher */}
        <div style={styles.tabs} role="tablist" aria-label="Account action">
          <button
            role="tab"
            aria-selected={isLogin}
            onClick={() => { setIsLogin(true); setError(''); setSuccess('') }}
            style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
          >
            Log In
          </button>
          <button
            role="tab"
            aria-selected={!isLogin}
            onClick={() => { setIsLogin(false); setError(''); setSuccess('') }}
            style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
          >
            Create Account
          </button>
        </div>

        {/* Heading */}
        <div style={styles.heading}>
          <h1 style={styles.h1}>
            {isLogin ? 'Welcome back' : 'Create your free account'}
          </h1>
          <p style={styles.sub}>
            {isLogin
              ? 'Log in to access your AI federal benefits assistant.'
              : 'Get free access to the AI chat. No credit card required.'}
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div style={styles.successBox} role="status">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }}>
              <circle cx="8" cy="8" r="7" fill="none" stroke="#10b981" strokeWidth="1.5"/>
              <path d="M6.5 8.5l1.5 1.5 3-3.5" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={styles.errorBox} role="alert">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }}>
              <path d="M8 1L14.93 14H1.07L8 1z" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="8" cy="11" r="0.75" fill="#dc2626"/>
              <path d="M8 6v3" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.gov"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    required={!isLogin}
                    autoComplete="name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-phone">Phone number</label>
                  <input
                    id="auth-phone"
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'At least 8 characters'}
                required
                minLength={8}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-navy btn-full"
              style={{ marginTop: 8, padding: '13px 0', fontSize: '1rem' }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Processing…</>
                : isLogin ? 'Log In' : 'Create Free Account'
              }
            </button>
          </form>
        )}

        {/* Switch mode */}
        {!success && (
          <div style={styles.switchMode}>
            {isLogin ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setIsLogin(false); setError('') }} style={styles.switchLink}>
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setIsLogin(true); setError('') }} style={styles.switchLink}>
                  Log in
                </button>
              </>
            )}
          </div>
        )}

        {/* Reference Mode link */}
        <div style={styles.guestNote}>
          <Link to="/reference" style={{ color: '#7b1c2e', fontWeight: 500, fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            Browse the free reference guide
          </Link>
          {' '}without an account
        </div>
      </div>

      {/* Side benefits reminder */}
      <aside data-auth-aside="" style={styles.aside} className="auth-aside" aria-label="Benefits of a free account">
        <div style={styles.asideInner}>
          <div style={styles.asideTitle}>What you get with a free account</div>
          {[
            { title: 'AI Benefits Chat', desc: 'Ask anything about FERS, TSP, FEHB, FEGLI, Medicare, and Social Security. Get precise, cited answers.' },
            { title: 'Personalized to Your Situation', desc: 'The AI remembers your years of service, your goals, and your family situation to tailor every answer.' },
            { title: 'Full Reference Guide', desc: 'Access all 11 benefit categories with key numbers, rules, and pitfalls to avoid.' },
            { title: 'Free Consultant Booking', desc: 'Book a free 30-minute call with a federal retirement expert. Always free.' },
          ].map((item, i) => (
            <div key={i} style={styles.asideBenefit}>
              <span style={styles.asideAccent} />
              <div>
                <div style={styles.asideBenTitle}>{item.title}</div>
                <div style={styles.asideBenDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: '#faf9f6',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 32,
    padding: '48px 24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: 14,
    border: 'none',
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    flexShrink: 0,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  logoMark: {
    background: '#7b1c2e',
    color: 'white',
    fontWeight: 800,
    fontSize: '0.68rem',
    letterSpacing: '0.06em',
    padding: '4px 7px',
    borderRadius: 6,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  logoText: { fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif" },
  flashMsg: {
    background: '#eff6ff',
    border: '1px solid #c7d7fc',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: '0.88rem',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  tabs: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    border: 'none',
    background: 'transparent',
    borderRadius: 8,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'white',
    color: '#0f172a',
    fontWeight: 700,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: 24,
  },
  h1: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: '-0.02em',
    fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
  },
  sub: {
    fontSize: '0.88rem',
    color: '#475569',
    lineHeight: 1.5,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  successBox: {
    background: '#ecfdf5',
    border: '1.5px solid #86efac',
    borderRadius: 10,
    padding: '14px 16px',
    fontSize: '0.9rem',
    color: '#065f46',
    marginBottom: 20,
    lineHeight: 1.5,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  errorBox: {
    background: '#fef2f2',
    border: '1.5px solid #fecaca',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: '0.88rem',
    color: '#dc2626',
    marginBottom: 16,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  switchMode: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: '0.88rem',
    color: '#475569',
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  switchLink: {
    background: 'none',
    border: 'none',
    color: '#7b1c2e',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '0.88rem',
  },
  guestNote: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: '0.82rem',
    color: '#94a3b8',
    paddingTop: 16,
    borderTop: '1px solid #f1f5f9',
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  aside: {
    width: 340,
    flexShrink: 0,
  },
  asideInner: {
    background: '#ffffff',
    borderRadius: 14,
    border: 'none',
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
    padding: '32px 28px',
  },
  asideTitle: {
    fontWeight: 800,
    fontSize: '1rem',
    color: '#0f172a',
    marginBottom: 24,
    letterSpacing: '-0.01em',
    fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
  },
  asideBenefit: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
  },
  asideAccent: {
    width: 4,
    height: 36,
    background: '#7b1c2e',
    borderRadius: 2,
    flexShrink: 0,
    marginTop: 2,
  },
  asideBenTitle: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#0f172a',
    marginBottom: 3,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  asideBenDesc: {
    fontSize: '0.82rem',
    color: '#475569',
    lineHeight: 1.5,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
}


// Mobile responsive styles for Auth
if (typeof document !== 'undefined') {
  const authStyle = document.createElement('style')
  authStyle.setAttribute('data-auth-responsive', '')
  authStyle.textContent = `
    @media (max-width: 768px) {
      [data-auth-page] {
        flex-direction: column !important;
        align-items: center !important;
        padding: 24px 16px !important;
        gap: 24px !important;
      }
      [data-auth-aside] {
        width: 100% !important;
        max-width: 420px !important;
      }
    }
  `
  if (!document.querySelector('[data-auth-responsive]')) {
    document.head.appendChild(authStyle)
  }
}
