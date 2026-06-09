import { Link } from 'react-router-dom'
import { colors, fonts } from '../constants/theme'

export default function ConsultantCTA({ compact = false }) {
  if (compact) {
    return (
      <div style={styles.compact}>
        <div>
          <div style={styles.compactTitle}>Want to talk it through?</div>
          <div style={styles.compactSub}>Book a free meeting with a Federal Retirement Consultant at Federal Market Associates. No time limit.</div>
        </div>
        <Link to="/consultation" className="fma-btn fma-btn-primary fma-btn-sm">Book a meeting</Link>
      </div>
    )
  }

  return (
    <div style={styles.banner}>
      <div style={styles.bannerLeft}>
        <div style={styles.bannerOverline}>Talk to a person</div>
        <div style={styles.bannerTitle}>Have a question that needs more than a calculator?</div>
        <div style={styles.bannerSub}>
          Book a free meeting with a Federal Retirement Consultant at Federal Market Associates. No pitch — just straight answers about your specific situation.
        </div>
      </div>
      <div style={styles.bannerRight}>
        <Link to="/consultation" className="fma-btn fma-btn-primary">Book a meeting</Link>
        <div style={styles.bannerNote}>Free. No time limit. No obligation.</div>
      </div>
    </div>
  )
}

const styles = {
  banner: {
    background: `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 60%, ${colors.pineLight} 100%)`,
    borderRadius: 16,
    padding: '36px 40px',
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    color: '#ffffff',
    flexWrap: 'wrap',
    fontFamily: fonts.sans,
  },
  bannerLeft: {
    flex: 1,
    minWidth: 280,
  },
  bannerOverline: {
    fontSize: '0.74rem',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.brassLight,
    marginBottom: 8,
  },
  bannerTitle: {
    fontFamily: fonts.serif,
    fontSize: '1.4rem',
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: '-0.01em',
    fontVariationSettings: '"opsz" 144, "SOFT" 50',
  },
  bannerSub: {
    fontSize: '0.96rem',
    lineHeight: 1.55,
    color: 'rgba(255,255,255,0.78)',
  },
  bannerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    flexShrink: 0,
  },
  bannerNote: {
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.58)',
  },
  compact: {
    background: colors.cream,
    border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.10)'}`,
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    fontFamily: fonts.sans,
  },
  compactTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: colors.pine,
    fontFamily: fonts.serif,
    letterSpacing: '-0.005em',
  },
  compactSub: {
    fontSize: '0.85rem',
    color: colors.slate700,
    marginTop: 2,
  },
}
