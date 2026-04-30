import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { colors, fonts } from '../constants/theme'

const linkBase = {
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.72)',
  textDecoration: 'none',
  marginBottom: 10,
  transition: 'color 0.15s',
  cursor: 'pointer',
  fontFamily: fonts.sans,
  display: 'inline-block',
}

const colTitle = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: colors.brassLight,
  marginBottom: 16,
  fontFamily: fonts.sans,
}

export default function Footer() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const hoverOn = (e) => { e.currentTarget.style.color = '#ffffff' }
  const hoverOff = (e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)' }

  return (
    <footer
      style={{
        background: `linear-gradient(180deg, ${colors.pineDeep} 0%, ${colors.pine} 100%)`,
        color: 'rgba(255,255,255,0.78)',
        padding: isMobile ? '48px 20px 28px' : '72px 48px 32px',
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr 1fr 1fr',
          gap: isMobile ? 32 : 48,
          marginBottom: isMobile ? 32 : 56,
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontFamily: fonts.serif,
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#ffffff',
              letterSpacing: '-0.01em',
              marginBottom: 6,
            }}
          >
            FedBenefitsAid
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: colors.brassLight,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            An education resource by Federal Market Associates
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', maxWidth: 320 }}>
            Free, accurate education for federal employees navigating retirement benefits — built and maintained for the
            current benefit year.
          </p>
        </div>

        {/* Tools */}
        <div>
          <div style={colTitle}>Tools</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/calculators" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>All Calculators</Link>
            <Link to="/calculator" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>FERS Pension</Link>
            <Link to="/calculators/fegli" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>FEGLI Cost</Link>
            <Link to="/assessment" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Readiness Check</Link>
          </div>
        </div>

        {/* Learn */}
        <div>
          <div style={colTitle}>Learn</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/reference" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Benefits Library</Link>
            <Link to="/resources" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Forms &amp; Links</Link>
            <Link to="/about" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>About</Link>
          </div>
        </div>

        {/* Talk */}
        <div>
          <div style={colTitle}>Talk</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/consultation" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Book a Call</Link>
            <Link to="/disclaimer" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Disclaimer</Link>
            <Link to="/privacy" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Privacy</Link>
            <Link to="/terms" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Terms</Link>
          </div>
        </div>
      </div>

      {/* Compliance disclosure line */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          paddingTop: 24,
          borderTop: '1px solid rgba(212,184,138,0.18)',
          fontSize: '0.78rem',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.62)',
        }}
      >
        <p style={{ marginBottom: 12 }}>
          Educational content. FedBenefitsAid and Federal Market Associates are not affiliated with, endorsed by, or
          authorized to speak on behalf of the U.S. government, the Office of Personnel Management, or any federal
          agency. Information presented does not constitute personalized financial, tax, or legal advice. Insurance and
          annuity products discussed in consultations are not available in California, New York, or Arkansas. Verify
          all benefit decisions with official government sources.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 16,
            fontSize: '0.75rem',
          }}
        >
          <span>© 2026 Federal Market Associates. All rights reserved.</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>Information current as of April 2026 · Sourced from OPM, IRS, SSA</span>
        </div>
      </div>
    </footer>
  )
}
