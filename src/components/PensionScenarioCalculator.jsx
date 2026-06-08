import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from './fma/Button'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'
import { colors, fonts } from '../constants/theme'
import { formatCurrency, formatYearsMonths, formatMonth } from '../lib/pensionCalc'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const todayYM = () => new Date().toISOString().slice(0, 7)

const yearsFromNow = (yrs) => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + yrs)
  return d.toISOString().slice(0, 7)
}

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
 * Shared pension scenario calculator UI.
 *
 * @param {string}   system        Display name ("FERS" / "CSRS" / "FERS Special Provisions")
 * @param {string}   accentColor   CSS color for system accent
 * @param {function} calc          Per-scenario calc fn from pensionCalc.js
 * @param {object}   extraInputs   Map of system-specific extra input descriptors
 * @param {array}    eligibility   List of eligibility rules to show
 * @param {string}   formula       Formula description to show
 * @param {function} renderScenarioDetails  Render extra system-specific rows in scenario card
 * @param {string}   chartLabel    Label for the chart line
 */
export default function PensionScenarioCalculator({
  system,
  calc,
  extraInputs = [],
  eligibility = [],
  formula,
  renderScenarioDetails,
  notes = [],
}) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Common inputs
  const [birthDate, setBirthDate] = useState('1972-06')
  const [hireDate, setHireDate] = useState('2008-09')
  const [high3Salary, setHigh3Salary] = useState(95000)
  const [sickLeaveHours, setSickLeaveHours] = useState(0)

  // System-specific extra inputs
  const [extraValues, setExtraValues] = useState(() =>
    extraInputs.reduce((acc, i) => ({ ...acc, [i.name]: i.defaultValue ?? 0 }), {})
  )

  // Scenarios — start with one. Users can add more via the "Add another scenario" button.
  const [scenarios, setScenarios] = useState(() => [
    { id: 1, label: 'Scenario 1', retireDate: yearsFromNow(5) },
  ])

  const addScenario = () => {
    const id = (scenarios.at(-1)?.id || 0) + 1
    setScenarios([...scenarios, { id, label: `Scenario ${id}`, retireDate: yearsFromNow(5 + scenarios.length * 3) }])
  }

  const updateScenario = (id, patch) => {
    setScenarios(scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const removeScenario = (id) => {
    if (scenarios.length <= 1) return
    setScenarios(scenarios.filter((s) => s.id !== id))
  }

  // Run calculations for each scenario
  const results = useMemo(() => {
    return scenarios.map((s) => {
      const result = calc({
        birthDate,
        hireDate,
        retireDate: s.retireDate,
        high3: Number(high3Salary) || 0,
        sickLeaveHours: Number(sickLeaveHours) || 0,
        ...extraValues,
      })
      return { scenario: s, result }
    })
  }, [scenarios, birthDate, hireDate, high3Salary, sickLeaveHours, extraValues, calc])

  // Chart: pension by retirement age, year-by-year from MRA-ish through age 70
  const chartData = useMemo(() => {
    const data = []
    if (!birthDate) return data
    const birthYear = parseInt(birthDate.split('-')[0], 10)
    const birthMonth = parseInt(birthDate.split('-')[1], 10)
    for (let age = 50; age <= 72; age += 1) {
      const retireYear = birthYear + age
      const retireDate = `${retireYear}-${String(birthMonth).padStart(2, '0')}`
      const r = calc({
        birthDate,
        hireDate,
        retireDate,
        high3: Number(high3Salary) || 0,
        sickLeaveHours: Number(sickLeaveHours) || 0,
        ...extraValues,
      })
      if (r && r.annualAnnuity != null) {
        const monthly = r.monthlyAnnuity || 0
        data.push({
          age,
          monthlyPension: Math.round(monthly),
          eligible: r.category && r.category !== 'ineligible' && r.category !== 'deferred',
        })
      }
    }
    return data
  }, [birthDate, hireDate, high3Salary, sickLeaveHours, extraValues, calc])

  const eligibleScenarios = results.filter((r) => r.result && r.result.category && r.result.category !== 'ineligible')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* INPUTS */}
      <section
        style={{
          background: '#ffffff',
          border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
          borderRadius: 16,
          padding: isMobile ? 24 : 32,
          boxShadow: '0 1px 3px rgba(15,29,61,0.04)',
        }}
      >
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: isMobile ? '1.4rem' : '1.6rem',
            fontWeight: 600,
            color: colors.pine,
            marginBottom: 6,
            letterSpacing: '-0.01em',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
          }}
        >
          About you
        </h2>
        <p style={{ fontSize: '0.92rem', color: colors.slate500, marginBottom: 22 }}>
          Everything happens in your browser. Nothing is stored or sent.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 16,
          }}
        >
          <label style={labelText}>
            Date of birth
            <input
              type="month"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={todayYM()}
              style={inputBox}
            />
            <span style={helpText}>Used for age and Minimum Retirement Age (FERS).</span>
          </label>

          <label style={labelText}>
            Federal hire date (or Special Provisions service start)
            <input
              type="month"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              max={todayYM()}
              style={inputBox}
            />
            <span style={helpText}>If you bought back military service, count from the deposit-completion date.</span>
          </label>

          <label style={labelText}>
            High-3 average salary
            <input
              type="number"
              value={high3Salary}
              onChange={(e) => setHigh3Salary(e.target.value)}
              min="0"
              step="500"
              style={inputBox}
            />
            <span style={helpText}>
              Average of the highest 36 consecutive months of basic pay (base salary + locality, no overtime/bonuses/awards). Use the <Link to="/calculators/high-3" style={{ color: colors.brassDeep, fontWeight: 600 }}>High-3 calculator</Link> if you need to project it for a future retirement date.
            </span>
          </label>

          <label style={labelText}>
            Sick leave balance (hours, optional)
            <input
              type="number"
              value={sickLeaveHours}
              onChange={(e) => setSickLeaveHours(e.target.value)}
              min="0"
              step="1"
              style={inputBox}
            />
            <span style={helpText}>2,087 hours = 1 year of credit. Added to the annuity computation (does not affect eligibility thresholds).</span>
          </label>

          {extraInputs.map((inp) => (
            <label key={inp.name} style={labelText}>
              {inp.label}
              <input
                type={inp.type || 'number'}
                value={extraValues[inp.name]}
                onChange={(e) => setExtraValues({ ...extraValues, [inp.name]: e.target.value })}
                step={inp.step || '1'}
                min={inp.min || '0'}
                style={inputBox}
              />
              {inp.help && <span style={helpText}>{inp.help}</span>}
            </label>
          ))}
        </div>

      </section>

      {/* SCENARIOS */}
      <section
        style={{
          background: '#ffffff',
          border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
          borderRadius: 16,
          padding: isMobile ? 24 : 32,
          boxShadow: '0 1px 3px rgba(15,29,61,0.04)',
        }}
      >
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: isMobile ? '1.4rem' : '1.6rem',
            fontWeight: 600,
            color: colors.pine,
            marginBottom: 6,
            letterSpacing: '-0.01em',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
          }}
        >
          Retirement scenarios
        </h2>
        <p style={{ fontSize: '0.92rem', color: colors.slate500, marginBottom: 22 }}>
          Pick any retirement month and see what you'd get. Add as many scenarios as you want.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenarios.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr auto',
                gap: 12,
                alignItems: 'flex-end',
                padding: 16,
                background: colors.cream,
                borderRadius: 12,
                border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.06)'}`,
              }}
            >
              <label style={labelText}>
                Scenario name
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => updateScenario(s.id, { label: e.target.value })}
                  style={inputBox}
                />
              </label>
              <label style={labelText}>
                Retirement month
                <input
                  type="month"
                  value={s.retireDate}
                  onChange={(e) => updateScenario(s.id, { retireDate: e.target.value })}
                  min={hireDate}
                  style={inputBox}
                />
              </label>
              <button
                type="button"
                onClick={() => removeScenario(s.id)}
                disabled={scenarios.length <= 1}
                style={{
                  padding: '11px 16px',
                  background: 'transparent',
                  color: scenarios.length <= 1 ? colors.slate300 : colors.brassDeep,
                  border: `1px solid ${scenarios.length <= 1 ? colors.slate300 : colors.brassDeep}`,
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: scenarios.length <= 1 ? 'not-allowed' : 'pointer',
                  fontFamily: FONT_SANS,
                  whiteSpace: 'nowrap',
                  height: 'fit-content',
                  marginTop: isMobile ? 4 : 26,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addScenario}
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
          + Add another scenario
        </button>
      </section>

      {/* RESULTS */}
      <section>
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: isMobile ? '1.6rem' : '2rem',
            fontWeight: 600,
            color: colors.pine,
            marginBottom: 6,
            letterSpacing: '-0.015em',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
          }}
        >
          Side-by-side
        </h2>
        <p style={{ fontSize: '0.95rem', color: colors.slate500, marginBottom: 24 }}>
          Numbers update as you change inputs. We show pre-tax annual + monthly figures, in
          today's-dollars (no COLA compounding).
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : `repeat(${results.length}, minmax(0, 1fr))`,
            gap: 16,
          }}
        >
          {results.map(({ scenario, result }) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              result={result}
              renderExtra={renderScenarioDetails}
            />
          ))}
        </div>
      </section>

      {/* CHART */}
      {chartData.length > 0 && (
        <section
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
            borderRadius: 16,
            padding: isMobile ? 20 : 32,
            boxShadow: '0 1px 3px rgba(15,29,61,0.04)',
          }}
        >
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: isMobile ? '1.4rem' : '1.7rem',
              fontWeight: 600,
              color: colors.pine,
              marginBottom: 6,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Monthly pension by retirement age
          </h2>
          <p style={{ fontSize: '0.92rem', color: colors.slate500, marginBottom: 18 }}>
            Monthly pension at each retirement age, using the High-3 you entered. Vertical dashes mark the scenarios you've set up above.
          </p>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="rgba(26,45,92,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="age" tick={{ fontSize: 12, fill: colors.slate700, fontFamily: FONT_SANS }} label={{ value: 'Age at retirement', position: 'insideBottom', offset: -2, fontSize: 12, fill: colors.slate500 }} />
                <YAxis tick={{ fontSize: 12, fill: colors.slate700, fontFamily: FONT_SANS }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => formatCurrency(v) + '/mo'}
                  labelFormatter={(l) => `Age ${l}`}
                  contentStyle={{ background: '#ffffff', border: `1px solid ${colors.brass}`, borderRadius: 10, fontFamily: FONT_SANS, fontSize: '0.88rem' }}
                />
                <Line type="monotone" dataKey="monthlyPension" stroke={colors.pine} strokeWidth={3} dot={false} name="Monthly pension" />
                {eligibleScenarios.map(({ scenario, result }) => (
                  <ReferenceLine
                    key={scenario.id}
                    x={Math.round(result.ageAtRetirement)}
                    stroke={colors.brassDeep}
                    strokeDasharray="2 4"
                    label={{ value: scenario.label, fontSize: 11, fill: colors.brassDeep, position: 'top' }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* CONTEXT */}
      {(eligibility.length > 0 || formula || notes.length > 0) && (
        <section
          style={{
            background: colors.bone,
            border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
            borderRadius: 16,
            padding: isMobile ? 24 : 32,
          }}
        >
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: '1.4rem',
              fontWeight: 600,
              color: colors.pine,
              marginBottom: 14,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            How {system} pension works
          </h2>
          {formula && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.brassDeep, marginBottom: 6 }}>
                Formula
              </div>
              <div
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '1.05rem',
                  color: colors.pine,
                  background: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
                  letterSpacing: '-0.005em',
                }}
              >
                {formula}
              </div>
            </div>
          )}
          {eligibility.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.brassDeep, marginBottom: 6 }}>
                Eligibility
              </div>
              <ul style={{ paddingLeft: 20, color: colors.slate700, fontSize: '0.95rem', lineHeight: 1.7 }}>
                {eligibility.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {notes.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.brassDeep, marginBottom: 6 }}>
                Notes
              </div>
              <ul style={{ paddingLeft: 20, color: colors.slate700, fontSize: '0.95rem', lineHeight: 1.7 }}>
                {notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* CTA */}
      <section
        style={{
          background: `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 70%, ${colors.pineLight} 100%)`,
          color: '#ffffff',
          borderRadius: 16,
          padding: isMobile ? 28 : 40,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: colors.brassLight,
              marginBottom: 8,
            }}
          >
            Want a second set of eyes?
          </div>
          <h3
            style={{
              fontFamily: FONT_SERIF,
              fontSize: isMobile ? '1.4rem' : '1.6rem',
              fontWeight: 600,
              marginBottom: 10,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Walk through your scenarios with us — free.
          </h3>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
            A short conversation usually surfaces what the calculator can't show — sick-leave nuances, pay-band quirks, what to ask your HR office, and whether your scenarios actually pencil out for the rest of your financial picture.
          </p>
        </div>
        <Button to="/consultation" variant="primary" arrow style={{ flexShrink: 0 }}>Book a meeting</Button>
      </section>
    </div>
  )
}

function ScenarioCard({ scenario, result, renderExtra }) {
  if (!result) {
    return (
      <div style={cardStyle}>
        <div style={{ ...cardHeader, color: colors.slate500 }}>{scenario.label}</div>
        <p style={{ color: colors.slate500, fontSize: '0.9rem', marginTop: 12 }}>
          Fill in the inputs above to see this scenario.
        </p>
      </div>
    )
  }

  const { categoryLabel, ageAtRetirement, yos, high3, monthlyAnnuity, annualAnnuity, supplementEligible, reductionDetail, multiplier } = result
  const ineligible = result.category === 'ineligible'

  return (
    <div style={cardStyle}>
      <div style={cardHeader}>{scenario.label}</div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.1rem',
          fontWeight: 600,
          color: colors.pine,
          marginBottom: 6,
          letterSpacing: '-0.005em',
        }}
      >
        {formatMonth(scenario.retireDate)}
      </div>
      <div style={{ fontSize: '0.82rem', color: colors.slate500, marginBottom: 16 }}>
        Age {formatYearsMonths(ageAtRetirement)} · {formatYearsMonths(yos)} of service
      </div>

      <div
        style={{
          background: ineligible ? colors.brassPale : colors.sagePale,
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: '0.82rem',
          color: ineligible ? colors.brassDeep : colors.pine,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {categoryLabel}
      </div>

      {!ineligible && (
        <>
          <Stat label="Monthly pension" value={formatCurrency(monthlyAnnuity)} large />
          <Stat label="Annual pension" value={formatCurrency(annualAnnuity)} />
          {high3 != null && <Stat label="High-3 used" value={formatCurrency(high3)} />}
          {multiplier != null && <Stat label="Multiplier" value={`${(multiplier * 100).toFixed(1)}%`} />}
          {reductionDetail && (
            <div style={{ fontSize: '0.78rem', color: colors.brassDeep, marginTop: 4, marginBottom: 6 }}>
              {reductionDetail}
            </div>
          )}

          {supplementEligible && (
            <div
              style={{
                marginTop: 14,
                padding: '14px 16px',
                background: `linear-gradient(135deg, rgba(123,28,46,0.10) 0%, rgba(123,28,46,0.10) 100%)`,
                border: `1px solid ${colors.brass}`,
                borderRadius: 10,
                fontFamily: FONT_SANS,
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.brassDeep, marginBottom: 4 }}>
                FERS Supplement eligible
              </div>
              <div style={{ fontSize: '0.82rem', color: colors.slate700, lineHeight: 1.55, marginBottom: 10 }}>
                You'll receive an additional bridge payment from retirement until age 62. To see the dollar amount layered into your full retirement income — alongside Social Security, TSP withdrawals, FEHB, and Medicare — open the Full Income Picture calculator.
              </div>
              <Link
                to="/calculators/income-picture"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: colors.brass,
                  color: '#ffffff',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
              >
                See your Full Income Picture <span aria-hidden>→</span>
              </Link>
            </div>
          )}

          {renderExtra && renderExtra(result)}
        </>
      )}
    </div>
  )
}

function Stat({ label, value, large = false, bold = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: '0.85rem', color: colors.slate500 }}>{label}</span>
      <span
        style={{
          fontFamily: large ? FONT_SERIF : FONT_SANS,
          fontSize: large ? '1.4rem' : '0.95rem',
          fontWeight: bold || large ? 600 : 500,
          color: large ? colors.pine : colors.charcoal,
          letterSpacing: large ? '-0.01em' : '0',
        }}
      >
        {value}
      </span>
    </div>
  )
}

const cardStyle = {
  background: '#ffffff',
  borderRadius: 16,
  padding: 24,
  border: `1px solid ${colors.borderSubtle || 'rgba(26,45,92,0.08)'}`,
  boxShadow: '0 4px 16px rgba(15,29,61,0.05)',
}

const cardHeader = {
  fontSize: '0.74rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: colors.brassDeep,
  marginBottom: 6,
}

