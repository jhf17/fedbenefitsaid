import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { UNAVAILABLE_STATES, UNAVAILABLE_STATE_NAMES } from '../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

// Concern → which calculators, library section, and meeting CTA framing to recommend.
// Concern is now the only routing dimension (per user feedback — we dropped horizon,
// numbers-history, and preference).
const CONCERN_ROUTING = {
  pension: {
    label: 'My FERS pension — how much will I actually get?',
    calculators: [
      { title: 'FERS Pension Calculator', body: 'Side-by-side retirement-date scenarios with the 1.0%/1.1% multiplier.', href: '/calculators/fers' },
      { title: 'High-3 Salary Calculator', body: 'Find your three highest consecutive years of base pay — the figure the pension formula starts from.', href: '/calculators/high-3' },
      { title: 'Full Income Picture', body: 'Layer in Social Security, TSP, and the FERS Supplement to see the whole retirement income picture.', href: '/calculators/income-picture' },
    ],
    libraryTitle: 'Read the FERS Pension section of the Library',
    libraryBody: 'High-3, multipliers, the FERS Supplement, the 1.1% kicker at age 62 — explained in plain language with the 2026 figures and OPM-sourced rules.',
    libraryHref: '/reference',
    callBody: 'A FERS pension election is one of the bigger financial decisions a federal employee makes. A free meeting can pressure-test your scenarios and walk through anything the calculator didn\'t cover.',
  },
  csrs: {
    label: 'My CSRS pension — how is this computed?',
    calculators: [
      { title: 'CSRS Pension Calculator', body: 'The tiered formula (1.5% / 1.75% / 2.0%), the 80% cap, and CSRS-specific eligibility rules.', href: '/calculators/csrs' },
      { title: 'High-3 Salary Calculator', body: 'Average your three highest consecutive years of base pay — the figure the CSRS formula starts from.', href: '/calculators/high-3' },
      { title: 'Full Income Picture', body: 'Layer in TSP withdrawals and (if applicable) Social Security to see the whole retirement income picture.', href: '/calculators/income-picture' },
    ],
    libraryTitle: 'Read the CSRS section of the Library',
    libraryBody: 'Tiered multiplier, deposit/redeposit, CSRS-Offset, the 80% cap, and how survivor elections reduce the annuity.',
    libraryHref: '/reference',
    callBody: 'CSRS retirees often have unique service-history nuances (deposits, redeposits, breaks in service). A free meeting can untangle the parts that don\'t fit a calculator.',
  },
  special: {
    label: 'I\'m LEO / FF / ATC / Special Provisions',
    calculators: [
      { title: 'Special Provisions Pension Calculator', body: 'The 1.7% / 1.0% formula, the 50+20 and any-age+25 paths, immediate COLA.', href: '/calculators/special' },
      { title: 'High-3 Salary Calculator', body: 'Average your three highest consecutive years of base pay (LEAP counts for LEOs).', href: '/calculators/high-3' },
      { title: 'Full Income Picture', body: 'Layer in the FERS Supplement (paid until 62, no earnings test before MRA for SP retirees), TSP, and SS.', href: '/calculators/income-picture' },
    ],
    libraryTitle: 'Read the Special Provisions section of the Library',
    libraryBody: 'Mandatory retirement ages, secondary positions, the higher contribution rate, immediate COLA, and the enhanced FERS Supplement rules.',
    libraryHref: '/reference',
    callBody: 'Special Provisions eligibility quirks (ATC mandatory age, secondary positions, primary/secondary creditable service) are where calculators are weakest. A free meeting fills in the gaps.',
  },
  fegli: {
    label: 'FEGLI — premiums look like they\'ll explode at retirement',
    calculators: [
      { title: 'FEGLI Cost Over Time Calculator', body: 'See exactly how your premiums change after age 50, 60, 65 — through age 80. Most people are surprised by what happens at 65.', href: '/calculators/fegli' },
      { title: 'What-If Coverage Estimator', body: 'See what your federal benefits pay if you die, become disabled, or need long-term care — and where the gaps are.', href: '/calculators/what-if' },
    ],
    libraryTitle: 'Read the FEGLI section of the Library',
    libraryBody: 'Option A/B/C breakdown, the 75% reduction election, why premiums spike at 65, and when private term life makes more sense.',
    libraryHref: '/reference',
    callBody: 'FEGLI elections are often where federal employees over- or under-pay by the most. A free meeting can lay out what your premiums will look like at 65, 70, and 80 — and what your alternatives are.',
  },
  income: {
    label: 'Will my pension + SS + TSP be enough?',
    calculators: [
      { title: 'Full Income Picture Calculator', body: 'Combine your pension, FERS Supplement, Social Security, and TSP — net of federal/state tax and FEHB/Medicare — against your current take-home.', href: '/calculators/income-picture' },
      { title: 'FERS Pension Calculator', body: 'You\'ll need a pension number first; this gives you that.', href: '/calculators/fers' },
      { title: 'What-If Coverage Estimator', body: 'Test how income changes if you delay retirement, claim SS later, or change your TSP withdrawal rate.', href: '/calculators/what-if' },
    ],
    libraryTitle: 'Read the FERS Pension + TSP sections of the Library',
    libraryBody: 'The three legs of the FERS stool — pension, Social Security, TSP — each explained with the 2026 figures and the rules that govern withdrawals.',
    libraryHref: '/reference',
    callBody: 'The income-gap question rarely has one answer — it depends on retirement date, SS claim age, TSP withdrawal strategy, and FEHB/Medicare timing. A free meeting can walk through which levers are realistic for you.',
  },
  survivor: {
    label: 'What my family / spouse gets if something happens',
    calculators: [
      { title: 'What-If Coverage Estimator', body: 'FEGLI, FERS Survivor, FERS Disability, and FLTCIP modeled honestly — what each actually pays in your situation.', href: '/calculators/what-if' },
      { title: 'FERS Pension Calculator', body: 'See how the survivor annuity election reduces your pension while alive in exchange for spousal coverage.', href: '/calculators/fers' },
      { title: 'Full Income Picture', body: 'Run the picture with and without you — can your spouse live on the federal package alone?', href: '/calculators/income-picture' },
    ],
    libraryTitle: 'Read the Survivor Benefits section of the Library',
    libraryBody: 'Before you can decide whether your federal package is enough, you need to know what it actually pays a spouse. The library walks through SBP elections in plain language.',
    libraryHref: '/reference',
    callBody: 'Survivor coverage is where federal employees most often discover a real gap in what their family would receive. A free meeting can lay out the federal package alongside any private options that might fit.',
  },
  medicare: {
    label: 'FEHB and Medicare — when, what, how much?',
    calculators: [
      { title: 'Full Income Picture', body: 'See how FEHB and Medicare Part B affect net retirement income at 65+. Helps frame whether Part B\'s cost makes sense for you.', href: '/calculators/income-picture' },
      { title: 'FERS Pension Calculator', body: 'A pension number frames the Part B decision — it\'s a percentage of your retirement income.', href: '/calculators/fers' },
    ],
    libraryTitle: 'Read the FEHB + Medicare section of the Library',
    libraryBody: 'The interaction between FEHB and Medicare Part B is the single most-asked question we get. Read this first; it answers most of it without a meeting.',
    libraryHref: '/reference',
    callBody: 'FEHB-and-Medicare coordination at 65 is where one election can save (or cost) you thousands a year for the rest of your life. A free meeting can walk through your specific FEHB plan and the Part B math.',
  },
  options: {
    label: 'I just want to understand my options',
    calculators: [
      { title: 'When-Can-I-Retire Widget', body: 'Two inputs (birth year, hire year) → a dated timeline of every retirement milestone you\'ll hit.', href: '/#eligibility' },
      { title: 'FERS Pension Calculator', body: 'Once you have a feel for when you can retire, the pension number tells you what you\'ll have to live on.', href: '/calculators/fers' },
      { title: 'Full Income Picture', body: 'Combine your pension with SS and TSP for the whole picture.', href: '/calculators/income-picture' },
    ],
    libraryTitle: 'Browse the Reference Library',
    libraryBody: 'Eleven topic areas — FERS, TSP, FEHB, FEGLI, Medicare, Social Security, CSRS, Survivor Benefits, and more — each with 2026 figures, rules, and pitfalls.',
    libraryHref: '/reference',
    callBody: 'Sometimes the best first step is a free 30-minute meeting where we walk through your whole picture, identify what to focus on, and point you to the right tools from there. No agenda you don\'t bring.',
  },
}

const CONCERN_ORDER = ['pension', 'csrs', 'special', 'fegli', 'income', 'survivor', 'medicare', 'options']

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

export default function Assessment() {
  const [concern, setConcern] = useState(null)
  const [state, setState] = useState('')

  const route = concern ? CONCERN_ROUTING[concern] : null
  const stateBlocked = state && UNAVAILABLE_STATES.includes(state)

  const reset = () => {
    setConcern(null)
    setState('')
  }

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="Federal Retirement Readiness — pick your question"
        description="Tell us what you're trying to figure out and we'll point you to the right calculator, the right library section, or a free meeting. No email required, no preference quiz."
        path="/assessment"
      />

      {/* HERO */}
      <header
        style={{
          background: `linear-gradient(165deg, ${colors.pineDeep} 0%, ${colors.pine} 55%, ${colors.pineLight} 100%)`,
          color: '#ffffff',
          padding: '64px 24px 72px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: colors.brassLight,
              marginBottom: 14,
            }}
          >
            Pick your question
          </div>
          <h1
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              marginBottom: 18,
            }}
          >
            Tell us what's on your mind. We'll point you to the right tool.
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 580 }}>
            One question. We'll show you the calculators that fit, the library section that explains it, and offer a free meeting if you want a person to walk through it with you.
          </p>
        </div>
      </header>

      {/* MAIN */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 96px' }}>
        {!concern ? (
          <ConcernPicker onPick={setConcern} />
        ) : (
          <Results
            route={route}
            concern={concern}
            state={state}
            setState={setState}
            stateBlocked={stateBlocked}
            onReset={reset}
          />
        )}
      </section>
    </main>
  )
}

function ConcernPicker({ onPick }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 18,
        padding: '40px 36px',
        border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
        boxShadow: '0 4px 24px rgba(20,42,29,0.06)',
      }}
    >
      <h2
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 'clamp(1.4rem, 3vw, 1.85rem)',
          fontWeight: 600,
          color: colors.pine,
          lineHeight: 1.2,
          letterSpacing: '-0.015em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
          marginBottom: 10,
        }}
      >
        What's the question on your mind today?
      </h2>
      <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 28 }}>
        Pick the one that feels most pressing. You can always come back and pick a different one.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CONCERN_ORDER.map((id) => {
          const c = CONCERN_ROUTING[id]
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPick(id)}
              style={{
                textAlign: 'left',
                padding: '16px 20px',
                borderRadius: 12,
                border: `1px solid ${colors.borderLight || '#cbd5e1'}`,
                background: '#ffffff',
                fontFamily: FONT_SANS,
                fontSize: '0.98rem',
                lineHeight: 1.4,
                color: colors.charcoal,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.brass
                e.currentTarget.style.background = colors.brassPale
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.borderLight || '#cbd5e1'
                e.currentTarget.style.background = '#ffffff'
              }}
            >
              {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Results({ route, concern, state, setState, stateBlocked, onReset }) {
  return (
    <div>
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          padding: '36px 36px 28px',
          border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
          boxShadow: '0 4px 24px rgba(20,42,29,0.06)',
          marginBottom: 24,
        }}
      >
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
          Your question
        </div>
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: '1.6rem',
            fontWeight: 600,
            color: colors.pine,
            letterSpacing: '-0.015em',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
            marginBottom: 16,
          }}
        >
          {route.label}
        </h2>
        <button
          type="button"
          onClick={onReset}
          style={{
            background: 'transparent',
            color: colors.slate500,
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          ← Pick a different question
        </button>
      </div>

      {/* CALCULATORS */}
      <ResultSection
        label="Run the numbers"
        title="Calculators that fit your question"
      >
        <div style={{ display: 'grid', gap: 12 }}>
          {route.calculators.map((c) => (
            <Link
              key={c.href}
              to={c.href}
              style={{
                display: 'block',
                padding: '20px 22px',
                background: '#ffffff',
                borderRadius: 12,
                border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.brass
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(20,42,29,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.borderSubtle || 'rgba(31,61,44,0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.05rem', fontWeight: 600, color: colors.pine, marginBottom: 4, letterSpacing: '-0.005em' }}>
                {c.title} →
              </div>
              <div style={{ fontSize: '0.92rem', color: colors.slate700, lineHeight: 1.55 }}>{c.body}</div>
            </Link>
          ))}
        </div>
      </ResultSection>

      {/* LIBRARY */}
      <ResultSection
        label="Read the rules"
        title={route.libraryTitle}
      >
        <Link
          to={route.libraryHref}
          style={{
            display: 'block',
            padding: '20px 22px',
            background: '#ffffff',
            borderRadius: 12,
            border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.brass
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(20,42,29,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.borderSubtle || 'rgba(31,61,44,0.08)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ fontSize: '0.92rem', color: colors.slate700, lineHeight: 1.6 }}>{route.libraryBody}</div>
          <div style={{ marginTop: 10, fontSize: '0.88rem', fontWeight: 600, color: colors.brassDeep }}>
            Open the Library →
          </div>
        </Link>
      </ResultSection>

      {/* MEETING */}
      <ResultSection
        label="Talk to a person"
        title="Or book a free meeting"
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 70%, ${colors.pineLight} 100%)`,
            color: '#ffffff',
            borderRadius: 14,
            padding: '28px 32px',
          }}
        >
          <p style={{ fontSize: '1rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.85)', marginBottom: 20 }}>
            {route.callBody}
          </p>

          {/* State selector — only needed for the meeting CTA */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
              What state do you live in?
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 6,
                  padding: '10px 12px',
                  fontSize: '0.95rem',
                  border: `1px solid rgba(255,255,255,0.25)`,
                  borderRadius: 8,
                  fontFamily: FONT_SANS,
                  color: colors.charcoal,
                  background: '#ffffff',
                  appearance: 'auto',
                }}
              >
                <option value="">Select a state…</option>
                {US_STATES.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </label>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginTop: 8, lineHeight: 1.5 }}>
              Insurance and annuity products are not available in CA, NY, or AR — but the meeting (and all calculators / library) are open to everyone.
            </p>
          </div>

          {stateBlocked ? (
            <div style={{ padding: '14px 18px', background: 'rgba(176,141,90,0.18)', border: `1px solid ${colors.brass}`, borderRadius: 10, fontSize: '0.92rem', lineHeight: 1.55 }}>
              <strong style={{ color: colors.brassLight }}>{UNAVAILABLE_STATE_NAMES[state]} residents:</strong>{' '}
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>
                We can't currently book consultations in your state for product-related planning. The calculators and library remain fully open — that's where most decisions get made anyway.
              </span>
            </div>
          ) : (
            <Link
              to="/consultation"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 26px',
                background: colors.brass,
                color: '#ffffff',
                borderRadius: 10,
                fontSize: '0.98rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(176,141,90,0.32)',
                letterSpacing: '0.01em',
              }}
            >
              Book a meeting <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </ResultSection>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            color: colors.pine,
            border: `1px solid ${colors.pine}`,
            borderRadius: 10,
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: FONT_SANS,
          }}
        >
          Pick a different question
        </button>
        <Link
          to="/"
          style={{
            padding: '10px 20px',
            color: colors.slate500,
            fontSize: '0.95rem',
            fontWeight: 500,
            textDecoration: 'underline',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

function ResultSection({ label, title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: colors.brassDeep,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <h3
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.2rem',
          fontWeight: 600,
          color: colors.pine,
          marginBottom: 14,
          letterSpacing: '-0.01em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}
