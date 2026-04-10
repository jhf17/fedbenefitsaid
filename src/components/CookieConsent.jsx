import { useState, useEffect } from 'react'

// Lightweight GDPR cookie consent banner.
// Checks document.cookie for "fba_consent=yes" — if not present, shows banner.
// GA4 tag in index.html loads regardless (for US users), but this gives EU visitors
// a way to understand what's being tracked + satisfies GDPR notice requirement.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasConsent = document.cookie.split(';').some(c => c.trim().startsWith('fba_consent='))
    if (!hasConsent) setVisible(true)
  }, [])

  const accept = () => {
    document.cookie = 'fba_consent=yes; max-age=31536000; path=/; SameSite=Lax'
    setVisible(false)
  }

  const decline = () => {
    document.cookie = 'fba_consent=no; max-age=31536000; path=/; SameSite=Lax'
    // Disable GA4 tracking
    window['ga-disable-G-6K0NHQ5WSK'] = true
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#0f172a',
        color: '#e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap',
        fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '0.9rem',
        lineHeight: 1.5,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
      }}
    >
      <p style={{ margin: 0, maxWidth: 600 }}>
        We use cookies and Google Analytics to improve your experience. See our{' '}
        <a href="/privacy" style={{ color: '#c9a84c', textDecoration: 'underline' }}>Privacy Policy</a>.
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={accept}
          style={{
            background: '#7b1c2e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Accept
        </button>
        <button
          onClick={decline}
          style={{
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid #475569',
            borderRadius: 8,
            padding: '8px 20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Decline
        </button>
      </div>
    </div>
  )
}
