import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

/**
 * "When can I retire?" inline eligibility widget.
 *
 * User enters birth year and federal hire year. We derive the retirement
 * system from the hire year (CSRS pre-1987, FERS otherwise — RAE/FRAE
 * variants share FERS eligibility rules), and emit a dated milestone
 * timeline. FERS Supplement eligibility is computed per-milestone based on
 * the user's age at that milestone (paid only if retirement age < 62).
 *
 * Year precision: ages use integer birth year, so dates are year-level
 * (exact calendar date depends on birth month / hire month, which we
 * don't collect). MRA follows OPM's tiered table.
 */

const NAVY = '#142a1d'
const MAROON = '#b08d5a'
const GOLD = '#b8860b'
const CREAM = '#faf6ef'
const BORDER = '#cbd5e1'
const SUBTLE = '#475569'
const MUTED = '#64748b'

const FONT_SERIF = "'Fraunces', 'Source Serif 4', Georgia, 'Times New Roman', serif"
const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

// Retirement system inferred from federal hire year. RAE (2013) and
// FRAE (2014+) differ from FERS in contribution rates only — eligibility
// rules are identical, so we collapse them under "FERS" for this widget.
function systemForHireYear(hy) {
  if (hy <= 1983) return { code: 'csrs', label: 'CSRS' }
  if (hy <= 1986) return { code: 'csrs', label: 'CSRS-Offset' }
  if (hy <= 2012) return { code: 'fers', label: 'FERS' }
  if (hy === 2013) return { code: 'fers', label: 'FERS-RAE' }
  return { code: 'fers', label: 'FERS-FRAE' }
}

// OPM MRA table — born 1947 or earlier: 55; 1948–1952: 55 + 2mo per year;
// 1953–1964: 56; 1965–1969: 56 + 2mo per year; 1970+: 57.
// https://www.opm.gov/retirement-center/fers-information/eligibility/
function mraForBirthYear(by) {
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

function formatAge(a) {
  const years = Math.floor(a)
  const months = Math.round((a - years) * 12)
  if (months === 0) return `${years}`
  return `${years} yr ${months} mo`
}

// FERS Supplement is paid only if the retiree is under age 62 at separation.
// (Once age 62, they're SS-eligible and the Supplement stops.)
function supplementApplies(ageAtMilestone) {
  return ageAtMilestone < 62
}

// Given birth year + hire year, compute each milestone date.
// `system` is the code ('fers' | 'csrs') derived from hire year.
function buildMilestones({ birthYear, hireYear, system }) {
  const stones = []

  if (system === 'csrs') {
    // CSRS: age 55 + 30 YOS, age 60 + 20 YOS, age 62 + 5 YOS — all unreduced.
    // No FERS Supplement for CSRS at any age.
    const ageAt30Yos = 30 + hireYear - birthYear
    stones.push({
      title: 'CSRS Immediate Unreduced (age 55 + 30 yrs)',
      year: Math.max(birthYear + 55, hireYear + 30),
      age: Math.max(55, ageAt30Yos),
      eligibilityNote: 'Full unreduced annuity. CSRS retirees are not eligible for the FERS Supplement.',
      supplementEligible: false,
    })
    stones.push({
      title: 'CSRS Immediate Unreduced (age 60 + 20 yrs)',
      year: Math.max(birthYear + 60, hireYear + 20),
      age: Math.max(60, 20 + hireYear - birthYear),
      eligibilityNote: 'Full unreduced annuity.',
      supplementEligible: false,
    })
    stones.push({
      title: 'CSRS Immediate Unreduced (age 62 + 5 yrs)',
      year: Math.max(birthYear + 62, hireYear + 5),
      age: Math.max(62, 5 + hireYear - birthYear),
      eligibilityNote: 'Full unreduced annuity.',
      supplementEligible: false,
    })
    return stones.sort((a, b) => a.year - b.year)
  }

  // FERS (and RAE / FRAE — same eligibility rules)
  const mra = mraForBirthYear(birthYear)
  const mraYear = Math.ceil(birthYear + mra)

  // MRA+10 Reduced — available when both MRA and 10 YOS are met.
  const mra10Age = Math.max(mra, 10 + hireYear - birthYear)
  stones.push({
    title: 'MRA + 10 Reduced',
    year: Math.max(mraYear, hireYear + 10),
    age: mra10Age,
    eligibilityNote: 'Immediate annuity reduced 5% per year under age 62. No FERS Supplement. Postponing the annuity start avoids the penalty.',
    supplementEligible: false,
  })

  // MRA+30 Immediate Unreduced
  const mra30Age = Math.max(mra, 30 + hireYear - birthYear)
  stones.push({
    title: 'MRA + 30 Immediate Unreduced',
    year: Math.max(mraYear, hireYear + 30),
    age: mra30Age,
    eligibilityNote: supplementApplies(mra30Age)
      ? 'Full unreduced annuity. FERS Supplement paid until age 62.'
      : 'Full unreduced annuity. By the time you hit 30 YOS you\'re past 62, so no FERS Supplement applies.',
    supplementEligible: supplementApplies(mra30Age),
  })

  // Age 60 + 20 YOS Immediate Unreduced
  const a60_20Age = Math.max(60, 20 + hireYear - birthYear)
  stones.push({
    title: 'Age 60 + 20 Immediate Unreduced',
    year: Math.max(birthYear + 60, hireYear + 20),
    age: a60_20Age,
    eligibilityNote: supplementApplies(a60_20Age)
      ? 'Full unreduced annuity. FERS Supplement paid until age 62.'
      : 'Full unreduced annuity. You\'re already 62+, so no FERS Supplement.',
    supplementEligible: supplementApplies(a60_20Age),
  })

  // Age 62 + 5 YOS Immediate Unreduced (1.0% multiplier)
  const a62_5Age = Math.max(62, 5 + hireYear - birthYear)
  stones.push({
    title: 'Age 62 + 5 Immediate Unreduced',
    year: Math.max(birthYear + 62, hireYear + 5),
    age: a62_5Age,
    eligibilityNote: 'Full unreduced annuity. No FERS Supplement — you\'re already SS-eligible.',
    supplementEligible: false,
  })

  // Age 62 + 20 YOS — 1.1% multiplier kicker (10% higher pension for life)
  const a62_20Age = Math.max(62, 20 + hireYear - birthYear)
  stones.push({
    title: 'Age 62 + 20 · 1.1% multiplier',
    year: Math.max(birthYear + 62, hireYear + 20),
    age: a62_20Age,
    eligibilityNote: '10% higher annuity for life vs the 1.0% formula. Often worth working an extra year for.',
    supplementEligible: false,
  })

  return stones.sort((a, b) => a.year - b.year || a.age - b.age)
}

export default function RetirementEligibilityWidget({ isMobile, fontSerifOverride, fontSansOverride }) {
  const fontSerif = fontSerifOverride || FONT_SERIF
  const fontSans = fontSansOverride || FONT_SANS

  const [birthYear, setBirthYear] = useState('')
  const [hireYear, setHireYear] = useState('')

  const nowYear = new Date().getFullYear()
  const birthNum = Number(birthYear)
  const hireNum = Number(hireYear)

  const valid = birthNum >= 1935 && birthNum <= nowYear - 18 && hireNum >= 1960 && hireNum <= nowYear && hireNum >= birthNum + 18

  const detectedSystem = valid ? systemForHireYear(hireNum) : null

  const milestones = useMemo(
    () => valid ? buildMilestones({ birthYear: birthNum, hireYear: hireNum, system: detectedSystem.code }) : [],
    [valid, birthNum, hireNum, detectedSystem]
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 28 : 56, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, display: 'inline-block', padding: '6px 14px', borderRadius: 6, color: GOLD, background: 'rgba(184,134,11,0.08)' }}>
          When can I retire?
        </div>
        <h2 style={{ fontFamily: fontSerif, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: 700, lineHeight: 1.18, letterSpacing: '-0.01em', marginBottom: 20, color: NAVY }}>
          Your eligibility,<br />by the year.
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: SUBTLE, marginBottom: 28, maxWidth: 480 }}>
          Two inputs, a dated timeline of every retirement milestone you'll hit, and whether each one comes with the FERS Supplement. Change the numbers — the timeline updates instantly.
        </p>
        <Link to="/assessment" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', color: MAROON }}>
          Run the full assessment →
        </Link>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 20, padding: isMobile ? '22px 18px' : 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: NAVY, fontFamily: fontSans }}>
            Birth year
            <input type="number" inputMode="numeric" min="1935" max={nowYear - 18} value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="e.g. 1972" style={inputStyle} />
          </label>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: NAVY, fontFamily: fontSans }}>
            Federal hire year
            <input type="number" inputMode="numeric" min="1960" max={nowYear} value={hireYear} onChange={e => setHireYear(e.target.value)} placeholder="e.g. 2008" style={inputStyle} />
          </label>
        </div>

        {detectedSystem && (
          <div style={{ fontSize: '0.78rem', color: MUTED, marginBottom: 16, padding: '8px 12px', background: CREAM, borderRadius: 8, fontFamily: fontSans }}>
            Retirement system: <strong style={{ color: NAVY }}>{detectedSystem.label}</strong>
            <span style={{ marginLeft: 6, color: MUTED }}>· derived from your hire year</span>
          </div>
        )}

        {!valid ? (
          <div style={{ padding: 16, background: CREAM, borderRadius: 10, color: MUTED, fontSize: '0.88rem', textAlign: 'center' }}>
            Fill in your birth year and federal hire year to see your milestone timeline.
          </div>
        ) : milestones.length === 0 ? (
          <div style={{ padding: 16, background: CREAM, borderRadius: 10, color: MUTED, fontSize: '0.88rem' }}>
            No milestones computed.
          </div>
        ) : (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
            {milestones.map((m, i) => {
              const eligibleNow = nowYear >= m.year
              return (
                <li key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i === milestones.length - 1 ? 'none' : `1px dashed ${BORDER}` }}>
                  <div style={{ flexShrink: 0, width: 60, textAlign: 'right', fontFamily: fontSerif, fontWeight: 900, fontSize: '1rem', color: NAVY }}>
                    {m.year}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: NAVY, fontFamily: fontSans }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: SUBTLE, marginTop: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                      <span>Age {formatAge(m.age)}</span>
                      {eligibleNow && (
                        <span style={{ padding: '1px 7px', background: 'rgba(74,107,90,0.15)', color: '#1f3d2c', borderRadius: 4, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.02em' }}>Eligible now</span>
                      )}
                      {m.supplementEligible && (
                        <span style={{ padding: '1px 6px', background: 'rgba(184,134,11,0.15)', color: GOLD, borderRadius: 4, fontWeight: 700, fontSize: '0.72rem' }}>+ FERS Supplement</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 3, lineHeight: 1.5 }}>{m.eligibilityNote}</div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        {valid && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}`, textAlign: 'center' }}>
            <Link to="/calculator" style={{ fontSize: '0.88rem', fontWeight: 700, color: MAROON, textDecoration: 'none' }}>
              Calculate your pension amount →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: 4,
  padding: '9px 12px',
  fontSize: '0.92rem',
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  boxSizing: 'border-box',
  fontFamily: FONT_SANS,
  color: NAVY,
  background: '#fff',
}
