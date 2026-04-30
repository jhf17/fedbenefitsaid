import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { UNAVAILABLE_STATES, UNAVAILABLE_STATE_NAMES } from '../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const QUESTIONS = [
  {
    id: 'horizon',
    label: 'How far out is retirement for you?',
    help: "If you're not sure, your best guess is fine. We use this to set urgency, not to pin you down.",
    options: [
      { value: 'lt2', label: 'Less than 2 years' },
      { value: '2to5', label: '2 to 5 years' },
      { value: '6to10', label: '6 to 10 years' },
      { value: 'gt10', label: 'More than 10 years (or just exploring)' },
      { value: 'retired', label: 'I\'m already retired' },
    ],
  },
  {
    id: 'concern',
    label: "What's the question on your mind today?",
    help: 'Pick the one that feels most pressing — we\'ll route you to the right tool first.',
    options: [
      { value: 'pension', label: 'My FERS pension — how much will I actually get?' },
      { value: 'fegli', label: 'FEGLI — premiums look like they\'ll explode at retirement' },
      { value: 'income', label: 'Will my pension + Social Security + TSP be enough?' },
      { value: 'survivor', label: 'What my family / spouse gets if something happens to me' },
      { value: 'medicare', label: 'FEHB and Medicare — when, what, how much?' },
      { value: 'options', label: 'Honestly, I just want to understand my options' },
    ],
  },
  {
    id: 'numbers',
    label: 'Have you run a FERS estimate before?',
    help: 'No judgment either way — most people haven\'t.',
    options: [
      { value: 'recent', label: 'Yes, within the last 12 months' },
      { value: 'old', label: 'Yes, but more than 2 years ago' },
      { value: 'tried', label: 'I tried but didn\'t really understand the result' },
      { value: 'never', label: 'No, I haven\'t' },
    ],
  },
  {
    id: 'state',
    label: 'What state do you live in?',
    help: 'We\'re available in most states — a few we\'re not (yet). This decides what we can offer if you want a call.',
    isStateDropdown: true,
  },
  {
    id: 'preference',
    label: 'How do you prefer to learn?',
    help: 'No wrong answer. We\'ll tilt the recommendations toward what fits.',
    options: [
      { value: 'tools', label: 'Hand me the calculators — I\'ll figure it out' },
      { value: 'reading', label: 'I want to read first, then run the numbers' },
      { value: 'talk', label: 'A 15-minute conversation would save me hours' },
    ],
  },
]

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

function buildPlan(answers) {
  const plan = []
  const concern = answers.concern
  const horizon = answers.horizon
  const numbers = answers.numbers
  const state = answers.state
  const preference = answers.preference

  // First action: based on top concern
  const concernRouting = {
    pension: {
      title: 'Run the FERS Pension Calculator',
      body: 'It takes five minutes. Use your High-3, your years of service, and the age you think you\'ll retire. The output gives you a baseline pension number you can compare scenarios against.',
      cta: 'Open the calculator',
      href: '/calculators/fers',
    },
    fegli: {
      title: 'Open the FEGLI Cost-Over-Time Tool',
      body: 'See exactly how your premiums change after age 50, 60, 65, and beyond — through age 80. Most federal employees are surprised by what happens at 65.',
      cta: 'Open the FEGLI calculator',
      href: '/calculators/fegli',
    },
    income: {
      title: 'Start with the FERS Pension Calculator',
      body: 'You can\'t answer the income-gap question without a pension number first. Run that, then we\'ll layer Social Security and TSP estimates on top in a follow-up tool (coming soon).',
      cta: 'Run the calculator',
      href: '/calculators/fers',
    },
    survivor: {
      title: 'Read the Survivor Benefits section in the Library',
      body: 'Before you can decide whether your federal package is enough, you need to know what it actually pays a spouse. The library walks through SBP elections in plain language.',
      cta: 'Open the library',
      href: '/reference',
    },
    medicare: {
      title: 'Read the FEHB + Medicare section in the Library',
      body: 'The interaction between FEHB and Medicare Part B is the single most-asked question we get. Read this first; it answers most of it without a call.',
      cta: 'Open the library',
      href: '/reference',
    },
    options: {
      title: 'Use the When-Can-I-Retire widget',
      body: 'Three inputs (birth year, hire year, retirement system) → a dated timeline of every milestone you\'ll hit. Best 60 seconds of orientation we\'ve found.',
      cta: 'Use the widget',
      href: '/#eligibility',
    },
  }
  if (concern && concernRouting[concern]) plan.push(concernRouting[concern])

  // Second action: based on numbers status
  if (numbers === 'never' || numbers === 'tried') {
    plan.push({
      title: 'Browse the FERS section of the Library',
      body: 'If the calculator output left you with questions, the library breaks down the High-3, the multipliers, and the FERS Supplement in language that doesn\'t assume you already know the rules.',
      cta: 'Read the FERS section',
      href: '/reference',
    })
  } else if (numbers === 'old') {
    plan.push({
      title: 'Re-run your numbers with current figures',
      body: 'Service years and High-3 change. Multipliers and earnings-test thresholds update annually. A two-year-old estimate is a two-year-old estimate.',
      cta: 'Re-run the calculator',
      href: '/calculators/fers',
    })
  }

  // Third action: based on horizon + preference
  const wantsCall = preference === 'talk' || horizon === 'lt2' || horizon === '2to5'
  const stateBlocked = state && UNAVAILABLE_STATES.includes(state)

  if (wantsCall && !stateBlocked) {
    plan.push({
      title: 'Book a 15-minute call',
      body:
        horizon === 'lt2'
          ? "If you're inside two years, the cost of one wrong election can outweigh decades of careful saving. The 15-minute call is free."
          : "You said a conversation would save you hours. The first 15 minutes are free, and there's no second-meeting expectation if it isn't useful.",
      cta: 'Book a call',
      href: '/consultation',
    })
  } else if (wantsCall && stateBlocked) {
    plan.push({
      title: 'Use the calculators and library while we expand',
      body: `We\'re not currently booking consultations for ${UNAVAILABLE_STATE_NAMES[state]} residents. The free education tools on the site will remain fully available.`,
      cta: 'Open the library',
      href: '/reference',
    })
  } else if (preference === 'reading') {
    plan.push({
      title: 'Subscribe for new articles (coming soon)',
      body: 'We\'re publishing one rigorously-cited article per benefit topic, updated each year. Library now; subscriptions soon.',
      cta: 'Open the library',
      href: '/reference',
    })
  }

  return plan
}

export default function Assessment() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)

  const total = QUESTIONS.length
  const current = QUESTIONS[step]

  const handleAnswer = (value) => {
    const updated = { ...answers, [current.id]: value }
    setAnswers(updated)
    if (step < total - 1) {
      setStep(step + 1)
    } else {
      setDone(true)
    }
  }

  const restart = () => {
    setStep(0)
    setAnswers({})
    setDone(false)
  }

  const plan = done ? buildPlan(answers) : []
  const stateBlocked = answers.state && UNAVAILABLE_STATES.includes(answers.state)

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="Federal Retirement Readiness — 5-Question Check"
        description="Five questions, a personalized starting plan. We route you to the calculator, library section, or call that answers your specific question first."
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
            Readiness check · 5 questions · 60 seconds
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
            Tell us five things, get a starting plan.
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 580 }}>
            We don't store your answers. We don't ask for an email. The output is a three-step plan tailored to what
            you said matters most — open the right calculator, read the right section, decide if a call is worth it.
          </p>
        </div>
      </header>

      {/* ASSESSMENT */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
        {!done ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '40px 36px',
              border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
              boxShadow: '0 4px 24px rgba(20,42,29,0.06)',
            }}
          >
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <span style={{ fontSize: '0.82rem', color: colors.slate500, fontWeight: 600, letterSpacing: '0.05em' }}>
                Question {step + 1} of {total}
              </span>
              <div style={{ flex: 1, height: 4, background: colors.bone, borderRadius: 999, marginLeft: 16, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${((step + 1) / total) * 100}%`,
                    background: colors.brass,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

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
              {current.label}
            </h2>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 28 }}>
              {current.help}
            </p>

            {current.isStateDropdown ? (
              <div>
                <select
                  value={answers.state || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
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
                <p style={{ fontSize: '0.84rem', color: colors.slate500, marginTop: 12, lineHeight: 1.5 }}>
                  Note: insurance and annuity products in consultations aren\'t available in California, New York, or
                  Arkansas. The calculators and library are open to everyone.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAnswer(opt.value)}
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
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{
                  marginTop: 28,
                  padding: '8px 0',
                  background: 'transparent',
                  color: colors.slate500,
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                ← Back
              </button>
            )}
          </div>
        ) : (
          <div>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 18,
                padding: '40px 36px',
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
                  marginBottom: 12,
                }}
              >
                Your starting plan
              </div>
              <h2
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '1.85rem',
                  fontWeight: 600,
                  color: colors.pine,
                  letterSpacing: '-0.015em',
                  fontVariationSettings: '"opsz" 144, "SOFT" 50',
                  marginBottom: 10,
                }}
              >
                Three things, in this order.
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: colors.slate700 }}>
                Based on what you told us, this is the path that saves you the most time. Skip anything that doesn't
                apply.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {plan.map((step, i) => (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    borderRadius: 14,
                    padding: 28,
                    border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr',
                    gap: 20,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: colors.sagePale,
                      color: colors.pine,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: FONT_SERIF,
                      fontWeight: 600,
                      fontSize: '1.3rem',
                      fontVariationSettings: '"opsz" 144, "SOFT" 50',
                    }}
                  >
                    0{i + 1}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: FONT_SERIF,
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        color: colors.pine,
                        marginBottom: 8,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '0.96rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 14 }}>
                      {step.body}
                    </p>
                    <Link
                      to={step.href}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        color: colors.brassDeep,
                        textDecoration: 'none',
                      }}
                    >
                      {step.cta}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {stateBlocked && (
              <div
                style={{
                  marginTop: 24,
                  padding: '20px 24px',
                  background: colors.brassPale,
                  border: `1px solid ${colors.brass}`,
                  borderRadius: 12,
                }}
              >
                <strong style={{ color: colors.brassDeep, fontFamily: FONT_SERIF }}>
                  Note for {UNAVAILABLE_STATE_NAMES[answers.state]} residents:
                </strong>{' '}
                <span style={{ color: colors.slate700, fontSize: '0.95rem' }}>
                  We can\'t currently book consultation calls for residents in your state. The free tools and library remain
                  fully available.
                </span>
              </div>
            )}

            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={restart}
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
                Start over
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
        )}
      </section>
    </main>
  )
}
