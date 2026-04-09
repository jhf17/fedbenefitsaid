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
  annuitant: { '<35': 0.43, '35-39': 0.43, '40-44': 0.65, '45-49': 1.30, '50-54': 2.17, '55-59': 3.90, '60-64': 13.00, '65-69': 13.00, '70-74': 13.00, '75-79': 13.00, '80+': 13.00 }
}

const FEGLI_OPTION_B_RATES = {
  employee: { '<35': 0.02, '35-39': 0.02, '40-44': 0.03, '45-49': 0.06, '50-54': 0.10, '55-59': 0.18, '60-64': 0.40, '65-69': 0.48, '70-74': 0.86, '75-79': 1.80, '80+': 2.88 },
  annuitant: { '<35': 0.043, '35-39': 0.043, '40-44': 0.065, '45-49': 0.130, '50-54': 0.217, '55-59': 0.390, '60-64': 0.867, '65-69': 1.040, '70-74': 1.863, '75-79': 3.900, '80+': 6.240 }
}

const FEGLI_OPTION_C_RATES = {
  employee: { '<35': 0.20, '35-39': 0.24, '40-44': 0.37, '45-49': 0.53, '50-54': 0.83, '55-59': 1.33, '60-64': 2.43, '65-69': 2.83, '70-74': 3.83, '75-79': 5.76, '80+': 7.80 },
  annuitant: { '<35': 0.43, '35-39': 0.52, '40-44': 0.80, '45-49': 1.15, '50-54': 1.80, '55-59': 2.88, '60-64': 5.27, '65-69': 6.13, '70-74': 8.30, '75-79': 12.48, '80+': 16.90 }
}

// Basic Insurance rates
const FEGLI_BASIC_EMPLOYEE = 0.3250 // per $1000 biweekly
const FEGLI_BASIC_POSTAL = 0.00     // employer paid for postal workers
const FEGLI_BASIC_ANNUITANT = 0.3467 // monthly rate per $1000

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

function calcFEGLI(salary, currentAge, retireAge, optA, optBMult, optCMult, basicReduction, optAReduction, optBReduction, optCReduction, isPostal = false, retirementStatus = 'active') {
  // Basic Insurance (BIA)
  const bia = Math.ceil(salary / 1000) * 1000 + 2000

  // Current (employee) costs - all ages
  const basicBiwRate = isPostal ? FEGLI_BASIC_POSTAL : FEGLI_BASIC_EMPLOYEE
  const basicBiw = (bia / 1000) * basicBiwRate
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

function calcFERSPension(yearsService, high3, retireAge, survivorBenefit, earlyRetirement) {
  const yrs = parseFloat(yearsService) || 0
  const h3 = parseFloat(high3) || 0
  const rAge = parseFloat(retireAge) || 62

  let multiplierRate = FERS_STANDARD
  if (rAge >= 62 && yrs >= 20) {
    multiplierRate = FERS_ENHANCED
  }

  const grossPension = yrs * multiplierRate * h3

  let earlyReductionAmt = 0
  let grossAfterEarly = grossPension
  if (rAge < 62 && earlyRetirement === 'mra10') {
    const yearsUnder62 = Math.min(62 - rAge, 5)
    const reductionPercent = yearsUnder62 * 0.05
    earlyReductionAmt = grossPension * reductionPercent
    grossAfterEarly = grossPension - earlyReductionAmt
  }

  let survivorDeduct = 0
  if (survivorBenefit === 'reduced') {
    survivorDeduct = grossAfterEarly * 0.005 * yrs
  } else if (survivorBenefit === 'full') {
    survivorDeduct = grossAfterEarly * 0.010 * yrs
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
    survivorDeduct = grossPension * 0.005 * yrs
  } else if (survivorBenefit === 'full') {
    survivorDeduct = grossPension * 0.010 * yrs
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

  grossPension = (grossPension * h3) / yrs
  grossPension = Math.min(grossPension, h3 * CSRS_MAX)

  let survivorDeduct = 0
  if (survivorBenefit === 'reduced') {
    survivorDeduct = grossPension * 0.005 * yrs
  } else if (survivorBenefit === 'full') {
    survivorDeduct = grossPension * 0.010 * yrs
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

  let multiplierRate = SP_LOW
  if (yrs <= 20) {
    multiplierRate = SP_HIGH
  }

  const grossPension = yrs * multiplierRate * h3

  let survivorDeduct = 0
  if (survivorBenefit === 'reduced') {
    survivorDeduct = grossPension * 0.005 * yrs
  } else if (survivorBenefit === 'full') {
    survivorDeduct = grossPension * 0.010 * yrs
  }

  const netAnnual = grossPension - survivorDeduct

  return {
    multiplierPct: multiplierRate * 100,
    gross: grossPension,
    survivorDeduct,
    netAnnual
  }
}

function calcSSBenefit(sstAt62, claimAge) {
  const ageShift = Math.max(0, claimAge - 62)
  const increases = {
    0: 1.0, 1: 1.08, 2: 1.16, 3: 1.24, 4: 1.32, 5: 1.40,
    6: 1.50, 7: 1.60, 8: 1.70, 9: 1.80, 10: 1.90
  }
  const factor = increases[Math.min(ageShift, 10)] || 1.9
  return (sstAt62 * factor) / 12
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
  return (yrs / 40) * ss / 12
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Calculator() {
  const navigate = useNavigate()
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
  const [fegliIsPostal, setFegliIsPostal] = useState(false)
  const [fegliRetirementStatus, setFegliRetirementStatus] = useState('active')
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
    const result = calcFEGLI(salary, age, parseFloat(fegliRetireAge) || 62, fegliOptA, fegliOptBMult, fegliOptCMult, fegliBasicReduction, fegliOptAReduction, fegliOptBReduction, fegliOptCReduction, fegliIsPostal, fegliRetirementStatus)
    setFegliResults(result)
  }, [tab, fegliSalary, fegliAge, fegliRetireAge, fegliOptA, fegliOptBMult, fegliOptCMult, fegliBasicReduction, fegliOptAReduction, fegliOptBReduction, fegliOptCReduction, fegliIsPostal, fegliRetirementStatus])

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
        fegliOptCReduction,
        fegliIsPostal,
        fegliRetirementStatus
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

        {/* FEGLI Tab - Full Width Single Column */}
        {tab === 'fegli' && (
          <div>
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
                <Field label="Employment Status">
                  <select value={fegliRetirementStatus} onChange={e => setFegliRetirementStatus(e.target.value)} style={s.select}>
                    <option value="active">Active Employee</option>
                    <option value="retired-pre65">Retired (Under 65)</option>
                    <option value="retired-65plus">Retired (Age 65+)</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Employee Type">
                  <select value={fegliIsPostal ? 'postal' : 'regular'} onChange={e => setFegliIsPostal(e.target.value === 'postal')} style={s.select}>
                    <option value="regular">Regular Federal Employee</option>
                    <option value="postal">USPS Postal Employee</option>
                  </select>
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
                  <option value="75">75% Reduction – Coverage becomes free after 65</option>
                  <option value="50">50% Reduction – Moderate cost; keep more coverage</option>
                  <option value="no">No Reduction – Full coverage; highest cost</option>
                </select>
              </Field>

              <div style={{ marginTop: 16 }}>
                <Field label="Option A">
                  <select value={fegliOptAReduction} onChange={e => setFegliOptAReduction(e.target.value)} style={s.select}>
                    <option value="full">Full Reduction – Coverage reduces to $0 after 65</option>
                    <option value="none">No Reduction – Keep coverage for life</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Option B">
                  <select value={fegliOptBReduction} onChange={e => setFegliOptBReduction(e.target.value)} style={s.select}>
                    <option value="full">Full Reduction – Coverage drops at 65</option>
                    <option value="none">No Reduction – Continue paying; coverage continues</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Option C">
                  <select value={fegliOptCReduction} onChange={e => setFegliOptCReduction(e.target.value)} style={s.select}>
                    <option value="full">Full Reduction – Coverage drops at 65</option>
                    <option value="none">No Reduction – Continue paying; coverage continues</option>
                  </select>
                </Field>
              </div>
            </div>

            {errors.length > 0 && (
              <div style={s.errorBox}>
                {errors.map((err, i) => <div key={i} style={{ marginBottom: i < errors.length - 1 ? 8 : 0 }}>{err}</div>)}
              </div>
            )}

            {/* Coverage Summary Cards - Inline */}
            {fegliResults && (
              <div>
                <div style={s.card}>
                  <div style={s.cardTitle}>Your Coverage Breakdown</div>
                  <div style={s.grid2}>
                    <div style={{ ...s.resultBox, borderLeft: '4px solid #7b1c2e' }}>
                      <div style={s.resultLabel}>Basic Insurance</div>
                      <div style={s.resultValue}>{fmt(fegliResults.bia)}</div>
                    </div>
                    {fegliResults.optA > 0 && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #0f172a' }}>
                        <div style={s.resultLabel}>Option A</div>
                        <div style={s.resultValue}>{fmt(fegliResults.optA)}</div>
                      </div>
                    )}
                    {fegliResults.optB > 0 && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #1e3a5f' }}>
                        <div style={s.resultLabel}>Option B</div>
                        <div style={s.resultValue}>{fmt(fegliResults.optB)}</div>
                      </div>
                    )}
                    {fegliResults.optC > 0 && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #64748b' }}>
                        <div style={s.resultLabel}>Option C</div>
                        <div style={s.resultValue}>{fmt(fegliResults.optC)}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>Total Coverage</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#7b1c2e' }}>{fmt(fegliResults.totalCoverage)}</div>
                  </div>
                </div>

                {/* Current Costs Card */}
                <div style={s.card}>
                  <div style={s.cardTitle}>Current Monthly Cost</div>
                  <div style={s.grid2}>
                    <div style={{ ...s.resultBox, borderLeft: '4px solid #7b1c2e' }}>
                      <div style={s.resultLabel}>Monthly Deduction</div>
                      <div style={s.resultValue}>{fmt(fegliResults.currentCostMonthly)}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 8 }}>Biweekly: {fmt(fegliResults.currentCostBiw)}</div>
                    </div>
                    <div style={{ ...s.resultBox, borderLeft: '4px solid #0f172a' }}>
                      <div style={s.resultLabel}>Annual Cost</div>
                      <div style={s.resultValue}>{fmt(fegliResults.currentCostAnnual)}</div>
                    </div>
                  </div>
                </div>

                {/* Cost at Key Ages */}
                <div style={s.card}>
                  <div style={s.cardTitle}>Projected Costs at Key Ages</div>
                  <div style={s.grid2}>
                    {fegliResults.retireCosts['65'] && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #1e3a5f' }}>
                        <div style={s.resultLabel}>Age 65 (Monthly)</div>
                        <div style={s.resultValue}>{fmt(fegliResults.retireCosts['65'].monthly)}</div>
                      </div>
                    )}
                    {fegliResults.retireCosts['75'] && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #1e3a5f' }}>
                        <div style={s.resultLabel}>Age 75 (Monthly)</div>
                        <div style={s.resultValue}>{fmt(fegliResults.retireCosts['75'].monthly)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* How to Calculate Section */}
            <div style={s.card}>
              <div style={s.cardTitle}>How FEGLI Costs Are Calculated</div>
              <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.8 }}>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#0f172a' }}>Basic Insurance:</strong> (Coverage ÷ 1,000) × Rate per $1,000 = Monthly Cost
                  <br /><span style={{ fontSize: '0.85rem', color: '#64748b' }}>Regular employees pay $0.3250 per $1,000 biweekly; Postal employees pay $0.00</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#0f172a' }}>Option A:</strong> Fixed monthly rate from age brackets
                  <br /><span style={{ fontSize: '0.85rem', color: '#64748b' }}>$0.20–$6.00 biweekly (employee rates) or $0.43–$13.00 monthly (annuitant rates)</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#0f172a' }}>Option B:</strong> (Salary × Multiples ÷ 1,000) × Rate per $1,000 = Monthly Cost
                  <br /><span style={{ fontSize: '0.85rem', color: '#64748b' }}>Per $1,000 of coverage elected</span>
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Option C:</strong> Fixed rate × Number of Multiples = Monthly Cost
                  <br /><span style={{ fontSize: '0.85rem', color: '#64748b' }}>One multiple ≈ $5,000 family coverage</span>
                </div>
              </div>
            </div>

            {/* FEGLI Rate Table */}
            <div style={s.card}>
              <div style={s.cardTitle}>FEGLI Premium Rate Table (Biweekly / Monthly)</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>Rates effective 10/1/2021. Postal employees: $0.00 for Basic (employer pays).</p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: 20 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8f7f4' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Age</th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Basic</th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Option A</th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Option B/K</th>
                      <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Option C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { age: 'Under 35', bracket: '<35', bia: '$0.33', a: '$0.20', b: '$0.02', c: '$0.20' },
                      { age: '35–39', bracket: '35-39', bia: '$0.33', a: '$0.20', b: '$0.02', c: '$0.24' },
                      { age: '40–44', bracket: '40-44', bia: '$0.33', a: '$0.30', b: '$0.03', c: '$0.37' },
                      { age: '45–49', bracket: '45-49', bia: '$0.33', a: '$0.60', b: '$0.06', c: '$0.53' },
                      { age: '50–54', bracket: '50-54', bia: '$0.33', a: '$1.00', b: '$0.10', c: '$0.83' },
                      { age: '55–59', bracket: '55-59', bia: '$0.33', a: '$1.80', b: '$0.18', c: '$1.33' },
                      { age: '60–64', bracket: '60-64', bia: '$0.33', a: '$6.00', b: '$0.40', c: '$2.43' },
                      { age: '65–69', bracket: '65-69', bia: '$0.33', a: '$6.00', b: '$0.48', c: '$2.83' },
                      { age: '70–74', bracket: '70-74', bia: '$0.33', a: '$6.00', b: '$0.86', c: '$3.83' },
                      { age: '75–79', bracket: '75-79', bia: '$0.33', a: '$6.00', b: '$1.80', c: '$5.76' },
                      { age: '80+', bracket: '80+', bia: '$0.33', a: '$6.00', b: '$2.88', c: '$7.80' },
                    ].map((row, idx) => {
                      const currentBracket = fegliAge ? getAgeBracket(parseFloat(fegliAge)) === row.bracket : false
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: currentBracket ? '#fffbeb' : 'transparent' }}>
                          <td style={{ padding: '10px 8px', color: '#475569', fontWeight: currentBracket ? 700 : 400 }}>
                            {row.age}
                            {currentBracket && <span style={{ color: '#7b1c2e', marginLeft: 8 }}>← You</span>}
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: '#475569' }}>{row.bia}</td>
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: '#475569' }}>{row.a}</td>
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: '#475569' }}>{row.b}</td>
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: '#475569' }}>{row.c}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Rates shown are <strong>employee</strong> rates (biweekly). Annuitant (retiree) rates for Options A, B, C are typically higher. Consult OPM for full annuitant rate table.</p>
            </div>

            {/* Cost Projection Over Time */}
            {fegliResults && (
              <div style={s.card}>
                <div style={s.cardTitle}>Cost Projection Over Time</div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 16 }}>Estimated monthly and annual costs at key ages, based on your elections.</p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8f7f4' }}>
                        <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Age</th>
                        <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Monthly Cost</th>
                        <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Annual Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[60, 65, 70, 75, 80].map((age) => {
                        const costs = fegliResults.retireCosts[age]
                        const isCurrent = parseFloat(fegliAge) >= age - 2 && parseFloat(fegliAge) < age + 5
                        return (
                          <tr key={age} style={{ borderBottom: '1px solid #e2e8f0', background: isCurrent ? '#fffbeb' : 'transparent' }}>
                            <td style={{ padding: '8px', color: '#475569', fontWeight: isCurrent ? 700 : 400 }}>
                              Age {age}
                              {isCurrent && <span style={{ color: '#7b1c2e', marginLeft: 8 }}>← Current bracket</span>}
                            </td>
                            <td style={{ textAlign: 'right', padding: '8px', color: '#475569' }}>{fmt(costs.monthly)}</td>
                            <td style={{ textAlign: 'right', padding: '8px', fontWeight: 600, color: '#0f172a' }}>{fmt(costs.annual)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Keep vs Drop Comparison */}
            <div style={s.card}>
              <div style={s.cardTitle}>Keep vs Drop Comparison</div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 16 }}>See why federal FEGLI is typically better than private term insurance.</p>
              <div style={s.grid2}>
                <div style={{ ...s.resultBox, borderLeft: '4px solid #16a34a' }}>
                  <div style={s.resultLabel}>FEGLI Cost Advantage</div>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: '8px 0' }}>
                    FEGLI is guaranteed, portable, and covers pre-existing conditions with NO medical underwriting.
                  </p>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 12 }}>
                    ✓ No medical exam required<br/>
                    ✓ Rates locked by age<br/>
                    ✓ Coverage up to retirement
                  </div>
                </div>
                <div style={{ ...s.resultBox, borderLeft: '4px solid #dc2626' }}>
                  <div style={s.resultLabel}>Private Term Risk</div>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: '8px 0' }}>
                    Private insurance requires medical underwriting and becomes very expensive at retirement.
                  </p>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 12 }}>
                    ✗ Medical exam required<br/>
                    ✗ Rates increase with age<br/>
                    ✗ Coverage ends at term limit
                  </div>
                </div>
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
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Want to know if your FEGLI strategy is right?</div>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: '0 0 12px 0' }}>
                    Your calculator results above are a great starting point, but every federal employee's situation is unique. A benefits specialist can review your coverage elections, retirement goals, and family situation to help you make the best choice.
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
                  <strong>Basic Insurance:</strong> BIA = Gross Salary (rounded to nearest $1,000) + $2,000. Regular employees pay $0.3250/K biweekly; Postal employees pay $0.00.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Option A:</strong> $10,000 fixed coverage. Rates increase sharply at age 60+. Annuitant rates apply in retirement.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Option B:</strong> Multiple of salary. Cost = (Salary × Multiples) ÷ 1,000 × Age-Based Rate.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Option C:</strong> Family coverage (spouse + children). One multiple ≈ $5,000 coverage.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Reduction Elections:</strong> Post-65 reductions affect coverage and cost differently by option. 75% Basic reduction = free after 65. Full A/B/C reductions = coverage drops to $0.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Postal Employees:</strong> No cost for Basic Insurance (employer pays 100%). Options A, B, C rates are the same.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retirement Calculator (FERS/CSRS/Special) */}
        {tab !== 'fegli' && (
          <>
            {/* Shared Retirement Form */}
            <div style={s.card}>
              <div style={s.cardTitle}>Your Service & Salary</div>
              <div style={s.grid2}>
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

              <div style={s.grid2}>
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
            </div>

            {/* Special Provisions Category */}
            {tab === 'special' && (
              <div style={s.card}>
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
            <div style={s.card}>
              <div style={s.cardTitle}>TSP & Social Security Projections</div>
              <div style={s.grid2}>
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

              <div style={s.grid2}>
                <Field label="Expected Annual Growth (%)" hint="Conservative: 5%, Moderate: 6%, Aggressive: 7%">
                  <input
                    type="number" min="0" max="15"
                    value={tspGrowthRate}
                    onChange={e => setTspGrowthRate(e.target.value)}
                    placeholder="e.g. 6"
                    style={s.input}
                  />
                </Field>
                <Field label="Estimated Social Security at Age 62 ($)">
                  <input
                    type="number" min="0"
                    value={ssAt62}
                    onChange={e => setSsAt62(e.target.value)}
                    placeholder="e.g. 2200"
                    style={s.input}
                  />
                </Field>
              </div>

              <Field label="Estimated Claiming Age">
                <select value={ssClaimAge} onChange={e => setSsClaimAge(e.target.value)} style={s.select}>
                  <option value="62">Age 62 (Reduced)</option>
                  <option value="67">Age 67 (Full Retirement Age)</option>
                  <option value="70">Age 70 (Delayed, Max Credit)</option>
                </select>
              </Field>
            </div>

            {/* FEHB & Medicare */}
            <div style={s.card}>
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

            {/* FERS-Only: Supplement Option */}
            {tab === 'fers' && (
              <div style={s.card}>
                <div style={s.cardTitle}>FERS Supplement</div>
                <div style={{ marginBottom: 12 }}>
                  <Toggle
                    checked={includeSupp}
                    onChange={e => setIncludeSupp(e.target.checked)}
                    label="Include FERS Supplement"
                    sublabel="Bridging income before age 62 (if retiring early)"
                  />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                  The FERS supplement is an annuity payable only on immediate retirement before age 62. It equals (Years of Service ÷ 40) × Estimated Social Security at 62.
                </p>
              </div>
            )}

            {errors.length > 0 && (
              <div style={s.errorBox}>
                {errors.map((err, i) => <div key={i} style={{ marginBottom: i < errors.length - 1 ? 8 : 0 }}>{err}</div>)}
              </div>
            )}

            <button onClick={calculate} style={s.button}>Calculate My Retirement</button>

            {/* Results Section */}
            {results && (
              <div id="calc-results" style={{ marginTop: 32 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7b1c2e', marginBottom: 24 }}>Your Retirement Income</div>

                {/* Monthly Income Breakdown */}
                <div style={s.card}>
                  <div style={s.cardTitle}>Monthly Income at Retirement</div>
                  <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#7b1c2e', marginBottom: 24 }}>{fmt(results.totalMonthly)}</div>

                  <div style={s.grid2}>
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
          </>
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
}
