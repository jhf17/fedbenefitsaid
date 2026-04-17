import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import ConsultantCTA from '../components/ConsultantCTA'

/**
 * /about — T2.6
 *
 * Founder-backed trust page. Content below marked `{{REPLACE: ...}}` is stubbed
 * for Tier 2; user supplies final copy + headshot in a follow-up commit before
 * the SEO push. Until then the placeholders render visibly so nothing is
 * accidentally shipped as "real" bio content.
 */
const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

const NAVY = '#0f172a'
const NAVY_MID = '#1e3a5f'
const MAROON = '#7b1c2e'
const CREAM = '#faf9f6'
const SUBTLE = '#475569'
const MUTED = '#64748b'
const BORDER = '#cbd5e1'

const FONT_SERIF = "'Merriweather', Georgia, 'Times New Roman', serif"
const FONT_SANS = "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"

function StubBadge({ children }) {
  return (
    <mark style={{ background: '#fffbeb', border: `1px dashed ${MAROON}`, color: MAROON, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.85em', fontWeight: 600 }}>
      {children}
    </mark>
  )
}

export default function About() {
  return (
    <main id="main-content" style={{ minHeight: '100vh', background: CREAM, fontFamily: FONT_SANS, color: NAVY }}>
      <Seo
        title="About FedBenefitsAid"
        description="FedBenefitsAid is an independent educational platform built for U.S. federal employees navigating FERS, TSP, FEHB, FEGLI, Medicare, and Social Security decisions."
        path="/about"
      />

      {/* Hero */}
      <header style={{ background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_MID} 60%)`, color: '#fff', padding: '64px 20px 56px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>About</div>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Built by a federal retirement specialist.<br />Run like a reference library.
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.78)', maxWidth: 640 }}>
            FedBenefitsAid exists because federal employees deserve free, accurate, OPM-sourced answers — not marketing gates or generic retirement content. Every tool here was built for the federal system specifically.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 20px 80px' }}>
        {/* Founder card */}
        <section style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 36 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
            {/* Headshot — falls back to a silhouette circle if the file isn't present */}
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: NAVY_MID, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: `3px solid ${MAROON}` }}>
              <img
                src="/founder.jpg"
                alt="{{REPLACE: FOUNDER_NAME}}"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = 'FBA'; e.currentTarget.parentElement.style.color = '#d4af37'; e.currentTarget.parentElement.style.fontFamily = FONT_SERIF; e.currentTarget.parentElement.style.fontWeight = '900'; e.currentTarget.parentElement.style.fontSize = '2rem'; }}
              />
            </div>
            <div>
              <div style={{ fontFamily: FONT_SERIF, fontWeight: 800, fontSize: '1.4rem', color: NAVY, marginBottom: 4 }}>
                <StubBadge>{`{{REPLACE: FOUNDER_NAME}}`}</StubBadge>
              </div>
              <div style={{ fontSize: '0.95rem', color: SUBTLE, marginBottom: 8 }}>
                <StubBadge>{`{{REPLACE: CREDENTIALS — e.g., ChFEBC®, RICP®, 15 years federal benefits}}`}</StubBadge>
              </div>
              <div style={{ fontSize: '0.88rem', color: MUTED, lineHeight: 1.6 }}>
                <StubBadge>{`{{REPLACE: ONE-SENTENCE BIO — background, years of experience, what makes their federal-benefits perspective useful}}`}</StubBadge>
              </div>
            </div>
          </div>
        </section>

        {/* Why this site exists */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: FONT_SERIF, fontSize: '1.5rem', fontWeight: 800, color: NAVY, marginBottom: 12 }}>Why FedBenefitsAid exists</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: SUBTLE }}>
            <StubBadge>{`{{REPLACE: MISSION PARAGRAPH — 3-5 sentences on why federal employees need better tools, why OPM-accurate content was missing from the web, and what FedBenefitsAid is trying to be in the long run.}}`}</StubBadge>
          </p>
        </section>

        {/* Relationship to Federal Market Associates */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: FONT_SERIF, fontSize: '1.5rem', fontWeight: 800, color: NAVY, marginBottom: 12 }}>How FedBenefitsAid and Federal Market Associates work together</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: SUBTLE }}>
            <StubBadge>{`{{REPLACE: One paragraph explaining the referral partnership between FedBenefitsAid (educational platform) and Federal Market Associates (licensed federal retirement specialists who take the consultation calls). Be explicit: FBA is the front door; FMA handles the licensed planning work when someone books a call.}}`}</StubBadge>
          </p>
        </section>

        {/* OPM disaffiliation disclaimer */}
        <section style={{ marginBottom: 36, background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 10, padding: '16px 20px' }}>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1rem', fontWeight: 700, color: '#92400e', marginBottom: 6 }}>Not affiliated with OPM</h3>
          <p style={{ fontSize: '0.92rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
            FedBenefitsAid is an independent educational platform. We are <strong>not affiliated with the U.S. Office of Personnel Management (OPM) or the U.S. government</strong>. All OPM rules, rates, and figures referenced on this site are sourced from official OPM, TSP, SSA, and CMS publications — links to the originals are included throughout. For anything with legal or tax consequences, consult a licensed professional or your agency HR office.
          </p>
        </section>

        {/* CTA */}
        <ConsultantCTA />

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: MUTED, marginTop: 24 }}>
          Ready to talk to a real person? <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ color: MAROON, fontWeight: 700 }}>Book with {`{{REPLACE: FOUNDER_NAME}}`}</a>.
        </p>
      </div>
    </main>
  )
}
