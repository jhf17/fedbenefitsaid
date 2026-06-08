import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import ConsultantCTA from '../../components/ConsultantCTA'
import { colors, fonts } from '../../constants/theme'
import { formatCurrency } from '../../lib/pensionCalc'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const inputBox = {
  display: 'block',
  width: '100%',
  padding: '11px 14px',
  fontSize: '0.95rem',
  border: `1px solid ${colors.borderLight || '#cbd5e1'}`,
  borderRadius: 10,
  fontFamily: FONT_SANS,
  color: colors.charcoal,
  background: '#ffffff',
  marginTop: 6,
  appearance: 'auto',
}

const labelText = {
  fontSize: '0.84rem',
  fontWeight: 600,
  color: colors.pine,
  letterSpacing: '0.01em',
  display: 'block',
}

const helpText = {
  fontSize: '0.78rem',
  color: colors.slate500,
  marginTop: 6,
  lineHeight: 1.45,
}

/**
 * High-3 average salary calculator.
 *
 * The "High-3" is the average of the highest three consecutive years (36
 * consecutive months) of basic pay. It's the figure every pension formula
 * starts from. For most retirees that's the last 36 months before retirement
 * — but if pay dropped at the end (demotion, reduced locality), the optimal
 * window may be earlier.
 *
 * Inputs: a list of salary periods (start month → end month → annual base pay).
 * Output: the highest 36-month average among all valid sub-windows.
 */

const todayYM = () => new Date().toISOString().slice(0, 7)

const monthsBetween = (startYM, endYM) => {
  if (!startYM || !endYM) return 0
  const [sy, sm] = startYM.split('-').map(Number)
  const [ey, em] = endYM.split('-').map(Number)
  return (ey - sy) * 12 + (em - sm)
}

const yearsMonthsBetween = (startYM, endYM) => {
  const m = monthsBetween(startYM, endYM)
  return { years: Math.floor(m / 12), months: m % 12 }
}

const formatMonthLabel = (ym) => {
  if (!ym) return ''
  const [y, m] = ym.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const addMonths = (ym, n) => {
  const [y, m] = ym.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  const ny = Math.floor(total / 12)
  const nm = (total % 12) + 1
  return `${ny}-${String(nm).padStart(2, '0')}`
}

// Compute the highest 36-month average across the user's salary timeline.
// Each period contributes its annual pay for its month-count; we slide a
// 36-month window across the timeline and pick the max.
function computeHigh3(periods) {
  // Validate & sort periods chronologically.
  const valid = periods
    .filter((p) => p.start && p.end && Number(p.pay) > 0 && monthsBetween(p.start, p.end) > 0)
    .map((p) => ({ start: p.start, end: p.end, pay: Number(p.pay) }))
    .sort((a, b) => (a.start < b.start ? -1 : 1))

  if (valid.length === 0) return null

  const timelineStart = valid[0].start
  const timelineEnd = valid[valid.length - 1].end
  const totalMonths = monthsBetween(timelineStart, timelineEnd)
  if (totalMonths < 36) {
    return { error: 'Need at least 36 months of pay history.', totalMonths }
  }

  // Build a month-by-month pay array.
  const monthly = new Array(totalMonths).fill(0)
  for (const p of valid) {
    const offset = monthsBetween(timelineStart, p.start)
    const span = monthsBetween(p.start, p.end)
    for (let i = 0; i < span && offset + i < totalMonths; i++) {
      monthly[offset + i] = p.pay / 12
    }
  }

  // Slide a 36-month window and find the max sum.
  let bestSum = -1
  let bestStartIdx = 0
  let runningSum = 0
  for (let i = 0; i < 36 && i < totalMonths; i++) runningSum += monthly[i]
  bestSum = runningSum
  for (let i = 36; i < totalMonths; i++) {
    runningSum += monthly[i] - monthly[i - 36]
    if (runningSum > bestSum) {
      bestSum = runningSum
      bestStartIdx = i - 35
    }
  }

  const high3 = bestSum / 3
  const windowStart = addMonths(timelineStart, bestStartIdx)
  const windowEnd = addMonths(timelineStart, bestStartIdx + 35)

  return { high3, windowStart, windowEnd, totalMonths }
}

const blankPeriod = () => ({ id: Math.random().toString(36).slice(2, 8), start: '', end: '', pay: '' })

export default function High3() {
  const [periods, setPeriods] = useState(() => {
    // Reasonable default: 3 years ending this month at $95k.
    const end = todayYM()
    const start = addMonths(end, -36)
    return [{ id: 'seed', start, end, pay: 95000 }]
  })

  const result = useMemo(() => computeHigh3(periods), [periods])

  const updatePeriod = (id, patch) => {
    setPeriods((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const addPeriod = () => {
    // Default new period to start where the latest ended.
    const last = periods[periods.length - 1]
    const start = last?.end || todayYM()
    setPeriods([...periods, { ...blankPeriod(), start, end: addMonths(start, 12) }])
  }

  const removePeriod = (id) => {
    if (periods.length <= 1) return
    setPeriods(periods.filter((p) => p.id !== id))
  }

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="High-3 Salary Calculator"
        description="Calculate your High-3 — the average of your three highest consecutive years of base pay, which every federal pension formula starts from."
        path="/calculators/high-3"
      />

      <header
        style={{
          background: `linear-gradient(165deg, ${colors.pineDeep} 0%, ${colors.pine} 55%, ${colors.pineLight} 100%)`,
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
            background: 'radial-gradient(circle at 80% 0%, rgba(123,28,46,0.18) 0%, transparent 55%)',
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
              marginBottom: 14,
            }}
          >
            High-3 Calculator
          </div>
          <h1
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(2rem, 4.6vw, 3.2rem)',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              marginBottom: 18,
            }}
          >
            Your High-3 average pay <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              The number every pension formula starts from.
            </span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 660 }}>
            FERS and CSRS pensions are computed as <strong>High-3 × years of service × multiplier</strong>. Your High-3 is the average of any 36 consecutive months of basic pay — usually the last three years, but not always. Enter your salary periods and we'll find the optimal window.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 920, margin: '0 auto', padding: '48px 24px 96px' }}>
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 1px 3px rgba(15,29,61,0.04)',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: '1.5rem',
              fontWeight: 600,
              color: colors.pine,
              marginBottom: 8,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Your salary history
          </h2>
          <p style={{ fontSize: '0.92rem', color: colors.slate500, marginBottom: 24 }}>
            Add each period of your federal employment where base pay was constant. Locality + base is fine — exclude overtime, bonuses, awards, and night differential.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {periods.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1.2fr auto',
                  gap: 12,
                  alignItems: 'flex-end',
                  padding: 16,
                  background: colors.cream,
                  borderRadius: 12,
                  border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.06)'}`,
                }}
              >
                <label style={labelText}>
                  Start month
                  <input
                    type="month"
                    value={p.start}
                    onChange={(e) => updatePeriod(p.id, { start: e.target.value })}
                    style={inputBox}
                  />
                </label>
                <label style={labelText}>
                  End month
                  <input
                    type="month"
                    value={p.end}
                    onChange={(e) => updatePeriod(p.id, { end: e.target.value })}
                    style={inputBox}
                  />
                </label>
                <label style={labelText}>
                  Annual basic pay
                  <input
                    type="number"
                    value={p.pay}
                    onChange={(e) => updatePeriod(p.id, { pay: e.target.value })}
                    min="0"
                    step="500"
                    style={inputBox}
                    placeholder="e.g. 95000"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removePeriod(p.id)}
                  disabled={periods.length <= 1}
                  aria-label={`Remove row ${idx + 1}`}
                  style={{
                    padding: '11px 14px',
                    background: 'transparent',
                    color: periods.length <= 1 ? colors.slate300 : colors.brassDeep,
                    border: `1px solid ${periods.length <= 1 ? colors.slate300 : colors.brassDeep}`,
                    borderRadius: 10,
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: periods.length <= 1 ? 'not-allowed' : 'pointer',
                    fontFamily: FONT_SANS,
                    whiteSpace: 'nowrap',
                    height: 'fit-content',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addPeriod}
            style={{
              marginTop: 16,
              padding: '12px 22px',
              background: colors.pine,
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT_SANS,
              letterSpacing: '0.01em',
            }}
          >
            + Add another period
          </button>
          <p style={helpText}>
            Tip: most users only need one row covering their final three years of expected pay. Add more rows if your salary changed (promotion, grade increase, GS step, locality change).
          </p>
        </div>

        {/* RESULT */}
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 4px 16px rgba(15,29,61,0.05)',
          }}
        >
          {!result ? (
            <p style={{ color: colors.slate500, fontSize: '0.95rem' }}>Enter at least one salary period above.</p>
          ) : result.error ? (
            <div>
              <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.2rem', color: colors.brassDeep, marginBottom: 8 }}>
                Not enough data
              </h3>
              <p style={{ fontSize: '0.95rem', color: colors.slate700 }}>
                {result.error} You've entered {result.totalMonths} months ({yearsMonthsBetween('2000-01', addMonths('2000-01', result.totalMonths)).years} yr {yearsMonthsBetween('2000-01', addMonths('2000-01', result.totalMonths)).months} mo). Add more salary history to compute a High-3.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: colors.brassDeep,
                  marginBottom: 8,
                }}
              >
                Your High-3
              </div>
              <div
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '2.6rem',
                  fontWeight: 700,
                  color: colors.pine,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                  fontVariationSettings: '"opsz" 144, "SOFT" 50',
                }}
              >
                {formatCurrency(result.high3)}
              </div>
              <p style={{ fontSize: '0.95rem', color: colors.slate700, marginBottom: 16, lineHeight: 1.6 }}>
                Highest 36-month average: <strong>{formatMonthLabel(result.windowStart)}</strong> through{' '}
                <strong>{formatMonthLabel(addMonths(result.windowEnd, -1))}</strong>.
              </p>
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 18px',
                  background: colors.sagePale,
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  color: colors.pine,
                  lineHeight: 1.6,
                }}
              >
                Use this number in the <Link to="/calculators/fers" style={{ color: colors.brassDeep, textDecoration: 'underline', fontWeight: 600 }}>FERS</Link>,{' '}
                <Link to="/calculators/csrs" style={{ color: colors.brassDeep, textDecoration: 'underline', fontWeight: 600 }}>CSRS</Link>, or{' '}
                <Link to="/calculators/special" style={{ color: colors.brassDeep, textDecoration: 'underline', fontWeight: 600 }}>Special Provisions</Link> pension calculators — they'll combine it with your years of service and the right multiplier to give you your annuity.
              </div>
            </>
          )}
        </div>

        {/* HOW IT WORKS */}
        <div
          style={{
            marginTop: 24,
            background: colors.bone,
            border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
            borderRadius: 16,
            padding: 32,
          }}
        >
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: '1.3rem',
              fontWeight: 600,
              color: colors.pine,
              marginBottom: 12,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            How High-3 works
          </h2>
          <ul style={{ paddingLeft: 20, color: colors.slate700, fontSize: '0.95rem', lineHeight: 1.75, marginBottom: 0 }}>
            <li>Your High-3 is the average of the <strong>36 consecutive months</strong> where you earned the most in basic pay — typically the last three years of federal service.</li>
            <li><strong>Basic pay</strong> means base salary + locality pay. It excludes overtime, bonuses, awards, night differential, hazard pay, and most other premium pay (though law-enforcement availability pay does count for LEOs).</li>
            <li>The 36 months don't have to be calendar-aligned. If you got a big raise mid-year, the optimal window starts the month the raise hit.</li>
            <li>If your pay dropped at the end (e.g., demotion, reduced locality on relocation), the optimal window is earlier than retirement. This calculator finds the optimum automatically.</li>
            <li>Source: 5 USC 8331(4) (CSRS), 5 USC 8401(3) (FERS); OPM CSRS-FERS Handbook ch. 50.</li>
          </ul>
        </div>

        <div style={{ marginTop: 36 }}>
          <ConsultantCTA compact />
        </div>
      </section>
    </main>
  )
}
