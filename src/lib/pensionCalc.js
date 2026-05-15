/* =============================================================
   FedBenefitsAid — pension calculation library
   Three federal retirement systems: FERS, CSRS, FERS Special Provisions.
   All formulas sourced from OPM CSRS-FERS Handbook + 5 USC; figures
   updated for 2026 benefit year. Dates returned as { year, month } pairs.
   ============================================================= */

// -- MRA table ----------------------------------------------------
// FERS Minimum Retirement Age. 5 USC 8412(h).
// https://www.opm.gov/retirement-center/fers-information/eligibility/
export function mraForBirthYear(by) {
  if (by <= 1947) return 55
  if (by === 1948) return 55 + 2 / 12
  if (by === 1949) return 55 + 4 / 12
  if (by === 1950) return 55 + 6 / 12
  if (by === 1951) return 55 + 8 / 12
  if (by === 1952) return 55 + 10 / 12
  if (by <= 1964) return 56
  if (by === 1965) return 56 + 2 / 12
  if (by === 1966) return 56 + 4 / 12
  if (by === 1967) return 56 + 6 / 12
  if (by === 1968) return 56 + 8 / 12
  if (by === 1969) return 56 + 10 / 12
  return 57
}

export function formatYearsMonths(years) {
  if (years == null || isNaN(years)) return '—'
  const y = Math.floor(years)
  const m = Math.round((years - y) * 12)
  if (m === 0) return `${y} yr`
  if (m === 12) return `${y + 1} yr`
  return `${y} yr ${m} mo`
}

export function formatCurrency(n) {
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function formatMonth(date) {
  if (!date) return '—'
  const d = new Date(date + '-01')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// -- Date math ----------------------------------------------------
// All inputs use ISO year-month strings ("2026-04"). Internally converted
// to fractional years for math, then formatted back for display.
export function ymToFractional(ym) {
  if (!ym) return null
  const [y, m] = ym.split('-').map(Number)
  return y + (m - 1) / 12
}

export function fractionalToYm(f) {
  if (f == null || isNaN(f)) return null
  const y = Math.floor(f)
  const monthIdx = Math.round((f - y) * 12)
  // Handle wraparound when monthIdx === 12
  const yy = monthIdx === 12 ? y + 1 : y
  const mm = monthIdx === 12 ? 1 : monthIdx + 1
  return `${yy}-${String(mm).padStart(2, '0')}`
}

// -- High-3 projection -------------------------------------------
// Very simple compounded growth from current basic pay to retirement date.
// Real High-3 is the highest 36 consecutive months of basic pay; for a
// projection assuming continued service in the same role, that's the
// final 3 years averaged. We return: (1) the High-3 average.
export function projectHigh3({ currentBasicPay, currentDate, retireDate, growthRate = 0.02 }) {
  const cur = ymToFractional(currentDate)
  const ret = ymToFractional(retireDate)
  if (cur == null || ret == null) return null
  const yearsForward = ret - cur
  if (yearsForward < 0) return null
  // Final 36 months averaged: pay at retirement, pay at retirement-12mo, pay at retirement-24mo
  // Each year of forward time grows by growthRate; ditto backward.
  const payAt = (offsetYears) => currentBasicPay * Math.pow(1 + growthRate, yearsForward - offsetYears)
  const high3 = (payAt(0) + payAt(1) + payAt(2)) / 3
  return high3
}

// -- Sick leave conversion ---------------------------------------
// 2087 hours = one year of service (OPM standard).
export function sickLeaveYears(hours) {
  if (!hours || hours < 0) return 0
  return hours / 2087
}

// -- Service computation -----------------------------------------
export function computeServiceYears({ hireDate, retireDate, sickLeaveHours = 0 }) {
  const start = ymToFractional(hireDate)
  const end = ymToFractional(retireDate)
  if (start == null || end == null) return null
  if (end < start) return null
  return (end - start) + sickLeaveYears(sickLeaveHours)
}

export function computeAge({ birthDate, asOfDate }) {
  const b = ymToFractional(birthDate)
  const d = ymToFractional(asOfDate)
  if (b == null || d == null) return null
  return d - b
}

// =============================================================
// FERS — standard
// =============================================================
//
// Annuity formula (5 USC 8415):
//   Standard:  1.0% × High-3 × YOS
//   Enhanced:  1.1% × High-3 × YOS  if age ≥ 62 AND YOS ≥ 20
//
// MRA+10 reduced: base annuity reduced 5%/year under 62
//   (or under 60 if YOS ≥ 20).
//
// FERS Supplement (5 USC 8421):
//   ≈ SS_age62_estimate × (FERS_civilian_years / 40)
//   Paid until age 62. Earnings test: $1 reduced per $2 over annual limit
//   (2026: $24,480). Not subject to earnings test until MRA for special
//   retirees.
export function fersPension({ birthDate, hireDate, retireDate, currentBasicPay, sickLeaveHours = 0, growthRate = 0.02, ssEstimateAt62 = 0 }) {
  const ageAtRetirement = computeAge({ birthDate, asOfDate: retireDate })
  const yos = computeServiceYears({ hireDate, retireDate, sickLeaveHours })
  const high3 = projectHigh3({ currentBasicPay, currentDate: hireDate ? new Date().toISOString().slice(0, 7) : null, retireDate, growthRate })

  if (ageAtRetirement == null || yos == null || high3 == null) return null

  const birthYear = parseInt(birthDate.split('-')[0], 10)
  const mra = mraForBirthYear(birthYear)

  // Eligibility category
  // Note: the category labels follow the user's actual retirement age &
  // service. When someone retires at 62+ with 20+ YOS, we label them under
  // the Age 62 rule (with the 1.1% kicker), not Age 60+20 — even though
  // they were technically eligible earlier. The Age 62 framing is more
  // useful because:
  //   (a) the multiplier kicker only applies at age 62+,
  //   (b) the FERS Supplement stops at 62, so attributing them to a
  //       Supplement-eligible rule when they're past 62 is misleading.
  let category = null
  let categoryLabel = null
  let supplementEligible = false
  let reduction = 0
  let reductionDetail = ''

  if (ageAtRetirement >= 62 && yos >= 5) {
    // Age 62+ retirement: already SS-eligible, no FERS Supplement.
    if (yos >= 20) {
      category = 'immediate-62-20'
      categoryLabel = 'Immediate Unreduced (Age 62 + 20, 1.1% kicker)'
    } else {
      category = 'immediate-62-5'
      categoryLabel = 'Immediate Unreduced (Age 62 + 5)'
    }
    supplementEligible = false
  } else if (yos >= 30 && ageAtRetirement >= mra) {
    category = 'immediate-mra30'
    categoryLabel = 'Immediate Unreduced (MRA + 30)'
    supplementEligible = true
  } else if (yos >= 20 && ageAtRetirement >= 60) {
    category = 'immediate-60-20'
    categoryLabel = 'Immediate Unreduced (Age 60 + 20)'
    supplementEligible = true
  } else if (yos >= 10 && ageAtRetirement >= mra) {
    category = 'mra-10'
    categoryLabel = 'MRA + 10 (Reduced)'
    // MRA+10 immediate retirement: annuity reduced 5%/year under age 62.
    // (The "under 60 with 20+ YOS" carve-out belongs to *postponed* MRA+10,
    //  not immediate MRA+10. See 5 USC 8415(f) and OPM CSRS-FERS Handbook ch. 42.)
    const yearsUnder = Math.max(0, 62 - ageAtRetirement)
    reduction = yearsUnder * 0.05
    reductionDetail = `Reduced ${(reduction * 100).toFixed(1)}% (${formatYearsMonths(yearsUnder)} under age 62). Postponing the annuity start avoids the penalty.`
    supplementEligible = false // MRA+10 is not eligible
  } else if (yos >= 5) {
    category = 'deferred'
    categoryLabel = 'Deferred (must wait until age 62 for unreduced)'
    supplementEligible = false
  } else {
    category = 'ineligible'
    categoryLabel = 'Not yet eligible (need 5+ years for any annuity)'
  }

  // Multiplier
  const enhanced = ageAtRetirement >= 62 && yos >= 20
  const multiplier = enhanced ? 0.011 : 0.010

  // Annuity (only if eligible)
  let annualAnnuity = 0
  if (category && category !== 'ineligible') {
    annualAnnuity = high3 * yos * multiplier * (1 - reduction)
  }

  // FERS Supplement (only if eligible). Per OPM (CSRS-FERS Handbook ch. 51):
  // formula uses *whole years* of FERS civilian service (rounded DOWN, max 40),
  // divided by 40 and multiplied by the SS-at-62 estimate.
  let supplementAnnual = 0
  if (supplementEligible && ssEstimateAt62 > 0) {
    const annualSsAt62 = ssEstimateAt62 * 12
    const civilianFersYears = yos - sickLeaveYears(sickLeaveHours) // sick leave doesn't count
    const wholeYearsForSupplement = Math.min(40, Math.floor(civilianFersYears))
    supplementAnnual = annualSsAt62 * (wholeYearsForSupplement / 40)
  }

  return {
    system: 'FERS',
    ageAtRetirement,
    yos,
    high3,
    mra,
    category,
    categoryLabel,
    enhanced,
    multiplier,
    reduction,
    reductionDetail,
    annualAnnuity,
    monthlyAnnuity: annualAnnuity / 12,
    supplementEligible,
    supplementAnnual,
    supplementMonthly: supplementAnnual / 12,
    supplementEnds: supplementEligible ? 62 : null,
  }
}

// =============================================================
// CSRS — standard
// =============================================================
//
// Annuity formula (5 USC 8339):
//   1.5% × High-3 × first 5 yrs +
//   1.75% × High-3 × next 5 yrs +
//   2.0% × High-3 × years > 10
//   Capped at 80% of High-3 (reached at 41 yrs 11 mos).
//
// Eligibility:
//   55 + 30, 60 + 20, 62 + 5
//
// COLA: starts immediately at retirement (unlike FERS, which waits to 62).
// No FERS Supplement. No 1.1% kicker. No SS earned from federal service.
export function csrsPension({ birthDate, hireDate, retireDate, currentBasicPay, sickLeaveHours = 0, growthRate = 0.02 }) {
  const ageAtRetirement = computeAge({ birthDate, asOfDate: retireDate })
  const yos = computeServiceYears({ hireDate, retireDate, sickLeaveHours })
  const high3 = projectHigh3({ currentBasicPay, currentDate: new Date().toISOString().slice(0, 7), retireDate, growthRate })

  if (ageAtRetirement == null || yos == null || high3 == null) return null

  // Eligibility
  let category = null
  let categoryLabel = null
  if (yos >= 30 && ageAtRetirement >= 55) {
    category = 'csrs-55-30'
    categoryLabel = 'Immediate Unreduced (Age 55 + 30)'
  } else if (yos >= 20 && ageAtRetirement >= 60) {
    category = 'csrs-60-20'
    categoryLabel = 'Immediate Unreduced (Age 60 + 20)'
  } else if (yos >= 5 && ageAtRetirement >= 62) {
    category = 'csrs-62-5'
    categoryLabel = 'Immediate Unreduced (Age 62 + 5)'
  } else if (yos >= 5) {
    category = 'deferred'
    categoryLabel = 'Deferred (must wait until age 62)'
  } else {
    category = 'ineligible'
    categoryLabel = 'Not yet eligible (need 5+ years)'
  }

  // Annuity formula (tiered)
  const t1 = Math.min(yos, 5)
  const t2 = Math.min(Math.max(yos - 5, 0), 5)
  const t3 = Math.max(yos - 10, 0)
  const baseAnnuity = high3 * (0.015 * t1 + 0.0175 * t2 + 0.020 * t3)
  const cappedAnnuity = Math.min(baseAnnuity, high3 * 0.80)
  const cappedHit = baseAnnuity > high3 * 0.80

  // Effective replacement rate (annuity / High-3)
  const replacementRate = high3 > 0 ? cappedAnnuity / high3 : 0

  let annualAnnuity = 0
  if (category && category !== 'ineligible') {
    annualAnnuity = cappedAnnuity
  }

  return {
    system: 'CSRS',
    ageAtRetirement,
    yos,
    high3,
    category,
    categoryLabel,
    annualAnnuity,
    monthlyAnnuity: annualAnnuity / 12,
    cappedHit,
    replacementRate,
    // Tier breakdown for display
    tiers: {
      first5Years: { years: t1, multiplier: 0.015, contribution: high3 * 0.015 * t1 },
      next5Years: { years: t2, multiplier: 0.0175, contribution: high3 * 0.0175 * t2 },
      remaining: { years: t3, multiplier: 0.020, contribution: high3 * 0.020 * t3 },
    },
  }
}

// =============================================================
// FERS Special Provisions — LEO, Firefighters, Air Traffic Controllers,
// Capitol Police, Secret Service Uniformed Division, Nuclear Materials Couriers
// =============================================================
//
// Annuity formula (5 USC 8412(d), 8415(d)):
//   1.7% × High-3 × first 20 yrs +
//   1.0% × High-3 × additional yrs
//
// Eligibility:
//   Age 50 + 20 yrs (special provisions service)
//   Any age + 25 yrs (special provisions service)
//   Mandatory retirement: 57 for LEO/FF; varies for ATC.
//
// FERS Supplement: paid from retirement until 62. NOT subject to earnings
// test until MRA. Same approximation formula.
export function specialProvisionsPension({ birthDate, hireDate, retireDate, currentBasicPay, sickLeaveHours = 0, growthRate = 0.02, ssEstimateAt62 = 0, additionalRegularYears = 0 }) {
  const ageAtRetirement = computeAge({ birthDate, asOfDate: retireDate })
  // For eligibility: SP service WITHOUT sick leave (5 USC 8415(g)(2);
  // OPM Handbook ch. 50). Sick leave counts only in the annuity computation.
  const specialServiceYears = computeServiceYears({ hireDate, retireDate, sickLeaveHours: 0 })
  // For annuity computation: include sick leave credit.
  const specialYos = computeServiceYears({ hireDate, retireDate, sickLeaveHours })
  const high3 = projectHigh3({ currentBasicPay, currentDate: new Date().toISOString().slice(0, 7), retireDate, growthRate })

  if (ageAtRetirement == null || specialYos == null || high3 == null) return null

  const birthYear = parseInt(birthDate.split('-')[0], 10)
  const mra = mraForBirthYear(birthYear)
  const totalYos = specialYos + additionalRegularYears

  // Eligibility (special provisions) — uses actual SP service, NOT sick-leave-padded.
  let category = null
  let categoryLabel = null
  let supplementEligible = false
  if (specialServiceYears >= 25) {
    category = 'sp-any-25'
    categoryLabel = 'Immediate Unreduced (Any age + 25 yrs Special Provisions service)'
    supplementEligible = true
  } else if (specialServiceYears >= 20 && ageAtRetirement >= 50) {
    category = 'sp-50-20'
    categoryLabel = 'Immediate Unreduced (Age 50 + 20 yrs Special Provisions service)'
    supplementEligible = true
  } else if (specialServiceYears >= 5 && ageAtRetirement >= 62) {
    category = 'fers-62-5'
    categoryLabel = 'Standard FERS Immediate (Age 62 + 5 — falls back to standard FERS rules)'
    supplementEligible = false
  } else if (specialServiceYears >= 5) {
    category = 'deferred'
    categoryLabel = 'Deferred / standard FERS rules apply (no Special Provisions benefit)'
  } else {
    category = 'ineligible'
    categoryLabel = 'Not yet eligible'
  }

  // FERS Supplement is paid only until age 62. SP retirees who retire at 62+
  // are already SS-eligible, so the Supplement doesn't apply even if they
  // qualified under sp-any-25 / sp-50-20.
  if (ageAtRetirement >= 62) supplementEligible = false

  // Annuity formula (uses sick-leave-padded years):
  //   First 20 yrs SP × 1.7% + remaining SP yrs × 1.0% + regular FERS yrs × 1.0%/1.1%
  const sp1 = Math.min(specialYos, 20)
  const sp2 = Math.max(specialYos - 20, 0)
  const standardMult = ageAtRetirement >= 62 && totalYos >= 20 ? 0.011 : 0.010
  const annualAnnuity =
    category && category !== 'ineligible'
      ? high3 * (0.017 * sp1 + 0.010 * sp2 + standardMult * additionalRegularYears)
      : 0

  // FERS Supplement — whole years of civilian FERS service (no sick leave), capped at 40, divided by 40.
  let supplementAnnual = 0
  if (supplementEligible && ssEstimateAt62 > 0) {
    const annualSsAt62 = ssEstimateAt62 * 12
    const civilianFersYears = totalYos - sickLeaveYears(sickLeaveHours)
    const wholeYearsForSupplement = Math.min(40, Math.floor(civilianFersYears))
    supplementAnnual = annualSsAt62 * (wholeYearsForSupplement / 40)
  }

  return {
    system: 'FERS Special Provisions',
    ageAtRetirement,
    yos: specialYos,
    totalYos,
    high3,
    mra,
    category,
    categoryLabel,
    annualAnnuity,
    monthlyAnnuity: annualAnnuity / 12,
    supplementEligible,
    supplementAnnual,
    supplementMonthly: supplementAnnual / 12,
    supplementEnds: supplementEligible ? 62 : null,
    earningsTestStartsAt: mra,
    tiers: {
      first20Years: { years: sp1, multiplier: 0.017, contribution: high3 * 0.017 * sp1 },
      additionalSpecial: { years: sp2, multiplier: 0.010, contribution: high3 * 0.010 * sp2 },
      additionalRegular: { years: additionalRegularYears, multiplier: standardMult, contribution: high3 * standardMult * additionalRegularYears },
    },
  }
}

// =============================================================
// Lifetime expected pension (rough)
// =============================================================
// Default life expectancy from SSA Period Life Table 2020 (released 2024):
// male age 65 ≈ 16.3 more yrs (so ~81), female ≈ 18.9 (~84). Using 85 for
// a non-gendered planning baseline. User can adjust.
//
// We do NOT compound COLA into the lifetime — that's a planning assumption
// that varies. We expose the raw figure and let the UI show "without COLA".
export function lifetimeExpected({ annualAnnuity, ageAtRetirement, lifeExpectancy = 85 }) {
  if (!annualAnnuity || annualAnnuity <= 0 || ageAtRetirement == null) return 0
  const years = Math.max(0, lifeExpectancy - ageAtRetirement)
  return annualAnnuity * years
}
