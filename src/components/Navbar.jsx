import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoMark}>FBA</span>
          <span style={styles.logoText}>FedBenefitsAid</span>
        </Link>

        {/* Desktop Nav Links */}
        <div data-navbar-links="" style={styles.links}>
          <Link to="/reference" style={{ ...styles.link, ...(isActive('/reference') ? styles.linkActive : {}) }}>
            Reference Guide
          </Link>
          <Link to="/calculator" style={{ ...styles.link, ...(isActive('/calculator') ? styles.linkActive : {}) }}>
            Calculator
          </Link>
          <Link to="/chat" style={{ ...styles.link, ...(isActive('/chat') ? styles.linkActive : {}) }}>
            AI Chat
          </Link>
        </div>

        {/* Desktop Auth */}
        <div data-navbar-auth="" style={styles.authArea}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={styles.userEmail}>{user.email?.split('@')[0]}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-navy btn-sm">Get Started Free</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          data-hamburger=""
          onClick={() => setMenuOpen(!menuOpen)}
          style={styles.hamburger}
          aria-label="Toggle menu"
        >
          <span style={styles.bar} />
          <span style={styles.bar} />
          <span style={styles.bar} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/reference" onClick={() => setMenuOpen(false)} style={styles.mobileLink}>Reference Guide</Link>
          <Link to="/calculator" onClick={() => setMenuOpen(false)} style={styles.mobileLink}>Calculator</Link>
          <Link to="/chat" onClick={() => setMenuOpen(false)} style={styles.mobileLink}>AI Chat</Link>
          <div style={styles.mobileDivider} />
          {user ? (
            <button onClick={handleLogout} style={styles.mobileLink}>Sign Out</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={styles.mobileLink}>Log In</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ ...styles.mobileLink, ...styles.mobileLinkCTA }}>Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoMark: {
    background: '#1e3a5f',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
    padding: '4px 8px',
    borderRadius: 6,
  },
  logoText: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  link: {
    padding: '6px 14px',
    borderRadius: 7,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#475569',
    transition: 'all 0.15s',
  },
  linkActive: {
    background: '#f1f5f9',
    color: '#1e3a5f',
    fontWeight: 700,
  },
  authArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  userEmail: {
    fontSize: '0.85rem',
    color: '#475569',
    fontWeight: 500,
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: 5,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  bar: {
    display: 'block',
    width: 22,
    height: 2,
    background: '#475569',
    borderRadius: 2,
  },
  mobileMenu: {
    borderTop: '1px solid #e2e8f0',
    padding: '12px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  mobileLink: {
    padding: '10px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#475569',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  mobileLinkCTA: {
    background: '#1e3a5f',
    color: '#fff',
    fontWeight: 700,
    marginTop: 4,
  },
  mobileDivider: {
    height: 1,
    background: '#e2e8f0',
    margin: '8px 0',
  },
}
