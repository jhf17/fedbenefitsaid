/**
 * 2026 General Schedule (GS) pay data — base rates + locality percentages.
 *
 * Effective the first day of the first applicable pay period beginning on or
 * after January 1, 2026 (January 11, 2026 for most agencies). Incorporates
 * the 1.0% across-the-board General Schedule increase. Locality pay
 * PERCENTAGES are unchanged from 2025 (the 2026 raise included no locality
 * component), so each locality table simply applies its existing percentage
 * to the new base rates.
 *
 * Official OPM sources:
 *   Base table (2026-GS):
 *     https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/salary-tables/26Tables/html/GS.aspx
 *     https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/salary-tables/pdf/2026/GS.pdf
 *   2026 salary tables index (per-locality tables, each stating its percentage):
 *     https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2026/general-schedule/
 *   Locality pay area definitions:
 *     https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2026/locality-pay-area-definitions/
 *   Cross-checked against generalschedule.org, federalpay.org, fedweek.com,
 *   fedsmith.com and fedtools.com (all republish the OPM tables).
 *
 * Scope notes:
 *   - LEO special base rates (GS-3..GS-10 law-enforcement tables), wildland
 *     firefighter (GW) tables, and occupation-specific SPECIAL RATE tables
 *     are NOT included — out of scope for this file.
 *   - Locality-adjusted GS pay is capped by law at Executive Schedule
 *     Level IV ($197,200 in 2026). gsSalary2026() does NOT apply the cap;
 *     callers displaying GS-14/15 pay in high-cost areas should clamp to
 *     GS_PAY_CAP_2026 if they want the payable amount.
 *
 * This file is the single source of truth for 2026 GS pay math. Do not
 * hardcode GS rates elsewhere in the codebase.
 */

/**
 * 2026 GS base pay — ANNUAL rates in whole dollars, before locality.
 * Keyed by grade (1–15); each array holds steps 1–10 in order.
 * GS-1 and GS-2 have irregular step increments (historical quirk of the
 * statutory table); GS-3 through GS-15 step up by a fixed within-grade
 * increment ($924 at GS-3 up to $4,213 at GS-15).
 */
export const GS_BASE_2026 = {
  1:  [22584, 23341, 24092, 24840, 25589, 26028, 26771, 27519, 27550, 28248],
  2:  [25393, 25997, 26839, 27550, 27858, 28677, 29496, 30315, 31134, 31953],
  3:  [27708, 28632, 29556, 30480, 31404, 32328, 33252, 34176, 35100, 36024],
  4:  [31103, 32140, 33177, 34214, 35251, 36288, 37325, 38362, 39399, 40436],
  5:  [34799, 35959, 37119, 38279, 39439, 40599, 41759, 42919, 44079, 45239],
  6:  [38791, 40084, 41377, 42670, 43963, 45256, 46549, 47842, 49135, 50428],
  7:  [43106, 44543, 45980, 47417, 48854, 50291, 51728, 53165, 54602, 56039],
  8:  [47738, 49329, 50920, 52511, 54102, 55693, 57284, 58875, 60466, 62057],
  9:  [52727, 54485, 56243, 58001, 59759, 61517, 63275, 65033, 66791, 68549],
  10: [58064, 59999, 61934, 63869, 65804, 67739, 69674, 71609, 73544, 75479],
  11: [63795, 65922, 68049, 70176, 72303, 74430, 76557, 78684, 80811, 82938],
  12: [76463, 79012, 81561, 84110, 86659, 89208, 91757, 94306, 96855, 99404],
  13: [90925, 93956, 96987, 100018, 103049, 106080, 109111, 112142, 115173, 118204],
  14: [107446, 111028, 114610, 118192, 121774, 125356, 128938, 132520, 136102, 139684],
  15: [126384, 130597, 134810, 139023, 143236, 147449, 151662, 155875, 160088, 164301],
}

/**
 * All 58 official 2026 locality pay areas (percentages unchanged from 2025).
 * `id` is OPM's salary-table code (e.g. table "2026-DCB"), `pct` is the
 * locality payment as published in each OPM table's title — e.g. 33.94
 * means base × 1.3394. Range: 17.06% (Rest of U.S.) to 46.34% (San
 * Jose–San Francisco). Alphabetical, with Rest of U.S. last as the
 * catch-all for duty stations outside every defined area.
 */
export const LOCALITY_2026 = [
  { id: 'AK',  name: 'Alaska', pct: 32.36 },
  { id: 'AL',  name: 'Albany–Schenectady, NY–MA', pct: 20.77 },
  { id: 'AQ',  name: 'Albuquerque–Santa Fe–Las Vegas, NM', pct: 18.33 },
  { id: 'ATL', name: 'Atlanta–Athens–Sandy Springs, GA–AL', pct: 23.79 },
  { id: 'AU',  name: 'Austin–Round Rock–Georgetown, TX', pct: 20.35 },
  { id: 'BH',  name: 'Birmingham–Hoover–Talladega, AL', pct: 18.24 },
  { id: 'BOS', name: 'Boston–Worcester–Providence, MA–RI–NH–CT–ME–VT', pct: 32.58 },
  { id: 'BU',  name: 'Buffalo–Cheektowaga–Olean, NY', pct: 22.41 },
  { id: 'BN',  name: 'Burlington–South Burlington–Barre, VT', pct: 19.45 },
  { id: 'CT',  name: 'Charlotte–Concord, NC–SC', pct: 19.67 },
  { id: 'CHI', name: 'Chicago–Naperville, IL–IN–WI', pct: 30.86 },
  { id: 'CIN', name: 'Cincinnati–Wilmington–Maysville, OH–KY–IN', pct: 21.93 },
  { id: 'CLE', name: 'Cleveland–Akron–Canton, OH–PA', pct: 22.23 },
  { id: 'CS',  name: 'Colorado Springs, CO', pct: 20.15 },
  { id: 'COL', name: 'Columbus–Marion–Zanesville, OH', pct: 22.15 },
  { id: 'CC',  name: 'Corpus Christi–Kingsville–Alice, TX', pct: 17.63 },
  { id: 'DFW', name: 'Dallas–Fort Worth, TX–OK', pct: 27.26 },
  { id: 'DV',  name: 'Davenport–Moline, IA–IL', pct: 18.93 },
  { id: 'DAY', name: 'Dayton–Springfield–Kettering, OH', pct: 21.42 },
  { id: 'DEN', name: 'Denver–Aurora, CO', pct: 30.52 },
  { id: 'DM',  name: 'Des Moines–Ames–West Des Moines, IA', pct: 18.01 },
  { id: 'DET', name: 'Detroit–Warren–Ann Arbor, MI', pct: 29.12 },
  { id: 'FN',  name: 'Fresno–Madera–Hanford, CA', pct: 17.65 },
  { id: 'HB',  name: 'Harrisburg–Lebanon, PA', pct: 19.43 },
  { id: 'HAR', name: 'Hartford–East Hartford, CT–MA', pct: 32.08 },
  { id: 'HI',  name: 'Hawaii', pct: 22.21 },
  { id: 'HOU', name: 'Houston–The Woodlands, TX', pct: 35.00 },
  { id: 'HNT', name: 'Huntsville–Decatur, AL–TN', pct: 21.91 },
  { id: 'IND', name: 'Indianapolis–Carmel–Muncie, IN', pct: 18.15 },
  { id: 'KC',  name: 'Kansas City–Overland Park, MO–KS', pct: 18.97 },
  { id: 'LR',  name: 'Laredo, TX', pct: 21.59 },
  { id: 'LV',  name: 'Las Vegas–Henderson, NV–AZ', pct: 19.57 },
  { id: 'LA',  name: 'Los Angeles–Long Beach, CA', pct: 36.47 },
  { id: 'MFL', name: 'Miami–Port St. Lucie–Fort Lauderdale, FL', pct: 24.67 },
  { id: 'MIL', name: 'Milwaukee–Racine–Waukesha, WI', pct: 22.42 },
  { id: 'MSP', name: 'Minneapolis–St. Paul, MN–WI', pct: 27.62 },
  { id: 'NY',  name: 'New York–Newark, NY–NJ–CT–PA', pct: 37.95 },
  { id: 'OM',  name: 'Omaha–Council Bluffs–Fremont, NE–IA', pct: 18.23 },
  { id: 'PB',  name: 'Palm Bay–Melbourne–Titusville, FL', pct: 17.93 },
  { id: 'PHL', name: 'Philadelphia–Reading–Camden, PA–NJ–DE–MD', pct: 28.99 },
  { id: 'PX',  name: 'Phoenix–Mesa, AZ', pct: 22.45 },
  { id: 'PIT', name: 'Pittsburgh–New Castle–Weirton, PA–OH–WV', pct: 21.03 },
  { id: 'POR', name: 'Portland–Vancouver–Salem, OR–WA', pct: 26.13 },
  { id: 'RA',  name: 'Raleigh–Durham–Cary, NC', pct: 22.24 },
  { id: 'RN',  name: 'Reno–Fernley, NV', pct: 17.52 },
  { id: 'RCH', name: 'Richmond, VA', pct: 22.28 },
  { id: 'RT',  name: 'Rochester–Batavia–Seneca Falls, NY', pct: 17.88 },
  { id: 'SAC', name: 'Sacramento–Roseville, CA–NV', pct: 29.76 },
  { id: 'SO',  name: 'San Antonio–New Braunfels–Pearsall, TX', pct: 18.78 },
  { id: 'SD',  name: 'San Diego–Chula Vista–Carlsbad, CA', pct: 33.72 },
  { id: 'SF',  name: 'San Jose–San Francisco–Oakland, CA', pct: 46.34 },
  { id: 'SEA', name: 'Seattle–Tacoma, WA', pct: 31.57 },
  { id: 'SN',  name: 'Spokane–Spokane Valley–Coeur d\'Alene, WA–ID', pct: 17.67 },
  { id: 'SL',  name: 'St. Louis–St. Charles–Farmington, MO–IL', pct: 20.03 },
  { id: 'TU',  name: 'Tucson–Nogales, AZ', pct: 19.28 },
  { id: 'VB',  name: 'Virginia Beach–Norfolk, VA–NC', pct: 18.80 },
  { id: 'DCB', name: 'Washington–Baltimore–Arlington, DC–MD–VA–WV–PA', pct: 33.94 },
  { id: 'RUS', name: 'Rest of U.S.', pct: 17.06 },
]

/** Official OPM page for the 2026 GS tables (base + every locality). */
export const GS_PAY_SOURCE_URL = 'https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2026/general-schedule/'

/**
 * 2026 cap on locality-adjusted GS annual pay: Executive Schedule Level IV.
 * Only bites at GS-15 upper steps (and a few GS-14 step 10s) in the
 * highest-percentage areas. gsSalary2026() does not apply it.
 */
export const GS_PAY_CAP_2026 = 197200

/**
 * Locality-adjusted 2026 annual salary in whole dollars.
 *
 * @param {number} grade       — GS grade, 1–15 (clamped)
 * @param {number} step        — step, 1–10 (clamped)
 * @param {number} localityPct — locality percentage, e.g. 33.94 for
 *                               Washington–Baltimore (LOCALITY_2026[i].pct).
 *                               Omit / 0 for the unadjusted base rate.
 *
 * Rounding note: OPM computes each locality cell by multiplying the base
 * rate by (1 + pct/100) and rounding to the nearest whole dollar. We use
 * the same simple Math.round here; spot checks against published OPM
 * locality tables match exactly, but this helper is a simple-rounding
 * reconstruction, not a copy of every locality table.
 */
export function gsSalary2026(grade, step, localityPct = 0) {
  const g = Math.min(15, Math.max(1, Math.round(Number(grade) || 1)))
  const s = Math.min(10, Math.max(1, Math.round(Number(step) || 1)))
  const pct = Number(localityPct) || 0
  return Math.round(GS_BASE_2026[g][s - 1] * (1 + pct / 100))
}
