import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/fma/Button'
import Seo from '../../components/Seo'
import { colors, fonts } from '../../constants/theme'
import { formatCurrency } from '../../lib/pensionCalc'
import { DATA_LAST_UPDATED } from '../../config/site'
import { monthlyGuaranteedIncome } from '../../data/guaranteedIncomeCalc'

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

const sectionLabel = {
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: colors.brassDeep,
  marginBottom: 10,
}

// Standard SSA formula. FRA = 67 for anyone born in 1960 or later — close enough
// for everyone using this tool. Returns the multiplier applied to PIA.
//   62 → 0.70   (30% reduction: 36 months × 5/9% + 24 months × 5/12%)
//   67 → 1.00   (FRA, full PIA)
//   70 → 1.24   (3 years × 8% delayed credits)
function ssMultiplierAtAge(age) {
  const FRA = 67
  if (age < 62) return 0
  if (age < FRA) {
    const monthsBeforeFRA = (FRA - age) * 12
    let reduction
    if (monthsBeforeFRA <= 36) {
      reduction = (monthsBeforeFRA * 5) / 9 / 100
    } else {
      reduction = (36 * 5) / 9 / 100 + ((monthsBeforeFRA - 36) * 5) / 12 / 100
    }
    return 1 - reduction
  }
  const cappedAge = Math.min(age, 70)
  return 1 + (cappedAge - FRA) * 0.08
}

export default function IncomePicture() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Flow: 'pre62' (retire before 62, FERS Supplement applies) or 'post62' (retire at 62+)
  const [flow, setFlow] = useState('pre62')

  // Common inputs
  const [retirementAge, setRetirementAge] = useState(58)
  const [pensionMonthly, setPensionMonthly] = useState(3500)

  // Pre-62 only
  const [ssAt62, setSsAt62] = useState(2000)
  const [yearsOfFersService, setYearsOfFersService] = useState(30)

  // Post-62 only
  const [ssReferenceAge, setSsReferenceAge] = useState('claim') // 'claim' | '62' | '67' | '70'
  const [ssReferenceAmount, setSsReferenceAmount] = useState(2500)

  // SS claim age (both flows)
  const [ssClaimAge, setSsClaimAge] = useState(62)

  // TSP
  const [tspBalance, setTspBalance] = useState(500000)
  const [yearsToDefer, setYearsToDefer] = useState(0)

  // FEHB
  const [fehbMonthly, setFehbMonthly] = useState(450)

  // When user flips flow, snap retirement age and claim age into the valid range.
  useEffect(() => {
    const ra = Number(retirementAge)
    if (flow === 'pre62' && ra >= 62) setRetirementAge(58)
    if (flow === 'post62' && ra < 62) setRetirementAge(62)
  }, [flow]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (flow === 'post62') {
      const ra = Number(retirementAge)
      const claim = Number(ssClaimAge)
      if (claim < ra) setSsClaimAge(ra)
    }
  }, [flow, retirementAge]) // eslint-disable-line react-hooks/exhaustive-deps

  const computed = useMemo(() => {
    const ra = Number(retirementAge) || 0
    const claim = Number(ssClaimAge) || 62
    const tspStartAge = ra + (Number(yearsToDefer) || 0)
    const pension = Number(pensionMonthly) || 0
    const fehb = Number(fehbMonthly) || 0

    // FERS Supplement (pre-62 flow only). Formula: (Years of FERS service / 40) × SS@62.
    // Paid from retirement until 62.
    const supplement =
      flow === 'pre62'
        ? ((Number(yearsOfFersService) || 0) / 40) * (Number(ssAt62) || 0)
        : 0

    // Compute PIA (the full-FRA benefit) so we can extrapolate to any claim age.
    let pia = 0
    if (flow === 'pre62') {
      // SS@62 is 70% of PIA
      pia = (Number(ssAt62) || 0) / 0.7
    } else {
      // Post-62 flow: user picks a reference age (or "exact claim age") and enters an amount.
      const refAmt = Number(ssReferenceAmount) || 0
      if (ssReferenceAge === 'claim') {
        const mult = ssMultiplierAtAge(claim)
        pia = mult > 0 ? refAmt / mult : 0
      } else {
        const refMult = ssMultiplierAtAge(Number(ssReferenceAge))
        pia = refMult > 0 ? refAmt / refMult : 0
      }
    }
    const ssAtClaim = pia * ssMultiplierAtAge(claim)

    // TSP guaranteed monthly income.
    // We assume the user is buying the contract AT retirement (issueAge = retirementAge),
    // so the only gap is yearsToDefer. This is what Nassau's NIA quote tool assumes when
    // "Years Until Retirement" = 0.
    const tspResult = monthlyGuaranteedIncome(
      Number(tspBalance) || 0,
      ra,
      tspStartAge
    )
    const tspMonthly = tspResult.monthly

    // Build income intervals — each interval is a phase where the source mix is constant.
    // Transitions happen at: retirement age, 62 (when supplement ends, pre-62 only),
    // SS claim age, and TSP start age.
    const incomeAtAge = (age) => ({
      pension,
      supplement: flow === 'pre62' && age < 62 ? supplement : 0,
      ss: age >= claim ? ssAtClaim : 0,
      tsp: age >= tspStartAge ? tspMonthly : 0,
    })

    const transitions = new Set([ra, claim, tspStartAge])
    if (flow === 'pre62') transitions.add(62)
    const transitionAges = [...transitions]
      .filter((a) => a >= ra && a <= 90)
      .sort((a, b) => a - b)

    const intervals = transitionAges.map((startAge, i) => {
      const nextStart = transitionAges[i + 1]
      const endAge = nextStart != null ? nextStart - 1 : null // null = open-ended
      const sources = incomeAtAge(startAge)
      const gross = sources.pension + sources.supplement + sources.ss + sources.tsp
      const net = gross - fehb
      return { startAge, endAge, sources, gross, net }
    })

    const atRetirement = intervals[0] || {
      startAge: ra,
      endAge: null,
      sources: { pension: 0, supplement: 0, ss: 0, tsp: 0 },
      gross: 0,
      net: -fehb,
    }

    return {
      supplement,
      ssAtClaim,
      tspMonthly,
      tspStartAge,
      pia,
      intervals,
      atRetirement,
      fehb,
    }
  }, [
    flow,
    retirementAge,
    pensionMonthly,
    ssAt62,
    yearsOfFersService,
    ssReferenceAge,
    ssReferenceAmount,
    ssClaimAge,
    tspBalance,
    yearsToDefer,
    fehbMonthly,
  ])

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="Full Income Picture Calculator"
        description="Layer your federal pension, FERS Supplement, Social Security, and guaranteed TSP income into one pre-tax income picture — with a year-by-year chart showing how it changes from your retirement date forward."
        path="/calculators/income-picture"
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
              marginBottom: 14,
            }}
          >
            Full Income Picture · Updated {DATA_LAST_UPDATED}
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
            Full Income Picture <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              Pension, Supplement, Social Security, and TSP — year by year.
            </span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 660 }}>
            All four legs of federal retirement income stacked together, pre-tax — with a year-by-year view of how it changes as your FERS Supplement ends, Social Security turns on, and TSP income kicks in.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28 }}>
        {/* INPUTS */}
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
            borderRadius: 16,
            padding: isMobile ? 24 : 32,
            boxShadow: '0 1px 3px rgba(20,42,29,0.04)',
          }}
        >
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: '1.4rem',
              fontWeight: 600,
              color: colors.pine,
              marginBottom: 18,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Your numbers
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* FLOW SELECT */}
            <div>
              <div style={sectionLabel}>When are you retiring?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  ['pre62', 'Before 62', 'FERS Supplement applies'],
                  ['post62', '62 or later', 'No FERS Supplement'],
                ].map(([val, label, sub]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFlow(val)}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      background: flow === val ? colors.pine : '#ffffff',
                      color: flow === val ? '#ffffff' : colors.pine,
                      border: `1px solid ${flow === val ? colors.pine : 'rgba(31,61,44,0.10)'}`,
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: FONT_SANS,
                      textAlign: 'left',
                    }}
                  >
                    <div>{label}</div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 400, opacity: 0.78, marginTop: 2 }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <label style={labelText}>
              Retirement age
              <input
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
                step="1"
                min={flow === 'pre62' ? 50 : 62}
                max={flow === 'pre62' ? 61 : 70}
                style={inputBox}
              />
            </label>

            <label style={labelText}>
              Monthly pension at retirement
              <input type="number" value={pensionMonthly} onChange={(e) => setPensionMonthly(e.target.value)} step="50" style={inputBox} />
              <span style={helpText}>From the FERS or CSRS pension calculator.</span>
            </label>

            {/* SOCIAL SECURITY */}
            <div style={{ paddingTop: 6, borderTop: `1px solid rgba(31,61,44,0.06)` }}>
              <div style={{ ...sectionLabel, marginTop: 10 }}>Social Security</div>

              {flow === 'pre62' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label style={labelText}>
                    Your SS estimate at age 62
                    <input
                      type="number"
                      value={ssAt62}
                      onChange={(e) => setSsAt62(e.target.value)}
                      step="25"
                      style={inputBox}
                    />
                    <span style={helpText}>From SSA.gov. We use this to compute both your FERS Supplement and your SS at any other claim age.</span>
                  </label>

                  <label style={labelText}>
                    Years of FERS service at retirement
                    <input
                      type="number"
                      value={yearsOfFersService}
                      onChange={(e) => setYearsOfFersService(e.target.value)}
                      step="1"
                      min="5"
                      max="42"
                      style={inputBox}
                    />
                    <span style={helpText}>Creditable FERS service. Formula: (Years ÷ 40) × your SS at 62 = your FERS Supplement.</span>
                  </label>

                  <div
                    style={{
                      background: colors.bone,
                      border: `1px solid rgba(176,141,90,0.30)`,
                      borderRadius: 10,
                      padding: 14,
                      fontSize: '0.88rem',
                      color: colors.pine,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>
                      Your FERS Supplement: {formatCurrency(computed.supplement)}/mo
                    </div>
                    <div style={{ color: colors.slate700, fontSize: '0.82rem' }}>
                      Pays from age {retirementAge} until you turn 62.
                    </div>
                  </div>

                  <label style={labelText}>
                    When will you claim Social Security?
                    <input
                      type="number"
                      value={ssClaimAge}
                      onChange={(e) => setSsClaimAge(e.target.value)}
                      step="1"
                      min="62"
                      max="70"
                      style={inputBox}
                    />
                    <span style={helpText}>Between 62 and 70. We estimate your benefit at this age using SSA's standard reduction/delayed-credit formulas.</span>
                  </label>

                  {Number(ssClaimAge) !== 62 && (
                    <div
                      style={{
                        background: colors.bone,
                        border: `1px solid rgba(176,141,90,0.30)`,
                        borderRadius: 10,
                        padding: 14,
                        fontSize: '0.88rem',
                        color: colors.pine,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        Estimated SS at age {ssClaimAge}: {formatCurrency(computed.ssAtClaim)}/mo
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label style={labelText}>
                    When will you claim Social Security?
                    <input
                      type="number"
                      value={ssClaimAge}
                      onChange={(e) => setSsClaimAge(e.target.value)}
                      step="1"
                      min={Math.max(62, Number(retirementAge) || 62)}
                      max="70"
                      style={inputBox}
                    />
                    <span style={helpText}>Between your retirement age and 70.</span>
                  </label>

                  <label style={labelText}>
                    Which SSA estimate are you entering?
                    <select
                      value={ssReferenceAge}
                      onChange={(e) => setSsReferenceAge(e.target.value)}
                      style={inputBox}
                    >
                      <option value="claim">My estimate at the exact age I'll claim ({ssClaimAge})</option>
                      <option value="62">My estimate at age 62</option>
                      <option value="67">My estimate at age 67 (Full Retirement Age)</option>
                      <option value="70">My estimate at age 70</option>
                    </select>
                    <span style={helpText}>SSA.gov shows estimates at 62, FRA, and 70. Pick whichever you have handy.</span>
                  </label>

                  <label style={labelText}>
                    Monthly SS estimate
                    <input
                      type="number"
                      value={ssReferenceAmount}
                      onChange={(e) => setSsReferenceAmount(e.target.value)}
                      step="25"
                      style={inputBox}
                    />
                  </label>

                  {ssReferenceAge !== 'claim' && Number(ssReferenceAge) !== Number(ssClaimAge) && (
                    <div
                      style={{
                        background: colors.bone,
                        border: `1px solid rgba(176,141,90,0.30)`,
                        borderRadius: 10,
                        padding: 14,
                        fontSize: '0.88rem',
                        color: colors.pine,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        Estimated SS at age {ssClaimAge}: {formatCurrency(computed.ssAtClaim)}/mo
                      </div>
                      <div style={{ color: colors.slate700, fontSize: '0.82rem', marginTop: 2 }}>
                        Extrapolated from your age-{ssReferenceAge} estimate using SSA's standard formulas.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TSP */}
            <div style={{ paddingTop: 6, borderTop: `1px solid rgba(31,61,44,0.06)` }}>
              <div style={{ ...sectionLabel, marginTop: 10 }}>Guaranteed income from TSP</div>

              <label style={labelText}>
                Projected TSP balance at retirement
                <input type="number" value={tspBalance} onChange={(e) => setTspBalance(e.target.value)} step="10000" min="0" style={inputBox} />
                <span style={helpText}>Project forward from your current balance with assumed contributions and 5–7% growth.</span>
              </label>

              <label style={{ ...labelText, marginTop: 14 }}>
                Years after retirement to wait before drawing income
                <input type="number" value={yearsToDefer} onChange={(e) => setYearsToDefer(e.target.value)} step="1" min="0" max="20" style={inputBox} />
                <span style={helpText}>Default is 0 — start drawing income at retirement. Waiting longer increases the monthly amount.</span>
              </label>
            </div>

            <label style={labelText}>
              FEHB monthly premium
              <input type="number" value={fehbMonthly} onChange={(e) => setFehbMonthly(e.target.value)} step="25" style={inputBox} />
              <span style={helpText}>Same plan you have today, often. Continues into retirement.</span>
            </label>
          </div>
        </div>

        {/* OUTPUT: headline at retirement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 100%)`,
              color: '#ffffff',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 8px 24px rgba(20,42,29,0.12)',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: colors.brassLight,
                marginBottom: 10,
              }}
            >
              Pre-tax monthly income at retirement
            </div>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontSize: '3rem',
                fontWeight: 600,
                marginBottom: 6,
                letterSpacing: '-0.02em',
                fontVariationSettings: '"opsz" 144, "SOFT" 50',
              }}
            >
              {formatCurrency(computed.atRetirement.net)}/mo
            </div>
            <div style={{ fontSize: '0.98rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
              Your starting monthly income the day you retire at age {retirementAge}. Pre-tax — actual take-home will be lower after federal and state tax.
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: `1px solid rgba(31,61,44,0.08)`,
              borderRadius: 16,
              padding: 28,
            }}
          >
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.2rem', fontWeight: 600, color: colors.pine, marginBottom: 4, letterSpacing: '-0.01em' }}>
              Where it lands at age {retirementAge}
            </h3>
            <div style={{ fontSize: '0.82rem', color: colors.slate500, marginBottom: 14 }}>
              The day your retirement starts.
            </div>
            {computed.atRetirement.sources.pension > 0 && (
              <Stat label="Pension" value={formatCurrency(computed.atRetirement.sources.pension)} dotColor={colors.pine} />
            )}
            {computed.atRetirement.sources.supplement > 0 && (
              <Stat label="FERS Supplement" value={formatCurrency(computed.atRetirement.sources.supplement)} dotColor={colors.brassDeep} />
            )}
            {computed.atRetirement.sources.ss > 0 && (
              <Stat label="Social Security" value={formatCurrency(computed.atRetirement.sources.ss)} dotColor={colors.sageLight} />
            )}
            {computed.atRetirement.sources.tsp > 0 && (
              <Stat label="Guaranteed income from TSP" value={formatCurrency(computed.atRetirement.sources.tsp)} dotColor={colors.brass} />
            )}
            <div style={{ height: 1, background: 'rgba(31,61,44,0.08)', margin: '10px 0' }} />
            <Stat label="Gross monthly" value={formatCurrency(computed.atRetirement.gross)} />
            <Stat label="FEHB premium" value={`–${formatCurrency(computed.fehb)}`} negative />
            <div style={{ height: 1, background: 'rgba(31,61,44,0.08)', margin: '10px 0' }} />
            <Stat label="Pre-tax monthly" value={formatCurrency(computed.atRetirement.net)} bold />
          </div>
        </div>
      </section>

      {/* INCOME OVER TIME — interval cards */}
      {computed.intervals.length > 1 && (
        <section style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 32px' }}>
          <div
            style={{
              background: '#ffffff',
              border: `1px solid rgba(31,61,44,0.08)`,
              borderRadius: 16,
              padding: isMobile ? 20 : 32,
              boxShadow: '0 1px 3px rgba(20,42,29,0.04)',
            }}
          >
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.4rem', fontWeight: 600, color: colors.pine, marginBottom: 4, letterSpacing: '-0.01em' }}>
              Income over time
            </h3>
            <p style={{ fontSize: '0.92rem', color: colors.slate500, marginBottom: 22, maxWidth: 720 }}>
              Each card is a phase where your income stays the same. Watch what happens when your FERS Supplement ends, when Social Security turns on, and when TSP income kicks in.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? '1fr'
                  : `repeat(${Math.min(computed.intervals.length, 4)}, 1fr)`,
                gap: 16,
              }}
            >
              {computed.intervals.map((interval, i) => {
                const prev = i > 0 ? computed.intervals[i - 1] : null
                const changes = []
                if (prev) {
                  if (prev.sources.supplement > 0 && interval.sources.supplement === 0)
                    changes.push('FERS Supplement ended')
                  if (prev.sources.ss === 0 && interval.sources.ss > 0)
                    changes.push('Social Security turned on')
                  if (prev.sources.tsp === 0 && interval.sources.tsp > 0)
                    changes.push('TSP income turned on')
                }
                return (
                  <IntervalCard
                    key={interval.startAge}
                    interval={interval}
                    changes={changes}
                    fehb={computed.fehb}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Notes + CTA */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 96px' }}>
        <div
          style={{
            background: colors.bone,
            borderRadius: 16,
            padding: isMobile ? 24 : 32,
            border: `1px solid rgba(31,61,44,0.08)`,
            marginBottom: 28,
          }}
        >
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.2rem', fontWeight: 600, color: colors.pine, marginBottom: 12, letterSpacing: '-0.01em' }}>
            How this calculator works
          </h3>
          <ul style={{ paddingLeft: 20, color: colors.slate700, fontSize: '0.95rem', lineHeight: 1.7 }}>
            <li><strong>FERS Supplement</strong> = (Years of FERS service ÷ 40) × your SS estimate at 62. Pays from your retirement date until you turn 62.</li>
            <li><strong>Social Security</strong> is extrapolated to your planned claim age using SSA's standard reduction (5/9% per month for the first 36 months before FRA, 5/12% beyond that) and delayed-retirement credits (8%/yr after FRA). FRA is assumed to be 67.</li>
            <li><strong>TSP guaranteed income</strong> comes from a fixed-rate annuity quote. Waiting longer to start income raises the monthly amount.</li>
            <li>All figures shown are <strong>pre-tax</strong>. Your actual after-tax take-home will be lower depending on your federal and state tax situation.</li>
          </ul>
        </div>

        <div
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
            <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.brassLight, marginBottom: 8 }}>
              Your TSP, your call
            </div>
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: isMobile ? '1.4rem' : '1.6rem', fontWeight: 600, marginBottom: 10, letterSpacing: '-0.01em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
              Want to learn how to use your TSP to maximize your income?
            </h3>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
              Book a free meeting — phone or video, no set time limit. We'll walk through your numbers, show you what each TSP decision actually costs (or earns), and answer any questions the calculator left open.
            </p>
          </div>
          <Button to="/consultation" variant="primary" arrow style={{ flexShrink: 0 }}>Book a free meeting</Button>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value, bold, negative, dotColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: '0.92rem', color: colors.slate700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {dotColor && (
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 999,
              background: dotColor,
              flexShrink: 0,
            }}
          />
        )}
        {label}
      </span>
      <span
        style={{
          fontFamily: bold ? FONT_SERIF : FONT_SANS,
          fontSize: bold ? '1.4rem' : '1rem',
          fontWeight: bold ? 600 : 500,
          color: negative ? colors.brassDeep : colors.charcoal,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function IntervalCard({ interval, changes, fehb }) {
  const { startAge, endAge, sources, gross, net } = interval
  const rangeLabel =
    endAge == null
      ? `Age ${startAge}+`
      : startAge === endAge
        ? `Age ${startAge}`
        : `Ages ${startAge}–${endAge}`
  const rows = [
    { label: 'Pension', value: sources.pension, color: colors.pine },
    { label: 'FERS Supplement', value: sources.supplement, color: colors.brassDeep },
    { label: 'Social Security', value: sources.ss, color: colors.sageLight },
    { label: 'TSP income', value: sources.tsp, color: colors.brass },
  ].filter((r) => r.value > 0)

  return (
    <div
      style={{
        background: colors.ivory,
        border: `1px solid rgba(31,61,44,0.10)`,
        borderRadius: 14,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div>
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: colors.brassDeep,
            marginBottom: 4,
          }}
        >
          {rangeLabel}
        </div>
        {changes.length > 0 && (
          <div style={{ fontSize: '0.78rem', color: colors.slate500, lineHeight: 1.4 }}>
            {changes.join(' · ')}
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.7rem',
          fontWeight: 600,
          color: colors.pine,
          letterSpacing: '-0.01em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
          lineHeight: 1.1,
        }}
      >
        {formatCurrency(net)}<span style={{ fontSize: '0.9rem', color: colors.slate500, fontFamily: FONT_SANS, fontWeight: 500 }}>/mo</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.85rem' }}
          >
            <span style={{ color: colors.slate700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span
                aria-hidden
                style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: r.color, flexShrink: 0 }}
              />
              {r.label}
            </span>
            <span style={{ color: colors.charcoal, fontWeight: 500 }}>{formatCurrency(r.value)}</span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: colors.slate500,
            marginTop: 4,
            paddingTop: 6,
            borderTop: '1px solid rgba(31,61,44,0.08)',
          }}
        >
          <span>Gross</span>
          <span>{formatCurrency(gross)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: colors.slate500 }}>
          <span>FEHB</span>
          <span>–{formatCurrency(fehb)}</span>
        </div>
      </div>
    </div>
  )
}
