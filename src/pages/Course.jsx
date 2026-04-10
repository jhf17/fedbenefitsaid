import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'

const TOPICS = [
  'FERS Annuity Calculation',
  'TSP &amp; Investment Strategy',
  'FEHB in Retirement',
  'FEGLI Life Insurance',
  'FERS Supplement',
  'Social Security Coordination',
  'Medicare &amp; FEHB',
  'Survivor Benefits',
  'Special Provisions (LEO/FF/ATC)',
  'Disability Retirement',
  'Federal Pay &amp; Leave',
]

const STATS = [
  { value: '350+', label: 'Practice Questions' },
  { value: '11', label: 'Benefit Modules' },
  { value: '2026', label: 'Updated for' },
  { value: 'CFR', label: 'Regulatory Citations' },
]

export default function Course() {
  const { user } = useAuth()
  const [chatAddon1, setChatAddon1] = useState(false)
  const [chatAddon2, setChatAddon2] = useState(false)

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#faf9f6' }}>

      {/* Hero */}
      <div style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <div style={styles.heroBadge}>Federal Benefits Training</div>
          <h1 style={styles.heroTitle}>
            Advise Federal Clients<br />
            <span style={styles.heroTitleAccent}>With Confidence.</span>
          </h1>
          <p style={styles.heroSub}>
            The most comprehensive FERS/FEHB/TSP training platform built
            for financial advisors, benefits consultants, and HR professionals
            who serve federal employees &mdash; with real regulations, real numbers,
            and exam-style practice questions.
          </p>

          <div style={styles.stats}>
            {STATS.map(s => (
              <div key={s.label} style={styles.statItem}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="container" style={{ padding: '48px 24px 0' }}>
        <div style={styles.sectionLabel}>What You'll Master</div>
        <div style={styles.topicTags}>
          {TOPICS.map(t => (
            <span key={t} style={styles.topicTag} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="container" style={{ padding: '48px 24px 64px' }}>
        <div style={styles.sectionLabel}>Choose Your Plan</div>
        <h2 style={styles.pricingTitle}>Simple, Transparent Pricing</h2>
        <p style={styles.pricingSubtitle}>
          Cancel anytime. No long-term contracts. Access to all modules from day one.
        </p>

        {/* Educational Disclaimer */}
        <div style={styles.disclaimer}>
          This course is for educational purposes only and does not constitute financial, legal, or tax advice. Always verify details with official sources and consider consulting a qualified advisor.
        </div>

        <div style={styles.pricingGrid}>

          {/* Professional */}
          <div style={styles.pricingCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>Pro</div>
              <h3 style={styles.cardTitle}>Professional</h3>
              <div style={styles.cardSubtitle}>For individual advisors &amp; consultants</div>
            </div>
            <div style={styles.cardPrice}>
              <span style={styles.priceDollar}>$</span>
              {chatAddon1 ? '29' : '19'}
              <span style={styles.priceCents}>{chatAddon1 ? '.99' : '.99'}</span>
              <span style={styles.pricePer}>/mo</span>
            </div>
            {chatAddon1 && (
              <div style={styles.addonBreakdown}>
                $19.99 Training + $10.00 AI Chat
              </div>
            )}
            <ul style={styles.featureList}>
              <li style={styles.feature}><span style={styles.check}>&#10003;</span> Full access to all 11 modules</li>
              <li style={styles.feature}><span style={styles.check}>&#10003;</span> 350+ practice questions</li>
              <li style={styles.feature}><span style={styles.check}>&#10003;</span> Progress tracking &amp; scoring</li>
              <li style={styles.feature}><span style={styles.check}>&#10003;</span> CFR regulatory references</li>
              <li style={styles.feature}><span style={styles.check}>&#10003;</span> Updated for 2026 rules</li>
            </ul>

            <div style={styles.addonBox}>
              <label style={styles.addonLabel}>
                <input
                  type="checkbox"
                  checked={chatAddon1}
                  onChange={() => setChatAddon1(!chatAddon1)}
                  style={{ marginRight: 8, accentColor: '#1e3a5f' }}
                />
                <span>
                  <strong>Add AI Chat</strong>
                  <span style={styles.addonPrice}> +$10/mo</span>
                </span>
              </label>
              <p style={styles.addonNote}>Unlimited AI answers to any benefits question</p>
            </div>

            <Link
              to="/signup"
              className="btn btn-outline"
              style={{ display: 'block', textAlign: 'center', marginTop: 20, padding: '12px 0', fontSize: '0.95rem' }}
            >
              {user ? 'Start Training' : 'Start Free Trial'}
            </Link>
          </div>

          {/* Agency */}
          <div style={{ ...styles.pricingCard, ...styles.pricingCardFeatured }}>
            <div style={styles.bestBadge}>BEST VALUE</div>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.cardIcon, background: 'rgba(255,255,255,0.15)', color: 'white' }}>Firm</div>
              <h3 style={{ ...styles.cardTitle, color: 'white' }}>Agency / Firm</h3>
              <div style={{ ...styles.cardSubtitle, color: 'rgba(255,255,255,0.7)' }}>For teams, HR offices &amp; consulting firms</div>
            </div>
            <div style={{ ...styles.cardPrice, color: 'white' }}>
              <span style={{ ...styles.priceDollar, color: 'rgba(255,255,255,0.8)' }}>$</span>
              {chatAddon2 ? '199' : '149'}
              <span style={{ ...styles.priceCents, color: 'rgba(255,255,255,0.8)' }}>.00</span>
              <span style={{ ...styles.pricePer, color: 'rgba(255,255,255,0.6)' }}>/mo</span>
            </div>
            {chatAddon2 && (
              <div style={{ ...styles.addonBreakdown, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)' }}>
                $149 Training + $50 AI Chat (all seats)
              </div>
            )}
            <ul style={styles.featureList}>
              <li style={{ ...styles.feature, color: 'rgba(255,255,255,0.9)' }}><span style={styles.checkWhite}>&#10003;</span> Up to <strong>10 seats</strong></li>
              <li style={{ ...styles.feature, color: 'rgba(255,255,255,0.9)' }}><span style={styles.checkWhite}>&#10003;</span> Everything in Professional</li>
              <li style={{ ...styles.feature, color: 'rgba(255,255,255,0.9)' }}><span style={styles.checkWhite}>&#10003;</span> Admin dashboard</li>
              <li style={{ ...styles.feature, color: 'rgba(255,255,255,0.9)' }}><span style={styles.checkWhite}>&#10003;</span> Team progress reports</li>
              <li style={{ ...styles.feature, color: 'rgba(255,255,255,0.9)' }}><span style={styles.checkWhite}>&#10003;</span> Priority support</li>
            </ul>

            <div style={{ ...styles.addonBox, borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)' }}>
              <label style={{ ...styles.addonLabel, color: 'white' }}>
                <input
                  type="checkbox"
                  checked={chatAddon2}
                  onChange={() => setChatAddon2(!chatAddon2)}
                  style={{ marginRight: 8, accentColor: '#fbbf24' }}
                />
                <span>
                  <strong>Add AI Chat for all seats</strong>
                  <span style={{ ...styles.addonPrice, color: '#fbbf24' }}> +$50/mo</span>
                </span>
              </label>
              <p style={{ ...styles.addonNote, color: 'rgba(255,255,255,0.5)' }}>Unlimited AI chat for all 10 seats</p>
            </div>

            <Link
              to="/signup"
              className="btn btn-primary"
              style={{
                display: 'block', textAlign: 'center', marginTop: 20,
                padding: '12px 0', fontSize: '0.95rem',
                background: 'white', color: '#1e3a5f',
              }}
            >
              Contact Sales
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p style={styles.footerNote}>
          Secure checkout &middot; Cancel anytime &middot; Questions? Email us at{' '}
          <a href="mailto:support@fedbenefitsaid.com" style={{ color: '#1e3a5f' }}>support@fedbenefitsaid.com</a>
        </p>
      </div>
    </div>
  )
}

const styles = {
  hero: {
    background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)',
    color: 'white',
    padding: '64px 0 56px',
  },
  heroInner: { maxWidth: 760, padding: '0 24px' },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 20, padding: '5px 14px', fontSize: '0.8rem',
    fontWeight: 600, letterSpacing: '0.04em', marginBottom: 20,
  },
  heroTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800,
    letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.15,
  },
  heroTitleAccent: { color: '#93c5fd' },
  heroSub: {
    fontSize: '1.05rem', opacity: 0.82, lineHeight: 1.7,
    maxWidth: 620, marginBottom: 40,
  },
  stats: { display: 'flex', gap: 32, flexWrap: 'wrap' },
  statItem: { textAlign: 'left' },
  statValue: { fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 },
  statLabel: { fontSize: '0.8rem', opacity: 0.8, marginTop: 4, fontWeight: 500 },

  sectionLabel: {
    fontSize: '0.78rem', fontWeight: 700, color: '#1e3a5f',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16,
  },
  topicTags: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  topicTag: {
    background: 'white', border: '1.5px solid #e2e8f0',
    borderRadius: 20, padding: '7px 14px', fontSize: '0.85rem',
    color: '#334155', fontWeight: 500,
  },

  pricingTitle: { fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' },
  pricingSubtitle: { color: '#64748b', fontSize: '0.95rem', marginBottom: 36 },
  disclaimer: {
    background: '#fffbeb',
    border: '1px solid #f59e0b',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: '0.82rem',
    color: '#92400e',
    marginBottom: 20,
  },
  pricingGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24, maxWidth: 760,
  },
  pricingCard: {
    background: 'white', border: '1.5px solid #e2e8f0',
    borderRadius: 18, padding: '32px 28px', position: 'relative',
  },
  pricingCardFeatured: {
    background: 'linear-gradient(160deg, #1e3a5f 0%, #2d5f8a 100%)',
    border: '2px solid #1e3a5f',
  },
  bestBadge: {
    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
    background: '#fbbf24', color: '#0f172a',
    fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
    padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap',
  },
  cardHeader: { marginBottom: 20 },
  cardIcon: {
    fontSize: '0.85rem', fontWeight: 800, color: '#1e3a5f',
    background: '#e8f0fe', width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' },
  cardSubtitle: { fontSize: '0.82rem', color: '#64748b' },
  cardPrice: {
    fontSize: '2.6rem', fontWeight: 800, color: '#0f172a',
    letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 20,
  },
  priceDollar: { fontSize: '1.2rem', fontWeight: 700, color: '#64748b', verticalAlign: 'super' },
  priceCents: { fontSize: '1.2rem', fontWeight: 700, color: '#64748b' },
  pricePer: { fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' },
  addonBreakdown: {
    fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9',
    borderRadius: 8, padding: '5px 10px', marginBottom: 16, marginTop: -12,
  },
  featureList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  feature: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.88rem', color: '#334155' },
  check: { color: '#22c55e', fontWeight: 700, flexShrink: 0 },
  checkWhite: { color: '#86efac', fontWeight: 700, flexShrink: 0 },
  addonBox: {
    border: '1.5px dashed #cbd5e1', borderRadius: 10,
    padding: '12px 14px', background: '#f8fafc',
  },
  addonLabel: {
    display: 'flex', alignItems: 'center', cursor: 'pointer',
    fontSize: '0.88rem', color: '#0f172a', fontWeight: 500,
  },
  addonPrice: { color: '#1e3a5f', fontWeight: 700 },
  addonNote: { fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0 24px' },
  footerNote: {
    marginTop: 32, textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8',
  },
}
