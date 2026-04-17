import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { colors } from '../constants/theme'

const fontSerif = "'Merriweather', Georgia, 'Times New Roman', serif"
const navy = colors.navy
const linkStyle = { fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }

export default function Footer() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const hoverOn = (e) => { e.target.style.color = 'white' }
  const hoverOff = (e) => { e.target.style.color = 'rgba(255,255,255,0.75)' }

  return (
    <footer style={{ background: navy, color: 'rgba(255,255,255,0.75)', padding: isMobile ? '40px 20px 24px' : '64px 48px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: isMobile ? '24px' : '48px', marginBottom: isMobile ? '24px' : '48px' }}>
        <div style={{ maxWidth: '300px' }}>
          <div style={{ fontFamily: fontSerif, fontWeight: '700', fontSize: '1rem', color: 'white', marginBottom: '12px' }}>
            FedBenefitsAid
          </div>
          <p style={{ fontSize: '0.82rem', lineHeight: '1.6' }}>
            Educational tools for federal employees navigating retirement benefits. Not affiliated with OPM or the U.S. government.
          </p>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? '24px' : '56px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: '14px' }}>
              Tools
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/calculators" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Retirement Calculator</Link>
              <Link to="/assessment" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Readiness Assessment</Link>
              <Link to="/chat" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>AI Benefits Chat</Link>
              <Link to="/reference" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Benefits Library</Link>
              <Link to="/resources" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Forms &amp; Links</Link>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: '14px' }}>
              Company
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <a href="https://calendly.com/jhf17/30min" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Book a Consultation</a>
              <Link to="/disclaimer" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Disclaimer</Link>
              <Link to="/privacy" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Privacy Policy</Link>
              <Link to="/terms" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
        <span>© 2026 FedBenefitsAid. All rights reserved.</span>
        <span>Information updated for 2026 figures.</span>
      </div>
    </footer>
  )
}
