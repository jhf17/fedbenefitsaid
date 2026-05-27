// Lookup-table-driven monthly guaranteed-income calculation from a TSP balance.
// Internal use only — no product references should appear in user-facing copy.

import RATES from './guaranteedIncomeRates.json'

const ISSUE_AGE_MIN = 40
const ISSUE_AGE_MAX = 80
const ATTAINED_AGE_MIN = 50
const ATTAINED_AGE_MAX = 90

function clamp(v, min, max) {
  if (Number.isNaN(v) || v == null) return min
  return Math.min(max, Math.max(min, v))
}

// Lookup the applicable Annual Benefit Amount percentage.
// rider: 'early' (gap from purchase to income ≤ 3 yrs) or 'later' (gap ≥ 4 yrs)
function lookupRate(rider, issueAge, attainedAge) {
  const matrix = RATES[rider]
  if (!matrix) return 0
  const ia = clamp(issueAge, ISSUE_AGE_MIN, ISSUE_AGE_MAX)
  const aa = clamp(attainedAge, ATTAINED_AGE_MIN, ATTAINED_AGE_MAX)
  const row = matrix[String(ia)]
  if (!row) return 0
  const pct = row[String(aa)]
  return typeof pct === 'number' ? pct : 0
}

/**
 * Compute monthly guaranteed income from a starting balance.
 *
 * @param {number} balance   - TSP balance moved at issue
 * @param {number} currentAge - Owner's age today (when the contract would be issued)
 * @param {number} incomeStartAge - Age at which income begins (retirement age + yearsToDefer)
 * @returns {{ monthly: number, annual: number, gap: number, rider: 'early'|'later', rate: number }}
 */
export function monthlyGuaranteedIncome(balance, currentAge, incomeStartAge) {
  const b = Math.max(0, Number(balance) || 0)
  const ia = Math.round(Number(currentAge) || 0)
  const aa = Math.round(Number(incomeStartAge) || 0)
  const gap = Math.max(0, aa - ia)
  // Early vs Later auto-selected by gap from purchase to first income draw.
  const rider = gap <= 3 ? 'early' : 'later'
  const ratePct = lookupRate(rider, ia, aa)
  if (!ratePct || aa < ATTAINED_AGE_MIN) {
    return { monthly: 0, annual: 0, gap, rider, rate: 0 }
  }
  // Benefit-base bonus (10%) + simple-interest roll-up (10%/yr for up to 10 yrs).
  const rollupYears = Math.min(10, gap)
  const ibb = b * 1.10 * (1 + 0.10 * rollupYears)
  const annual = ibb * (ratePct / 100)
  return {
    monthly: annual / 12,
    annual,
    gap,
    rider,
    rate: ratePct,
  }
}
