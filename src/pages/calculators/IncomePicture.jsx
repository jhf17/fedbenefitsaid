import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
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

// Federal effective tax brackets — tax year 2026.
// Source: IRS Rev. Proc. 2025-32 (https://www.irs.gov/pub/irs-drop/rp-25-32.pdf).
// Used as a rough "blended effective rate" estimator for retirement income.
function estimateFederalEffectiveRate(annualIncome, filingStatus = 'mfj') {
  const brackets = filingStatus === 'mfj' ? [
    { upTo: 24800,  rate: 0.10 },
    { upTo: 100800, rate: 0.12 },
    { upTo: 211400, rate: 0.22 },
    { upTo: 403550, rate: 0.24 },
    { upTo: 512450, rate: 0.32 },
    { upTo: 768700, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ] : [
    { upTo: 12400,  rate: 0.10 },
    { upTo: 50400,  rate: 0.12 },
    { upTo: 105700, rate: 0.22 },
    { upTo: 201775, rate: 0.24 },
    { upTo: 256225, rate: 0.32 },
    { upTo: 640600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ]

  // 2026 standard deduction (IRS Rev. Proc. 2025-32).
  const stdDeduction = filingStatus === 'mfj' ? 32200 : 16100
  const taxable = Math.max(0, annualIncome - stdDeduction)

  let tax = 0
  let prev = 0
  for (const b of brackets) {
    const slice = Math.max(0, Math.min(taxable, b.upTo) - prev)
    tax += slice * b.rate
    prev = b.upTo
    if (taxable <= b.upTo) break
  }
  return annualIncome > 0 ? tax / annualIncome : 0
}

// IRS provisional-income test (IRS Pub. 915) — determines what portion of
// Social Security benefits is included in taxable income. Up to 85% may be
// taxable for high-income retirees; less for lower-income.
function taxableSsAmount(annualSsBenefits, otherIncome, filingStatus) {
  if (annualSsBenefits <= 0) return 0
  const provisional = otherIncome + 0.5 * annualSsBenefits
  const t1 = filingStatus === 'mfj' ? 32000 : 25000
  const t2 = filingStatus === 'mfj' ? 44000 : 34000
  if (provisional <= t1) return 0
  if (provisional <= t2) {
    return Math.min(0.5 * annualSsBenefits, 0.5 * (provisional - t1))
  }
  // Provisional > t2
  const tier1 = Math.min(0.5 * annualSsBenefits, 0.5 * (t2 - t1))
  const tier2 = 0.85 * (provisional - t2)
  return Math.min(0.85 * annualSsBenefits, tier1 + tier2)
}

export default function IncomePicture() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Inputs
  const [currentTakeHome, setCurrentTakeHome] = useState(7000) // monthly net take-home today
  const [pensionMonthly, setPensionMonthly] = useState(3500)
  const [supplementMonthly, setSupplementMonthly] = useState(0)
  const [ssMonthlyAt62, setSsMonthlyAt62] = useState(0)
  const [tspBalance, setTspBalance] = useState(500000)
  const [currentAge, setCurrentAge] = useState(58)
  const [retirementAge, setRetirementAge] = useState(62)
  const [yearsToDefer, setYearsToDefer] = useState(0)
  const [fehbMonthly, setFehbMonthly] = useState(450)
  const [medicarePartB, setMedicarePartB] = useState(202.90) // 2026 standard
  const [filingStatus, setFilingStatus] = useState('mfj')
  const [stateRate, setStateRate] = useState(5) // % flat estimate

  // Scenarios — three conceptual phases users can compare
  const [scenario, setScenario] = useState('between') // 'before62', 'between', 'after65'

  const computed = useMemo(() => {
    const incomeStartAge = Number(retirementAge) + Number(yearsToDefer)
    const tspResult = monthlyGuaranteedIncome(tspBalance, currentAge, incomeStartAge)
    const tspMonthlyIncome = tspResult.monthly
    const pension = Number(pensionMonthly) || 0
    const supplement = Number(supplementMonthly) || 0
    const ss = Number(ssMonthlyAt62) || 0
    const fehb = Number(fehbMonthly) || 0
    const medB = Number(medicarePartB) || 0

    let preTaxMonthly = 0
    let breakdown = {}

    if (scenario === 'before62') {
      // Retired before 62: pension + supplement + TSP. No SS yet.
      preTaxMonthly = pension + supplement + tspMonthlyIncome
      breakdown = {
        Pension: pension,
        'FERS Supplement': supplement,
        'Guaranteed income from TSP': tspMonthlyIncome,
      }
    } else if (scenario === 'between') {
      // Age 62–65: pension + SS + TSP. Supplement ended at 62. No Medicare yet.
      preTaxMonthly = pension + ss + tspMonthlyIncome
      breakdown = {
        Pension: pension,
        'Social Security': ss,
        'Guaranteed income from TSP': tspMonthlyIncome,
      }
    } else {
      // 65+: pension + SS + TSP. Medicare Part B kicks in.
      preTaxMonthly = pension + ss + tspMonthlyIncome
      breakdown = {
        Pension: pension,
        'Social Security': ss,
        'Guaranteed income from TSP': tspMonthlyIncome,
      }
    }

    const annualIncome = preTaxMonthly * 12
    // SS tax: apply IRS provisional-income test (Pub. 915). Up to 85% of SS may
    // be federally taxable; the rest is exempt. State tax usually follows the
    // federal taxable amount (some states exempt all SS; we approximate by
    // applying state rate to the same taxable base).
    const annualSs = (scenario === 'before62' ? 0 : ss) * 12
    const otherTaxableIncome = annualIncome - annualSs
    const taxableSs = taxableSsAmount(annualSs, otherTaxableIncome, filingStatus)
    const annualTaxableIncome = otherTaxableIncome + taxableSs
    const effectiveFedRate = estimateFederalEffectiveRate(annualTaxableIncome, filingStatus)
    const stateRateDecimal = (Number(stateRate) || 0) / 100
    const monthlyFedTax = (annualTaxableIncome * effectiveFedRate) / 12
    const monthlyStateTax = (annualTaxableIncome * stateRateDecimal) / 12

    const monthlyHealthCare = scenario === 'after65' ? medB + fehb : fehb

    const afterTaxMonthly = preTaxMonthly - monthlyFedTax - monthlyStateTax
    const netMonthly = afterTaxMonthly - monthlyHealthCare

    const gap = netMonthly - Number(currentTakeHome)
    const gapPct = currentTakeHome > 0 ? gap / Number(currentTakeHome) : 0

    return {
      tspMonthlyIncome,
      preTaxMonthly,
      annualIncome,
      effectiveFedRate,
      monthlyFedTax,
      monthlyStateTax,
      monthlyHealthCare,
      afterTaxMonthly,
      netMonthly,
      gap,
      gapPct,
      breakdown,
    }
  }, [pensionMonthly, supplementMonthly, ssMonthlyAt62, tspBalance, currentAge, retirementAge, yearsToDefer, fehbMonthly, medicarePartB, scenario, currentTakeHome, filingStatus, stateRate])

  const pieData = Object.entries(computed.breakdown)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value: Math.round(value) }))

  const pieColors = [colors.pine, colors.brass, colors.sage, colors.brassDeep]

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="Full Income Picture Calculator"
        description="Layer your federal pension, FERS Supplement, Social Security, and guaranteed TSP income against your current take-home. See the full income picture — pre-tax, after federal/state tax, and net of FEHB + Medicare."
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
              Pension + Supplement + SS + TSP vs your current take-home.
            </span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 660 }}>
            The three (or four) legs of federal retirement income — pension, FERS Supplement, Social Security, TSP — laid out side-by-side against your current take-home. Pre-tax, after federal/state tax, and net of FEHB + Medicare. Honest math, no spin.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '48px 24px 96px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28 }}>
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
            <label style={labelText}>
              Current monthly take-home (after taxes & FEHB)
              <input type="number" value={currentTakeHome} onChange={(e) => setCurrentTakeHome(e.target.value)} step="100" style={inputBox} />
              <span style={helpText}>What hits your bank account today after all deductions.</span>
            </label>

            <div style={{ paddingTop: 6, borderTop: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.06)'}` }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.brassDeep, marginTop: 10, marginBottom: 6 }}>
                Time period
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  ['before62', 'Before 62', 'Pension + Supplement + TSP'],
                  ['between', '62 – 64', 'Pension + SS + TSP'],
                  ['after65', '65+', 'Pension + SS + TSP, Medicare adds in'],
                ].map(([val, label, sub]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScenario(val)}
                    style={{
                      flex: 1,
                      minWidth: 100,
                      padding: '10px 12px',
                      background: scenario === val ? colors.pine : '#ffffff',
                      color: scenario === val ? '#ffffff' : colors.pine,
                      border: `1px solid ${scenario === val ? colors.pine : colors.borderSubtle || 'rgba(31,61,44,0.10)'}`,
                      borderRadius: 10,
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: FONT_SANS,
                      textAlign: 'left',
                    }}
                  >
                    <div>{label}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.78, marginTop: 2 }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <label style={labelText}>
              Monthly pension at retirement
              <input type="number" value={pensionMonthly} onChange={(e) => setPensionMonthly(e.target.value)} step="50" style={inputBox} />
              <span style={helpText}>From the FERS or CSRS pension calculator.</span>
            </label>

            {scenario === 'before62' && (
              <label style={labelText}>
                Monthly FERS Supplement (until 62)
                <input type="number" value={supplementMonthly} onChange={(e) => setSupplementMonthly(e.target.value)} step="25" style={inputBox} />
                <span style={helpText}>Only applies to FERS retirees who left before 62 with immediate annuity. CSRS retirees: leave at 0.</span>
              </label>
            )}

            {scenario !== 'before62' && (
              <label style={labelText}>
                Monthly Social Security benefit
                <input type="number" value={ssMonthlyAt62} onChange={(e) => setSsMonthlyAt62(e.target.value)} step="25" style={inputBox} />
                <span style={helpText}>From SSA.gov. Use the row matching your assumed claiming age.</span>
              </label>
            )}

            <div style={{ paddingTop: 6, borderTop: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.06)'}` }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.brassDeep, marginTop: 10, marginBottom: 10 }}>
                Guaranteed income from TSP
              </div>

              <label style={labelText}>
                Projected TSP balance at retirement
                <input type="number" value={tspBalance} onChange={(e) => setTspBalance(e.target.value)} step="10000" min="0" style={inputBox} />
                <span style={helpText}>Project forward from your current balance with assumed contributions and 5–7% growth.</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                <label style={labelText}>
                  Your current age
                  <input type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} step="1" min="40" max="80" style={inputBox} />
                </label>
                <label style={labelText}>
                  Your retirement age
                  <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)} step="1" min="50" max="80" style={inputBox} />
                </label>
              </div>

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

            {scenario === 'after65' && (
              <label style={labelText}>
                Medicare Part B monthly premium
                <input type="number" value={medicarePartB} onChange={(e) => setMedicarePartB(e.target.value)} step="1" style={inputBox} />
                <span style={helpText}>2026 standard premium is $202.90. IRMAA applies above income thresholds.</span>
              </label>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={labelText}>
                Filing status
                <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} style={inputBox}>
                  <option value="mfj">Married, joint</option>
                  <option value="single">Single</option>
                </select>
              </label>
              <label style={labelText}>
                State income tax (%)
                <input type="number" value={stateRate} onChange={(e) => setStateRate(e.target.value)} step="0.5" min="0" max="15" style={inputBox} />
                <span style={helpText}>Effective rate. 0 if you live in a no-state-tax state.</span>
              </label>
            </div>
          </div>
        </div>

        {/* OUTPUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Result card */}
          <div
            style={{
              background: computed.gap >= 0
                ? `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 100%)`
                : `linear-gradient(135deg, #5d2d24 0%, #8d3f2c 100%)`,
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
              {computed.gap >= 0 ? 'Income surplus' : 'Income shortfall'}
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
              {computed.gap >= 0 ? '+' : ''}{formatCurrency(computed.gap)}/mo
            </div>
            <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.78)' }}>
              {computed.gap >= 0
                ? `That's ${(computed.gapPct * 100).toFixed(0)}% above your current take-home.`
                : `That's ${(Math.abs(computed.gapPct) * 100).toFixed(0)}% below your current take-home.`}
            </div>
          </div>

          {/* Breakdown */}
          <div
            style={{
              background: '#ffffff',
              border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
              borderRadius: 16,
              padding: 28,
            }}
          >
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.2rem', fontWeight: 600, color: colors.pine, marginBottom: 16, letterSpacing: '-0.01em' }}>
              Where it lands
            </h3>
            <Stat label="Gross monthly retirement income" value={formatCurrency(computed.preTaxMonthly)} />
            <Stat label={`Federal tax (~${(computed.effectiveFedRate * 100).toFixed(1)}% effective)`} value={`–${formatCurrency(computed.monthlyFedTax)}`} negative />
            <Stat label="State tax" value={`–${formatCurrency(computed.monthlyStateTax)}`} negative />
            <Stat label={scenario === 'after65' ? 'FEHB + Medicare Part B' : 'FEHB premium'} value={`–${formatCurrency(computed.monthlyHealthCare)}`} negative />
            <div style={{ height: 1, background: 'rgba(31,61,44,0.08)', margin: '12px 0' }} />
            <Stat label="Net monthly" value={formatCurrency(computed.netMonthly)} bold />
            <Stat label="Compared to today" value={formatCurrency(currentTakeHome)} muted />
          </div>

          {/* Pie chart */}
          {pieData.length > 0 && (
            <div
              style={{
                background: '#ffffff',
                border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.1rem', fontWeight: 600, color: colors.pine, marginBottom: 12, letterSpacing: '-0.01em' }}>
                Income sources (gross)
              </h3>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v) + '/mo'} contentStyle={{ background: '#ffffff', border: `1px solid ${colors.brass}`, borderRadius: 8, fontFamily: FONT_SANS, fontSize: '0.85rem' }} />
                    <Legend wrapperStyle={{ fontSize: '0.82rem', fontFamily: FONT_SANS }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notes + CTA */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 96px' }}>
        <div
          style={{
            background: colors.bone,
            borderRadius: 16,
            padding: isMobile ? 24 : 32,
            border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
            marginBottom: 28,
          }}
        >
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.2rem', fontWeight: 600, color: colors.pine, marginBottom: 12, letterSpacing: '-0.01em' }}>
            How this calculator works
          </h3>
          <ul style={{ paddingLeft: 20, color: colors.slate700, fontSize: '0.95rem', lineHeight: 1.7 }}>
            <li>The tax estimate uses 2026 federal brackets and the standard deduction for your filing status. It is a blended effective rate, not a precise filing-by-filing number.</li>
            <li>Healthcare cost: FEHB-only before 65, FEHB + Medicare Part B after. IRMAA can push Part B significantly higher above income thresholds — not modeled.</li>
            <li>TSP income is assumed traditional (taxable). Roth TSP income would shift the after-tax math meaningfully — not modeled here.</li>
            <li>This is a planning estimate. For an actual tax projection, run your numbers through tax software for the year you'll retire — or talk to us.</li>
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
          <Link
            to="/consultation"
            style={{
              padding: '14px 28px',
              background: colors.brass,
              color: '#ffffff',
              borderRadius: 10,
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: FONT_SANS,
              flexShrink: 0,
              boxShadow: '0 6px 20px rgba(176,141,90,0.32)',
              whiteSpace: 'nowrap',
            }}
          >
            Book a free meeting →
          </Link>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value, bold, muted, negative }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: '0.9rem', color: muted ? colors.slate500 : colors.slate700 }}>{label}</span>
      <span
        style={{
          fontFamily: bold ? FONT_SERIF : FONT_SANS,
          fontSize: bold ? '1.3rem' : '1rem',
          fontWeight: bold ? 600 : 500,
          color: muted ? colors.slate500 : negative ? colors.brassDeep : colors.charcoal,
        }}
      >
        {value}
      </span>
    </div>
  )
}
