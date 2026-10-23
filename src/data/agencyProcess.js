// How each agency's employees start retirement (researched 10/2026 from OPM,
// agency, NFC and DoD benefits-center pages). Keep text short: it prints on
// the client PDF. Lead times are in days before the retirement date.
export const GENERAL_PROCESS = {
  application: "Applications are filed online through OPM's Online Retirement Application (ORA). HR starts it and emails you an invitation; you sign in with Login.gov using a personal email.",
  firstPay: 'OPM aims to start interim pay within days of retirement when the package is complete; interim payments are typically 60–80% of your estimate until OPM finalizes it (recently about 2–3 months).',
  leave: 'Unused annual leave is paid as a lump sum after your final check; unused sick leave becomes service credit.',
}

export const AGENCIES = {
  va: {
    name: 'Department of Veterans Affairs',
    portal: 'GRB Platform (Government Retirement & Benefits) for estimates, plus your facility HR benefits coordinator',
    contact: 'Your VA facility HR office / assigned retirement specialist',
    payroll: 'DFAS myPay (TSP, FEHB and payroll changes)',
    leadDays: 90,
    tip: 'VA payroll runs through DFAS, so your final pay and leave payout come from DFAS before the package goes to OPM.',
  },
  usps: {
    name: 'U.S. Postal Service',
    portal: 'LiteBlue > My HR > Planning for Retirement > eRetire',
    contact: 'HR Shared Service Center (HRSSC), 877-477-3273, option 5',
    payroll: 'PostalEASE on LiteBlue (TSP); health enrollment through PSHB',
    leadDays: 180,
    tip: 'Optional retirements are online-only (ORA) since 1/1/2026. After HRSSC confirms eligibility, OPM emails your ORA link within about 3 business days.',
  },
  dod: {
    name: 'Department of Defense (civilian)',
    portal: 'GRB Platform through your benefits center (Army ABC-C, Navy Benefits Center, Air Force AFPC BEST)',
    contact: 'Army ABC-C 877-276-9287 · Navy 888-320-2917 · Air Force 800-525-0102 opt. 2 · DLA 877-692-0276',
    payroll: 'DFAS myPay (TSP); benefits elections in GRB',
    leadDays: 90,
    tip: 'DoD benefits centers ask for your application at least 90 days before your retirement date.',
  },
  usda: {
    name: 'Department of Agriculture',
    portal: 'NFC Employee Personal Page (benefits statement and annuity estimate)',
    contact: "Your USDA agency's servicing HR office",
    payroll: 'NFC Employee Personal Page (TSP and benefits)',
    leadDays: 90,
    tip: 'NFC needs your separation action and a final timecard before your package can go to OPM.',
  },
  dhs: {
    name: 'Department of Homeland Security',
    portal: "Your component's HR office (CBP, TSA and Coast Guard use NFC's Employee Personal Page)",
    contact: "Your component's servicing HR/benefits office",
    payroll: 'NFC Employee Personal Page (NFC-payrolled components)',
    leadDays: 90,
    tip: 'Each DHS component runs its own HR, so confirm its lead time early.',
  },
  ssa: {
    name: 'Social Security Administration',
    portal: 'Your SSA HR / Benefits & Payroll Team',
    contact: 'SSA servicing HR office',
    payroll: 'Employee Express (TSP and benefits changes)',
    leadDays: 90,
    tip: '',
  },
  irs: {
    name: 'IRS / Treasury',
    portal: 'HRConnect (records, SF-50s) and NFC Employee Personal Page',
    contact: 'IRS Employee Resource Center, 866-743-5748, option 1',
    payroll: 'NFC Employee Personal Page (TSP)',
    leadDays: 90,
    tip: '',
  },
  other: {
    name: 'Your agency',
    portal: 'Your agency HR/benefits office (many use GRB, Employee Express or NFC EPP for estimates)',
    contact: 'Your agency HR/benefits office',
    payroll: "Your payroll provider's self-service site",
    leadDays: 90,
    tip: '',
  },
}

// Guess the agency key from the free-text agency field.
export function agencyKeyFromText(t = '') {
  const s = String(t).toLowerCase()
  if (/veteran|\bva\b|vha|vba/.test(s)) return 'va'
  if (/postal|usps/.test(s)) return 'usps'
  if (/defense|army|navy|air force|\bdod\b|\bdow\b|dla|marine/.test(s)) return 'dod'
  if (/agricult|usda|forest service|nrcs/.test(s)) return 'usda'
  if (/homeland|dhs|tsa|cbp|ice|fema|coast guard|uscis/.test(s)) return 'dhs'
  if (/social security|\bssa\b/.test(s)) return 'ssa'
  if (/irs|internal revenue|treasury/.test(s)) return 'irs'
  return 'other'
}
