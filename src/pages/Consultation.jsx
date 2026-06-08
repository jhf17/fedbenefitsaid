import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { brand } from '../constants/brand'
import { CALENDLY_EMBED_URL, UNAVAILABLE_STATES, UNAVAILABLE_STATE_NAMES } from '../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

// Brand-aware shortcuts
const PRIMARY = colors.primary
const PRIMARY_DARK = colors.primaryDark
const PRIMARY_LIGHT = colors.primaryLight
const ACCENT = colors.accent
const ACCENT_DARK = colors.accentDark
const ACCENT_LIGHT = colors.accentLight

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
  { title: 'FERS / CSRS pension', body: 'High-3, sick-leave credit, scenario comparisons across retirement dates.' },
  { title: 'TSP withdrawals', body: 'Sequence-of-returns risk, Roth vs traditional split, RMDs.' },
  { title: 'Social Security timing', body: 'Claim age, the FERS Supplement earnings test, and what 70 actually buys you.' },
  { title: 'FEHB + Medicare', body: 'When to enroll in Part B, how the two programs coordinate, what to drop.' },
  { title: 'Survivor & disability', body: 'What your federal package actually pays your spouse, and when private alternatives make sense.' },
  { title: 'FEGLI cost trajectory', body: 'How premiums change after age 50/60/65 — and what your alternatives are.' },
]

export default function Consultation() {
  const [method, setMethod] = useState(null) // 'phone' | 'video'
  const widgetRef = useRef(null)

  const scrollToWidget = () => {
    setTimeout(() => {
      widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const pickMethod = (m) => {
    setMethod(m)
    scrollToWidget()
  }

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="Book a free meeting"
        description={`Talk to a Federal Retirement Consultant at ${brand.name}. Phone or Zoom, no time limit, no sales pitch. Bring your questions about FERS, TSP, FEHB, FEGLI, Medicare timing, or Social Security strategy.`}
        path="/consultation"
      />

      {/* HERO */}
      <header
        style={{
          background: `linear-gradient(165deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 55%, ${PRIMARY_LIGHT} 100%)`,
          color: '#ffffff',
          padding: '72px 24px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 80% 0%, ${rgba(ACCENT_LIGHT, 0.18)} 0%, transparent 55%)`,
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
              color: ACCENT_LIGHT,
              marginBottom: 16,
            }}
          >
            Book a meeting
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
            Bring the question.<br />
            <span style={{ color: ACCENT_LIGHT, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              We bring the rest.
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 620 }}>
            Phone or Zoom. The meeting is free and there is no time limit on it. Most run 30 to 45 minutes; some go 90.
            We send a written summary afterward with any numbers we walked through. If a follow-up isn't useful, there
            won't be one.
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
              color: ACCENT_DARK,
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
              color: PRIMARY,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              maxWidth: 640,
            }}
          >
            A few of the topics that come up most.
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
                border: `1px solid ${colors.primaryBorder}`,
              }}
            >
              <h3
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: PRIMARY,
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

      {/* METHOD PICKER */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 24px' }} ref={widgetRef}>
        {!method ? (
          <div>
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: ACCENT_DARK,
                  marginBottom: 10,
                }}
              >
                Pick a format
              </div>
              <h2
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)',
                  fontWeight: 600,
                  color: PRIMARY,
                  lineHeight: 1.15,
                  letterSpacing: '-0.015em',
                  fontVariationSettings: '"opsz" 144, "SOFT" 50',
                }}
              >
                Phone or Zoom?
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              <MethodCard
                title="Phone call"
                tagline="We call you at the time you pick"
                body="Pick a date and a 30-minute slot between 8 AM and 7:30 PM ET. We call you. Works best if you would rather not share your screen, or you are calling from your car."
                onClick={() => pickMethod('phone')}
              />
              <MethodCard
                title="Zoom"
                tagline="Pick a slot from the live calendar"
                body="Choose any open slot on the calendar. You get a confirmation email with the Zoom link. Works best when you want to walk through calculator outputs on screen together."
                onClick={() => pickMethod('video')}
              />
            </div>
          </div>
        ) : method === 'phone' ? (
          <PhonePath onBack={() => setMethod(null)} />
        ) : (
          <VideoPath onBack={() => setMethod(null)} />
        )}
      </section>

      {/* TRUST FOOTER STRIP */}
      <section style={{ background: colors.bone, padding: '48px 24px', borderTop: `1px solid ${colors.primaryBorder}`, marginTop: 48 }}>
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
          <TrustItem label="No cost" body="The meeting is free. There is no time limit on it." />
          <TrustItem label="No prep" body="Bring the questions. We have the rest." />
          <TrustItem label="No pressure" body="If we are not the right fit, we will say so." />
        </div>
      </section>
    </main>
  )
}

function MethodCard({ title, tagline, body, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '28px 28px 24px',
        background: '#ffffff',
        border: `1px solid ${colors.primaryBorder}`,
        borderRadius: 16,
        cursor: 'pointer',
        fontFamily: FONT_SANS,
        boxShadow: '0 2px 12px rgba(20,30,55,0.04)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.accentBorder
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(20,30,55,0.10)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.primaryBorder
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(20,30,55,0.04)'
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ACCENT_DARK,
          marginBottom: 8,
        }}
      >
        {tagline}
      </div>
      <h3
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.4rem',
          fontWeight: 600,
          color: PRIMARY,
          marginBottom: 12,
          letterSpacing: '-0.01em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.96rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 16, flex: 1 }}>{body}</p>
      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: ACCENT_DARK, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Choose this <span aria-hidden>→</span>
      </span>
    </button>
  )
}

// ─── Phone path: form ───────────────────────────────────────────────

// Time slots: 8:00 AM – 7:30 PM ET, in 30-minute increments (24 slots).
const PHONE_TIME_SLOTS = (() => {
  const slots = []
  for (let h = 8; h < 20; h++) {
    for (const m of [0, 30]) {
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
      const display = `${displayHour}:${String(m).padStart(2, '0')} ${period} ET`
      const totalMinutes = h * 60 + m
      slots.push({ value: display, totalMinutes })
    }
  }
  return slots
})()

function getEtNowMinutes() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(new Date())
  const h = parseInt(parts.find((p) => p.type === 'hour').value, 10)
  const m = parseInt(parts.find((p) => p.type === 'minute').value, 10)
  return h * 60 + m
}

function getEtTodayString() {
  // YYYY-MM-DD in ET
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

function PhonePath({ onBack }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    employer: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  })
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error' | 'blocked'
  const [errorMsg, setErrorMsg] = useState('')

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/.netlify/functions/request-phone-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, _source: brand.domain }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 403) {
        setStatus('blocked')
        setErrorMsg(data.error || 'Consultations are not available in your state.')
        return
      }
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong. Please try again, or use the video-call option.')
        return
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    const friendlyDate = form.preferredDate
      ? new Date(form.preferredDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'soon'
    return (
      <SuccessPanel
        title="Request received."
        body={`Thanks, ${form.name.split(' ')[0] || 'there'}. We'll call you at ${form.phone} on ${friendlyDate} at ${form.preferredTime || 'your selected time'}. If anything changes before then, reply to the confirmation we'll send to ${form.email}.`}
        onBack={onBack}
      />
    )
  }

  if (status === 'blocked') {
    return (
      <BlockedPanel stateCode={form.state} message={errorMsg} onBack={onBack} />
    )
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 18,
        padding: '40px 36px',
        border: `1px solid ${colors.primaryBorder}`,
        boxShadow: '0 4px 24px rgba(15,29,61,0.06)',
      }}
    >
      <BackLink onClick={onBack} label="← Pick a different format" />
      <h2
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.7rem',
          fontWeight: 600,
          color: colors.primary,
          marginBottom: 8,
          marginTop: 14,
          letterSpacing: '-0.015em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        Phone call — when's a good time?
      </h2>
      <p style={{ fontSize: '1rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 24 }}>
        Pick a date and a 30-minute time slot (8:00&nbsp;AM – 7:30&nbsp;PM ET). An FRC will call you at the number below at the slot you choose. We'll only use this info for the meeting — no email lists, no third-party sharing.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        <Row two>
          <Field label="Name" required>
            <input type="text" required value={form.name} onChange={(e) => update({ name: e.target.value })} style={inputBox} placeholder="Your name" />
          </Field>
          <Field label="Email" required>
            <input type="email" required value={form.email} onChange={(e) => update({ email: e.target.value })} style={inputBox} placeholder="you@example.com" />
          </Field>
        </Row>
        <Row two>
          <Field label="Phone" required hint="We'll call this number at your preferred time.">
            <input type="tel" required value={form.phone} onChange={(e) => update({ phone: e.target.value })} style={inputBox} placeholder="(555) 123-4567" />
          </Field>
          <Field label="State of residence" required>
            <select required value={form.state} onChange={(e) => update({ state: e.target.value })} style={{ ...inputBox, appearance: 'auto' }}>
              <option value="">Select a state…</option>
              {US_STATES.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </Field>
        </Row>
        <Field label="Employer / agency / department" hint="VA, DoD, USPS, OPM, agency name — whatever fits. Helps us prep.">
          <input type="text" value={form.employer} onChange={(e) => update({ employer: e.target.value })} style={inputBox} placeholder="e.g. Department of Veterans Affairs" />
        </Field>
        <Field label="Preferred date" required>
          <input
            type="date"
            required
            value={form.preferredDate}
            onChange={(e) => update({ preferredDate: e.target.value, preferredTime: '' })}
            style={inputBox}
            min={getEtTodayString()}
          />
        </Field>

        <TimeSlotPicker
          preferredDate={form.preferredDate}
          selectedTime={form.preferredTime}
          onSelect={(time) => update({ preferredTime: time })}
        />
        {/* Hidden input enforces native required validation for the time slot */}
        <input
          type="text"
          value={form.preferredTime}
          onChange={() => {}}
          required
          aria-hidden="true"
          tabIndex={-1}
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
        />
        <Field label="Anything else? (optional)" hint="Specific question, deadline, document you'd like us to look at — anything that helps us prep.">
          <textarea
            value={form.message}
            onChange={(e) => update({ message: e.target.value })}
            rows={3}
            style={{ ...inputBox, resize: 'vertical', minHeight: 90 }}
            placeholder="e.g. Trying to decide whether to retire this December or next June."
          />
        </Field>

        {errorMsg && (
          <div role="alert" style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, color: '#991b1b', fontSize: '0.92rem' }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{
            marginTop: 8,
            padding: '14px 28px',
            background: status === 'submitting' ? rgba(ACCENT, 0.55) : colors.accent,
            color: '#ffffff',
            borderRadius: 10,
            fontSize: '1rem',
            fontWeight: 600,
            border: 'none',
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            letterSpacing: '0.01em',
            boxShadow: `0 6px 18px ${rgba(ACCENT, 0.28)}`,
            fontFamily: FONT_SANS,
            alignSelf: 'flex-start',
          }}
        >
          {status === 'submitting' ? 'Sending…' : 'Request the call →'}
        </button>
      </form>
    </div>
  )
}

// ─── Video path: Calendly ───────────────────────────────────────────

function VideoPath({ onBack }) {
  const [state, setState] = useState('')
  const [showCalendly, setShowCalendly] = useState(false)

  const stateBlocked = state && UNAVAILABLE_STATES.includes(state)

  useEffect(() => {
    if (!showCalendly) return
    const existing = document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
  }, [showCalendly])

  if (showCalendly && !stateBlocked) {
    return (
      <div>
        <BackLink onClick={() => setShowCalendly(false)} label="← Change state" />
        <div
          style={{
            marginTop: 18,
            marginBottom: 18,
            padding: '14px 18px',
            background: colors.primaryTint,
            borderRadius: 12,
            fontSize: '0.92rem',
            color: colors.primary,
          }}
        >
          Booking video call for <strong>{US_STATES.find((s) => s[0] === state)?.[1] || state}</strong>. Pick any open slot below — you'll get a confirmation email with the Zoom link.
        </div>
        <div
          className="calendly-inline-widget"
          data-url={CALENDLY_EMBED_URL}
          style={{ minWidth: 320, height: 720, borderRadius: 16, overflow: 'hidden', background: colors.cream }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 18,
        padding: '40px 36px',
        border: `1px solid ${colors.primaryBorder}`,
        boxShadow: '0 4px 24px rgba(15,29,61,0.06)',
      }}
    >
      <BackLink onClick={onBack} label="← Pick a different format" />
      <h2
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.7rem',
          fontWeight: 600,
          color: colors.primary,
          marginBottom: 8,
          marginTop: 14,
          letterSpacing: '-0.015em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        Video call — find a time
      </h2>
      <p style={{ fontSize: '1rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 24 }}>
        One quick question first — we want to make sure we're set up to actually help you, given where you live.
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); if (state) setShowCalendly(true) }}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <label style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.primary }}>
          What state do you live in?
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            style={{ ...inputBox, appearance: 'auto' }}
          >
            <option value="">Select a state…</option>
            {US_STATES.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </label>
        {stateBlocked && (
          <BlockedInline state={state} />
        )}
        <button
          type="submit"
          disabled={!state || stateBlocked}
          style={{
            marginTop: 8,
            padding: '14px 28px',
            background: !state || stateBlocked ? rgba(ACCENT, 0.35) : colors.accent,
            color: '#ffffff',
            borderRadius: 10,
            fontSize: '1rem',
            fontWeight: 600,
            border: 'none',
            cursor: !state || stateBlocked ? 'not-allowed' : 'pointer',
            letterSpacing: '0.01em',
            boxShadow: !state || stateBlocked ? 'none' : `0 6px 18px ${rgba(ACCENT, 0.28)}`,
            fontFamily: FONT_SANS,
            alignSelf: 'flex-start',
          }}
        >
          Continue →
        </button>
      </form>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────

function TimeSlotPicker({ preferredDate, selectedTime, onSelect }) {
  const isToday = preferredDate && preferredDate === getEtTodayString()
  const etNowMin = isToday ? getEtNowMinutes() : -Infinity

  return (
    <div>
      <div
        style={{
          fontSize: '0.86rem',
          fontWeight: 600,
          color: colors.primary,
          marginBottom: 8,
        }}
      >
        Preferred time <span style={{ color: colors.accentDark, marginLeft: 4 }}>*</span>
      </div>
      {!preferredDate ? (
        <div
          style={{
            padding: '14px 16px',
            background: colors.bone,
            borderRadius: 10,
            fontSize: '0.9rem',
            color: colors.slate500,
            border: `1px dashed ${colors.slate300}`,
          }}
        >
          Pick a date above to see available times.
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 8,
            }}
          >
            {PHONE_TIME_SLOTS.map((slot) => {
              const isPast = slot.totalMinutes <= etNowMin
              const isSelected = selectedTime === slot.value
              return (
                <button
                  key={slot.value}
                  type="button"
                  disabled={isPast}
                  onClick={() => onSelect(slot.value)}
                  aria-pressed={isSelected}
                  style={{
                    padding: '10px 8px',
                    fontSize: '0.86rem',
                    fontWeight: isSelected ? 600 : 500,
                    fontFamily: 'inherit',
                    background: isSelected ? colors.accent : isPast ? '#f3f0e8' : '#ffffff',
                    color: isSelected ? '#ffffff' : isPast ? colors.slate500 : colors.charcoal,
                    border: `1px solid ${isSelected ? colors.accent : isPast ? 'rgba(26,45,92,0.08)' : colors.slate300}`,
                    borderRadius: 8,
                    cursor: isPast ? 'not-allowed' : 'pointer',
                    transition: 'all 0.12s ease',
                    opacity: isPast ? 0.55 : 1,
                    textDecoration: isPast ? 'line-through' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (isPast || isSelected) return
                    e.currentTarget.style.borderColor = colors.accent
                    e.currentTarget.style.background = colors.accentPale
                  }}
                  onMouseLeave={(e) => {
                    if (isPast || isSelected) return
                    e.currentTarget.style.borderColor = colors.slate300
                    e.currentTarget.style.background = '#ffffff'
                  }}
                >
                  {slot.value.replace(' ET', '')}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize: '0.78rem', color: colors.slate500, marginTop: 8, lineHeight: 1.5 }}>
            Times shown in Eastern Time (ET). Slots run 8:00 AM – 7:30 PM ET in 30-minute increments.
          </p>
        </>
      )}
    </div>
  )
}

function BackLink({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
      {label}
    </button>
  )
}

function Row({ two, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: two ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr', gap: 14 }}>
      {children}
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: colors.primary }}>
      {label}{required && <span style={{ color: colors.accentDark, marginLeft: 4 }}>*</span>}
      {children}
      {hint && <span style={{ display: 'block', fontSize: '0.78rem', color: colors.slate500, marginTop: 4, lineHeight: 1.5, fontWeight: 400 }}>{hint}</span>}
    </label>
  )
}

function SuccessPanel({ title, body, onBack }) {
  return (
    <div
      style={{
        background: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: 18,
        padding: '36px 36px',
      }}
    >
      <h2
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.6rem',
          fontWeight: 600,
          color: '#14532d',
          marginBottom: 14,
          letterSpacing: '-0.015em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: '1.02rem', lineHeight: 1.65, color: '#166534', marginBottom: 20 }}>{body}</p>
      <Link
        to="/calculators"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 24px',
          background: colors.primary,
          color: '#ffffff',
          borderRadius: 10,
          fontSize: '0.95rem',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Browse the calculators while you wait
      </Link>
    </div>
  )
}

function BlockedPanel({ stateCode, message, onBack }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 18,
        padding: '36px 36px',
        border: `1px solid ${colors.accent}`,
      }}
    >
      <BackLink onClick={onBack} label="← Pick a different format" />
      <h2
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.5rem',
          fontWeight: 600,
          color: colors.primary,
          marginBottom: 12,
          marginTop: 14,
          letterSpacing: '-0.015em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        We can't currently book in {UNAVAILABLE_STATE_NAMES[stateCode] || 'your state'}.
      </h2>
      <p style={{ fontSize: '1rem', lineHeight: 1.65, color: colors.slate700, marginBottom: 18 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/calculators" style={primaryLinkStyle()}>Open the calculators</Link>
        <Link to="/reference" style={secondaryLinkStyle()}>Read the library</Link>
      </div>
    </div>
  )
}

function BlockedInline({ state }) {
  return (
    <div style={{ padding: '12px 16px', background: colors.accentPale, border: `1px solid ${colors.accent}`, borderRadius: 10, fontSize: '0.92rem', color: colors.slate700, lineHeight: 1.55 }}>
      Federal Market Associates can't currently book consultations for <strong>{UNAVAILABLE_STATE_NAMES[state]}</strong> residents. The calculators and library remain fully open to you.
    </div>
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
          color: colors.accentDark,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <p style={{ fontSize: '0.95rem', color: colors.slate700, lineHeight: 1.5 }}>{body}</p>
    </div>
  )
}

function primaryLinkStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    background: colors.primary,
    color: '#ffffff',
    borderRadius: 10,
    fontSize: '0.95rem',
    fontWeight: 600,
    textDecoration: 'none',
  }
}

function secondaryLinkStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    background: 'transparent',
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    borderRadius: 10,
    fontSize: '0.95rem',
    fontWeight: 600,
    textDecoration: 'none',
  }
}

const inputBox = {
  display: 'block',
  width: '100%',
  padding: '11px 14px',
  fontSize: '0.95rem',
  border: `1px solid ${colors.slate300}`,
  borderRadius: 10,
  fontFamily: FONT_SANS,
  color: colors.charcoal,
  background: '#ffffff',
  marginTop: 6,
}

function rgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
