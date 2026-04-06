import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

const ADMIN_EMAIL = 'jhf17@icloud.com'

const ADMIN_EMAIL = 'jhf17@icloud.com'

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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

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
          <Link to="/calculator" style={{ ...styles.link, ...(isActive('/calculator') ? styles.linkActive : {}) }}>
            Calculator
          </Link>
          <Link to="/reference" style={{ ...styles.link, ...(isActive('/reference') ? styles.linkActive : {}) }}>
            Reference Guide
          </Link>
          <Link to="/resources" style={{ ...styles.link, ...(isActive('/resources') ? styles.linkActive : {}) }}>
            Resources
          </Link>
          <Link to="/chat" style={{ ...styles.link, ...(isActive('/chat') ? styles.linkActive : {}) }}>
            AI Chat
          </Link>
          {user && user.email === ADMIN_EMAIL && (
            <Link to="/admin" style={{ ...styles.link, ...(isActive('/admin') ? styles.linkActive : {}), color: isActive('/admin') ? '#7b1c2e' : '#7b1c2e', fontWeight: 600 }}>
              Admin
            </Link>
          )}
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
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div style={{ ...styles.bar, ...(menuOpen ? styles.barOpen1 : {}) }} />
          <div style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} />
          <div style={{ ...styles.bar, ...(menuOpen ? styles.barOpen2 : {}) }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div data-mobile-menu="" style={styles.mobileMenu}>
          <Link to="/calculator" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Calculator
          </Link>
          <Link to="/reference" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Reference Guide
          </Link>
          <Link to="/resources" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Forms &amp; Resources
          </Link>
          <Link to="/chat" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            AI Chat
          </Link>
          {user && user.email === ADMIN_EMAIL && (
            <Link to="/admin" style={{ ...styles.mobileLink, color: '#7b1c2e', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          <div style={styles.mobileDivider} />
          {user ? (
            <>
              <span style={styles.mobileUserEmail}>{user.email}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm btn-full" style={{ marginTop: 8 }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-full" onClick={() => setMenuOpen(false)}>
                Log In
              </Link>
              <Link to="/signup" className="btn btn-navy btn-full" onClick={() => setMenuOpen(false)} style={{ marginTop: 8 }}>
                Get Started Free
              </Link>
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
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  inner: {
    maxWidth: 1140,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 32,
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
    color: 'white',
    fontWeight: 800,
    fontSize: '0.72rem',
    letterSpacing: '0.06em',
    padding: '4px 7px',
    borderRadius: 6,
  },
  logoText: {
    fontWeight: 800,
    fontSize: '1.05rem',
    color: '#1e3a5f',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  link: {
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#475569',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  linkActive: {
    color: '#1e3a5f',
    background: '#eff6ff',
    fontWeight: 600,
  },
  authArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  userEmail: {
    fontSize: '0.85rem',
    color: '#64748b',
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
    marginLeft: 'auto',
  },
  bar: {
    width: 22,
    height: 2,
    background: '#1e3a5f',
    borderRadius: 2,
    transition: 'all 0.2s ease',
  },
  barOpen1: { transform: 'rotate(45deg) translate(5px, 5px)' },
  barOpen2: { transform: 'rotate(-45deg) translate(5px, -5px)' },
  mobileMenu: {
    display: 'none',
    padding: '16px 24px 24px',
    borderTop: '1px solid #e2e8f0',
    flexDirection: 'column',
    gap: 4,
    background: 'white',
  },
  mobileLink: {
    display: 'block',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#334155',
    textDecoration: 'none',
  },
  mobileDivider: {
    height: 1,
    background: '#e2e8f0',
    margin: '8px 0',
  },
  mobileUserEmail: {
    fontSize: '0.85rem',
    color: '#64748b',
    padding: '4px 12px',
  },
}

// Mobile responsive via injected CSS using data attributes
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @media (max-width: 768px) {
      [data-navbar-links] { display: none !important; }
      [data-navbar-auth] { display: none !important; }
      [data-hamburger] { display: flex !important; }
      [data-mobile-menu] { display: flex !important; }
    }
  `
  document.head.appendChild(style)
}
