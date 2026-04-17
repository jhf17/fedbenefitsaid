import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

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

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [menuOpen])

  return (
    <nav style={styles.nav} aria-label="Main navigation">
      <a href="#main-content" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden', zIndex: 9999, padding: '12px 24px', background: '#1e3a5f', color: 'white', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', borderRadius: '0 0 8px 0' }} onFocus={(e) => { e.target.style.position = 'fixed'; e.target.style.left = '0'; e.target.style.top = '0'; e.target.style.width = 'auto'; e.target.style.height = 'auto'; e.target.style.overflow = 'visible'; }} onBlur={(e) => { e.target.style.position = 'absolute'; e.target.style.left = '-9999px'; e.target.style.width = '1px'; e.target.style.height = '1px'; e.target.style.overflow = 'hidden'; }}>Skip to main content</a>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo} aria-label="FedBenefitsAid — go to homepage">
          <span style={styles.logoText}>
            <span style={styles.logoFed}>Fed</span>
            <span style={styles.logoHighlight}>Benefits</span>
            <span style={styles.logoAid}>Aid</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div data-navbar-links="" style={styles.links}>
          <Link to="/assessment" style={{ ...styles.link, ...(isActive('/assessment') ? { ...styles.linkActive, color: '#7b1c2e', background: '#fef2f2' } : {}) }} aria-current={isActive('/assessment') ? 'page' : undefined}>
            Assessment
          </Link>
          <Link to="/calculators" style={{ ...styles.link, ...(isActive('/calculators') ? styles.linkActive : {}) }} aria-current={isActive('/calculators') ? 'page' : undefined}>
            Calculators
          </Link>
          <Link to="/reference" style={{ ...styles.link, ...(isActive('/reference') ? styles.linkActive : {}) }} aria-current={isActive('/reference') ? 'page' : undefined}>
            Benefits Library
          </Link>
          <Link to="/resources" style={{ ...styles.link, ...(isActive('/resources') ? styles.linkActive : {}) }} aria-current={isActive('/resources') ? 'page' : undefined}>
            Forms & Links
          </Link>
          <Link to="/vera-vsip" style={{ ...styles.link, ...(isActive('/vera-vsip') ? styles.linkActive : {}) }} aria-current={isActive('/vera-vsip') ? 'page' : undefined}>
            VERA/VSIP
          </Link>
          <Link to="/chat" style={{ ...styles.link, ...(isActive('/chat') ? styles.linkActive : {}) }} aria-current={isActive('/chat') ? 'page' : undefined}>
            Chat
          </Link>
          {/* T2.5: "Meeting" → "Book a Call", filled maroon primary button */}
          <Link to="/consultation" style={styles.navCta} aria-current={isActive('/consultation') ? 'page' : undefined}>
            Book a Call
          </Link>
          {user && user.email === ADMIN_EMAIL && (
            <Link to="/admin" style={{ ...styles.link, ...(isActive('/admin') ? styles.linkActive : {}), color: isActive('/admin') ? '#7b1c2e' : '#7b1c2e', fontWeight: 600 }} aria-current={isActive('/admin') ? 'page' : undefined}>
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
              <Link to="/signup" style={styles.ctaButton} className="btn btn-sm">Get Started Free</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          data-hamburger=""
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
        >
          <div style={{ ...styles.bar, ...(menuOpen ? styles.barOpen1 : {}) }} aria-hidden="true" />
          <div style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} aria-hidden="true" />
          <div style={{ ...styles.bar, ...(menuOpen ? styles.barOpen2 : {}) }} aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div id="mobile-nav-menu" data-mobile-menu="" style={styles.mobileMenu} role="navigation" aria-label="Mobile navigation">
          <Link to="/assessment" style={{ ...styles.mobileLink, color: '#7b1c2e', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>
            Retirement Assessment
          </Link>
          <Link to="/calculators" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Calculators
          </Link>
          <Link to="/reference" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Benefits Library
          </Link>
          <Link to="/resources" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Forms &amp; Links
          </Link>
          <Link to="/vera-vsip" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            VERA/VSIP
          </Link>
          <Link to="/chat" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Chat
          </Link>
          {/* T2.5: "Meeting" → "Book a Call", filled maroon on mobile too */}
          <Link to="/consultation" style={{ ...styles.mobileLink, background: '#7b1c2e', color: '#fff', fontWeight: 700, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
            Book a Call
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
              <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ ...styles.ctaButton, marginTop: 8 }} className="btn btn-full">
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
    background: 'rgba(250, 249, 246, 0.92)',
    backdropFilter: 'blur(20px)',
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
    gap: 0,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
    fontWeight: 700,
    fontSize: '1.2rem',
    letterSpacing: '-0.01em',
    color: '#0f172a',
  },
  logoFed: {
    color: '#0f172a',
  },
  logoHighlight: {
    color: '#7b1c2e',
    marginLeft: '0.2em',
    marginRight: '0.2em',
  },
  logoAid: {
    color: '#0f172a',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  link: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 500,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#475569',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  linkActive: {
    color: '#7b1c2e',
    background: '#fef2f2',
    fontWeight: 600,
  },
  // T2.5: filled maroon primary CTA — "Book a Call" nav item
  navCta: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 700,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
    background: '#7b1c2e',
    color: '#ffffff',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    marginLeft: 6,
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
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 10,
    marginLeft: 'auto',
    minWidth: 44,
    minHeight: 44,
  },
  bar: {
    width: 22,
    height: 2,
    background: '#0f172a',
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
    background: '#faf9f6',
  },
  mobileLink: {
    // T1.12: was duplicate display ('block' then 'flex') — flex wins, block was dead
    display: 'flex',
    padding: '12px 16px',
    minHeight: 44,
    borderRadius: 8,
    fontSize: '0.95rem',
    fontWeight: 500,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#475569',
    textDecoration: 'none',
    alignItems: 'center',
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
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  ctaButton: {
    background: '#7b1c2e',
    color: 'white',
    borderRadius: 8,
    border: 'none',
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
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
