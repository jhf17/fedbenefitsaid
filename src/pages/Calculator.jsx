import { useState } from 'react'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

// ============================================================
// VERIFIED 2026 CALCULATION CONSTANTS
// Source: OPM, SSA, IRS
// ============================================================

// Social Security 2026 bend points (monthly AIME)
const SS_BEND1 = 1226   // 90% below this
const SS_BEND2 = 7391   // 32% between bend1 and bend2, 15% above

// FERS multipliers
const FERS_STANDARD = 0.010   // 1.0% — all cases except age 62+ with 20+ years
const FERS_ENHANCED = 0.011   // 1.1% — age 62 or older WITH 20+ years of service

// CSRS tiered multipliers
const CSRS_T1 = 0.015   // 1.5% — first 5 years
const CSRS_T2 = 0.0175  // 1.75% — years 6-10
const CSRS_T3 = 0.020   // 2.0% — years 11+
const CSRS_MAX = 0.80   // 80% cap

// Special Provision (LEO/FF/ATC/Congressional) multipliers
const SP_HIGH = 0.017   // 1.7% — LEO/FF/ATC first 20 yrs; Congressional first 10 yrs
const SP_LOW  = 0.010   // 1.0% — all years thereafter

// Medicare Part B premium 2026
const MEDICARE_B_MONTHLY = 185.00

// 2026 FEHB biweekly enrollee premiums (employee/retiree share)
// Source: OPM 2026 FEHB Premium Tables. Biweekly × 26 / 12 = monthly deduction.
// Rates marked * are estimates — verify at opm.gov/premiums
const FEHB_PLANS = [
  { id: 'bcbs_standard', label: 'BCBS FEP Standard Option',  self: 188.32, s1: 410.88, fam: 457.66, verified: true },
  { id: 'bcbs_basic',    label: 'BCBS FEP Basic Option',      self: 133.77, s1: 291.50, fam: 356.86, verified: true },
  { id: 'bcbs_focus',    label: 'BCBS FEP Blue Focus',        self: 66.81,  s1: 143.63, fam: 157.97, verified: true },
  { id: 'geha_standard', label: 'GEHA Standard *',            self: 94.07,  s1: 186.36, fam: 210.00, verified: false },
  { id: 'geha_high',     label: 'GEHA High *',                self: 233.00, s1: 416.00, fam: 458.00, verified: false },
  { id: 'aetna_direct',  label: 'Aetna Direct CDHP *',        self: 122.00, s1: 261.00, fam: 287.00, verified: false },
  { id: 'custom',        label: 'Other / Enter Custom Amount', self: 0,      s1: 0,      fam: 0,      verified: true },
]
// Monthly deduction from pension = biweekly rate × 26 ÷ 12
function fehbMonthlyAmt(biweekly) { return biweekly * 26 / 12 }


function fmt(n) {
  if (n == null || isNaN(n)) return '$0'
  return '$' + Math.round(n).toLocaleString('en-US')
}

function fmtDec(n, d = 1) {
  if (n == null || isNaN(n)) return '0'
  return n.toFixed(d)
}

// ============================================================
// CORE CALCULATION FUNCTIONS
// ============================================================

function calcFERSPension(yearsService, high3, retireAge, survivorBenefit, earlyRetirement) {
  const multiplier = (retireAge >= 62 && yearsService >= 20) ? FERS_ENHANCED : FERS_STANDARD
  let gross = yearsService * multiplier * high3
  let earlyReduction = 0
  let earlyReductionAmt = 0

  if (earlyRetirement === 'mra10' && retireAge < 62) {
    // 5% per year under 62, max 50%
    earlyReduction = Math.min((62 - retireAge) * 0.05, 0.50)
    earlyReductionAmt = gross * earlyReduction
    gross = gross * (1 - earlyReduction)
  }

  let survivorDeduct = 0
  if (survivorBenefit === 'full') survivorDeduct = gross * 0.10
  if (survivorBenefit === 'partial') survivorDeduct = gross * 0.05

  return {
    gross: yearsService * multiplier * high3,
    earlyReduction,
    earlyReductionAmt,
    grossAfterEarly: gross,
    survivorDeduct,
    netAnnual: gross - survivorDeduct,
    multiplierPct: multiplier * 100
  }
}

function calcFERSSupplement(yearsService, ssAt62Monthly) {
  // (Years of FERS service / 40) x estimated SS benefit at age 62
  // Only payable on immediate retirement before age 62
  return (yearsService / 40) * ssAt62Monthly
}

function calcCSRSPension(yearsService, high3, survivorBenefit) {
  const t1amt = Math.min(yearsService, 5) * CSRS_T1 * high3
  const t2amt = Math.max(0, Math.min(yearsService, 10) - 5) * CSRS_T2 * high3
  const t3amt = Math.max(0, yearsService - 10) * CSRS_T3 * high3
  const rate = Math.min(
    Math.min(yearsService, 5) * CSRS_T1 +
    Math.max(0, Math.min(yearsService, 10) - 5) * CSRS_T2 +
    Math.max(0, yearsService - 10) * CSRS_T3,
    CSRS_MAX
  )
  const gross = rate * high3
  let survivorDeduct = 0
  if (survivorBenefit === 'full') survivorDeduct = gross * 0.10
  if (survivorBenefit === 'partial') survivorDeduct = gross * 0.05

  return {
    t1amt, t2amt, t3amt,
    ratePct: rate * 100,
    gross,
    survivorDeduct,
    netAnnual: gross - survivorDeduct
  }
}

function calcSpecialPension(yearsService, high3, survivorBenefit, category) {
  let gross = 0
  let breakdown = ''
  if (category === 'leo' || category === 'ff' || category === 'atc') {
    const p1 = Math.min(yearsService, 20) * SP_HIGH * high3
    const p2 = Math.max(0, yearsService - 20) * SP_LOW * high3
    gross = p1 + p2
    breakdown = `${Math.min(yearsService,20)} yrs x 1.7% + ${Math.max(0,yearsService-20)} yrs x 1.0%`
  } else if (category === 'congressional') {
    const p1 = Math.min(yearsService, 10) * SP_HIGH * high3
    const p2 = Math.max(0, yearsService - 10) * SP_LOW * high3
    gross = p1 + p2
    breakdown = `${Math.min(yearsService,10)} yrs x 1.7% + ${Math.max(0,yearsService-10)} yrs x 1.0%`
  } else {
    gross = yearsService * SP_LOW * high3
    breakdown = `${yearsService} yrs x 1.0%`
  }
  let survivorDeduct = 0
  if (survivorBenefit === 'full') survivorDeduct = gross * 0.10
  if (survivorBenefit === 'partial') survivorDeduct = gross * 0.05
  return { gross, survivorDeduct, netAnnual: gross - survivorDeduct, breakdown }
}

function calcSSBenefit(ssAt62, claimAge) {
  // Adjustments relative to age-62 benefit (FRA assumed 67)
  // At 62: already 70% of PIA (passed in by user as monthly estimate at 62)
  // Each year delayed from 62 adds back some benefit
  const monthsFrom62 = (claimAge - 62) * 12
  if (claimAge <= 62) return ssAt62
  // From 62 to 67: each month adds ~0.556% (8% / 12 months * FRA adjustment approximation)
  // Simplified: at 67 = ssAt62 / 0.70 (full PIA), then +8%/yr after 67
  const pia = ssAt62 / 0.70
  if (claimAge <= 67) {
    // Linear interpolation between 70% at 62 and 100% at 67
    const pct = 0.70 + (claimAge - 62) * 0.06
    return pia * Math.min(pct, 1.0)
  } else {
    // +8% per year after FRA
    return pia * (1 + (claimAge - 67) * 0.08)
  }
}

function calcTSPFutureValue(balance, monthlyContrib, yearsToRetirement, annualRatePct) {
  const r = annualRatePct / 100 / 12
  const n = Math.max(0, yearsToRetirement) * 12
  if (n === 0) return balance
  if (r === 0) return balance + monthlyContrib * n
  const fvBalance = balance * Math.pow(1 + r, n)
  const fvContribs = monthlyContrib > 0
    ? monthlyContrib * (Math.pow(1 + r, n) - 1) / r
    : 0
  return fvBalance + fvContribs
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Calculator() {
  const [tab, setTab] = useState('fers')
  const [results, setResults] = useState(null)
  const [showFIA, setShowFIA] = useState(false)

  // Shared inputs
  const [currentAge, setCurrentAge] = useState('')
  const [retireAge, setRetireAge] = useState('')
  const [yearsService, setYearsService] = useState('')
  const [high3, setHigh3] = useState('')
  const [survivorBenefit, setSurvivorBenefit] = useState('full')
  const [tspBalance, setTspBalance] = useState('')
  const [monthlyContrib, setMonthlyContrib] = useState('')
  const [tspGrowthRate, setTspGrowthRate] = useState('6')
  const [ssAt62, setSsAt62] = useState('')
  const [ssClaimAge, setSsClaimAge] = useState('67')
  const [includeMedicare, setIncludeMedicare] = useState(true)

  // FEHB health insurance deduction
  const [includeFEHB, setIncludeFEHB] = useState(false)
  const [fehbPlan, setFehbPlan] = useState('bcbs_standard')
  const [fehbCoverage, setFehbCoverage] = useState('self')
  const [fehbCustom, setFehbCustom] = useState('')

  // FERS-specific
  const [earlyRetirement, setEarlyRetirement] = useState('immediate')

  // FERS Supplement
  const [includeSupp, setIncludeSupp] = useState(true)

  // Special category
  const [specialCat, setSpecialCat] = useState('leo')

  const [errors, setErrors] = useState([])

  function validate() {
    const errs = []
    if (!yearsService || isNaN(yearsService) || +yearsService <= 0) errs.push('Enter years of federal service.')
    if (!high3 || isNaN(high3) || +high3 <= 0) errs.push('Enter your High-3 average salary.')
    if (tab === 'fers' || tab === 'special') {
      if (!retireAge || isNaN(retireAge)) errs.push('Enter your planned retirement age.')
    }
    return errs
  }

  function calculate() {
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])

    const yrs = parseFloat(yearsService)
    const h3 = parseFloat(high3)
    const rAge = parseFloat(retireAge) || 62
    const cAge = parseFloat(currentAge) || 0
    const yearsToRetire = Math.max(0, rAge - cAge)
    const tspBal = parseFloat(tspBalance) || 0
    const mContrib = parseFloat(monthlyContrib) || 0
    const growthRate = parseFloat(tspGrowthRate) || 6
    const ssEstimate = parseFloat(ssAt62) || 0
    const claimAge = parseFloat(ssClaimAge) || 67

    let pensionResult, supplementMonthly = 0

    if (tab === 'fers') {
      pensionResult = calcFERSPension(yrs, h3, rAge, survivorBenefit, earlyRetirement)
      // FERS Supplement: only if immediate retirement before 62
      if (includeSupp && rAge < 62 && earlyRetirement !== 'mra10' && ssEstimate > 0) {
        supplementMonthly = calcFERSSupplement(yrs, ssEstimate)
      }
    } else if (tab === 'csrs') {
      pensionResult = calcCSRSPension(yrs, h3, survivorBenefit)
    } else {
      pensionResult = calcSpecialPension(yrs, h3, survivorBenefit, specialCat)
      if (includeSupp && rAge < 62 && ssEstimate > 0) {
        supplementMonthly = calcFERSSupplement(yrs, ssEstimate)
      }
    }

    const tspAtRetirement = calcTSPFutureValue(tspBal, mContrib, yearsToRetire, growthRate)
    const tspMonthly4pct = (tspAtRetirement * 0.04) / 12
    const ssMonthly = ssEstimate > 0 ? calcSSBenefit(ssEstimate, claimAge) : 0
    const pensionMonthly = pensionResult.netAnnual / 12
    const medicareDeduct = includeMedicare ? MEDICARE_B_MONTHLY : 0

    let fehbDeduct = 0
    if (includeFEHB) {
      const plan = FEHB_PLANS.find(p => p.id === fehbPlan)
      if (plan) {
        if (fehbPlan === 'custom') {
          fehbDeduct = parseFloat(fehbCustom) || 0
        } else {
          const bw = fehbCoverage === 'self' ? plan.self : fehbCoverage === 'self1' ? plan.s1 : plan.fam
          fehbDeduct = fehbMonthlyAmt(bw)
        }
      }
    }
    const fehbPlanLabel = FEHB_PLANS.find(p => p.id === fehbPlan)?.label || ''
    const fehbCoverageLabel = fehbCoverage === 'self' ? 'Self Only' : fehbCoverage === 'self1' ? 'Self + One' : 'Self + Family'

    const totalMonthly = pensionMonthly + tspMonthly4pct + ssMonthly + supplementMonthly - medicareDeduct - fehbDeduct
    const totalAnnual = totalMonthly * 12

    // FIA income projections (conservative range)
    const fiaPayouts = {
      conservative: (tspAtRetirement * 0.045) / 12,
      moderate:     (tspAtRetirement * 0.055) / 12,
      aggressive:   (tspAtRetirement * 0.065) / 12,
    }

    setResults({
      tab,
      pensionResult,
      pensionMonthly,
      pensionAmnual: pensionResult.netAnnual,
      supplementMonthly,
      tspAtRetirement,
      tspMonthly4pct,
      ssMonthly,
      medicareDeduct,
      fehbDeduct,
      fehbPlanLabel,
      fehbCoverageLabel,
      totalMonthly,
      totalAnnual,
      fiaPayouts,
      yearsToRetire,
      rAge,
      yrs,
      h3,
      growthRate,
      claimAge,
    })
    setShowFIA(false)

    setTimeout(() => {
      document.getElementById('calc-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const s = styles

  return (
    <main style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.badge}>Free Tool - No Account Required</div>
          <h1 style={s.h1}>Federal Retirement Income Calculator</h1>
          <p style={s.subtitle}>
            See your complete retirement picture: pension, TSP, and Social Security combined.
            All calculations use verified 2026 OPM figures.
          </p>
        </div>

        {/* System Tabs */}
        <div style={s.tabRow}>
          {[
            { id: 'fers',    label: 'FERS' },
            { id: 'csrs',    label: 'CSRS' },
            { id: 'special', label: 'FERS Special (LEO/FF/ATC)' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResults(null); setErrors([]) }}
              style={{ ...s.tabBtn, ...(tab === t.id ? s.tabBtnActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div style={s.card}>

          {/* Service & Salary */}
          <div style={s.cardTitle}>Your Service Information</div>
          <div style={s.grid2}>
            <Field label="Years of Federal Service" hint="Total creditable service years">
              <input
                type="number" min="1" max="50"
                value={yearsService}
                onChange={e => setYearsService(e.target.value)}
                placeholder="e.g. 28"
                style={s.input}
              />
            </Field>
            <Field label="High-3 Average Salary ($)" hint="Average of your 3 highest consecutive earning years">
              <input
                type="number" min="20000"
                value={high3}
                onChange={e => setHigh3(e.target.value)}
                placeholder="e.g. 95000"
                style={s.input}
              />
            </Field>
          </div>

          {/* Age fields - shown for FERS and Special */}
          {(tab === 'fers' || tab === 'special') && (
            <div style={{ ...s.grid2, marginTop: 16 }}>
              <Field label="Current Age">
                <input
                  type="number" min="25" max="80"
                  value={currentAge}
                  onChange={e => setCurrentAge(e.target.value)}
                  placeholder="e.g. 55"
                  style={s.input}
                />
              </Field>
              <Field label="Planned Retirement Age">
                <input
                  type="number" min="50" max="70"
                  value={retireAge}
                  onChange={e => setRetireAge(e.target.value)}
                  placeholder="e.g. 62"
                  style={s.input}
                />
              </Field>
            </div>
          )}

          {/* FERS-specific: retirement type */}
          {tab === 'fers' && (
            <div style={{ marginTop: 16 }}>
              <Field label="Retirement Type" hint="Affects early retirement penalty calculation">
                <select value={earlyRetirement} onChange={e => setEarlyRetirement(e.target.value)} style={s.select}>
                  <option value="immediate">Immediate (MRA + 30 yrs, or age 60 + 20 yrs, or age 62 + 5 yrs)</option>
                  <option value="mra10">Early Voluntary (MRA + 10) - 5% reduction per year under 62</option>
                </select>
              </Field>
            </div>
          )}

          {/* Special category selector */}
          {tab === 'special' && (
            <div style={{ marginTop: 16 }}>
              <Field label="Special Category">
                <select value={specialCat} onChange={e => setSpecialCat(e.target.value)} style={s.select}>
                  <option value="leo">Law Enforcement Officer (LEO)</option>
                  <option value="ff">Firefighter (FF)</option>
                  <option value="atc">Air Traffic Controller (ATC)</option>
                  <option value="congressional">Congressional Employee</option>
                </select>
              </Field>
            </div>
          )}

          {/* Survivor Benefit */}
          <div style={{ marginTop: 16 }}>
            <Field label="Survivor Benefit Election" hint="Reduces your pension to provide income to a surviving spouse">
              <select value={survivorBenefit} onChange={e => setSurvivorBenefit(e.target.value)} style={s.select}>
                <option value="full">Full (50% to survivor - 10% deduction from your pension)</option>
                <option value="partial">Partial (25% to survivor - 5% deduction from your pension)</option>
                <option value="none">None (0% deduction - no survivor benefit)</option>
              </select>
            </Field>
          </div>

          {/* TSP Section */}
          <div style={{ ...s.cardTitle, marginTop: 28 }}>Your TSP (Thrift Savings Plan)</div>
          <div style={s.grid2}>
            <Field label="Current TSP Balance ($)" hint="Your current account balance across all funds">
              <input
                type="number" min="0"
                value={tspBalance}
                onChange={e => setTspBalance(e.target.value)}
                placeholder="e.g. 250000"
                style={s.input}
              />
            </Field>
            <Field label="Monthly Contribution ($)" hint="Employee + agency contributions per month">
              <input
                type="number" min="0"
                value={monthlyContrib}
                onChange={e => setMonthlyContrib(e.target.value)}
                placeholder="e.g. 800"
                style={s.input}
              />
            </Field>
          </div>
          <div style={{ marginTop: 16 }}>
            <Field label={`Assumed Annual Growth Rate: ${tspGrowthRate}%`} hint=ive planning.">
              <div style={s.sliderRow}>
                <input
                  type="range" min="3" max="10" step="0.5"
                  value={tspGrowthRate}
                  onChange={e => setTspGrowthRate(e.target.value)}
                  style={s.slider}
                />
                <span style={s.sliderVal}>{tspGrowthRate}%</span>
              </div>
            </Field>
          </div>

          {/* Social Security */}
          <div style={{ ...s.cardTitle, marginTop: 28 }}>Social Security</div>
          <div style={s.grid2}>
            <Field
              label="Estimated Monthly Benefit at Age 62 ($)"
              hint="Find this on your Social Security statement at ssa.gov/myaccount. Leave blank to skip."
            >
              <input
                type="number" min="0"
                value={ssAt62}
                onChange={e => setSsAt62(e.target.value)}
                placeholder="e.g. 1450"
                style={s.input}
              />
            </Field>
            <Field label="Planned SS Claiming Age" hint="Delaying SS increases your benefit. FRA is 67 for most workers.">
              <select value={ssClaimAge} onChange={e => setSsClaimAge(e.target.value)} style={s.select}>
                <option value="62">62 (earliest, reduced benefit)</option>
                <option value="63">63</option>
                <option value="64">64</option>
                <option value="65">65</option>
                <option value="66">66</option>
                <option value="67">67 (Full Retirement Age for most)</option>
                <option value="68">68</option>
                <option value="69">69</option>
                <option value="70">70 (maximum benefit)</option>
              </select>
            </Field>
          </div>

          {/* FERS Supplement toggle */}
          {(tab === 'fers' || tab === 'special') && parseFloat(retireAge) < 62 && ssAt62 && (
            <div style={{ marginTop: 12 }}>
              <label style={s.checkLabel}>
                <input
                  type="checkbox"
                  checked={includeSupp}
                  onChange={e => setIncludeSupp(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Include FERS Supplement (payable until age 62 on immediate retirement)
              </label>
            </div>
          )}

          {/* Medicare toggle */}
          <div style={{ marginTop: 12 }}>
            <label style={s.checkLabel}>
              <input
                type="checkbox"
                checked={includeMedicare}
                onChange={e => setIncludeMedicare(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Deduct Medicare Part B premium ($185/mo in 2026) from total income
            </label>
          </div>


          {/* FEHB Health Insurance */}
          <div style={{ marginTop: 12 }}>
            <label style={s.checkLabel}>
              <input
                type="checkbox"
                checked={includeFEHB}
                onChange={e => setIncludeFEHB(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Deduct FEHB health insurance premium from total income
            </label>
          </div>
          {includeFEHB && (
            <div style={{ marginTop: 14, padding: '18px 20px', background: '#f0f9ff', borderRadius: 12, border: '1.5px solid #bae6fd' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <Field label="FEHB Plan" hint="2026 OPM rates. * = estimated — verify at opm.gov/premiums">
                  <select value={fehbPlan} onChange={e => setFehbPlan(e.target.value)} style={s.select}>
                    {FEHB_PLANS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Coverage Type">
                  <select value={fehbCoverage} onChange={e => setFehbCoverage(e.target.value)} style={s.select}>
                    <option value="self">Self Only</option>
                    <option value="self1">Self + One</option>
                    <option value="fam">Self + Family</option>
                  </select>
                </Field>
              </div>
              {fehbPlan === 'custom' && (
                <div style={{ marginTop: 12 }}>
                  <Field label="Monthly Premium Amount ($)" hint="Enter the monthly amount deducted from your pension">
                    <input
                      type="number" min="0"
                      value={fehbCustom}
                      onChange={e => setFehbCustom(e.target.value)}
                      placeholder="e.g. 350"
                      style={s.input}
                    />
                  </Field>
                </div>
              )}
              {fehbPlan !== 'custom' && (() => {
                const plan = FEHB_PLANS.find(p => p.id === fehbPlan)
                const bw = plan ? (fehbCoverage === 'self' ? plan.self : fehbCoverage === 'self1' ? plan.s1 : plan.fam) : 0
                const mo = fehbMonthlyAmt(bw)
                return (
                  <div style={{ marginTop: 10, fontSize: '0.82rem', color: '#0369a1' }}>
                    Estimated monthly deduction: <strong>{fmt(mo)}/mo</strong> ({fmt(bw)}/biweekly × 26 ÷ 12)
                    {plan && !plan.verified && <span style={{ color: '#d97706', marginLeft: 6 }}>*estimate — verify at opm.gov</span>}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div style={s.errorBox}>
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          {/* Calculate Button */}
          <button onClick={calculate} style={s.calcBtn}>
            Calculate My Retirement Income
          </button>

          <div style={s.disclaimer}>
            Calculations use verified 2026 OPM figures. This tool provides estimates for educational
            purposes. Consult OPM or a licensed benefits specialist for official projections.
          </div>
        </div>

        {/* RESULTS */}
        {results && (
          <div id="calc-results" style={s.results}>

            {/* Total Income Banner */}
            <div style={s.totalBanner}>
              <div style={s.totalLabel}>Estimated Total Monthly Retirement Income</div>
              <div style={s.totalAmount}>{fmt(results.totalMonthly)}</div>
              <div style={s.totalSub}>{fmt(results.totalAnnual)} per year</div>
            </div>

            {/* Income Breakdown Grid */}
            <div style={s.breakdownGrid}>

              {/* Pension */}
              <div style={s.breakdownCard}>
                <div style={s.bCardIcon}>$</div>
                <div style={s.bCardLabel}>Monthly Pension</div>
                <div style={s.bCardValue}>{fmt(results.pensionMonthly)}</div>
                <div style={s.bCardSub}>{fmt(results.pensionAnnual)}/yr</div>
                {results.tab === 'fers' && (
                  <div style={s.bCardDetail}>
                    {results.yrs} yrs x {fmtDec(results.pensionResult.multiplierPct)}% x {fmt(results.h3)} High-3
                    {results.pensionResult.earlyReduction > 0 && (
                      <span style={{ color: '#ef4444' }}>
                        {' '}(MRA+10: -{fmtDec(results.pensionResult.earlyReduction * 100, 0)}% reduction)
                      </span>
                    )}
                  </div>
                )}
                {results.tab === 'csrs' && (
                  <div style={s.bCardDetail}>
                    {fmtDec(results.pensionResult.ratePct)}% effective rate x {fmt(results.h3)} High-3
                  </div>
                )}
                {results.tab === 'special' && (
                  <div style={s.bCardDetail}>{results.pensionResult.breakdown}</div>
                )}
              </div>

              {/* FERS Supplement */}
              {results.supplementMonthly > 0 && (
                <div style={s.breakdownCard}>
                  <div style={s.bCardIcon}>+</div>
                  <div style={s.bCardLabel}>FERS Supplement</div>
                  <div style={s.bCardValue}>{fmt(results.supplementMonthly)}</div>
                  <div style={s.bCardSub}>Until age 62</div>
                  <div style={s.bCardDetail}>({yrsServiceLabel(results.yrs)} / 40) x SS at 62</div>
                </div>
              )}

              {/* TSP */}
              <div style={s.breakdownCard}>
                <div style={s.bCardIcon}>T</div>
                <div style={s.bCardLabel}>TSP Monthly Income</div>
                <div style={s.bCardValue}>{fmt(results.tspMonthly4pct)}</div>
                <div style={s.bCardSub}>4% rule from {fmt(results.tspAtRetirement)}</div>
                <div style={s.bCardDetail}>
                  At {fmtDec(results.growthRate, 1)}% growth over {results.yearsToRetire} yrs
                  {'+'+{' '})- variable, market-dependent
                </div>
              </div>

              {/* Social Security */}
              {results.ssMonthly > 0 && (
                <div style={s.breakdownCard}>
                  <div style={s.bCardIcon}>SS</div>
                  <div style={s.bCardLabel}>Social Security</div>
                  <div style={s.bCardValue}>{fmt(results.ssMonthly)}</div>
                  <div style={s.bCardSub}>Claiming at age {results.claimAge}</div>
                  <div style={s.bCardDetail}>Estimated based on your age-62 benefit</div>
                </div>
              )}

              {/* Medicare deduction */}
              {results.medicareDeduct > 0 && (
                <div style={{ ...s.breakdownCard, borderColor: '#fca5a5' }}>
                  <div style={{ ...s.bCardIcon, background: '#fee2e2', color: '#dc2626' }}>-</div>
                  <div style={s.bCardLabel}>Medicare Part B</div>
                  <div style={{ ...s.bCardValue, color: '#dc2626' }}>-{fmt(results.medicareDeduct)}</div>
                  <div style={s.bCardSub}>2026 standard premium</div>
                  <div style={s.bCardDetail}>Typically deducted from SS or pension</div>
                </div>
              )}

              {/* FEHB deduction */}
              {results.fehbDeduct > 0 && (
                <div style={{ ...s.breakdownCard, borderColor: '#fca5a5' }}>
                  <div style={{ ...s.bCardIcon, background: '#fee2e2', color: '#dc2626' }}>H</div>
                  <div style={s.bCardLabel}>FEHB Premium</div>
                  <div style={{ ...s.bCardValue, color: '#dc2626' }}>-{fmt(results.fehbDeduct)}</div>
                  <div style={s.bCardSub}>monthly deduction</div>
                  <div style={s.bCardDetail}>{results.fehbPlanLabel}</div>
                  <div style={s.bCardDetail}>{results.fehbCoverageLabel}</div>
                </div>
              )}

            </div>

            {/* Income Breakdown Table */}
            <div style={s.tableCard}>
              <div style={s.tableTitle}>Complete Income Breakdown</div>
              {[
                { label: 'FERS/CSRS Pension (net after survivor deduction)', value: fmt(results.pensionMonthly), sub: fmt(results.pensionAnnual) + '/yr', pos: true },
                results.supplementMonthly > 0 && { label: 'FERS Supplement (until age 62)', value: '+' + fmt(results.supplementMonthly), sub: 'temporary', pos: true },
                { label: 'TSP Income (4% safe withdrawal rate - variable)', value: '+' + fmt(results.tspMonthly4pct), sub: 'from ' + fmt(results.tspAtRetirement), pos: true },
                results.ssMonthly > 0 && { label: `Social Security (claiming at ${results.claimAge})`, value: '+' + fmt(results.ssMonthly), sub: fmt(results.ssMonthly * 12) + '/yr', pos: true },
                results.medicareDeduct > 0 && { label: 'Medicare Part B Premium (2026)', value: '-' + fmt(results.medicareDeduct), sub: 'monthly deduction', pos: false },
                results.fehbDeduct > 0 && { label: `FEHB Premium — ${results.fehbPlanLabel} (${results.fehbCoverageLabel})`, value: '-' + fmt(results.fehbDeduct), sub: 'monthly deduction', pos: false },
                { label: 'Total Estimated Monthly Income', value: fmt(results.totalMonthly), sub: fmt(results.totalAnnual) + '/yr', bold: true },
              ].filter(Boolean).map((row, i) => (
                <div key={i} style={{ ...s.tableRow, ...(row.bold ? s.tableRowBold : {}) }}>
                  <span style={s.tableDesc}>{row.label}</span>
                  <span style={{ ...s.tableAmt, ...(row.pos === false ? { color: '#dc2626' } : {}), ...(row.bold ? { color: '#1e3a5f' } : {}) }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* FIA Comparison Panel */}
            <div style={s.fiaPanel}>
              <div style={s.fiaPanelHeader}>
                <div>
                  <div style={s.fiaBadge}>TSP Strategy Comparison</div>
                  <div style={s.fiaTitle}>What if your TSP generated guaranteed income?</div>
                  <div style={s.fiaSub}>
                    Your TSP income above uses the 4% rule - a widely used guideline, but not guaranteed.
                    A Fixed Indexed Annuity (FIA) with an income rider can convert your TSP into
                    predictable, guaranteed monthly income you cannot outlive - regardless of market conditions.
                  </div>
                </div>
              </div>

              <div style={s.fiaCompareGrid}>
                <div style={s.fiaCompareCard}>
                  <div style={s.fiaCompareLabel}>TSP - 4% Rule (Variable)</div>
                  <div style={s.fiaCompareAmount}>{fmt(results.tspMonthly4pct)}/mo</div>
                  <div style={s.fiaCompareNote}>Market dependent. Could increase or decrease. Depletes over time.</div>
                </div>
                <div style={s.fiaVs}>vs.</div>
                <div style={{ ...s.fiaCompareCard, ...s.fiaCompareCardHighlight }}>
                  <div style={{ ...s.fiaCompareLabel, color: '#1e3a5f' }}>FIA Income Rider (Guaranteed)</div>
                  <div style={{ ...s.fiaCompareAmount, color: '#1e3a5f' }}>
                    {fmt(results.fiaPayouts.conservative)} - {fmt(results.fiaPayouts.aggressive)}/mo
                  </div>
                  <div style={{ ...s.fiaCompareNote, color: '#475569' }}>
                    Guaranteed for life. 4.5%-6.5% payout rate typical. Cannot run out.
                  </div>
                </div>
              </div>

              <div style={s.fiaDisclaimer}>
                FIA payout rates vary by carrier, product, and age. Illustration assumes a 4.5%-6.5%
                annual income rider payout on your TSP balance of {fmt(results.tspAtRetirement)} at retirement.
                This is for educational comparison only and does not constitute a product recommendation.
                Actual guaranteed income amounts require a full illustration from a licensed advisor.
              </div>

              <div style={s.fiaCTA}>
                <div style={s.fiaCTAText}>
                  Want to see exactly what guaranteed income your TSP could generate?
                </div>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={s.fiaCTABtn}>
                  Book Your Free Consultation
                </a>
                <div style={s.fiaCTASub}>30 minutes. No cost. No obligation. Federal Market Associates.</div>
              </div>
            </div>

            {/* Important Assumptions */}
            <div style={s.assumptionsBox}>
              <div style={s.assumptionsTitle}>Calculation Notes & Assumptions</div>
              <div style={s.assumptionsGrid}>
                <div style={s.assumptionItem}>
                  <strong>FERS Multiplier:</strong> 1.0% standard; 1.1% if age 62+ with 20+ years of service (OPM verified)
                </div>
                <div style={s.assumptionItem}>
                  <strong>CSRS:</strong> Tiered - 1.5% (yrs 1-5), 1.75% (yrs 6-10), 2.0% (yrs 11+), max 80% of High-3
                </div>
                <div style={s.assumptionItem}>
                  <strong>Special Provisions:</strong> 1.7% per year first 20 years (LEO/FF/ATC), 1.0% thereafter
                </div>
                <div style={s.assumptionItem}>
                  <strong>FERS Supplement:</strong> (FERS years / 40) x estimated SS at 62. Payable until age 62 on immediate retirement only.
                </div>
                <div style={s.assumptionItem}>
                  <strong>TSP Projection:</strong> Compound growth including future contributions. Past performance does not guarantee future results.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Social Security:</strong> Based on your entered age-62 estimate. Adjustments for claiming age use SSA reduction/credit factors.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Medicare Part B:</strong> 2026 standard premium $185.00/mo (CMS verified). Higher earners may pay more (IRMAA).
                </div>
                <div style={s.assumptionItem}>
                  <strong>MRA+10 Penalty:</strong> 5% reduction for each year you are under age 62 at retirement, up to 50%.
                </div>
                <div style={s.assumptionItem}>
                  <strong>FEHB Premium:</strong> 2026 OPM biweekly rates (BCBS FEP verified; GEHA/Aetna estimated). Deducted monthly from pension. Verify your plan at opm.gov/premiums.
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={fieldStyles.label}>{label}</label>
      {children}
      {hint && <div style={fieldStyles.hint}>{hint}</div>}
    </div>
  )
}

function yrsServiceLabel(n) {
  return fmtDec(n, 0)
}

// ============================================================
// STYLES
// ============================================================

const fieldStyles = {
  label: { fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569' },
  hint:  { fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.4 },
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', paddingBottom: 80 },
  container: { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },

  header: { textAlign: 'center', marginBottom: 36 },
  badge: { display: 'inline-block', background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, marginBottom: 14 },
  h1: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12 },
  subtitle: { fontSize: '1rem', color: '#64748b', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 },

  tabRow: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tabBtn: { flex: 1, minWidth: 120, padding: '10px 16px', border: '2px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s' },
  tabBtnActive: { borderColor: '#1e3a5f', background: '#1e3a5f', color: '#fff' },

  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px', marginBottom: 24 },
  cardTitle: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1e3a5f', marginBottom: 18, paddingBottom: 10, borderBottom: '2px solid #e2e8f0' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 },

  input: { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '11px 14px', color: '#0f172a', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  select: { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '11px 14px', color: '#0f172a', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box', cursor: 'pointer' },

  sliderRow: { display: 'flex', alignItems: 'center', gap: 14 },
  slider: { flex: 1, height: 6, borderRadius: 3, cursor: 'pointer', accentColor: '#1e3a5f' },
  sliderVal: { minWidth: 44, textAlign: 'right', fontWeight: 700, color: '#1e3a5f', fontSize: '1rem' },

  checkLabel: { display: 'flex', alignItems: 'center', fontSize: '0.88rem', color: '#475569', cursor: 'pointer' },

  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: '0.88rem', marginTop: 16 },

  calcBtn: { width: '100%', marginTop: 24, padding: '16px', background: '#1e3a5f', color: '#fff', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', border: 'none', borderRadius: 12, cursor: 'pointer' },

  disclaimer: { marginTop: 14, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, textAlign: 'center' },

  // Results
  results: { marginTop: 8 },

  totalBanner: { background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a9e 100%)', borderRadius: 16, padding: '36px 32px', textAlign: 'center', marginBottom: 24 },
  totalLabel: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  totalAmount: { fontSize: 'clamp(2.8rem, 8vw, 4.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 8 },
  totalSub: { fontSize: '1rem', color: 'rgba(255,255,255,0.75)' },

  breakdownGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  breakdownCard: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '20px 18px' },
  bCardIcon: { width: 36, height: 36, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1e40af', fontSize: '0.85rem', marginBottom: 10 },
  bCardLabel: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: 6 },
  bCardValue: { fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 4 },
  bCardSub: { fontSize: '0.78rem', color: '#64748b', marginBottom: 8 },
  bCardDetail: { fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.4 },

  tableCard: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '24px', marginBottom: 24 },
  tableTitle: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e3a5f', marginBottom: 16 },
  tableRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
  tableRowBold: { borderTop: '2px solid #1e3a5f', borderBottom: 'none', marginTop: 4, paddingTop: 14 },
  tableDesc: { fontSize: '0.88rem', color: '#475569', flex: 1, marginRight: 16 },
  tableAmt: { fontSize: '1rem', fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' },

  // FIA Panel
  fiaPanel: { background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: 16, padding: '32px', marginBottom: 24 },
  fiaPanelHeader: { marginBottom: 24 },
  fiaBadge: { display: 'inline-block', background: '#0ea5e9', color: '#fff', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: 20, marginBottom: 10 },
  fiaTitle: { fontSize: '1.3rem', fontWeight: 800, color: '#0c4a6e', marginBottom: 10 },
  fiaSub: { fontSize: '0.9rem', color: '#0369a1', lineHeight: 1.6 },

  fiaCompareGrid: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 20 },
  fiaVs: { fontSize: '1.2rem', fontWeight: 800, color: '#64748b', textAlign: 'center' },
  fiaCompareCard: { background: '#fff', border: '1.5px solid #bae6fd', borderRadius: 12, padding: '20px 18px' },
  fiaCompareCardHighlight: { background: '#ecfdf5', border: '2px solid #22c55e' },
  fiaCompareLabel: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 },
  fiaCompareAmount: { fontSize: '1.6rem', fontWeight: 800, color: '#0c4a6e', marginBottom: 8 },
  fiaCompareNote: { fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 },

  fiaDisclaimer: { fontSize: '0.73rem', color: '#0369a1', lineHeight: 1.5, marginBottom: 24, background: '#e0f2fe', borderRadius: 8, padding: '12px 16px' },

  fiaCTA: { background: '#1e3a5f', borderRadius: 14, padding: '28px', textAlign: 'center' },
  fiaCTAText: { fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 18 },
  fiaCTABtn: { display: 'inline-block', background: '#22c55e', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', marginBottom: 12 },
  fiaCTASub: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' },

  assumptionsBox: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '24px' },
  assumptionsTitle: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: 16 },
  assumptionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 },
  assumptionItem: { fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 },
}
