import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { CALENDLY_EMBED_URL, UNAVAILABLE_STATES, UNAVAILABLE_STATE_NAMES } from '../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'],
  ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'],
  ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
  ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'],
  ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
]

const TOPICS = [
  { title: 'FERS pension', body: 'High-3, sick-leave credit, scenario comparisons across retirement dates.' },
  { title: 'TSP withdrawals', body: 'Sequence-of-returns risk, Roth vs traditional split, RMDs.' },
  { title: 'Social Security timing', body: 'Claim age, the FERS Supplement earnings test, and what 70 actually buys you.' },
  { title: 'FEHB + Medicare', body: 'When to enroll in Part B, how the two programs coordinate, what to drop.' },
  { title: 'Survivor & disability', body: 'What your federal package actually pays your spouse, and when private alternatives make sense.' },
  { title: 'FEGLI cost trajectory', body: 'How premiums change after age 50/60/65 — and what your alternatives are.' },
]

export default function Consultation() {
  const [state, setState] = useState('')
  const [showWidget, setShowWidget] = useState(false)
  const widgetRef = useRef(null)

  const isUnavailable = state && UNAVAILABLE_STATES.includes(state)
  const stateName = state ? (US_STATES.find((s) => s[0] === state)?.[1] || state) : ''

  // Load Calendly widget script when widget is shown
  useEffect(() => {
    if (!showWidget) return
    const existing = document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      // Don't remove on unmount — leaving it cached is faster on re-mount
    }
  }, [showWidget])

  const handleStateSubmit = (e) => {
    e.preventDefault()
    if (!state) return
    setShowWidget(true)
    // Scroll widget into view after render
    setTimeout(() => {
      widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="Book a free 15-minute call"
        description="Free 15-minute call with Jack Fitzgerald at Federal Market Associates. No sales pitch — straight answers about FERS, TSP, FEHB, FEGLI, and Medicare decisions."
        path="/consultation"
      />

      {/* HERO */}
      <header
        style={{
          background: `linear-gradient(165deg, ${colors.pineDeep} 0%, ${colors.pine} 55%, ${colors.pineLight} 100%)`,
          color: '#ffffff',
          padding: '88px 24px 96px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 80% 0%, rgba(176,141,90,0.18) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: colors.brassLight,
              marginBottom: 16,
            }}
          >
            Book a call
          </div>
          <h1
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              marginBottom: 20,
              maxWidth: 720,
            }}
          >
            15 minutes. <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              No agenda you didn't bring.
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 600 }}>
            Pick a time that works. We'll talk about whatever's on your mind — your pension, TSP, healthcare, what to do
            with FEGLI, or any decision the calculators raised. No prep required.
          </p>
        </div>
      </header>

      {/* TOPICS */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 24px 32px' }}>
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: colors.brassDeep,
              marginBottom: 10,
            }}
          >
            What people bring up
          </div>
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)',
              fontWeight: 600,
              color: colors.pine,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              maxWidth: 600,
            }}
          >
            We'll go where the questions are.
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {TOPICS.map((t) => (
            <div
              key={t.title}
              style={{
                background: '#ffffff',
                padding: 24,
                borderRadius: 14,
                border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
              }}
            >
              <h3
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: colors.pine,
                  marginBottom: 8,
                  letterSpacing: '-0.005em',
                }}
              >
                {t.title}
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: colors.slate700 }}>{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATE INTAKE / CALENDLY */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px 96px' }} ref={widgetRef}>
        {!showWidget ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '40px 36px',
              border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
              boxShadow: '0 4px 24px rgba(20,42,29,0.06)',
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '1.7rem',
                  fontWeight: 600,
                  color: colors.pine,
                  marginBottom: 10,
                  letterSpacing: '-0.015em',
                  fontVariationSettings: '"opsz" 144, "SOFT" 50',
                }}
              >
                Find a time
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: colors.slate700 }}>
                One quick question first — we want to make sure we're set up to actually help you, given where you live.
              </p>
            </div>
            <form onSubmit={handleStateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: colors.pine,
                  letterSpacing: '0.01em',
                }}
              >
                What state do you live in?
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 8,
                    padding: '12px 14px',
                    fontSize: '1rem',
                    border: `1px solid ${colors.borderLight || '#cbd5e1'}`,
                    borderRadius: 10,
                    fontFamily: FONT_SANS,
                    color: colors.charcoal,
                    background: '#ffffff',
                    appearance: 'auto',
                  }}
                >
                  <option value="" disabled>Select a state…</option>
                  {US_STATES.map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={!state}
                style={{
                  marginTop: 8,
                  padding: '14px 28px',
                  background: state ? colors.brass : 'rgba(176,141,90,0.4)',
                  color: '#ffffff',
                  borderRadius: 10,
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: state ? 'pointer' : 'not-allowed',
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s ease',
                  alignSelf: 'flex-start',
                  boxShadow: state ? '0 6px 18px rgba(176,141,90,0.28)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!state) return
                  e.currentTarget.style.background = colors.brassDeep
                }}
                onMouseLeave={(e) => {
                  if (!state) return
                  e.currentTarget.style.background = colors.brass
                }}
              >
                Continue →
              </button>
            </form>
          </div>
        ) : isUnavailable ? (
          <UnavailableState stateName={stateName} onChange={() => setShowWidget(false)} />
        ) : (
          <CalendlyEmbed stateName={stateName} onChange={() => setShowWidget(false)} />
        )}
      </section>

      {/* TRUST FOOTER STRIP */}
      <section style={{ background: colors.bone, padding: '48px 24px', borderTop: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}` }}>
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            textAlign: 'center',
          }}
        >
          <TrustItem label="No cost" body="The first 15 minutes are free." />
          <TrustItem label="No prep" body="Just bring your questions." />
          <TrustItem label="No pressure" body="If we're not the right fit, we'll tell you." />
        </div>
      </section>
    </main>
  )
}

function TrustItem({ label, body }) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: colors.brassDeep,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <p style={{ fontSize: '0.95rem', color: colors.slate700, lineHeight: 1.5 }}>{body}</p>
    </div>
  )
}

function UnavailableState({ stateName, onChange }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 18,
        padding: '40px 36px',
        border: `1px solid ${colors.brass}`,
      }}
    >
      <h2
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.6rem',
          fontWeight: 600,
          color: colors.pine,
          marginBottom: 12,
          letterSpacing: '-0.015em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        We can't currently book consultations for {stateName} residents.
      </h2>
      <p style={{ fontSize: '1.02rem', lineHeight: 1.65, color: colors.slate700, marginBottom: 16 }}>
        Federal Market Associates can't currently work with residents of {stateName} on insurance or annuity-related
        planning. The free education tools on this site are still fully available to you — and we update the calculators
        and library every benefit year.
      </p>
      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: colors.slate500, marginBottom: 24 }}>
        If your circumstances change (e.g., you relocate or your federal duty station shifts), come back and we'll be
        happy to talk.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          to="/calculators"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 22px',
            background: colors.pine,
            color: '#ffffff',
            borderRadius: 10,
            fontSize: '0.95rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Open the calculators
        </Link>
        <Link
          to="/reference"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 22px',
            background: 'transparent',
            color: colors.pine,
            border: `1px solid ${colors.pine}`,
            borderRadius: 10,
            fontSize: '0.95rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Read the library
        </Link>
        <button
          type="button"
          onClick={onChange}
          style={{
            padding: '12px 22px',
            background: 'transparent',
            color: colors.slate500,
            border: 'none',
            fontSize: '0.92rem',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Change state
        </button>
      </div>
    </div>
  )
}

function CalendlyEmbed({ stateName, onChange }) {
  return (
    <div>
      <div
        style={{
          marginBottom: 18,
          padding: '14px 18px',
          background: colors.sagePale,
          borderRadius: 12,
          fontSize: '0.92rem',
          color: colors.pine,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span>
          Booking for <strong>{stateName}</strong>. Pick any open slot below.
        </span>
        <button
          type="button"
          onClick={onChange}
          style={{
            background: 'transparent',
            color: colors.brassDeep,
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Change state
        </button>
      </div>
      <div
        className="calendly-inline-widget"
        data-url={CALENDLY_EMBED_URL}
        style={{ minWidth: 320, height: 720, borderRadius: 16, overflow: 'hidden', background: colors.cream }}
      />
    </div>
  )
}
