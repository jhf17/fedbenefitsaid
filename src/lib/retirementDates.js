// Exact-date retirement math for the advisor Retirement Summary builder.
// All dates are ISO strings 'YYYY-MM-DD'. Rules (OPM CSRS/FERS Handbook):
//  - Creditable service = SCD to separation, in years/months/days; for the
//    annuity computation only full months count (leftover days are dropped).
//  - FERS immediate unreduced: MRA+30, 60+20, 62+5. MRA+10: reduced 5/12 of 1%
//    per month under 62 unless postponed (to 60 with 20+ yrs, else 62).
//  - CSRS immediate: 55+30, 60+20, 62+5 (no MRA+10).
//  - Special provisions (FERS LEO/FF/ATC): 50+20 or any age with 25.
import { mraForBirthYear } from './pensionCalc'

export function parseISO(s) {
  if (!s || typeof s !== 'string') return null
  const parts = s.split('-').map(Number)
  if (parts.length < 2 || parts.some((x) => isNaN(x))) return null
  const [y, m, d = 1] = parts
  return { y, m, d }
}
export function toISO({ y, m, d }) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function daysInMonth(y, m) { return new Date(y, m, 0).getDate() }
export function addMonths(iso, months) {
  const p = parseISO(iso); if (!p) return null
  const total = p.y * 12 + (p.m - 1) + Math.round(months)
  const y = Math.floor(total / 12), m = (total % 12) + 1
  return toISO({ y, m, d: Math.min(p.d, daysInMonth(y, m)) })
}
export function addYears(iso, years) { return addMonths(iso, years * 12) }
export function addDaysISO(iso, days) {
  const p = parseISO(iso); if (!p) return null
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d) + days * 86400000)
  return toISO({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() })
}
export function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0 }

// Calendar difference from -> to as { y, m, d } (to >= from).
export function diffYMD(from, to) {
  const a = parseISO(from), b = parseISO(to)
  if (!a || !b || cmp(from, to) > 0) return { y: 0, m: 0, d: 0 }
  let y = b.y - a.y, m = b.m - a.m, d = b.d - a.d
  if (d < 0) { m -= 1; d += daysInMonth(b.m === 1 ? b.y - 1 : b.y, b.m === 1 ? 12 : b.m - 1) }
  if (m < 0) { y -= 1; m += 12 }
  return { y, m, d }
}
export function ymdToYears({ y, m, d }) { return y + m / 12 + d / 365.25 }
export function fmtYM({ y, m }) {
  const parts = []
  if (y) parts.push(`${y} yr${y === 1 ? '' : 's'}`)
  if (m) parts.push(`${m} mo`)
  return parts.length ? parts.join(' ') : '0 mo'
}
export function fmtLong(iso) {
  const p = parseISO(iso); if (!p) return '—'
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[p.m - 1]} ${p.d}, ${p.y}`
}
export function fmtShort(iso) {
  const p = parseISO(iso); if (!p) return '—'
  return `${p.m}/${p.d}/${p.y}`
}

// MRA as an exact date (birth date + MRA years/months).
export function mraDate(birth) {
  const p = parseISO(birth); if (!p) return null
  return addMonths(birth, Math.round(mraForBirthYear(p.y) * 12))
}

// Social Security full retirement age by birth year (SSA).
export function ssFraMonths(birthYear) {
  if (birthYear <= 1937) return 65 * 12
  if (birthYear <= 1942) return 65 * 12 + (birthYear - 1937) * 2
  if (birthYear <= 1954) return 66 * 12
  if (birthYear <= 1959) return 66 * 12 + (birthYear - 1954) * 2
  return 67 * 12
}
// SECURE 2.0 RMD age.
export function rmdAge(birthYear) { return birthYear >= 1960 ? 75 : birthYear >= 1951 ? 73 : 72 }

// Service (no sick leave) between two dates, and computation service with sick
// leave added (2,087 hrs = 1 yr; ~174 hrs = 1 mo), full months only.
export function serviceAt(scd, date) { return diffYMD(scd, date) }
export function computationService(svc, sickHours) {
  const sickMonths = (Number(sickHours) || 0) / (2087 / 12)
  const totalMonths = Math.floor(svc.y * 12 + svc.m + svc.d / 30 + sickMonths)
  return { y: Math.floor(totalMonths / 12), m: totalMonths % 12, years: totalMonths / 12, sickMonths }
}

// Is an immediate UNREDUCED annuity available on this date?
function unreducedOn(system, age, yos, mra) {
  if (system === 'csrs') return (age >= 55 && yos >= 30) || (age >= 60 && yos >= 20) || (age >= 62 && yos >= 5)
  if (system === 'special') return yos >= 25 || (age >= 50 && yos >= 20) || (age >= 62 && yos >= 5) || (age >= 60 && yos >= 20) || (age >= mra && yos >= 30)
  return (age >= mra && yos >= 30) || (age >= 60 && yos >= 20) || (age >= 62 && yos >= 5)
}

/**
 * Classify the retirement on the planned date.
 * Returns { type, label, reductionPct, supplementEligible, postponeDate, earliestUnreduced, notes[] }
 *  type: 'immediate' | 'mra10' | 'deferred' | 'not-eligible'
 */
export function classifyRetirement({ system = 'fers', birth, scd, retire }) {
  const out = { type: 'not-eligible', label: '', reductionPct: 0, supplementEligible: false, postponeDate: null, earliestUnreduced: null, notes: [] }
  if (!parseISO(birth) || !parseISO(scd) || !parseISO(retire)) return out
  const age = ymdToYears(diffYMD(birth, retire))
  const svc = serviceAt(scd, retire)
  const yos = ymdToYears(svc)
  const birthYear = parseISO(birth).y
  const mra = mraForBirthYear(birthYear)
  const mraD = mraDate(birth)

  // Earliest unreduced date if they keep working (search month by month to age 70).
  for (let i = 0; i <= 12 * 25; i++) {
    const d = addMonths(retire, i)
    const a = ymdToYears(diffYMD(birth, d)), s = ymdToYears(serviceAt(scd, d))
    if (unreducedOn(system, a, s, mra)) { out.earliestUnreduced = d; break }
  }

  if (unreducedOn(system, age, yos, mra)) {
    out.type = 'immediate'
    out.label = 'Immediate, unreduced annuity'
    if (system !== 'csrs' && age < 62) {
      out.supplementEligible = system === 'special' ? true : ((yos >= 30 && age >= mra) || (yos >= 20 && age >= 60))
    }
    return out
  }
  if (system !== 'csrs' && age >= mra && yos >= 10) {
    // MRA+10: reduced 5% per year (5/12 of 1% per month) under 62, or postpone.
    // OPM counts age in full years and months (days dropped).
    const ageYM = diffYMD(birth, retire)
    const monthsUnder62 = Math.max(0, 62 * 12 - (ageYM.y * 12 + ageYM.m))
    out.type = 'mra10'
    out.label = 'MRA+10 (early) annuity'
    out.reductionPct = Math.round(monthsUnder62 * (5 / 12) * 100) / 100
    out.postponeDate = addYears(birth, yos >= 20 ? 60 : 62)
    out.postponeAge = yos >= 20 ? 60 : 62
    out.notes.push('No FERS Supplement with an MRA+10 annuity.')
    return out
  }
  if (yos >= 5) {
    out.type = 'deferred'
    out.label = 'Deferred annuity (separating before retirement eligibility)'
    out.postponeDate = system === 'csrs' ? addYears(birth, 62) : (yos >= 10 ? mraD : addYears(birth, 62))
    out.notes.push('A deferred annuity does not carry FEHB or FEGLI into retirement.')
    return out
  }
  out.label = 'Not yet eligible for an annuity (under 5 years of service)'
  return out
}

// Medicare Part B enrollment window relative to retirement.
export function partBWindow(birth, retire) {
  if (!parseISO(birth) || !parseISO(retire)) return null
  const d65 = addYears(birth, 65)
  if (cmp(retire, d65) <= 0) {
    // Still employed at 65 (or retiring at 65): initial window around the 65th birthday month.
    const p = parseISO(d65)
    const start = toISO({ ...parseISO(addMonths(toISO({ y: p.y, m: p.m, d: 1 }), -3)) })
    const endM = parseISO(addMonths(toISO({ y: p.y, m: p.m, d: 1 }), 3))
    const end = toISO({ y: endM.y, m: endM.m, d: daysInMonth(endM.y, endM.m) })
    return { kind: 'iep', start, end, d65, note: 'Initial enrollment window around your 65th birthday. If you are still working with FEHB at 65, you can also wait and use the 8-month window after you retire.' }
  }
  // Retiring after 65 while covered by current-employment FEHB: 8-month SEP.
  const e = parseISO(addMonths(retire, 8))
  const end = toISO({ y: e.y, m: e.m, d: daysInMonth(e.y, e.m) })
  return { kind: 'sep', start: retire, end, d65, note: '8-month Special Enrollment Period after your job (and job-based coverage) ends. After that, only January–March with a permanent late penalty.' }
}

// Annual leave use-or-lose: the leave year ends on the Saturday ending the
// first full pay period of the new year. 2026 leave year ends 1/9/2027;
// scheduling deadline 11/28/2026 (OPM fact sheet).
export const LEAVE_YEAR = { end: '2027-01-09', scheduleBy: '2026-11-28', label: '2026' }
