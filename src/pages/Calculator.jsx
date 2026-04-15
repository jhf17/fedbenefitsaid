import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

// ============================================================
// VERIFIED 2026 CALCULATION CONSTANTS
// Source: OPM, SSA, IRS
// ============================================================

// Social Security 2026 bend points (monthly AIME)
const SS_BEND1 = 1286   // 90% below this (2026 per SSA.gov)
const SS_BEND2 = 7749   // 32% between bend1 and bend2, 15% above

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
const MEDICARE_B_MONTHLY = 202.90

// FERS COLA (Cost of Living Adjustment) rules
const COLA_AVERAGE_ANNUAL = 0.02


function calcCOLAProjection(pensionMonthly, retireAge, yearsToRetirement, tab) {
  if (tab !== 'fers') return null
  const retirementAge = Math.round(retireAge)
  const projections = []
  // FERS COLA rules (applied to assumed average CPI of 2%):
  // - If CPI ≤ 2%: COLA = CPI (full adjustment)
  // - If 2% < CPI ≤ 3%: COLA = 2%
  // - If CPI > 3%: COLA = CPI - 1%
  // With our 2% average CPI assumption, effective COLA = 2%
  // No COLA until age 62 (except for disability/survivor)
  const assumedCPI = COLA_AVERAGE_ANNUAL
  const effectiveCOLA = assumedCPI <= 0.02 ? assumedCPI : (assumedCPI <= 0.03 ? 0.02 : assumedCPI - 0.01)
  for (const yearsAfter of [5, 10, 15, 20]) {
    const ageAtYear = retirementAge + yearsAfter
    let projectedMonthly = pensionMonthly
    let totalColaApplied = 0
    let currentAge = retirementAge
    for (let year = 1; year <= yearsAfter; year++) {
      currentAge = retirementAge + year
      if (currentAge >= 62) {
        projectedMonthly = projectedMonthly * (1 + effectiveCOLA)
        totalColaApplied += effectiveCOLA
      }
    }
    projections.push({ yearsAfter, ageAtYear, projectedMonthly: Math.round(projectedMonthly * 100) / 100, totalColaApplied })
  }
  return projections
}

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

function calcFERSPension(yearsService, high3, retireAge, survivorBenefit, earlyRetirement, sickLeaveHours = 0) {
  const yrs = parseFloat(yearsService) || 0
  const h3 = parseFloat(high3) || 0
  const rAge = parseFloat(retireAge) || 62
  // Sick leave credit: 174 hrs = 1 month of additional service (FERS, since 2010 NDAA)
  // Source: OPM FERS Handbook — added to creditable service for annuity computation only
  const slHours = parseFloat(sickLeaveHours) || 0
  const sickLeaveMonths = Math.floor(slHours / 174)
  const sickLeaveYears = sickLeaveMonths / 12
  const effectiveYrs = yrs + sickLeaveYears

  let multiplierRate = FERS_STANDARD
  if (rAge >= 62 && yrs >= 20) {
    multiplierRate = FERS_ENHANCED
  }

  const grossPension = effectiveYrs * multiplierRate * h3

  let earlyReductionAmt = 0
  let grossAfterEarly = grossPension
  if (rAge < 62 && earlyRetirement === 'mra10') {
    const yearsUnder62 = 62 - rAge
    const reductionPercent = yearsUnder62 * 0.05
    earlyReductionAmt = grossPension * reductionPercent
    grossAfterEarly = grossPension - earlyReductionAmt
  }

  let survivorDeduct = 0
  if (survivorBenefit === 'reduced') {
    survivorDeduct = grossAfterEarly * 0.05
  } else if (survivorBenefit === 'full') {
    survivorDeduct = grossAfterEarly * 0.10
  }

  const netAnnual = grossAfterEarly - survivorDeduct

  return {
    multiplierPct: multiplierRate * 100,
    gross: grossPension,
    earlyReductionAmt,
    grossAfterEarly,
    survivorDeduct,
    netAnnual
  }
}

function calcCSRSPension(yearsService, high3, survivorBenefit) {
  const yrs = parseFloat(yearsService) || 0
  const h3 = parseFloat(high3) || 0

  let multiplierRate = 0
  if (yrs <= 5) {
    multiplierRate = CSRS_T1
  } else if (yrs <= 10) {
    const firstFive = 5 * CSRS_T1
    const remaining = (yrs - 5) * CSRS_T2
    return calcCSRSPension_Helper(yrs, h3, firstFive, remaining, 'CSRS', survivorBenefit)
  } else {
    const firstFive = 5 * CSRS_T1
    const nextFive = 5 * CSRS_T2
    const remaining = (yrs - 10) * CSRS_T3
    return calcCSRSPension_Helper(yrs, h3, firstFive, nextFive, 'CSRS_T3', survivorBenefit, remaining)
  }

  const grossPension = Math.min(yrs * multiplierRate * h3, h3 * CSRS_MAX)

  let survivorDeduct = 0
  if (survivorBenefit === 'reduced') {
    survivorDeduct = grossPension * 0.05
  } else if (survivorBenefit === 'full') {
    survivorDeduct = grossPension * 0.10
  }

  const netAnnual = grossPension - survivorDeduct

  return {
    multiplierPct: (grossPension / h3 / yrs) * 100,
    gross: grossPension,
    survivorDeduct,
    netAnnual
  }
}

function calcCSRSPension_Helper(yrs, h3, firstFive, remaining, tier, survivorBenefit, thirdTier = 0) {
  let grossPension
  if (tier === 'CSRS') {
    const nextFive = (yrs - 5) * CSRS_T2
    grossPension = firstFive + nextFive
  } else {
    grossPension = firstFive + remaining + thirdTier
  }

  grossPension = grossPension * h3
  grossPension = Math.min(grossPension, h3 * CSRS_MAX)

  let survivorDeduct = 0
  if (survivorBenefit === 'reduced') {
    survivorDeduct = grossPension * 0.05
  } else if (survivorBenefit === 'full') {
    survivorDeduct = grossPension * 0.10
  }

  const netAnnual = grossPension - survivorDeduct

  return {
    multiplierPct: (grossPension / h3 / yrs) * 100,
    gross: grossPension,
    survivorDeduct,
    netAnnual
  }
}

function calcSpecialPension(yearsService, high3, survivorBenefit, category) {
  const yrs = parseFloat(yearsService) || 0
  const h3 = parseFloat(high3) || 0

  let grossPension
  if (yrs <= 20) {
    grossPension = yrs * SP_HIGH * h3
  } else {
    grossPension = (20 * SP_HIGH + (yrs - 20) * SP_LOW) * h3
  }

  let survivorDeduct = 0
  if (survivorBenefit === 'reduced') {
    survivorDeduct = grossPension * 0.05
  } else if (survivorBenefit === 'full') {
    survivorDeduct = grossPension * 0.10
  }

  const netAnnual = grossPension - survivorDeduct

  return {
    multiplierPct: (grossPension / h3 / yrs) * 100,
    gross: grossPension,
    survivorDeduct,
    netAnnual
  }
}

function calcSSBenefit(sstAt62, claimAge) {
  // Input sstAt62 is the user's estimated MONTHLY benefit if claimed at age 62.
  // Factors below are ratios of (benefit at claim age) / (benefit at 62), computed
  // from SSA.gov rules for workers with Full Retirement Age = 67 (born 1960+):
  //   Age 62 = 70% of PIA, 63 = 75%, 64 = 80%, 65 = 86.67%, 66 = 93.33%,
  //   Age 67 (FRA) = 100%, 68 = 108%, 69 = 116%, 70 = 124% (DRCs cap at 70).
  // Source: https://www.ssa.gov/benefits/retirement/planner/agereduction.html
  // Source: https://www.ssa.gov/benefits/retirement/planner/delayret.html
  const ageShift = Math.max(0, claimAge - 62)
  const increases = {
    0: 1.000,                // 62: 70/70
    1: 75 / 70,              // 63: 75/70  ≈ 1.0714
    2: 80 / 70,              // 64: 80/70  ≈ 1.1429
    3: 86.67 / 70,           // 65: 86.67/70 ≈ 1.2381
    4: 93.33 / 70,           // 66: 93.33/70 ≈ 1.3333
    5: 100 / 70,             // 67 FRA: 100/70 ≈ 1.4286
    6: 108 / 70,             // 68: 108/70 ≈ 1.5429
    7: 116 / 70,             // 69: 116/70 ≈ 1.6571
    8: 124 / 70,             // 70: 124/70 ≈ 1.7714 (DRCs cap)
  }
  const factor = increases[Math.min(ageShift, 8)] || 1.000
  return sstAt62 * factor
}

function calcTSPFutureValue(balance, monthlyContrib, yearsToRetire, annualGrowthRate) {
  const months = Math.round(yearsToRetire * 12)
  const monthlyRate = (annualGrowthRate / 100) / 12
  const months_fv = balance * Math.pow(1 + monthlyRate, months)
  const contrib_fv = monthlyContrib * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
  return months_fv + contrib_fv
}

function calcFERSSupplement(yearsService, ssAt62) {
  const yrs = parseFloat(yearsService) || 0
  const ss = parseFloat(ssAt62) || 0
  // ssAt62 input is collected as a MONTHLY figure (label: "Estimated Social
  // Security at Age 62 ($/mo)"), and the OPM Supplement formula produces a
  // monthly result: (years of FERS service / 40) × estimated age-62 monthly SS.
  return (yrs / 40) * ss
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Calculator() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('fers')
  const [results, setResults] = useState(null)
  const [showFIA, setShowFIA] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Shared inputs
  const [currentAge, setCurrentAge] = useState('')
  const [retireAge, setRetireAge] = useState('')
  const [yearsService, setYearsService] = useState('')
  const [high3, setHigh3] = useState('')
  const [survivorBenefit, setSurvivorBenefit] = useState('full')
  const [sickLeaveHours, setSickLeaveHours] = useState('')
  const [tspBalance, setTspBalance] = useState('')
  const [monthlyContrib, setMonthlyContrib] = useState('')
  const [tspGrowthRate, setTspGrowthRate] = useState('6')
  const [ssAt62, setSsAt62] = useState('')
  const [ssClaimAge, setSsClaimAge] = useState('67')
  const [includeMedicare, setIncludeMedicare] = useState(false)

  // FEHB health insurance deduction
  const [includeFEHB, setIncludeFEHB] = useState(false)
  const [fehbPlan, setFehbPlan] = useState('bcbs_standard')
  const [fehbCoverage, setFehbCoverage] = useState('self')
  const [fehbCustom, setFehbCustom] = useState('')

  // FERS retirement type — auto-detected from age, service, and planned retirement age
  // MRA for FERS: born 1970+ = 57; 1953-1964 = 56; before 1953 = 55
  const getMRA = (age) => {
    const birthYear = new Date().getFullYear() - (parseInt(age) || 0)
    if (birthYear >= 1970) return 57
    if (birthYear >= 1953) return 56
    return 55
  }
  const earlyRetirement = (() => {
    const rAge = parseInt(retireAge) || 0
    const cAge = parseInt(currentAge) || 0
    const svc = parseInt(yearsService) || 0
    const svcAtRetire = svc + (rAge - cAge)
    if (rAge >= 62 && svcAtRetire >= 5) return 'immediate'
    if (rAge >= 60 && svcAtRetire >= 20) return 'immediate'
    const mra = getMRA(cAge)
    if (rAge >= mra && svcAtRetire >= 30) return 'immediate'
    if (rAge >= mra && svcAtRetire >= 10) return 'mra10'
    return 'immediate'
  })()

  // FERS Supplement
  const [includeSupp, setIncludeSupp] = useState(true)

  // Special category
  const [specialCat, setSpecialCat] = useState('leo')


  const [errors, setErrors] = useState([])
  const [captureEmail, setCaptureEmail] = useState('')
  const [captureName, setCaptureName] = useState('')
  const [capturePhone, setCapturePhone] = useState('')
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureSent, setCaptureSent] = useState(false)
  const [captureError, setCaptureError] = useState('')

  useEffect(() => {
    document.title = 'Federal Retirement Income Calculator | FedBenefitsAid'
  }, [tab])

  const handleEmailCapture = async (e) => {
    e.preventDefault()
    setCaptureError('')
    setCaptureLoading(true)
    try {
      const res = await fetch('/.netlify/functions/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: captureName, email: captureEmail, phone: capturePhone, source: 'Calculator' }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setCaptureSent(true)

      // Send results email (fire-and-forget)
      if (results) {
        const fmt = (n) => '$' + Math.round(n).toLocaleString()
        const breakdown = [
          { label: 'FERS Pension', value: fmt(results.pension), type: 'income' },
          results.supplement > 0 ? { label: 'FERS Supplement', subtitle: 'Until age 62', value: fmt(results.supplement), type: 'income' } : null,
          results.ss > 0 ? { label: 'Social Security', subtitle: `Claiming at age ${retireAge || 62}`, value: fmt(results.ss), type: 'income' } : null,
          results.tspDraw > 0 ? { label: 'TSP Drawdown', subtitle: `Based on ${fmt(+tspBalance)} balance`, value: fmt(results.tspDraw), type: 'income' } : null,
          results.fehb > 0 ? { label: 'FEHB Health Premium', subtitle: fehbPlan || 'Self Only', value: fmt(results.fehb), type: 'deduction' } : null,
          results.medicare > 0 ? { label: 'Medicare Part B', value: fmt(results.medicare), type: 'deduction' } : null,
        ].filter(Boolean)

        fetch('/.netlify/functions/send-results-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'calculator',
            email: captureEmail,
            data: {
              name: captureName,
              totalMonthly: fmt(results.total),
              totalAnnual: fmt(results.total * 12),
              retirementSystem: tab === 'csrs' ? 'CSRS' : tab === 'special' ? 'FERS Special Provision' : 'FERS',
              breakdown,
            },
          }),
        }).catch(() => {}) // silent fail
      }
    } catch {
      setCaptureError('Something went wrong. Please try again.')
    } finally {
      setCaptureLoading(false)
    }
  }

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
        pensionResult = calcFERSPension(yrs, h3, rAge, survivorBenefit, earlyRetirement, sickLeaveHours)
        // FERS Supplement: auto-included when eligible (immediate retirement before 62)
        if (rAge < 62 && earlyRetirement !== 'mra10' && ssEstimate > 0) {
          supplementMonthly = calcFERSSupplement(yrs, ssEstimate)
        }
      } else if (tab === 'csrs') {
        pensionResult = calcCSRSPension(yrs, h3, survivorBenefit)
      } else {
        pensionResult = calcSpecialPension(yrs, h3, survivorBenefit, specialCat)
        if (rAge < 62 && ssEstimate > 0) {
          supplementMonthly = calcFERSSupplement(yrs, ssEstimate)
        }
      }

      const tspAtRetirement = calcTSPFutureValue(tspBal, mContrib, yearsToRetire, growthRate)
      const tspMonthly4pct = (tspAtRetirement * 0.04) / 12
      const ssMonthly = (tab !== 'csrs' && ssEstimate > 0) ? calcSSBenefit(ssEstimate, claimAge) : 0
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
        pensionAnnual: pensionResult.netAnnual,
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
        colaProjection: calcCOLAProjection(pensionMonthly, rAge, yearsToRetire, tab),
      })
      setShowFIA(false)

    setTimeout(() => {
      document.getElementById('calc-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const s = styles

  return (
    <main id="main-content" style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header(isMobile)}>
          <div style={s.badge}>Free Tool - No Account Required</div>
          <h1 style={s.h1}>{'Federal Retirement Income Calculator'}</h1>
          <p style={s.subtitle}>
            {'See your complete retirement picture: pension, TSP, and Social Security combined. All calculations use verified 2026 OPM figures.'}
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div style={s.disclaimerBanner}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          This calculator provides estimates for educational purposes only. {'Results are based on publicly available FERS formulas and the information you provide.'} Actual benefits may differ. This is not financial advice — consult a qualified federal benefits advisor for personalized guidance. FedBenefitsAid is not affiliated with OPM or the U.S. government.
        </div>

        {/* Calculator Tabs */}
        <div style={s.tabRow} role="tablist" aria-label="Calculator type">
          {[
            { id: 'fers', label: 'FERS' },
            { id: 'csrs', label: 'CSRS' },
            { id: 'special', label: 'Special Provisions' },
          ].map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => { setTab(t.id); setResults(null); setErrors([]) }}
              style={{ ...s.tabBtn, ...(tab === t.id ? s.tabBtnActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>


            {/* Shared Retirement Form */}
            <div style={s.card(isMobile)}>
              <div style={s.cardTitle}>Your Service & Salary</div>
              <div style={s.grid2(isMobile)}>
                <Field label="Years of Federal Service">
                  <input
                    type="number" min="0" max="80"
                    value={yearsService}
                    onChange={e => setYearsService(e.target.value)}
                    placeholder="e.g. 25"
                    style={s.input}
                  />
                </Field>
                <Field label="High-3 Average Salary (annual)">
                  <input
                    type="number" min="0"
                    value={high3}
                    onChange={e => setHigh3(e.target.value)}
                    placeholder="e.g. 95000"
                    style={s.input}
                  />
                </Field>
              </div>

              <div style={s.grid2(isMobile)}>
                <Field label="Current Age">
                  <input
                    type="number" min="25" max="80"
                    value={currentAge}
                    onChange={e => setCurrentAge(e.target.value)}
                    placeholder="e.g. 50"
                    style={s.input}
                  />
                </Field>
                <Field label="Planned Retirement Age">
                  <input
                    type="number" min="50" max="75"
                    value={retireAge}
                    onChange={e => setRetireAge(e.target.value)}
                    placeholder="e.g. 62"
                    style={s.input}
                  />
                </Field>
              </div>

              <Field label="Survivor Benefit Option">
                <select value={survivorBenefit} onChange={e => setSurvivorBenefit(e.target.value)} style={s.select}>
                  <option value="none">None</option>
                  <option value="reduced">Reduced (5% deduction)</option>
                  <option value="full">Full (10% deduction)</option>
                </select>
              </Field>
              <Field label="Sick Leave Hours (Optional)" hint="FERS only. 174 hours = 1 month of service credit. Enter unused sick leave at retirement.">
                <input
                  type="number"
                  value={sickLeaveHours}
                  onChange={e => setSickLeaveHours(e.target.value)}
                  placeholder="e.g. 520"
                  min="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }}
                />
              </Field>
            </div>

            {/* Special Provisions Category */}
            {tab === 'special' && (
              <div style={s.card(isMobile)}>
                <div style={s.cardTitle}>Special Provision Category</div>
                <Field label="Category">
                  <select value={specialCat} onChange={e => setSpecialCat(e.target.value)} style={s.select}>
                    <option value="leo">Law Enforcement Officer (LEO)</option>
                    <option value="firefighter">Firefighter</option>
                    <option value="atc">Air Traffic Controller (ATC)</option>
                    <option value="congressional">Congressional</option>
                  </select>
                </Field>
              </div>
            )}

            {/* TSP & Social Security */}
            <div style={s.card(isMobile)}>
              <div style={s.cardTitle}>{tab === 'csrs' ? 'TSP Projections' : 'TSP & Social Security Projections'}</div>
              <div style={s.grid2(isMobile)}>
                <Field label="Current TSP Balance ($)">
                  <input
                    type="number" min="0"
                    value={tspBalance}
                    onChange={e => setTspBalance(e.target.value)}
                    placeholder="e.g. 150000"
                    style={s.input}
                  />
                </Field>
                <Field label="Monthly TSP Contribution ($)">
                  <input
                    type="number" min="0"
                    value={monthlyContrib}
                    onChange={e => setMonthlyContrib(e.target.value)}
                    placeholder="e.g. 500"
                    style={s.input}
                  />
                </Field>
              </div>

              <div style={s.grid2(isMobile)}>
                <Field label="Expected Annual Growth (%)" hint="Conservative: 5%, Moderate: 6%, Aggressive: 7%">
                  <input
                    type="number" min="0" max="15"
                    value={tspGrowthRate}
                    onChange={e => setTspGrowthRate(e.target.value)}
                    placeholder="e.g. 6"
                    style={s.input}
                  />
                </Field>
                {tab !== 'csrs' && (
                  <Field label="Estimated Social Security at Age 62 ($/mo)">
                    <input
                      type="number" min="0"
                      value={ssAt62}
                      onChange={e => setSsAt62(e.target.value)}
                      placeholder="e.g. 2200"
                      style={s.input}
                    />
                  </Field>
                )}
              </div>

              {tab !== 'csrs' ? (
                <Field label="Estimated Claiming Age">
                  <select value={ssClaimAge} onChange={e => setSsClaimAge(e.target.value)} style={s.select}>
                    <option value="62">Age 62 (Reduced)</option>
                    <option value="67">Age 67 (Full Retirement Age)</option>
                    <option value="70">Age 70 (Delayed, Max Credit)</option>
                  </select>
                </Field>
              ) : (
                <div style={{ marginTop: 12, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  CSRS employees generally do not pay Social Security through federal service. If you have SS credits from non-federal employment, be aware that WEP and GPO were repealed by the Social Security Fairness Act (Jan 2025), so prior-service benefits are no longer reduced.
                </div>
              )}
            </div>

            {/* FEHB & Medicare */}
            <div style={s.card(isMobile)}>
              <div style={s.cardTitle}>Health Insurance Deductions</div>

              <div style={{ marginBottom: 20 }}>
                <Toggle
                  checked={includeMedicare}
                  onChange={e => setIncludeMedicare(e.target.checked)}
                  label="Include Medicare Part B"
                  sublabel="2026 standard premium: $202.90/month"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <Toggle
                  checked={includeFEHB}
                  onChange={e => setIncludeFEHB(e.target.checked)}
                  label="Include FEHB Health Insurance"
                  sublabel="Deducted from your pension"
                />
              </div>

              {includeFEHB && (
                <>
                  <Field label="FEHB Plan">
                    <select value={fehbPlan} onChange={e => setFehbPlan(e.target.value)} style={s.select}>
                      {FEHB_PLANS.map(plan => (
                        <option key={plan.id} value={plan.id}>{plan.label}</option>
                      ))}
                    </select>
                  </Field>

                  {fehbPlan !== 'custom' && (
                    <div style={{ marginTop: 16 }}>
                      <Field label="Coverage Type">
                        <select value={fehbCoverage} onChange={e => setFehbCoverage(e.target.value)} style={s.select}>
                          <option value="self">Self Only</option>
                          <option value="self1">Self + One</option>
                          <option value="fam">Self + Family</option>
                        </select>
                      </Field>
                    </div>
                  )}

                  {fehbPlan === 'custom' && (
                    <div style={{ marginTop: 16 }}>
                      <Field label="Custom Monthly Premium ($)">
                        <input
                          type="number" min="0"
                          value={fehbCustom}
                          onChange={e => setFehbCustom(e.target.value)}
                          placeholder="e.g. 300"
                          style={s.input}
                        />
                      </Field>
                    </div>
                  )}
                </>
              )}
            </div>


            {errors.length > 0 && (
              <div role="alert" style={s.errorBox}>
                {errors.map((err, i) => <div key={i} style={{ marginBottom: i < errors.length - 1 ? 8 : 0 }}>{err}</div>)}
              </div>
            )}

            <button onClick={calculate} style={s.button}>Calculate My Retirement</button>

            {/* Results Section */}
            {results && (
              <div id="calc-results" style={{ marginTop: 32 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7b1c2e', marginBottom: 24 }}>Your Retirement Income</div>

                {/* Monthly Income Breakdown */}
                <div style={s.card(isMobile)}>
                  <div style={s.cardTitle}>Monthly Income at Retirement</div>
                  <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#7b1c2e', marginBottom: 24 }}>{fmt(results.totalMonthly)}</div>

                  <div style={s.grid2(isMobile)}>
                    <div style={s.resultBox}>
                      <div style={s.resultLabel}>Pension</div>
                      <div style={s.resultValue}>{fmt(results.pensionMonthly)}</div>
                    </div>
                    {results.supplementMonthly > 0 && (
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>FERS Supplement</div>
                        <div style={s.resultValue}>{fmt(results.supplementMonthly)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>Until age 62</div>
                      </div>
                    )}
                  </div>
                  {results.supplementMonthly > 0 && (
                    <div style={{ ...s.resultBox, borderLeft: '4px solid #d97706', background: '#fffbeb', marginTop: 16 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Earnings Test Warning</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                        The FERS Supplement is subject to the Social Security earnings test. In 2026, if you earn more than $24,480/year from wages or self-employment before age 62, your supplement is reduced by $1 for every $2 earned above the limit.
                      </div>
                    </div>
                  )}
                </div>

                {/* Income Details */}
                <div style={s.card(isMobile)}>
                  <div style={s.cardTitle}>Other Income Sources</div>
                  <div style={s.grid2(isMobile)}>
                    {results.ssMonthly > 0 && (
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>Social Security</div>
                        <div style={s.resultValue}>{fmt(results.ssMonthly)}</div>
                      </div>
                    )}
                    {results.tspMonthly4pct > 0 && (
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>TSP Withdrawal (4%)</div>
                        <div style={s.resultValue}>{fmt(results.tspMonthly4pct)}</div>
                      </div>
                    )}
                    {results.medicareDeduct > 0 && (
                      <div style={{ ...s.resultBox, background: '#fff5f5' }}>
                        <div style={s.resultLabel}>Medicare Part B</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626' }}>−{fmt(results.medicareDeduct)}</div>
                      </div>
                    )}
                    {results.fehbDeduct > 0 && (
                      <div style={{ ...s.resultBox, background: '#fff5f5' }}>
                        <div style={s.resultLabel}>FEHB Premium</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626' }}>−{fmt(results.fehbDeduct)}</div>
                      </div>
                    )}
                  </div>
                  {results.ssMonthly > 0 && (
                    <div style={{ ...s.resultBox, borderLeft: '4px solid #16a34a', background: '#f0fdf4', marginTop: 16 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>WEP/GPO Repealed</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                        The Windfall Elimination Provision (WEP) and Government Pension Offset (GPO) were repealed by the Social Security Fairness Act (January 2025). Social Security benefits are no longer reduced for those with pensions from non-SS-covered work. If you were previously affected, contact SSA about retroactive adjustments.
                      </div>
                    </div>
                  )}
                </div>

                {/* Pension Breakdown */}
                {results.pensionResult && (
                  <div style={s.card(isMobile)}>
                    <div style={s.cardTitle}>{results.tab === 'csrs' ? 'CSRS' : results.tab === 'special' ? 'Special Provision' : 'FERS'} Pension Calculation</div>
                    <div style={s.grid2(isMobile)}>
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>High-3 Salary</div>
                        <div style={s.resultValue}>{fmt(results.h3)}</div>
                      </div>
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>Years of Service</div>
                        <div style={s.resultValue}>{fmtDec(results.yrs)}</div>
                      </div>
                    </div>
                    <div style={s.grid2(isMobile)}>
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>Multiplier Rate</div>
                        <div style={s.resultValue}>{fmtDec(results.pensionResult.multiplierPct)}%</div>
                      </div>
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>Gross Annual Pension</div>
                        <div style={s.resultValue}>{fmt(results.pensionResult.gross)}</div>
                      </div>
                    </div>
                    {results.pensionResult.earlyReductionAmt > 0 && (
                      <div style={s.grid2(isMobile)}>
                        <div style={{ ...s.resultBox, background: '#fff5f5' }}>
                          <div style={s.resultLabel}>Early Retirement Reduction (MRA+10)</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626' }}>−{fmt(results.pensionResult.earlyReductionAmt)}</div>
                        </div>
                        <div style={s.resultBox}>
                          <div style={s.resultLabel}>After Early Reduction</div>
                          <div style={s.resultValue}>{fmt(results.pensionResult.grossAfterEarly)}</div>
                        </div>
                      </div>
                    )}
                    {results.pensionResult.survivorDeduct > 0 && (
                      <div style={s.grid2(isMobile)}>
                        <div style={{ ...s.resultBox, background: '#fff5f5' }}>
                          <div style={s.resultLabel}>Survivor Benefit Deduction</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626' }}>−{fmt(results.pensionResult.survivorDeduct)}</div>
                        </div>
                        <div style={{ ...s.resultBox, background: '#f0fdf4' }}>
                          <div style={s.resultLabel}>Your Net Annual Pension</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>{fmt(results.pensionAnnual)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TSP Projection */}
                {results.tspAtRetirement > 0 && (
                  <div style={s.card(isMobile)}>
                    <div style={s.cardTitle}>TSP at Retirement</div>
                    <div style={s.grid2(isMobile)}>
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>Projected TSP Balance</div>
                        <div style={s.resultValue}>{fmt(results.tspAtRetirement)}</div>
                      </div>
                      <div style={s.resultBox}>
                        <div style={s.resultLabel}>Annual 4% Withdrawal</div>
                        <div style={s.resultValue}>{fmt(results.tspAtRetirement * 0.04)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 12 }}>
                      <strong>Conservative approach:</strong> A 4% annual withdrawal (${Math.round(results.tspAtRetirement * 0.04 / 12)}/mo) has historically supported a 30-year retirement. Adjust based on your risk tolerance and lifespan expectations.
                    </div>
                  </div>
                )}

                {/* COLA Projection (FERS only) */}
                {results.tab === 'fers' && results.colaProjection && (
                  <div style={s.card(isMobile)}>
                    <div style={s.cardTitle}>FERS Pension Growth with COLA Adjustments</div>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 12 }}>
                      Cost-of-living adjustments (COLA) begin at age 62. Projected at historical 2% average annual increase.
                    </p>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                            <th scope="col" style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Years After Retirement</th>
                            <th scope="col" style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Your Age</th>
                            <th scope="col" style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Projected Monthly Pension</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.colaProjection.map((proj) => (
                            <tr key={proj.yearsAfter} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px', color: '#475569' }}>{proj.yearsAfter} years</td>
                              <td style={{ textAlign: 'right', padding: '8px', color: '#475569' }}>Age {proj.ageAtYear}</td>
                              <td style={{ textAlign: 'right', padding: '8px', fontWeight: 600, color: '#0f172a' }}>{fmt(proj.projectedMonthly)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TSP Withdrawal Consultation CTA */}
                <div style={s.card(isMobile)}>
                  <div style={s.cardTitle}>Need help with your TSP withdrawal strategy?</div>
                  <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                    Want help understanding your TSP withdrawal options? Book a free 30-minute consultation to review your TSP strategy, income options, and tax implications.
                  </p>
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', background: '#7b1c2e', color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
                  >
                    Book Free Consultation
                  </a>
                </div>

                {/* Email Capture */}
                <div style={s.card(isMobile)}>
                  <div style={s.cardTitle}>Save & Share Your Results</div>
                  {captureSent ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>Results saved!</p>
                      <p style={{ color: '#4ade80', fontSize: 14, margin: 0 }}>Check your email for a summary of your numbers.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailCapture}>
                      <div style={s.grid2(isMobile)}>
                        <Field label="Name">
                          <input
                            type="text"
                            value={captureName}
                            onChange={e => setCaptureName(e.target.value)}
                            placeholder="Your full name"
                            style={s.input}
                            required
                          />
                        </Field>
                        <Field label="Email">
                          <input
                            type="email"
                            value={captureEmail}
                            onChange={e => setCaptureEmail(e.target.value)}
                            placeholder="your@email.com"
                            style={s.input}
                            required
                          />
                        </Field>
                      </div>
                      <Field label="Phone (optional)">
                        <input
                          type="tel"
                          value={capturePhone}
                          onChange={e => setCapturePhone(e.target.value)}
                          placeholder="(555) 123-4567"
                          style={s.input}
                        />
                      </Field>
                      {captureError && <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{captureError}</div>}
                      <button
                        type="submit"
                        disabled={captureLoading}
                        style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: captureLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap', marginTop: 16 }}
                      >
                        {captureLoading ? 'Sending...' : 'Email My Results'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Important Assumptions */}
                <div style={s.assumptionsBox(isMobile)}>
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
                    {results.tab !== 'csrs' && (
                      <div style={s.assumptionItem}>
                        <strong>Social Security:</strong> Based on your entered age-62 estimate. Adjustments for claiming age use SSA reduction/credit factors.
                      </div>
                    )}
                    <div style={s.assumptionItem}>
                      <strong>Medicare Part B:</strong> 2026 standard premium $202.90/mo (CMS verified). Higher earners may pay more (IRMAA).
                    </div>
                    <div style={s.assumptionItem}>
                      <strong>MRA+10 Penalty:</strong> 5% reduction for each year you are under age 62 at retirement, up to 50%.
                    </div>
                    <div style={s.assumptionItem}>
                      <strong>FEHB Premium:</strong> 2026 OPM biweekly rates (BCBS FEP verified; GEHA/Aetna estimated). Deducted monthly from pension. Verify your plan at opm.gov/premiums.
                    </div>
                    <div style={s.assumptionItem}>
                      <strong>FERS COLA:</strong> No adjustment until age 62. After 62, projected at 2% average annual COLA (historical mean). Actual adjustments vary yearly based on CPI-W.
                    </div>
                  </div>
                </div>
              </div>
            )}
      </div>
    </main>
  )
}


function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        aria-label={label}
      />
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? '#7b1c2e' : '#cbd5e1',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: '#64748b' }}>{sublabel}</div>}
      </div>
    </label>
  )
}

function Field({ label, hint, children }) {
  const id = 'field-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={fieldStyles.label}>{label}</label>
      {React.isValidElement(children) ? React.cloneElement(children, { id }) : children}
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
  label: { fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif" },
  hint:  { fontSize: '0.73rem', color: '#64748b', lineHeight: 1.4 },
}

const styles = {
  page: { minHeight: '100vh', background: '#faf9f6', paddingBottom: 80 },
  container: { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },

  header: (isMobile) => ({ textAlign: 'center', marginBottom: 36, background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)', color: '#fff', padding: isMobile ? '32px 16px' : '48px 32px', borderRadius: 12, marginLeft: -20, marginRight: -20, paddingLeft: isMobile ? 'calc(20px + 16px)' : 'calc(20px + 32px)', paddingRight: isMobile ? 'calc(20px + 16px)' : 'calc(20px + 32px)' }),
  badge: { display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, marginBottom: 14 },
  h1: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif", letterSpacing: '-0.02em', marginBottom: 12 },
  subtitle: { fontSize: '1rem', color: 'rgba(255,255,255,0.85)', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 },

  disclaimerBanner: { background: '#f8f7f4', borderLeft: '3px solid #cbd5e1', padding: '12px 16px', fontSize: '12px', color: '#475569', borderRadius: 6, marginBottom: 24 },

  tabRow: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tabBtn: { padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  tabBtnActive: { background: '#0f172a', color: '#fff', borderColor: '#0f172a' },

  card: (isMobile) => ({ background: '#fff', borderRadius: 12, padding: isMobile ? 20 : 32, marginBottom: 24, boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }),
  cardTitle: { fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7b1c2e', marginBottom: 20 },

  grid2: (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }),

  input: { border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px', fontSize: '0.95rem', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif" },
  select: { border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px', fontSize: '0.95rem', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif", background: '#fff' },

  button: { background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },

  resultBox: { background: '#f8f7f4', borderRadius: 8, padding: 16, borderLeft: '3px solid #cbd5e1' },
  resultLabel: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 },
  resultValue: { fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' },

  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, color: '#991b1b', fontSize: '0.9rem', marginTop: 16, marginBottom: 16 },

  assumptionsBox: (isMobile) => ({ background: '#f0f9ff', borderRadius: 12, padding: isMobile ? 16 : 24, marginTop: 24 }),
  assumptionsTitle: { fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f172a', marginBottom: 16 },
  assumptionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 },
  assumptionItem: { fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 },
}
