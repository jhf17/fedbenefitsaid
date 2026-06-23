import { useMemo, useState } from 'react'
import { colors, fonts } from '../constants/theme'
import { GS_BASE_2026, LOCALITY_2026, GS_PAY_CAP_2026, GS_PAY_SOURCE_URL, gsSalary2026 } from '../data/gsPay2026'
import { formatCurrency } from '../lib/pensionCalc'

const FONT_SANS = fonts.sans

// Look up 2026 GS pay from grade + step + locality and hand it to the parent
// (e.g. to seed the High-3 field). This is an INPUT AID: it returns current
// 2026 basic pay, which is not the same as a true High-3 average — the helper
// says so explicitly rather than pretending otherwise.
export default function GsPayFinder({ onUse, useLabel = 'Use as my High-3 starting point' }) {
  const [open, setOpen] = useState(false)
  const [grade, setGrade] = useState(12)
  const [step, setStep] = useState(5)
  const [localityId, setLocalityId] = useState('RUS')

  const locality = useMemo(
    () => LOCALITY_2026.find((l) => l.id === localityId) || LOCALITY_2026[LOCALITY_2026.length - 1],
    [localityId]
  )

  const base = GS_BASE_2026[grade]?.[step - 1] || 0
  const uncapped = gsSalary2026(grade, step, locality.pct)
  const capped = Math.min(uncapped, GS_PAY_CAP_2026)
  const capHit = uncapped > GS_PAY_CAP_2026

  const selectStyle = {
    width: '100%',
    padding: '9px 10px',
    borderRadius: 8,
    border: `1px solid ${colors.primaryBorder || 'rgba(15,29,61,0.15)'}`,
    fontFamily: FONT_SANS,
    fontSize: '0.9rem',
    color: colors.charcoal,
    background: '#ffffff',
    appearance: 'auto',
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          marginTop: 6,
          fontFamily: FONT_SANS,
          fontSize: '0.84rem',
          fontWeight: 600,
          color: colors.brassDeep,
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          alignSelf: 'flex-start',
        }}
      >
        Don't know your number? Look it up by GS grade, step &amp; locality (2026 table) →
      </button>
    )
  }

  return (
    <div
      style={{
        marginTop: 10,
        padding: '14px 16px',
        background: colors.bone,
        border: `1px solid ${colors.primaryBorder || 'rgba(15,29,61,0.12)'}`,
        borderRadius: 10,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.brassDeep }}>
          2026 GS pay lookup
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: colors.slate500, fontSize: '0.8rem', cursor: 'pointer', fontFamily: FONT_SANS }}
        >
          Close ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
        <label style={{ display: 'grid', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: colors.slate700 }}>
          Grade
          <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} style={selectStyle}>
            {Object.keys(GS_BASE_2026).map((g) => (
              <option key={g} value={g}>GS-{g}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: colors.slate700 }}>
          Step
          <select value={step} onChange={(e) => setStep(Number(e.target.value))} style={selectStyle}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
              <option key={s} value={s}>Step {s}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: colors.slate700, gridColumn: '1 / -1' }}>
          Locality pay area
          <select value={localityId} onChange={(e) => setLocalityId(e.target.value)} style={selectStyle}>
            {LOCALITY_2026.map((l) => (
              <option key={l.id} value={l.id}>{l.name} — {l.pct.toFixed(2)}%</option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '10px 12px',
          background: '#ffffff',
          borderRadius: 8,
          border: `1px solid ${colors.primaryBorder || 'rgba(15,29,61,0.1)'}`,
        }}
      >
        <div>
          <div style={{ fontSize: '0.74rem', color: colors.slate500 }}>
            Base {formatCurrency(base)} + {locality.pct.toFixed(2)}% locality
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.pine, fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(capped)} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: colors.slate500 }}>/ yr (2026)</span>
          </div>
          {capHit && (
            <div style={{ fontSize: '0.72rem', color: colors.brassDeep }}>
              Capped at the {formatCurrency(GS_PAY_CAP_2026)} Executive Schedule Level IV limit.
            </div>
          )}
        </div>
        {onUse && (
          <button
            type="button"
            onClick={() => onUse(capped)}
            className="fma-btn fma-btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            {useLabel}
          </button>
        )}
      </div>

      <div style={{ fontSize: '0.74rem', lineHeight: 1.55, color: colors.slate500 }}>
        This is your <strong>current</strong> 2026 basic pay (base + locality), from the{' '}
        <a href={GS_PAY_SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: colors.brassDeep }}>official OPM tables</a>.
        Your true High-3 is the average of your highest 36 consecutive months — usually a touch below current pay if
        you've had recent raises. Use this as a starting point, then adjust.
      </div>
    </div>
  )
}
