import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
const MEDICARE_B_MONTHLY = 202.90

// FERS COLA (Cost of Living Adjustment) rules
const COLA_AVERAGE_ANNUAL = 0.02

// ============================================================
// FEGLI RATES (effective 10/1/2021 from OPM.gov)
// ============================================================

// FEGLI rate tables by age
const FEGLI_OPTION_A_RATES = {
  employee: { '<35': 0.20, '35-39': 0.20, '40-44': 0.30, '45-49': 0.60, '50-54': 1.00, '55-59': 1.80, '60+': 6.00 },
  annuitant: { '<35': 0.43, '35-39': 0.43, '40-44': 0.65, '45-49': 1.30, '50-54': 2.17, '55-59': 3.90, '60-64': 13.00 }
}

const FEGLI_OPTION_B_RATES = {
  employee: { '<35': 0.02, '35-39': 0.02, '40-44': 0.03, '45-49': 0.06, '50-54': 0.10, '55-59': 0.18, '60-64': 0.40, '65-69': 0.48, '70-74': 0.86, '75-79': 1.80, '80+': 2.88 },
  annuitant: { '<35': 0.043, '35-39': 0.043, '40-44': 0.065, '45-49': 0.130, '50-54': 0.217, '55-59': 0.390, '60-64': 0.867, '65-69': 1.040, '70-74': 1.863, '75-79': 3.900, '80+': 6.240 }
}

const FEGLI_OPTION_C_RATES = {
  employee: { '<35': 0.20, '35-39': 0.24, '40-44': 0.37, '45-49': 0.53, '50-54': 0.83, '55-59': 1.33, '60-64': 2.43, '65-69': 2.83, '70-74': 3.83, '75-79': 5.76, '80+': 7.80 },
  annuitant: { '<35': 0.43, '35-39': 0.52, '40-44': 0.80, '45-49': 1.15, '50-54': 1.80, '55-59': 2.88, '60-64': 5.27, '65-69': 6.13, '70-74': 8.30, '75-79': 12.48, '80+': 16.90 }
}

function getAgeBracket(age) {
  if (age < 35) return '<35'
  if (age < 40) return '35-39'
  if (age < 45) return '40-44'
  if (age < 50) return '45-49'
  if (age < 55) return '50-54'
  if (age < 60) return '55-59'
  if (age < 65) return '60-64'
  if (age < 70) return '65-69'
  if (age < 75) return '70-74'
  if (age < 80) return '75-79'
  return '80+'
}

function getRate(rateTable, age) {
  const bracket = getAgeBracket(age)
  return rateTable[bracket] || 0
}

function calcFEGLI(salary, currentAge, retireAge, optA, optBMult, optCMult, basicReduction, optAReduction, optBReduction, optCReduction) {
  // Basic Insurance (BIA)
  const bia = Math.ceil(salary / 1000) * 1000 + 2000

  // Current (employee) costs - all ages
  const basicBiw = (bia / 1000) * 0.1600  // $0.16 per $1000
  const optABiw = optA ? (10000 / 10000) * getRate(FEGLI_OPTION_A_RATES.employee, currentAge) : 0
  const optBPerK = parseFloat(optBMult) || 0
  const optBBiw = optBPerK > 0 ? optBPerK * (salary / 1000) * getRate(FEGLI_OPTION_B_RATES.employee, currentAge) : 0
  const optCPerMult = parseFloat(optCMult) || 0
  const optCBiw = optCPerMult > 0 ? optCPerMult * getRate(FEGLI_OPTION_C_RATES.employee, currentAge) : 0

  const totalBiw = basicBiw + optABiw + optBBiw + optCBiw
  const totalMonthly = totalBiw * 26 / 12
  const totalAnnual = totalBiw * 26

  // Post-retirement costs at various ages
  const projectionAges = [60, 65, 70, 75, 80]
  const retireCosts = {}

  projectionAges.forEach(projAge => {
    let basicMo = 0, optAMo = 0, optBMo = 0, optCMo = 0

    if (projAge < 65) {
      // Before 65: annuitant rates apply
      basicMo = (bia / 1000) * {
        '75': 0.3467,  // 75% reduction: $0.3467/mo per $1000 until 65, then FREE
        '50': 1.0967,  // 50% reduction: $1.0967/mo per $1000 until 65
        'no': 2.5967   // No reduction: $2.5967/mo per $1000
      }[basicReduction]

      optAMo = optA ? getRate(FEGLI_OPTION_A_RATES.annuitant, projAge) : 0
      optBMo = optBPerK > 0 ? optBPerK * (salary / 1000) * getRate(FEGLI_OPTION_B_RATES.annuitant, projAge) : 0
      optCMo = optCPerMult > 0 ? optCPerMult * getRate(FEGLI_OPTION_C_RATES.annuitant, projAge) : 0
    } else {
      // At 65 and beyond
      if (basicReduction === '75') {
        basicMo = 0  // Coverage reduces to 25% of BIA, but after 65 reduction is free
      } else if (basicReduction === '50') {
        basicMo = (bia / 1000) * 0.75  // 50% reduction: stays at $0.75/mo per $1000
      } else {
        basicMo = (bia / 1000) * 2.25  // No reduction: stays at $2.25/mo per $1000
      }

      if (optAReduction === 'full') {
        optAMo = 0  // Coverage reduces to $0 with full reduction
      } else {
        optAMo = getRate(FEGLI_OPTION_A_RATES.annuitant, projAge)
      }

      if (optBReduction === 'full') {
        optBMo = 0
      } else {
        optBMo = optBPerK > 0 ? optBPerK * (salary / 1000) * getRate(FEGLI_OPTION_B_RATES.annuitant, projAge) : 0
      }

      if (optCReduction === 'full') {
        optCMo = 0
      } else {
        optCMo = optCPerMult > 0 ? optCPerMult * getRate(FEGLI_OPTION_C_RATES.annuitant, projAge) : 0
      }
    }

    retireCosts[projAge] = {
      monthly: basicMo + optAMo + optBMo + optCMo,
      annual: (basicMo + optAMo + optBMo + optCMo) * 12
    }
  })

  return {
    bia,
    optA: optA ? 10000 : 0,
    optB: optBPerK * (salary / 1000),
    optC: optCPerMult * 5000,  // 1 multiple = $5K spouse + $2.5K per child (approx $5K per multiple)
    totalCoverage: bia + (optA ? 10000 : 0) + (optBPerK * (salary / 1000)) + (optCPerMult * 5000),
    currentCostBiw: totalBiw,
    currentCostMonthly: totalMonthly,
    currentCostAnnual: totalAnnual,
    retireCosts
  }
}

function calcCOLAProjection(pensionMonthly, retireAge, yearsToRetirement, tab) {
  if (tab !== 'fers') return null
  const retirementAge = Math.round(retireAge)
  const projections = []
  for (const yearsAfter of [5, 10, 15, 20]) {
    const ageAtYear = retirementAge + yearsAfter
    let projectedMonthly = pensionMonthly
    let totalColaApplied = 0
    let currentAge = retirementAge
    for (let year = 1; year <= yearsAfter; year++) {
      currentAge = retirementAge + year
      if (currentAge >= 62) {
        projectedMonthly = projectedMonthly * (1 + COLA_AVERAGE_ANNUAL)
        totalColaApplied += COLA_AVERAGE_ANNUAL
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
  const navigate = useNavigate()
  const [tab, setTab] = useState('fers')
  const [results, setResults] = useState(null)
  const [showFIA, setShowFIA] = useState(false)

  // Responsive layout for FEGLI two-column
  const [isWide, setIsWide] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)
  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

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

  // FEGLI inputs
  const [fegliSalary, setFegliSalary] = useState('')
  const [fegliAge, setFegliAge] = useState('')
  const [fegliRetireAge, setFegliRetireAge] = useState('')
  const [fegliOptA, setFegliOptA] = useState(true)
  const [fegliOptBMult, setFegliOptBMult] = useState('1')
  const [fegliOptCMult, setFegliOptCMult] = useState('0')
  const [fegliBasicReduction, setFegliBasicReduction] = useState('75')
  const [fegliOptAReduction, setFegliOptAReduction] = useState('full')
  const [fegliOptBReduction, setFegliOptBReduction] = useState('full')
  const [fegliOptCReduction, setFegliOptCReduction] = useState('full')
  const [fegliResults, setFegliResults] = useState(null)

  const [errors, setErrors] = useState([])
  const [captureEmail, setCaptureEmail] = useState('')
  const [captureName, setCaptureName] = useState('')
  const [capturePhone, setCapturePhone] = useState('')
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureSent, setCaptureSent] = useState(false)
  const [captureError, setCaptureError] = useState('')

  useEffect(() => {
    if (tab === 'fegli') {
      document.title = 'FEGLI Life Insurance Calculator | FedBenefitsAid'
    } else {
      document.title = 'FERS Retirement Calculator | FedBenefitsAid'
    }
  }, [tab])

  // Real-time FEGLI calculation
  useEffect(() => {
    if (tab !== 'fegli') return
    const salary = parseFloat(fegliSalary)
    const age = parseFloat(fegliAge)
    if (!salary || salary <= 0 || !age || age <= 0) {
      setFegliResults(null)
      return
    }
    const result = calcFEGLI(salary, age, parseFloat(fegliRetireAge) || 62, fegliOptA, fegliOptBMult, fegliOptCMult, fegliBasicReduction, fegliOptAReduction, fegliOptBReduction, fegliOptCReduction)
    setFegliResults(result)
  }, [tab, fegliSalary, fegliAge, fegliRetireAge, fegliOptA, fegliOptBMult, fegliOptCMult, fegliBasicReduction, fegliOptAReduction, fegliOptBReduction, fegliOptCReduction])

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
    if (tab === 'fegli') {
      if (!fegliSalary || isNaN(fegliSalary) || +fegliSalary <= 0) errs.push('Enter your annual salary.')
      if (!fegliAge || isNaN(fegliAge) || +fegliAge <= 0) errs.push('Enter your current age.')
      if (!fegliRetireAge || isNaN(fegliRetireAge) || +fegliRetireAge <= 0) errs.push('Enter your planned retirement age.')
    } else {
      if (!yearsService || isNaN(yearsService) || +yearsService <= 0) errs.push('Enter years of federal service.')
      if (!high3 || isNaN(high3) || +high3 <= 0) errs.push('Enter your High-3 average salary.')
      if (tab === 'fers' || tab === 'special') {
        if (!retireAge || isNaN(retireAge)) errs.push('Enter your planned retirement age.')
      }
    }
    return errs
  }

  function calculate() {
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])

    if (tab === 'fegli') {
      const salary = parseFloat(fegliSalary)
      const age = parseFloat(fegliAge)
      const rAge = parseFloat(fegliRetireAge)

      const result = calcFEGLI(
        salary,
        age,
        rAge,
        fegliOptA,
        fegliOptBMult,
        fegliOptCMult,
        fegliBasicReduction,
        fegliOptAReduction,
        fegliOptBReduction,
        fegliOptCReduction
      )

      setFegliResults(result)
    } else {
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
    }

    setTimeout(() => {
      document.getElementById('calc-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const s = styles

  return (
    <main id="main-content" style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.badge}>Free Tool - No Account Required</div>
          <h1 style={s.h1}>{tab === 'fegli' ? 'FEGLI Life Insurance Calculator' : 'Federal Retirement Income Calculator'}</h1>
          <p style={s.subtitle}>
            {tab === 'fegli'
              ? 'Understand your Federal Employees\' Group Life Insurance (FEGLI) coverage, costs, and retirement impact.'
              : 'See your complete retirement picture: pension, TSP, and Social Security combined. All calculations use verified 2026 OPM figures.'
            }
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div style={s.disclaimerBanner}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          This calculator provides estimates for educational purposes only. {tab === 'fegli' ? 'FEGLI rates and coverage are based on OPM data effective 10/1/2021.' : 'Results are based on publicly available FERS formulas and the information you provide.'} Actual benefits may differ. This is not financial advice — consult a qualified federal benefits advisor for personalized guidance. FedBenefitsAid is not affiliated with OPM or the U.S. government.
        </div>

        {/* Calculator Tabs */}
        <div style={s.tabRow} role="tablist" aria-label="Calculator type">
          {[
            { id: 'fers', label: 'FERS' },
            { id: 'csrs', label: 'CSRS' },
            { id: 'special', label: 'Special Provisions' },
            { id: 'fegli', label: 'FEGLI Life Insurance' },
          ].map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => { setTab(t.id); setResults(null); setFegliResults(null); setErrors([]) }}
              style={{ ...s.tabBtn, ...(tab === t.id ? s.tabBtnActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* FEGLI Form & Results - Two Column Layout */}
        {tab === 'fegli' && (
          <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexDirection: isWide ? 'row' : 'column' }}>
            {/* LEFT COLUMN - FORM */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Your Information Card */}
              <div style={s.card}>
                <div style={s.cardTitle}>Your Information</div>
                <Field label="Annual Gross Salary ($)">
                  <input
                    type="number" min="20000"
                    value={fegliSalary}
                    onChange={e => setFegliSalary(e.target.value)}
                    placeholder="e.g. 95000"
                    style={s.input}
                  />
                </Field>

                <div style={{ marginTop: 16 }}>
                  <Field label="Current Age">
                    <input
                      type="number" min="25" max="80"
                      value={fegliAge}
                      onChange={e => setFegliAge(e.target.value)}
                      placeholder="e.g. 50"
                      style={s.input}
                    />
                  </Field>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Field label="Planned Retirement Age">
                    <input
                      type="number" min="50" max="75"
                      value={fegliRetireAge}
                      onChange={e => setFegliRetireAge(e.target.value)}
                      placeholder="e.g. 62"
                      style={s.input}
                    />
                  </Field>
                </div>
              </div>

              {/* Coverage Elections Card */}
              <div style={s.card}>
                <div style={s.cardTitle}>Coverage Elections</div>

                <div style={{ marginBottom: 20 }}>
                  <Toggle
                    checked={fegliOptA}
                    onChange={e => setFegliOptA(e.target.checked)}
                    label="Option A"
                    sublabel="Standard life insurance – $10,000"
                  />
                </div>

                <Field label="Option B – Multiples of salary">
                  <select value={fegliOptBMult} onChange={e => setFegliOptBMult(e.target.value)} style={s.select}>
                    <option value="0">Not elected</option>
                    <option value="1">1 multiple</option>
                    <option value="2">2 multiples</option>
                    <option value="3">3 multiples</option>
                    <option value="4">4 multiples</option>
                    <option value="5">5 multiples</option>
                  </select>
                </Field>

                <div style={{ marginTop: 16 }}>
                  <Field label="Option C – Family coverage multiples">
                    <select value={fegliOptCMult} onChange={e => setFegliOptCMult(e.target.value)} style={s.select}>
                      <option value="0">Not elected</option>
                      <option value="1">1 multiple</option>
                      <option value="2">2 multiples</option>
                      <option value="3">3 multiples</option>
                      <option value="4">4 multiples</option>
                      <option value="5">5 multiples</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Reduction Elections Card */}
              <div style={s.card}>
                <div style={s.cardTitle}>Post-Retirement Reductions at Age 65</div>

                <Field label="Basic Insurance">
                  <select value={fegliBasicReduction} onChange={e => setFegliBasicReduction(e.target.value)} style={s.select}>
                    <option value="75">75% Reduction – Lower cost</option>
                    <option value="50">50% Reduction – Moderate cost</option>
                    <option value="no">No Reduction – Full coverage</option>
                  </select>
                </Field>

                <div style={{ marginTop: 16 }}>
                  <Field label="Option A">
                    <select value={fegliOptAReduction} onChange={e => setFegliOptAReduction(e.target.value)} style={s.select}>
                      <option value="full">Full Reduction – Free after 65</option>
                      <option value="none">No Reduction – Keep coverage</option>
                    </select>
                  </Field>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Field label="Option B">
                    <select value={fegliOptBReduction} onChange={e => setFegliOptBReduction(e.target.value)} style={s.select}>
                      <option value="full">Full Reduction – Drops at 65</option>
                      <option value="none">No Reduction – Continues for life</option>
                    </select>
                  </Field>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Field label="Option C">
                    <select value={fegliOptCReduction} onChange={e => setFegliOptCReduction(e.target.value)} style={s.select}>
                      <option value="full">Full Reduction – Drops at 65</option>
                      <option value="none">No Reduction – Continues for life</option>
                    </select>
                  </Field>
                </div>
              </div>

              {errors.length > 0 && (
                <div style={s.errorBox}>
                  {errors.map((err, i) => <div key={i} style={{ marginBottom: i < errors.length - 1 ? 8 : 0 }}>{err}</div>)}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - STICKY SUMMARY */}
            <div style={{ width: isWide ? 360 : '100%', flexShrink: 0 }}>
              <div style={{ position: isWide ? 'sticky' : 'relative', top: isWide ? 20 : 0 }}>
                <div style={s.summaryPanel}>
                  {fegliResults ? (
                    <>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>Your Coverage Summary</div>

                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Total Coverage</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7b1c2e' }}>{fmt(fegliResults.totalCoverage)}</div>
                      </div>

                      <div style={{ background: '#f8f7f4', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>
                        <div style={{ color: '#64748b', marginBottom: 8 }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Basic</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(fegliResults.bia)}</div>
                        </div>
                        {fegliResults.optA > 0 && <div style={{ color: '#64748b', marginBottom: 8 }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Option A</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(fegliResults.optA)}</div>
                        </div>}
                        {fegliResults.optB > 0 && <div style={{ color: '#64748b', marginBottom: 8 }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Option B</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(fegliResults.optB)}</div>
                        </div>}
                        {fegliResults.optC > 0 && <div style={{ color: '#64748b' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Option C</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(fegliResults.optC)}</div>
                        </div>}
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Current Costs</div>
                        <div style={{ fontSize: '0.9rem', marginBottom: 6 }}>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Monthly</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{fmt(fegliResults.currentCostMonthly)}</div>
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Annual</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{fmt(fegliResults.currentCostAnnual)}</div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Cost at Key Ages</div>
                        {fegliResults.retireCosts['65'] && <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Age 65 – {fmt(fegliResults.retireCosts['65'].monthly)}/mo</div>
                        </div>}
                        {fegliResults.retireCosts['75'] && <div style={{ fontSize: '0.9rem' }}>
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Age 75 – {fmt(fegliResults.retireCosts['75'].monthly)}/mo</div>
                        </div>}
                      </div>

                      <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', background: '#7b1c2e', color: '#fff', padding: '12px', textAlign: 'center', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                        Book Consultation
                      </a>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                      Enter your salary and age to see your coverage summary.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retirement Form (shown for non-FEGLI tabs) */}
        {tab !== 'fegli' && (
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
              <Field label="Current TSP Balance ($)" hint="Leave blank if $0">
                <input
                  type="number" min="0"
                  value={tspBalance}
                  onChange={e => setTspBalance(e.target.value)}
                  placeholder="e.g. 250000"
                  style={s.input}
                />
              </Field>
              <Field label="Monthly TSP Contribution ($)" hint="Your biweekly contribution ÷ 2. Leave blank if not contributing.">
                <input
                  type="number" min="0"
                  value={monthlyContrib}
                  onChange={e => setMonthlyContrib(e.target.value)}
                  placeholder="e.g. 1000"
                  style={s.input}
                />
              </Field>
            </div>

            <div style={s.grid2}>
              <Field label="Expected Annual TSP Growth (%)" hint="Conservative: 5%, Moderate: 6%, Aggressive: 7%">
                <input
                  type="number" min="1" max="12" step="0.5"
                  value={tspGrowthRate}
                  onChange={e => setTspGrowthRate(e.target.value)}
                  style={s.input}
                />
              </Field>
            </div>

            {/* Social Security Section */}
            <div style={{ ...s.cardTitle, marginTop: 28 }}>Social Security Estimate</div>

            <div style={s.grid2}>
              <Field label="Estimated Benefit at Age 62 ($/month)" hint="Use your Social Security Statement or ssa.gov">
                <input
                  type="number" min="0"
                  value={ssAt62}
                  onChange={e => setSsAt62(e.target.value)}
                  placeholder="e.g. 2100"
                  style={s.input}
                />
              </Field>
              <Field label="Planned Claim Age" hint="Earliest 62, Full Retirement Age ~67, Delayed 70">
                <input
                  type="number" min="62" max="80"
                  value={ssClaimAge}
                  onChange={e => setSsClaimAge(e.target.value)}
                  style={s.input}
                />
              </Field>
            </div>

            {/* Benefits Deductions */}
            <div style={{ ...s.cardTitle, marginTop: 28 }}>Post-Retirement Deductions</div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeMedicare}
                  onChange={e => setIncludeMedicare(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Include Medicare Part B Premium (${MEDICARE_B_MONTHLY}/mo)</span>
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeFEHB}
                  onChange={e => setIncludeFEHB(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Include FEHB Health Insurance Premium</span>
              </label>
            </div>

            {includeFEHB && (
              <div style={{ marginTop: 12 }}>
                <Field label="Select FEHB Plan">
                  <select value={fehbPlan} onChange={e => setFehbPlan(e.target.value)} style={s.select}>
                    {FEHB_PLANS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {fehbPlan !== 'custom' && (
                  <Field label="Coverage Type" style={{ marginTop: 12 }}>
                    <select value={fehbCoverage} onChange={e => setFehbCoverage(e.target.value)} style={s.select}>
                      <option value="self">Self Only</option>
                      <option value="self1">Self + One</option>
                      <option value="family">Self + Family</option>
                    </select>
                  </Field>
                )}

                {fehbPlan === 'custom' && (
                  <Field label="Custom Monthly Premium ($)" style={{ marginTop: 12 }}>
                    <input
                      type="number" min="0"
                      value={fehbCustom}
                      onChange={e => setFehbCustom(e.target.value)}
                      placeholder="e.g. 400"
                      style={s.input}
                    />
                  </Field>
                )}
              </div>
            )}

            {tab === 'fers' && (
              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={includeSupp}
                    onChange={e => setIncludeSupp(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Include FERS Supplement (payable until age 62 on immediate retirement)</span>
                </label>
              </div>
            )}

            {/* Error messages */}
            {errors.length > 0 && (
              <div style={s.errorBox}>
                {errors.map((err, i) => (
                  <div key={i} style={{ marginBottom: i < errors.length - 1 ? 8 : 0 }}>
                    {err}
                  </div>
                ))}
              </div>
            )}

            {/* Calculate Button */}
            <button onClick={calculate} style={{ ...s.button, marginTop: 24, width: '100%', padding: '14px 24px', fontSize: 16 }}>
              Calculate My Retirement Income
            </button>

          </div>
        )}

        {/* FEGLI ADDITIONAL RESULTS - Year by Year Projection & Comparison */}
        {tab === 'fegli' && fegliResults && (
          <div id="calc-results">
            {/* Year-by-Year Projection Table */}
            <div style={s.card}>
              <div style={s.cardTitle}>Retirement Cost Projection</div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 16 }}>
                Costs based on your elected reductions. Actual costs may vary with future rate increases.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Age</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Monthly Premium</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Annual Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(fegliResults.retireCosts).map(([age, costs]) => (
                      <tr key={age} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 8px', color: '#0f172a' }}>Age {age}</td>
                        <td style={{ textAlign: 'right', padding: '10px 8px', color: '#475569' }}>{fmt(costs.monthly)}</td>
                        <td style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600, color: '#0f172a' }}>{fmt(costs.annual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Keep vs Drop Comparison */}
            <div style={s.card}>
              <div style={s.cardTitle}>Keep FEGLI vs Drop Coverage: Lifetime Cost Analysis</div>
              <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: 12 }}>
                This shows the cost difference between keeping your current FEGLI coverage through age 85 versus dropping it and buying private term life insurance.
              </p>

              <div style={{ ...s.grid2, marginTop: 12 }}>
                <div style={{ ...s.resultBox, background: '#fef2f2' }}>
                  <div style={s.resultLabel}>FEGLI Coverage Cost (Age {Math.round(parseFloat(fegliAge) || 50)} to 85)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#7b1c2e', marginTop: 8 }}>
                    {fmt(fegliResults.currentCostMonthly * 12 * (85 - parseFloat(fegliAge)))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                    {fegliResults.currentCostMonthly.toFixed(2)}/mo × 12 months × {85 - Math.round(parseFloat(fegliAge) || 50)} years
                  </div>
                </div>

                <div style={{ ...s.resultBox, background: '#fef3f2' }}>
                  <div style={s.resultLabel}>Private Term Insurance Est. Cost (Age {Math.round(parseFloat(fegliAge) || 50)} to 85)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9f1239', marginTop: 8 }}>
                    {fmt(estimatePrivateTermCost(parseFloat(fegliAge) || 50, fegliResults.totalCoverage))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                    Based on typical industry rates (~$50-165/mo per $100K)
                  </div>
                </div>
              </div>

              <div style={{ ...s.resultBox, background: '#f0fdf4', borderLeft: '4px solid #16a34a' }}>
                <div style={s.resultLabel}>Your Potential Savings with FEGLI</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: 8 }}>
                  {fmt(estimatePrivateTermCost(parseFloat(fegliAge) || 50, fegliResults.totalCoverage) - (fegliResults.currentCostMonthly * 12 * (85 - parseFloat(fegliAge))))}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 12, lineHeight: 1.6 }}>
                <strong>Disclaimer:</strong> Private term insurance estimates are industry averages and vary significantly by health, age, and underwriting. FEGLI rates are as of 10/1/2021 and may have been updated. This is for comparison only — not a quote. Consult a licensed insurance professional for personalized analysis.
              </div>
            </div>

            {/* Consultation CTA */}
            <div style={{ ...s.card, background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ fontSize: '2rem', lineHeight: 1 }}>💡</div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Expert Review</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Optimize Your Life Insurance Strategy</div>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0 }}>
                    Your FEGLI election will stay with you into retirement. A benefits specialist can review your coverage, compare to private insurance, and help you make the best choice for your situation and family.
                  </p>
                  <div style={{ marginTop: 16 }}>
                    <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#fff', color: '#7b1c2e', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                      Schedule Free Consultation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RETIREMENT RESULTS */}
        {tab !== 'fegli' && results && (
          <div id="calc-results" style={{ marginTop: 32 }}>
            {/* Main Results Card */}
            <div style={s.card}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7b1c2e', marginBottom: 8 }}>Your Retirement Summary</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 4, marginTop: 0 }}>Monthly Income at Retirement</h2>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#7b1c2e', marginBottom: 16, lineHeight: 1 }}>{fmt(results.totalMonthly)}/mo</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 20 }}>
                ({fmt(results.totalAnnual)}/year) — Based on your inputs above and verified 2026 OPM figures.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                {results.pensionMonthly > 0 && (
                  <div style={s.resultBox}>
                    <div style={s.resultLabel}>{results.tab === 'csrs' ? 'CSRS Pension' : results.tab === 'special' ? 'Special Provision Pension' : 'FERS Pension'}</div>
                    <div style={s.resultValue}>{fmt(results.pensionMonthly)}</div>
                  </div>
                )}
                {results.supplementMonthly > 0 && (
                  <div style={s.resultBox}>
                    <div style={s.resultLabel}>FERS Supplement</div>
                    <div style={s.resultValue}>{fmt(results.supplementMonthly)}</div>
                  </div>
                )}
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
            </div>

            {/* Pension Breakdown */}
            {results.pensionResult && (
              <div style={s.card}>
                <div style={s.cardTitle}>{results.tab === 'csrs' ? 'CSRS' : results.tab === 'special' ? 'Special Provision' : 'FERS'} Pension Calculation</div>
                <div style={s.grid2}>
                  <div style={s.resultBox}>
                    <div style={s.resultLabel}>High-3 Salary</div>
                    <div style={s.resultValue}>{fmt(results.h3)}</div>
                  </div>
                  <div style={s.resultBox}>
                    <div style={s.resultLabel}>Years of Service</div>
                    <div style={s.resultValue}>{fmtDec(results.yrs)}</div>
                  </div>
                </div>
                <div style={s.grid2}>
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
                  <div style={s.grid2}>
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
                  <div style={s.grid2}>
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
              <div style={s.card}>
                <div style={s.cardTitle}>TSP at Retirement</div>
                <div style={s.grid2}>
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
              <div style={s.card}>
                <div style={s.cardTitle}>FERS Pension Growth with COLA Adjustments</div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 12 }}>
                  Cost-of-living adjustments (COLA) begin at age 62. Projected at historical 2% average annual increase.
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Years After Retirement</th>
                        <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Your Age</th>
                        <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Projected Monthly Pension</th>
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

            {/* FIA Alternative */}
            <div style={s.card}>
              <div style={s.cardTitle}>TSP Payout Alternatives (FIA or Withdrawal Options)</div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 12 }}>
                Instead of manual withdrawals, you may elect a Fixed Immediate Annuity (FIA) from your TSP balance. Using TSP annuity rates, estimate your lifetime monthly income (these vary with market rates when you purchase).
              </p>

              <button onClick={() => setShowFIA(!showFIA)} style={{ ...s.button, marginBottom: 12, background: '#1e3a5f' }}>
                {showFIA ? 'Hide' : 'Show'} Annuity Scenarios
              </button>

              {showFIA && results.tspAtRetirement > 0 && (
                <div style={s.grid2}>
                  <div style={s.resultBox}>
                    <div style={s.resultLabel}>Conservative 4.5% Payout</div>
                    <div style={s.resultValue}>{fmt(results.fiaPayouts.conservative)}/mo</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>{fmt(results.fiaPayouts.conservative * 12)}/yr</div>
                  </div>
                  <div style={s.resultBox}>
                    <div style={s.resultLabel}>Moderate 5.5% Payout</div>
                    <div style={s.resultValue}>{fmt(results.fiaPayouts.moderate)}/mo</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>{fmt(results.fiaPayouts.moderate * 12)}/yr</div>
                  </div>
                  <div style={s.resultBox}>
                    <div style={s.resultLabel}>Aggressive 6.5% Payout</div>
                    <div style={s.resultValue}>{fmt(results.fiaPayouts.aggressive)}/mo</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>{fmt(results.fiaPayouts.aggressive * 12)}/yr</div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 12 }}>
                Annuity rates are quoted at time of purchase and depend on Treasury rates, mortality assumptions, and TSP terms. Compare to your 4% withdrawal strategy.
              </div>
            </div>

            {/* Email Capture */}
            <div style={s.card}>
              <div style={s.cardTitle}>Save & Share Your Results</div>
              {captureSent ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>Results saved!</p>
                  <p style={{ color: '#4ade80', fontSize: 14, margin: 0 }}>Check your email for a summary of your numbers.</p>
                </div>
              ) : (
                <form onSubmit={handleEmailCapture}>
                  <div style={s.grid2}>
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
                    style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: captureLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {captureLoading ? 'Sending...' : 'Email My Results'}
                  </button>
                </form>
              )}
            </div>

            {/* Consultation CTA */}
            <div style={{ ...s.card, background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ fontSize: '2rem', lineHeight: 1 }}>🎯</div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Personalized Guidance</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Want to know if you're on track?</div>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: '0 0 12px 0' }}>
                    Your numbers above are a great starting point, but every federal retirement situation is unique. A benefits specialist can review your specific scenario, identify gaps, and help you make the most of your FERS pension, TSP, and Social Security timing.
                  </p>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#fff', color: '#7b1c2e', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                    Book a Free Consultation
                  </a>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>30 minutes. No cost. No obligation.</div>
                </div>
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

function estimatePrivateTermCost(currentAge, coverageAmount) {
  const monthlyPerK = currentAge < 55 ? 50 : currentAge < 60 ? 85 : currentAge < 65 ? 165 : 250
  const monthlyRate = (coverageAmount / 100000) * monthlyPerK
  const yearsToAge85 = Math.max(0, 85 - currentAge)
  return monthlyRate * 12 * yearsToAge85
}

function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0' }}>
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
  label: { fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif" },
  hint:  { fontSize: '0.73rem', color: '#64748b', lineHeight: 1.4 },
}

const styles = {
  page: { minHeight: '100vh', background: '#faf9f6', paddingBottom: 80 },
  container: { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },

  header: { textAlign: 'center', marginBottom: 36, background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)', color: '#fff', padding: '48px 32px', borderRadius: 12, marginLeft: -20, marginRight: -20, paddingLeft: 'calc(20px + 32px)', paddingRight: 'calc(20px + 32px)' },
  badge: { display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, marginBottom: 14 },
  h1: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif", letterSpacing: '-0.02em', marginBottom: 12 },
  subtitle: { fontSize: '1rem', color: 'rgba(255,255,255,0.85)', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 },

  disclaimerBanner: { background: '#f8f7f4', borderLeft: '3px solid #cbd5e1', padding: '12px 16px', fontSize: '12px', color: '#475569', borderRadius: 6, marginBottom: 24 },

  tabRow: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tabBtn: { padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  tabBtnActive: { background: '#0f172a', color: '#fff', borderColor: '#0f172a' },

  card: { background: '#fff', borderRadius: 12, padding: 32, marginBottom: 24, boxShadow: '0 1px 3px rgba(15,23,42,0.08)' },
  cardTitle: { fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7b1c2e', marginBottom: 20 },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },

  input: { border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px', fontSize: '0.95rem', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif" },
  select: { border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px', fontSize: '0.95rem', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif", background: '#fff' },

  button: { background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },

  resultBox: { background: '#f8f7f4', borderRadius: 8, padding: 16, borderLeft: '3px solid #cbd5e1' },
  resultLabel: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 },
  resultValue: { fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' },

  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, color: '#991b1b', fontSize: '0.9rem', marginTop: 16, marginBottom: 16 },

  assumptionsBox: { background: '#f0f9ff', borderRadius: 12, padding: 24, marginTop: 24 },
  assumptionsTitle: { fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f172a', marginBottom: 16 },
  assumptionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 },
  assumptionItem: { fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 },

  // FEGLI summary panel
  summaryPanel: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(15,23,42,0.08)', borderTop: '4px solid #7b1c2e' },
}
