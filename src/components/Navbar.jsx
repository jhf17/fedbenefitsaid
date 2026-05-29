import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { colors, fonts } from '../constants/theme'
import { brand } from '../constants/brand'

// Convert #RRGGBB to rgba(r,g,b,alpha). Used to build subtle tinted backgrounds
// from the brand primary/accent colors without hardcoding per brand.
function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const PRIMARY = brand.colors.primary
const ACCENT = brand.colors.accent
const PRIMARY_TINT = hexToRgba(PRIMARY, 0.06)
const PRIMARY_BORDER = hexToRgba(PRIMARY, 0.1)
const ACCENT_SHADOW = hexToRgba(brand.colors.accentDark || ACCENT, 0.25)

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
    borderBottom: scrolled ? `1px solid ${PRIMARY_BORDER}` : '1px solid transparent',
    boxShadow: scrolled ? '0 1px 3px rgba(20,42,29,0.06)' : 'none',
    transition: 'all 0.2s ease',
  }

  return (
    <nav style={navStyle} aria-label="Main navigation">
      <div style={styles.inner}>
        <Link to="/" style={styles.logo} aria-label={`${brand.name} — go to homepage`}>
          <BrandLogo />
        </Link>

        <div data-navbar-links="" style={styles.links}>
          <Link
            to="/assessment"
            style={{ ...styles.link, ...(isActive('/assessment') ? activeLinkStyle() : {}) }}
            aria-current={isActive('/assessment') ? 'page' : undefined}
          >
            Assessment
          </Link>
          <Link
            to="/calculators"
            style={{ ...styles.link, ...(isActive('/calculators') ? activeLinkStyle() : {}) }}
            aria-current={isActive('/calculators') ? 'page' : undefined}
          >
            Calculators
          </Link>
          <Link
            to="/reference"
            style={{ ...styles.link, ...(isActive('/reference') ? activeLinkStyle() : {}) }}
            aria-current={isActive('/reference') ? 'page' : undefined}
          >
            Library
          </Link>
          <Link
            to="/resources"
            style={{ ...styles.link, ...(isActive('/resources') ? activeLinkStyle() : {}) }}
            aria-current={isActive('/resources') ? 'page' : undefined}
          >
            Resources
          </Link>
          <Link
            to="/about"
            style={{ ...styles.link, ...(isActive('/about') ? activeLinkStyle() : {}) }}
            aria-current={isActive('/about') ? 'page' : undefined}
          >
            About
          </Link>
          <Link
            to="/consultation"
            style={ctaStyle()}
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
          <div style={{ ...barStyle(), ...(menuOpen ? styles.barOpen1 : {}) }} aria-hidden="true" />
          <div style={{ ...barStyle(), opacity: menuOpen ? 0 : 1 }} aria-hidden="true" />
          <div style={{ ...barStyle(), ...(menuOpen ? styles.barOpen2 : {}) }} aria-hidden="true" />
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
            style={{ ...styles.mobileLink, background: ACCENT, color: '#fff', fontWeight: 700, justifyContent: 'center' }}
            onClick={() => setMenuOpen(false)}
          >
            Book a Meeting
          </Link>
        </div>
      )}
    </nav>
  )
}

// === Brand logo: switches text vs image based on brand.logo.type ===
function BrandLogo() {
  if (brand.logo.type === 'image') {
    return (
      <img
        src={brand.logo.src}
        alt={brand.logo.alt}
        style={{
          height: brand.logo.height,
          width: 'auto',
          display: 'block',
          // Image logos typically include their own colors; no filters applied.
        }}
      />
    )
  }
  // Default: text logo (FBA-style) — uses brand.logo.parts with primary/accent emphasis
  const parts = brand.logo.parts || []
  return (
    <span style={styles.logoText}>
      {parts.map((p, i) => {
        const isAccent = p.emphasis === 'accent'
        return (
          <span
            key={i}
            style={{
              color: isAccent ? ACCENT : PRIMARY,
              marginLeft: isAccent ? '0.15em' : 0,
              marginRight: isAccent ? '0.15em' : 0,
            }}
          >
            {p.text}
          </span>
        )
      })}
    </span>
  )
}

function activeLinkStyle() {
  return {
    color: PRIMARY,
    background: PRIMARY_TINT,
    fontWeight: 600,
  }
}

function ctaStyle() {
  return {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: 8,
    fontSize: '0.92rem',
    fontWeight: 600,
    fontFamily: fonts.sans,
    background: ACCENT,
    color: '#ffffff',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    marginLeft: 6,
    letterSpacing: '0.01em',
    boxShadow: `0 1px 3px ${ACCENT_SHADOW}`,
  }
}

function barStyle() {
  return {
    width: 22,
    height: 2,
    background: PRIMARY,
    borderRadius: 2,
    transition: 'all 0.2s ease',
  }
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
    color: PRIMARY,
    fontVariationSettings: '"opsz" 144, "SOFT" 50',
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
    fontSize: '0.92rem',
    fontWeight: 500,
    fontFamily: fonts.sans,
    color: colors.slate700,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    letterSpacing: '0.005em',
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
  barOpen1: { transform: 'rotate(45deg) translate(5px, 5px)' },
  barOpen2: { transform: 'rotate(-45deg) translate(5px, -5px)' },
  mobileMenu: {
    display: 'none',
    padding: '16px 24px 24px',
    borderTop: `1px solid ${PRIMARY_BORDER}`,
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
