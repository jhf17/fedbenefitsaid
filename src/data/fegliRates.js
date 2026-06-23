/**
 * FEGLI premium rates — monthly employee rates, effective October 1, 2021.
 *
 * Official OPM source: https://www.opm.gov/healthcare-insurance/life-insurance/rates/
 * This is the current rate schedule — OPM has not published a newer one since 2021.
 *
 * Rates are expressed as follows:
 *   basicPer1000   — monthly premium per $1,000 of Basic Insurance Amount (BIA).
 *                    Flat across all ages because the Basic premium does not
 *                    change with age; only the coverage amount changes as salary
 *                    changes. Employees pay $0.3467 / $1,000 / month; USPS and
 *                    agencies that pay the full Basic share make Basic free to
 *                    postal employees.
 *   optionA        — flat monthly premium for the $10,000 Option A Standard
 *                    coverage. Age-banded in 5-year brackets starting at age 35.
 *   optionBPer1000 — monthly premium per $1,000 of Option B (Additional)
 *                    coverage. Coverage = salary rounded up to next $1,000 ×
 *                    elected multiple (1–5). Age-banded in 5-year brackets.
 *   optionCPerMultiple — monthly premium per 1× multiple of Option C (Family)
 *                    coverage. 1× covers the spouse for $5,000 and each
 *                    eligible child for $2,500. Age-banded on the EMPLOYEE's
 *                    age, not the spouse's.
 *
 * Age bracket is determined by the employee's age at the start of the pay
 * period — rates step up on the birthday inside the relevant bracket.
 *
 * This file is the single source of truth for FEGLI math. Do not hardcode
 * rates elsewhere in the codebase.
 */

export const FEGLI_RATES = [
  { label: 'Under 35', min: 0,  max: 34, basicPer1000: 0.3467, optionA: 0.43, optionBPer1000: 0.043, optionCPerMultiple: 0.43 },
  { label: '35–39',    min: 35, max: 39, basicPer1000: 0.3467, optionA: 0.43, optionBPer1000: 0.043, optionCPerMultiple: 0.52 },
  { label: '40–44',    min: 40, max: 44, basicPer1000: 0.3467, optionA: 0.65, optionBPer1000: 0.065, optionCPerMultiple: 0.80 },
  { label: '45–49',    min: 45, max: 49, basicPer1000: 0.3467, optionA: 1.30, optionBPer1000: 0.130, optionCPerMultiple: 1.15 },
  { label: '50–54',    min: 50, max: 54, basicPer1000: 0.3467, optionA: 2.17, optionBPer1000: 0.217, optionCPerMultiple: 1.80 },
  { label: '55–59',    min: 55, max: 59, basicPer1000: 0.3467, optionA: 3.90, optionBPer1000: 0.390, optionCPerMultiple: 2.88 },
  { label: '60–64',    min: 60, max: 64, basicPer1000: 0.3467, optionA: 13.00, optionBPer1000: 0.867, optionCPerMultiple: 5.27 },
  { label: '65–69',    min: 65, max: 69, basicPer1000: 0.3467, optionA: 13.00, optionBPer1000: 1.040, optionCPerMultiple: 6.13 },
  { label: '70–74',    min: 70, max: 74, basicPer1000: 0.3467, optionA: 13.00, optionBPer1000: 1.863, optionCPerMultiple: 8.30 },
  { label: '75–79',    min: 75, max: 79, basicPer1000: 0.3467, optionA: 13.00, optionBPer1000: 3.900, optionCPerMultiple: 12.48 },
  { label: '80+',      min: 80, max: 200, basicPer1000: 0.3467, optionA: 13.00, optionBPer1000: 6.240, optionCPerMultiple: 16.90 },
]

export const FEGLI_SOURCE_URL = 'https://www.opm.gov/healthcare-insurance/life-insurance/rates/'

/** Returns the rate bracket for a given age. */
export function getRateBracket(age) {
  const a = Math.max(0, Number(age) || 0)
  return FEGLI_RATES.find((b) => a >= b.min && a <= b.max) || FEGLI_RATES[FEGLI_RATES.length - 1]
}

/** Round salary UP to the next $1,000, then add $2,000 (FEGLI BIA formula). */
export function basicCoverageForSalary(salary) {
  const s = Math.max(0, Number(salary) || 0)
  return Math.ceil(s / 1000) * 1000 + 2000
}

/**
 * Compute the MONTHLY employee premium for each coverage option at a given age.
 * Does not apply any post-65 reduction — the caller handles that via
 * `applyReductionFactors` below, because reductions only kick in for
 * retirees who have elected each option's Reduction setting.
 *
 * @param {object} args
 * @param {number} args.age         — employee age
 * @param {number} args.salary      — annual salary (drives Basic + Option B coverage)
 * @param {boolean} args.basic      — Basic elected?
 * @param {boolean} args.optionA    — Option A elected?
 * @param {number} args.optionBMult — Option B multiples (0–5). 0 = not elected.
 * @param {number} args.optionCMult — Option C multiples (0–5). 0 = not elected.
 * @param {boolean} args.postal     — USPS postal employee? If true, Basic is $0.
 * @returns {{basic: number, optionA: number, optionB: number, optionC: number, total: number}}
 */
export function monthlyPremium({ age, salary, basic, optionA, optionBMult, optionCMult, postal }) {
  const b = getRateBracket(age)
  const bia = basicCoverageForSalary(salary)
  const optBCoverage = Math.ceil(Number(salary || 0) / 1000) * 1000 * Number(optionBMult || 0)

  const basicCost = !basic ? 0 : postal ? 0 : (bia / 1000) * b.basicPer1000
  const optionACost = optionA ? b.optionA : 0
  const optionBCost = (optionBMult > 0) ? (optBCoverage / 1000) * b.optionBPer1000 : 0
  const optionCCost = (optionCMult > 0) ? b.optionCPerMultiple * Number(optionCMult) : 0

  return {
    basic: basicCost,
    optionA: optionACost,
    optionB: optionBCost,
    optionC: optionCCost,
    total: basicCost + optionACost + optionBCost + optionCCost,
  }
}

/**
 * Returns the effective coverage amount per option for a given election set.
 * Used for sidebar "Total Life Insurance Coverage" and chart tooltips.
 */
export function coverageBreakdown({ salary, basic, optionA, optionBMult, optionCMult }) {
  const bia = basic ? basicCoverageForSalary(salary) : 0
  const optA = optionA ? 10000 : 0
  const optB = (optionBMult > 0) ? Math.ceil(Number(salary || 0) / 1000) * 1000 * Number(optionBMult) : 0
  const optCSpouse = (optionCMult > 0) ? 5000 * Number(optionCMult) : 0
  const optCPerChild = (optionCMult > 0) ? 2500 * Number(optionCMult) : 0
  return {
    basic: bia,
    optionA: optA,
    optionB: optB,
    optionC: { spouse: optCSpouse, perChild: optCPerChild },
    total: bia + optA + optB + optCSpouse, // total "self + spouse" face value; children are per-child so not summed
  }
}

/**
 * Apply retiree reduction elections.
 * Reductions (OPM annuitant rates, effective Oct 1, 2021, monthly per $1,000 of BIA):
 *   Basic: 75% reduction (default) — $0.3467 until 65, FREE at 65+; coverage
 *            drops 2%/month from 65 until 25% remains.
 *          50% reduction — extra +$0.75/mo per $1,000 FOR LIFE, charged from
 *            retirement (≈ $1.0967 until 65, $0.75 at 65+); coverage drops
 *            1%/month from 65 until 50% remains.
 *          No Reduction — extra +$2.25/mo per $1,000 FOR LIFE, charged from
 *            retirement (≈ $2.5967 until 65, $2.25 at 65+); coverage stays 100%.
 *   Option A: Full Reduction only — coverage drops 2%/month to zero starting at 65, no premium
 *   Option B: Full Reduction (drops to zero starting at 65, no premium) OR
 *             No Reduction (retiree keeps 100% coverage and continues to pay age-banded premium)
 *   Option C: Full Reduction OR No Reduction — same pattern as B.
 *
 * For simplicity in the chart and estimated costs, we model the "end state"
 * after reductions fully phase in. The 2%/month or 1%/month coverage taper is
 * a sawtooth in the real world but is not material to a monthly cost chart.
 *
 * @param {object} premium   — output of monthlyPremium() at the target age
 * @param {object} elections — { basicReduction: '75'|'50'|'none', optionBReduction: 'full'|'none', optionCReduction: 'full'|'none' }
 * @param {number} age       — target age
 * @param {boolean} retired  — has the employee retired (i.e. is the reduction election in effect)?
 * @param {object} [opts]    — { salary, basic } — needed to size the 50%/No-Reduction
 *                             Basic add-on premium. Omitted ⇒ add-on not modeled.
 */
export function applyReductionFactors(premium, elections, age, retired, opts = {}) {
  if (!retired) return premium

  const br = elections.basicReduction || '75'
  // Extra lifetime premium for electing 50% or No Reduction on Basic.
  // Starts at retirement (not 65) and continues for life.
  const biaThousands = opts.salary && opts.basic ? basicCoverageForSalary(opts.salary) / 1000 : 0
  const basicAddon = (br === '50' ? 0.75 : br === 'none' ? 2.25 : 0) * biaThousands

  if (age < 65) {
    // Before 65 the regular age-band premium continues for everything; the
    // only retirement-specific charge is the Basic reduction-election add-on.
    if (!basicAddon) return premium
    return { ...premium, basic: premium.basic + basicAddon, total: premium.total + basicAddon }
  }

  const oBZero = (elections.optionBReduction || 'full') === 'full'
  const oCZero = (elections.optionCReduction || 'full') === 'full'
  // At 65+ the regular Basic charge ($0.3467/$1,000) stops for annuitants;
  // only the reduction-election add-on (if any) continues.
  const basicAt65 = basicAddon

  return {
    basic: basicAt65,
    optionA: 0, // Option A is always Full Reduction
    optionB: oBZero ? 0 : premium.optionB,
    optionC: oCZero ? 0 : premium.optionC,
    total: basicAt65
         + (oBZero ? 0 : premium.optionB)
         + (oCZero ? 0 : premium.optionC),
  }
}

/**
 * Build a year-by-year monthly cost projection for a given election set.
 *
 * Rates change on 5-year age-bracket boundaries, so the chart is naturally
 * stepped. We emit one data point per year from `currentAge` through 80 to
 * give the chart enough resolution for vertical "today" and "retirement"
 * markers.
 *
 * @returns {Array<{age: number, basic: number, optionA: number, optionB: number, optionC: number, total: number}>}
 */
export function buildCostProjection({
  currentAge,
  retireAge,
  salary,
  postal,
  basic,
  optionA,
  optionBMult,
  optionCMult,
  elections,
}) {
  const start = Math.max(18, Math.min(80, Math.floor(Number(currentAge) || 0)))
  const rAge = Math.max(start, Math.floor(Number(retireAge) || 62))
  const points = []
  for (let age = start; age <= 80; age++) {
    const retired = age >= rAge
    // USPS pays Basic only while employed — postal RETIREES pay the normal
    // annuitant Basic rate, so the postal exemption ends at retirement.
    const base = monthlyPremium({ age, salary, basic, optionA, optionBMult, optionCMult, postal: postal && !retired })
    const adjusted = applyReductionFactors(base, elections, age, retired, { salary, basic })
    points.push({
      age,
      basic: Math.round(adjusted.basic * 100) / 100,
      optionA: Math.round(adjusted.optionA * 100) / 100,
      optionB: Math.round(adjusted.optionB * 100) / 100,
      optionC: Math.round(adjusted.optionC * 100) / 100,
      total: Math.round(adjusted.total * 100) / 100,
    })
  }
  return points
}
