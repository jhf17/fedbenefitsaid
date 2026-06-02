import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { colors, fonts } from '../constants/theme'
import { brand } from '../constants/brand'
import { DATA_LAST_UPDATED } from '../config/site'

const PRIMARY = brand.colors.primary
const PRIMARY_DARK = brand.colors.primaryDark
const ACCENT_LIGHT = brand.colors.accentLight

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
  color: ACCENT_LIGHT,
  marginBottom: 16,
  fontFamily: fonts.sans,
}

function formatLastUpdated(yyyyDashMm) {
  if (!yyyyDashMm) return ''
  const [y, m] = yyyyDashMm.split('-')
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const monthIdx = Math.max(0, Math.min(11, parseInt(m, 10) - 1))
  return `${months[monthIdx]} ${y}`
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

  const lastUpdatedLabel = formatLastUpdated(DATA_LAST_UPDATED)
  // FBA names its parent operator in the disclaimer; FMA is the operator itself.
  const complianceBrands =
    brand.id === 'fba'
      ? `${brand.name} and ${brand.legalName}`
      : brand.name

  return (
    <footer
      style={{
        background: `linear-gradient(180deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 100%)`,
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
            {brand.name}
          </div>
          {brand.attributionLine && (
            <div
              style={{
                fontSize: '0.78rem',
                color: ACCENT_LIGHT,
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              {brand.attributionLine}
            </div>
          )}
          <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', maxWidth: 320, marginTop: brand.attributionLine ? 0 : 16 }}>
            {brand.shortDescription}
          </p>
          {brand.contact.phoneDisplay && (
            <div style={{ marginTop: 16, fontSize: '0.92rem' }}>
              <a
                href={`tel:${brand.contact.phone}`}
                style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.02em' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT_LIGHT }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff' }}
              >
                {brand.contact.phoneDisplay}
              </a>
            </div>
          )}
        </div>

        {/* Tools */}
        <div>
          <div style={colTitle}>Tools</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/calculators" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>All Calculators</Link>
            <Link to="/calculators/fers" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>FERS Pension</Link>
            <Link to="/calculators/csrs" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>CSRS Pension</Link>
            <Link to="/calculators/special" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Special Provisions</Link>
            <Link to="/calculators/fegli" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>FEGLI Cost</Link>
            <Link to="/calculators/tsp-drawdown" style={linkBase} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>TSP Drawdown</Link>
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
          borderTop: `1px solid ${ACCENT_LIGHT}2e`,
          fontSize: '0.78rem',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.62)',
        }}
      >
        <p style={{ marginBottom: 12 }}>
          Educational content. {complianceBrands} {brand.id === 'fba' ? 'are' : 'is'} not affiliated with, endorsed by, or
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
          <span>© {new Date().getFullYear()} {brand.copyrightHolder}. All rights reserved.</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>Information current as of {lastUpdatedLabel} · Sourced from OPM, IRS, SSA</span>
        </div>
      </div>
    </footer>
  )
}
