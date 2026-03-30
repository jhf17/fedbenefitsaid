/**
 * ConsultantCTA — "Talk to a Human Expert" banner
 * Used on Reference page and Chat page
 * Replace CALENDLY_URL with Jack's actual Calendly link
 */

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

export default function ConsultantCTA({ compact = false }) {
  if (compact) {
    return (
      <div style={styles.compact}>
        <div style={styles.compactText}>
          <span style={styles.compactIcon}>👨‍💼</span>
          <div>
            <div style={styles.compactTitle}>Prefer a human expert?</div>
            <div style={styles.compactSub}>Book a free 30-min consultation</div>
          </div>
        </div>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-navy btn-sm"
        >
          Book Free Call
        </a>
      </div>
    )
  }

  return (
    <div style={styles.banner}>
      <div style={styles.bannerLeft}>
        <div style={styles.bannerIcon}>👨‍💼</div>
        <div>
          <div style={styles.bannerTitle}>Want personalized guidance from a real expert?</div>
          <div style={styles.bannerSub}>
            Book a free 30-minute consultation with a federal retirement specialist at Federal Market Associates.
            No sales pitch — just expert answers to your specific questions.
          </div>
        </div>
      </div>
      <div style={styles.bannerRight}>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-navy btn-lg"
          style={{ flexShrink: 0 }}
        >
          📅 Book Free Consultation
        </a>
        <div style={styles.bannerNote}>No cost. No obligation. 30 minutes.</div>
      </div>
    </div>
  )
}

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4f7c 100%)',
    borderRadius: 16,
    padding: '32px 36px',
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    color: 'white',
    flexWrap: 'wrap',
  },
  bannerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
    minWidth: 280,
  },
  bannerIcon: {
    fontSize: '2.5rem',
    flexShrink: 0,
    lineHeight: 1,
  },
  bannerTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: '0.9rem',
    opacity: 0.85,
    lineHeight: 1.5,
  },
  bannerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  bannerNote: {
    fontSize: '0.8rem',
    opacity: 0.7,
  },
  compact: {
    background: '#f0f4ff',
    border: '1.5px solid #c7d7fc',
    borderRadius: 12,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  compactText: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  compactIcon: {
    fontSize: '1.4rem',
  },
  compactTitle: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#1e3a5f',
  },
  compactSub: {
    fontSize: '0.8rem',
    color: '#475569',
  },
}
