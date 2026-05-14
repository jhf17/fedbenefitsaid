import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { colors, fonts } from '../constants/theme'

export default function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && menuOpen) setMenuOpen(false) }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [menuOpen])

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: scrolled ? 'rgba(250, 246, 239, 0.95)' : 'rgba(250, 246, 239, 0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: scrolled ? `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.10)'}` : '1px solid transparent',
    boxShadow: scrolled ? '0 1px 3px rgba(20,42,29,0.06)' : 'none',
    transition: 'all 0.2s ease',
  }

  return (
    <nav style={navStyle} aria-label="Main navigation">
      <div style={styles.inner}>
        <Link to="/" style={styles.logo} aria-label="FedBenefitsAid — go to homepage">
          <span style={styles.logoText}>
            <span style={styles.logoFed}>Fed</span>
            <span style={styles.logoHighlight}>Benefits</span>
            <span style={styles.logoAid}>Aid</span>
          </span>
        </Link>

        <div data-navbar-links="" style={styles.links}>
          <Link
            to="/assessment"
            style={{ ...styles.link, ...(isActive('/assessment') ? styles.linkActive : {}) }}
            aria-current={isActive('/assessment') ? 'page' : undefined}
          >
            Assessment
          </Link>
          <Link
            to="/calculators"
            style={{ ...styles.link, ...(isActive('/calculators') ? styles.linkActive : {}) }}
            aria-current={isActive('/calculators') ? 'page' : undefined}
          >
            Calculators
          </Link>
          <Link
            to="/reference"
            style={{ ...styles.link, ...(isActive('/reference') ? styles.linkActive : {}) }}
            aria-current={isActive('/reference') ? 'page' : undefined}
          >
            Library
          </Link>
          <Link
            to="/resources"
            style={{ ...styles.link, ...(isActive('/resources') ? styles.linkActive : {}) }}
            aria-current={isActive('/resources') ? 'page' : undefined}
          >
            Resources
          </Link>
          <Link
            to="/about"
            style={{ ...styles.link, ...(isActive('/about') ? styles.linkActive : {}) }}
            aria-current={isActive('/about') ? 'page' : undefined}
          >
            About
          </Link>
          <Link
            to="/consultation"
            style={styles.navCta}
            aria-current={isActive('/consultation') ? 'page' : undefined}
          >
            Book a Meeting
          </Link>
        </div>

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

      {menuOpen && (
        <div id="mobile-nav-menu" data-mobile-menu="" style={styles.mobileMenu} role="navigation" aria-label="Mobile navigation">
          <Link to="/assessment" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Assessment</Link>
          <Link to="/calculators" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Calculators</Link>
          <Link to="/reference" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Library</Link>
          <Link to="/resources" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Resources</Link>
          <Link to="/about" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>About</Link>
          <Link
            to="/consultation"
            style={{ ...styles.mobileLink, background: colors.brass, color: '#fff', fontWeight: 700, justifyContent: 'center' }}
            onClick={() => setMenuOpen(false)}
          >
            Book a Meeting
          </Link>
        </div>
      )}
    </nav>
  )
}

const styles = {
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 68,
    display: 'flex',
    alignItems: 'center',
    gap: 28,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: fonts.serif,
    fontWeight: 700,
    fontSize: '1.32rem',
    letterSpacing: '-0.015em',
    color: colors.pine,
    fontVariationSettings: '"opsz" 144, "SOFT" 50',
  },
  logoFed: { color: colors.pine },
  logoHighlight: { color: colors.brass, marginLeft: '0.15em', marginRight: '0.15em' },
  logoAid: { color: colors.pine },
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
    fontSize: '0.92rem',
    fontWeight: 500,
    fontFamily: fonts.sans,
    color: colors.slate700,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    letterSpacing: '0.005em',
  },
  linkActive: {
    color: colors.pine,
    background: 'rgba(31,61,44,0.06)',
    fontWeight: 600,
  },
  navCta: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: 8,
    fontSize: '0.92rem',
    fontWeight: 600,
    fontFamily: fonts.sans,
    background: colors.brass,
    color: '#ffffff',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    marginLeft: 6,
    letterSpacing: '0.01em',
    boxShadow: '0 1px 3px rgba(141,111,68,0.25)',
  },
  authArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  userEmail: {
    fontSize: '0.85rem',
    color: colors.slate500,
    fontWeight: 500,
    fontFamily: fonts.sans,
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
    background: colors.pine,
    borderRadius: 2,
    transition: 'all 0.2s ease',
  },
  barOpen1: { transform: 'rotate(45deg) translate(5px, 5px)' },
  barOpen2: { transform: 'rotate(-45deg) translate(5px, -5px)' },
  mobileMenu: {
    display: 'none',
    padding: '16px 24px 24px',
    borderTop: '1px solid rgba(31,61,44,0.10)',
    flexDirection: 'column',
    gap: 4,
    background: colors.cream,
  },
  mobileLink: {
    display: 'flex',
    padding: '14px 16px',
    minHeight: 48,
    borderRadius: 8,
    fontSize: '0.98rem',
    fontWeight: 500,
    fontFamily: fonts.sans,
    color: colors.slate700,
    textDecoration: 'none',
    alignItems: 'center',
  },
  mobileDivider: {
    height: 1,
    background: 'rgba(31,61,44,0.10)',
    margin: '8px 0',
  },
  mobileUserEmail: {
    fontSize: '0.85rem',
    color: colors.slate500,
    padding: '4px 12px',
    fontFamily: fonts.sans,
  },
}

if (typeof document !== 'undefined') {
  const STYLE_ID = 'fba-navbar-responsive'
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
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
}
