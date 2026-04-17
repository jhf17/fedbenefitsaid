import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

/**
 * T2.8 — "When can I retire?" inline eligibility widget.
 *
 * Replaces the static chat preview card on the landing page. User enters:
 *   - birth year (or current age — birth year is more precise)
 *   - FERS/CSRS hire year (or years of service)
 *   - retirement system (FERS / FERS-RAE/FRAE / CSRS)
 *
 * Output: a dated milestone timeline showing every eligibility milestone
 * they'll hit — MRA, MRA+10 (reduced), MRA+30 (immediate unreduced),
 * age 60 + 20 YOS, age 62 + 5 YOS, age 62 + 20 YOS (1.1% multiplier) — with
 * the calendar year, age, and a note on FERS Supplement applicability.
 *
 * Math: ages use integer birth year, so dates are year-level precision (the
 * widget is illustrative — the exact calendar date depends on birth month /
 * hire month, which we don't collect). MRA follows OPM's tiered table.
 */

const NAVY = '#0f172a'
const NAVY_MID = '#1e3a5f'
const MAROON = '#7b1c2e'
const GOLD = '#b8860b'
const CREAM = '#faf9f6'
const BORDER = '#cbd5e1'
const SUBTLE = '#475569'
const MUTED = '#64748b'

const FONT_SERIF = "'Merriweather', Georgia, 'Times New Roman', serif"
const FONT_SANS = "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"

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

// Given birth year + hire year + current year, compute each milestone date
function buildMilestones({ birthYear, hireYear, system }) {
  const now = new Date().getFullYear()
  const mra = mraForBirthYear(birthYear)

  // Helper: the year/age at which the user hits a given age requirement.
  const atAge = (age) => {
    const yearHit = Math.ceil(birthYear + age)
    return { age, year: yearHit, reached: now >= yearHit }
  }

  // Helper: the year at which the user hits a years-of-service threshold.
  const atYos = (yos) => {
    const yearHit = hireYear + yos
    return { yos, year: yearHit, reached: now >= yearHit }
  }

  const stones = []

  if (system === 'csrs') {
    // CSRS: age 55 with 30 yrs, age 60 with 20 yrs, age 62 with 5 yrs
    const a55 = atAge(55)
    const y30 = atYos(30)
    const ageAt30 = Math.max(55, birthYear ? 30 + hireYear - birthYear : 55)
    stones.push({
      title: 'CSRS Immediate Unreduced (age 55 + 30 yrs)',
      year: Math.max(a55.year, y30.year),
      age: Math.max(55, ageAt30),
      eligibilityNote: 'Full unreduced annuity. No FERS Supplement for CSRS retirees.',
      supplementEligible: false,
    })
    stones.push({
      title: 'CSRS Immediate Unreduced (age 60 + 20 yrs)',
      year: Math.max(atAge(60).year, atYos(20).year),
      age: Math.max(60, 20 + hireYear - birthYear),
      eligibilityNote: 'Full unreduced annuity.',
      supplementEligible: false,
    })
    stones.push({
      title: 'CSRS Immediate Unreduced (age 62 + 5 yrs)',
      year: Math.max(atAge(62).year, atYos(5).year),
      age: Math.max(62, 5 + hireYear - birthYear),
      eligibilityNote: 'Full unreduced annuity.',
      supplementEligible: false,
    })
    return stones.sort((a, b) => a.year - b.year)
  }

  // FERS / FERS-RAE / FERS-FRAE share the same eligibility rules
  const mraYear = Math.ceil(birthYear + mra)
  const mraAge = mra

  // MRA+10 Reduced — available when the employee hits BOTH MRA and 10 YOS
  const mra10Year = Math.max(mraYear, hireYear + 10)
  const mra10Age = Math.max(mraAge, 10 + hireYear - birthYear)
  stones.push({
    title: 'MRA + 10 Reduced',
    year: mra10Year,
    age: mra10Age,
    eligibilityNote: 'Annuity reduced 5% per year under 62 (or under 60 if you have 20+ YOS). No FERS Supplement. Can be avoided by postponing.',
    supplementEligible: false,
  })

  // MRA+30 Immediate Unreduced
  const mra30Year = Math.max(mraYear, hireYear + 30)
  const mra30Age = Math.max(mraAge, 30 + hireYear - birthYear)
  stones.push({
    title: 'MRA + 30 Immediate Unreduced',
    year: mra30Year,
    age: mra30Age,
    eligibilityNote: 'Full unreduced annuity. FERS Supplement paid until age 62.',
    supplementEligible: true,
  })

  // Age 60 + 20 YOS Immediate Unreduced
  const a60_20Year = Math.max(birthYear + 60, hireYear + 20)
  const a60_20Age = Math.max(60, 20 + hireYear - birthYear)
  stones.push({
    title: 'Age 60 + 20 Immediate Unreduced',
    year: a60_20Year,
    age: a60_20Age,
    eligibilityNote: 'Full unreduced annuity. FERS Supplement paid until age 62.',
    supplementEligible: true,
  })

  // Age 62 + 5 YOS Immediate Unreduced (1.0% multiplier)
  const a62_5Year = Math.max(birthYear + 62, hireYear + 5)
  const a62_5Age = Math.max(62, 5 + hireYear - birthYear)
  stones.push({
    title: 'Age 62 + 5 Immediate Unreduced',
    year: a62_5Year,
    age: a62_5Age,
    eligibilityNote: 'Full unreduced annuity. No FERS Supplement — you\'re already SS-eligible.',
    supplementEligible: false,
  })

  // Age 62 + 20 YOS — 1.1% multiplier kicker
  const a62_20Year = Math.max(birthYear + 62, hireYear + 20)
  const a62_20Age = Math.max(62, 20 + hireYear - birthYear)
  stones.push({
    title: 'Age 62 + 20 · 1.1% multiplier',
    year: a62_20Year,
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
  const [system, setSystem] = useState('fers')

  const nowYear = new Date().getFullYear()
  const birthNum = Number(birthYear)
  const hireNum = Number(hireYear)

  const valid = birthNum >= 1935 && birthNum <= nowYear - 18 && hireNum >= 1960 && hireNum <= nowYear && hireNum >= birthNum + 18

  const milestones = useMemo(() => valid ? buildMilestones({ birthYear: birthNum, hireYear: hireNum, system }) : [], [valid, birthNum, hireNum, system])

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
          Three inputs, a dated timeline of every retirement milestone you'll hit, and whether each one comes with the FERS Supplement. Change the numbers — the timeline updates instantly.
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
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: NAVY, fontFamily: fontSans, display: 'block', marginBottom: 16 }}>
          Retirement system
          <select value={system} onChange={e => setSystem(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
            <option value="fers">FERS (hired 1987–2012)</option>
            <option value="frae">FERS-RAE / FERS-FRAE (hired 2013+)</option>
            <option value="csrs">CSRS (hired before 1987)</option>
          </select>
        </label>

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
              const reached = nowYear >= m.year
              return (
                <li key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i === milestones.length - 1 ? 'none' : `1px dashed ${BORDER}` }}>
                  <div style={{ flexShrink: 0, width: 60, textAlign: 'right', fontFamily: fontSerif, fontWeight: 900, fontSize: '1rem', color: reached ? MUTED : NAVY }}>
                    {m.year}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: reached ? MUTED : NAVY, textDecoration: reached ? 'line-through' : 'none', fontFamily: fontSans }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: reached ? MUTED : SUBTLE, marginTop: 2 }}>
                      Age {formatAge(m.age)}
                      {m.supplementEligible && (
                        <span style={{ marginLeft: 8, padding: '1px 6px', background: 'rgba(184,134,11,0.15)', color: GOLD, borderRadius: 4, fontWeight: 700, fontSize: '0.72rem' }}>+ FERS Supplement</span>
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
