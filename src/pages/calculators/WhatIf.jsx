import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/fma/Button'
import Seo from '../../components/Seo'
import { colors, fonts } from '../../constants/theme'
import { formatCurrency } from '../../lib/pensionCalc'
import { basicCoverageForSalary, monthlyPremium } from '../../data/fegliRates'
import { DATA_LAST_UPDATED } from '../../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const inputBox = {
  display: 'block',
  width: '100%',
  padding: '11px 14px',
  fontSize: '0.95rem',
  border: `1px solid ${colors.borderLight || '#cbd5e1'}`,
  borderRadius: 10,
  fontFamily: FONT_SANS,
  color: colors.charcoal,
  background: '#ffffff',
  marginTop: 6,
  appearance: 'auto',
}

const labelText = {
  fontSize: '0.84rem',
  fontWeight: 600,
  color: colors.pine,
  letterSpacing: '0.01em',
  display: 'block',
}

const helpText = {
  fontSize: '0.78rem',
  color: colors.slate500,
  marginTop: 6,
  lineHeight: 1.45,
}

const TABS = [
  { id: 'death', label: 'If I die', sub: 'FEGLI + FERS survivor + SS' },
  { id: 'disability', label: 'If I become disabled', sub: 'FERS disability formula' },
]

export default function WhatIf() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const [tab, setTab] = useState('death')

  // Shared inputs
  const [age, setAge] = useState(48)
  const [annualSalary, setAnnualSalary] = useState(95000)
  const [yearsOfService, setYearsOfService] = useState(15)
  const [hasSpouse, setHasSpouse] = useState(true)
  const [dependentChildren, setDependentChildren] = useState(2)

  // Death-specific
  const [basicOn, setBasicOn] = useState(true)
  const [optionAOn, setOptionAOn] = useState(false)
  const [optionBMult, setOptionBMult] = useState(1)
  const [optionCMult, setOptionCMult] = useState(0)
  const [survivorElection, setSurvivorElection] = useState('full') // full | partial | none
  const [ssSurvivorEstimate, setSsSurvivorEstimate] = useState(0)

  // Disability-specific
  const [ssdiEstimate, setSsdiEstimate] = useState(0)

  // ---- DEATH calculations ----
  const deathOutput = useMemo(() => {
    if (tab !== 'death') return null

    // FEGLI lump sum
    const bia = basicOn ? basicCoverageForSalary(annualSalary) : 0
    const optA = optionAOn ? 10000 : 0
    const optBCoverage = (Number(optionBMult) || 0) > 0 ? Math.ceil(Number(annualSalary || 0) / 1000) * 1000 * Number(optionBMult) : 0
    const optCSpouse = (Number(optionCMult) || 0) > 0 ? 5000 * Number(optionCMult) : 0
    const optCPerChild = (Number(optionCMult) || 0) > 0 ? 2500 * Number(optionCMult) : 0
    const fegliLumpSum = bia + optA + optBCoverage + optCSpouse + optCPerChild * Number(dependentChildren)

    // FERS survivor pension (rough)
    // Assumes high-3 ≈ current salary; actual high-3 will differ slightly.
    // Survivor pension: 50% of unreduced annuity (full election) or 25% (partial),
    // calculated at the date of death — roughly: annualSalary × yos × 0.01 × survivorPercent
    // Pre-retirement death-in-service: spouse gets 50% of "earned annuity" (different rules)
    // For simplicity we model post-retirement survivor; user can recompute on a call for in-service death.
    const survivorPercent = survivorElection === 'full' ? 0.50 : survivorElection === 'partial' ? 0.25 : 0
    const baseAnnuity = annualSalary * yearsOfService * 0.01
    const survivorAnnualPension = hasSpouse ? baseAnnuity * survivorPercent : 0

    // SS survivor (rough): user-provided
    const ssSurvivorAnnual = (Number(ssSurvivorEstimate) || 0) * 12

    // Total annual income to spouse
    const annualToSpouse = survivorAnnualPension + ssSurvivorAnnual
    const monthlyToSpouse = annualToSpouse / 12

    // Typical need: 10× annual salary as a benchmark, or income replacement to 65
    // We use the 10× rule as the simpler benchmark.
    const tenTimesIncome = annualSalary * 10
    const fegliShortfall = Math.max(0, tenTimesIncome - fegliLumpSum)

    return {
      fegliLumpSum,
      bia,
      optA,
      optBCoverage,
      optCSpouse,
      optCPerChild: optCPerChild * Number(dependentChildren),
      survivorPercent,
      survivorAnnualPension,
      ssSurvivorAnnual,
      annualToSpouse,
      monthlyToSpouse,
      tenTimesIncome,
      fegliShortfall,
    }
  }, [tab, basicOn, optionAOn, optionBMult, optionCMult, annualSalary, dependentChildren, hasSpouse, survivorElection, yearsOfService, ssSurvivorEstimate])

  // ---- DISABILITY calculations ----
  const disabilityOutput = useMemo(() => {
    if (tab !== 'disability') return null

    // FERS Disability:
    //  First 12 months: 60% of high-3, less 100% of SS disability
    //  After 12 months: 40% of high-3, less 60% of SS disability
    //  At age 62: converts to "earned" retirement annuity
    const high3 = annualSalary // approximation
    const ssdiAnnual = (Number(ssdiEstimate) || 0) * 12
    const firstYearAnnual = high3 * 0.60 - ssdiAnnual * 1.00
    const afterYearOneAnnual = Math.max(0, high3 * 0.40 - ssdiAnnual * 0.60)

    const replacementYearOne = (firstYearAnnual + ssdiAnnual) / annualSalary
    const replacementAfter = (afterYearOneAnnual + ssdiAnnual) / annualSalary

    return {
      firstYearAnnual: firstYearAnnual + ssdiAnnual,
      firstYearMonthly: (firstYearAnnual + ssdiAnnual) / 12,
      afterYearOneAnnual: afterYearOneAnnual + ssdiAnnual,
      afterYearOneMonthly: (afterYearOneAnnual + ssdiAnnual) / 12,
      replacementYearOne,
      replacementAfter,
    }
  }, [tab, annualSalary, ssdiEstimate])

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title='What if... federal benefits coverage estimator'
        description='Honest math on what your federal benefits actually pay if you die or become disabled. FEGLI, FERS Survivor, Social Security, and FERS Disability modeled.'
        path='/calculators/what-if'
      />

      <header
        style={{
          background: `linear-gradient(165deg, ${colors.pineDeep} 0%, ${colors.pine} 55%, ${colors.pineLight} 100%)`,
          color: '#ffffff',
          padding: '72px 24px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 0%, rgba(176,141,90,0.18) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.brassLight, marginBottom: 14 }}>
            "What if..." · Updated {DATA_LAST_UPDATED}
          </div>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(2rem, 4.6vw, 3.2rem)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 144, "SOFT" 50', marginBottom: 18 }}>
            What does your federal package <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>actually pay when bad things happen?</span>
          </h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 660 }}>
            Honest math, not hand-waving. We model FEGLI plus FERS Survivor plus Social Security for death, and
            FERS Disability for disability. The gap is the gap.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 24px' }}>
        {/* Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 8,
            marginBottom: 28,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type='button'
              onClick={() => setTab(t.id)}
              style={{
                padding: '16px 20px',
                background: tab === t.id ? colors.pine : '#ffffff',
                color: tab === t.id ? '#ffffff' : colors.pine,
                border: `1px solid ${tab === t.id ? colors.pine : colors.borderSubtle || 'rgba(31,61,44,0.10)'}`,
                borderRadius: 12,
                fontSize: '0.98rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: FONT_SANS,
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.1rem', marginBottom: 4, fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>{t.label}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 400, opacity: tab === t.id ? 0.78 : 0.7 }}>{t.sub}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28 }}>
          {/* INPUTS */}
          <div style={{ background: '#ffffff', border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`, borderRadius: 16, padding: isMobile ? 24 : 32 }}>
            <h2 style={{ fontFamily: FONT_SERIF, fontSize: '1.4rem', fontWeight: 600, color: colors.pine, marginBottom: 18, letterSpacing: '-0.01em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
              Your inputs
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={labelText}>
                  Current age
                  <input type='number' value={age} onChange={(e) => setAge(e.target.value)} min='18' max='75' style={inputBox} />
                </label>
                <label style={labelText}>
                  Annual basic pay
                  <input type='number' value={annualSalary} onChange={(e) => setAnnualSalary(e.target.value)} step='1000' style={inputBox} />
                </label>
              </div>
              <label style={labelText}>
                FERS / CSRS years of service
                <input type='number' value={yearsOfService} onChange={(e) => setYearsOfService(e.target.value)} step='0.5' min='0' style={inputBox} />
              </label>

              {tab === 'death' && (
                <>
                  <div style={{ paddingTop: 10, borderTop: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.06)'}` }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.brassDeep, marginTop: 4, marginBottom: 12 }}>
                      Family
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <label style={labelText}>
                        Spouse?
                        <select value={hasSpouse ? 'yes' : 'no'} onChange={(e) => setHasSpouse(e.target.value === 'yes')} style={inputBox}>
                          <option value='yes'>Yes</option>
                          <option value='no'>No</option>
                        </select>
                      </label>
                      <label style={labelText}>
                        Dependent children
                        <input type='number' value={dependentChildren} onChange={(e) => setDependentChildren(e.target.value)} min='0' max='10' style={inputBox} />
                      </label>
                    </div>
                  </div>

                  <div style={{ paddingTop: 10, borderTop: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.06)'}` }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.brassDeep, marginTop: 4, marginBottom: 12 }}>
                      FEGLI elections
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <label style={{ ...labelText, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type='checkbox' checked={basicOn} onChange={(e) => setBasicOn(e.target.checked)} /> Basic
                      </label>
                      <label style={{ ...labelText, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type='checkbox' checked={optionAOn} onChange={(e) => setOptionAOn(e.target.checked)} /> Option A ($10K)
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                      <label style={labelText}>
                        Option B multiples (0–5)
                        <input type='number' value={optionBMult} onChange={(e) => setOptionBMult(e.target.value)} min='0' max='5' style={inputBox} />
                      </label>
                      <label style={labelText}>
                        Option C multiples (0–5)
                        <input type='number' value={optionCMult} onChange={(e) => setOptionCMult(e.target.value)} min='0' max='5' style={inputBox} />
                      </label>
                    </div>
                  </div>

                  {hasSpouse && (
                    <label style={labelText}>
                      Survivor benefit election
                      <select value={survivorElection} onChange={(e) => setSurvivorElection(e.target.value)} style={inputBox}>
                        <option value='full'>Full (50% — costs ~10% of annuity)</option>
                        <option value='partial'>Partial (25% — costs ~5%)</option>
                        <option value='none'>None</option>
                      </select>
                      <span style={helpText}>For post-retirement death scenarios. Pre-retirement death has different rules — see notes below.</span>
                    </label>
                  )}

                  <label style={labelText}>
                    Estimated SS survivor benefit (monthly)
                    <input type='number' value={ssSurvivorEstimate} onChange={(e) => setSsSurvivorEstimate(e.target.value)} step='25' style={inputBox} />
                    <span style={helpText}>From SSA.gov, "if you die" estimate. 0 if not eligible (e.g., young spouse, no kids).</span>
                  </label>
                </>
              )}

              {tab === 'disability' && (
                <label style={labelText}>
                  Estimated SS Disability benefit (monthly, if approved)
                  <input type='number' value={ssdiEstimate} onChange={(e) => setSsdiEstimate(e.target.value)} step='25' style={inputBox} />
                  <span style={helpText}>FERS Disability requires you to apply for SSDI within one year of approval. The FERS payment is reduced by 100% of SSDI in year 1, and 60% thereafter.</span>
                </label>
              )}
            </div>
          </div>

          {/* OUTPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'death' && deathOutput && <DeathOutput data={deathOutput} hasSpouse={hasSpouse} dependentChildren={dependentChildren} />}
            {tab === 'disability' && disabilityOutput && <DisabilityOutput data={disabilityOutput} annualSalary={annualSalary} />}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 32,
            background: `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 70%, ${colors.pineLight} 100%)`,
            color: '#ffffff',
            borderRadius: 16,
            padding: isMobile ? 28 : 40,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 24,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.brassLight, marginBottom: 8 }}>
              See a gap?
            </div>
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: isMobile ? '1.4rem' : '1.6rem', fontWeight: 600, marginBottom: 10, letterSpacing: '-0.01em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
              Most federal employees have one of these gaps and don't know it.
            </h3>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
              Sometimes the federal package is enough. Sometimes it isn't. We'll tell you honestly which side you're on
              — and what (if anything) is worth doing about it.
            </p>
          </div>
          <Button to="/consultation" variant="primary" arrow style={{ flexShrink: 0 }}>Book a free meeting</Button>
        </div>
      </section>
    </main>
  )
}

function StatRow({ label, value, bold, large, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: '0.9rem', color: muted ? colors.slate500 : colors.slate700 }}>{label}</span>
      <span
        style={{
          fontFamily: large ? FONT_SERIF : FONT_SANS,
          fontSize: large ? '1.5rem' : bold ? '1.05rem' : '0.95rem',
          fontWeight: bold || large ? 600 : 500,
          color: muted ? colors.slate500 : large ? colors.pine : colors.charcoal,
          letterSpacing: large ? '-0.01em' : '0',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function GapCard({ title, status, children }) {
  const isShortfall = status === 'shortfall'
  return (
    <div
      style={{
        background: isShortfall ? `linear-gradient(135deg, #5d2d24 0%, #8d3f2c 100%)` : `linear-gradient(135deg, ${colors.pineDeep} 0%, ${colors.pine} 100%)`,
        color: '#ffffff',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 8px 24px rgba(20,42,29,0.12)',
      }}
    >
      <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.brassLight, marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function DeathOutput({ data, hasSpouse, dependentChildren }) {
  return (
    <>
      <GapCard title='FEGLI lump sum' status={data.fegliShortfall > 0 ? 'shortfall' : 'covered'}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: '2.4rem', fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
          {formatCurrency(data.fegliLumpSum)}
        </div>
        <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.78)' }}>
          A 10× income benchmark is {formatCurrency(data.tenTimesIncome)}.{' '}
          {data.fegliShortfall > 0 ? `Gap: ${formatCurrency(data.fegliShortfall)}.` : 'Covered.'}
        </div>
      </GapCard>

      <div style={{ background: '#ffffff', border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.1rem', fontWeight: 600, color: colors.pine, marginBottom: 14, letterSpacing: '-0.01em' }}>
          FEGLI breakdown
        </h3>
        <StatRow label='Basic (BIA)' value={formatCurrency(data.bia)} />
        <StatRow label='Option A (standard $10K)' value={formatCurrency(data.optA)} />
        <StatRow label='Option B (multiples of salary)' value={formatCurrency(data.optBCoverage)} />
        <StatRow label='Option C — spouse coverage' value={hasSpouse ? formatCurrency(data.optCSpouse) : '—'} />
        <StatRow label={`Option C — ${dependentChildren} child${dependentChildren === 1 ? '' : 'ren'}`} value={dependentChildren > 0 ? formatCurrency(data.optCPerChild) : '—'} />
      </div>

      {hasSpouse && data.survivorAnnualPension > 0 && (
        <div style={{ background: '#ffffff', border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.1rem', fontWeight: 600, color: colors.pine, marginBottom: 14, letterSpacing: '-0.01em' }}>
            Spouse income (annual)
          </h3>
          <StatRow label={`FERS survivor pension (${(data.survivorPercent * 100).toFixed(0)}%)`} value={formatCurrency(data.survivorAnnualPension)} />
          <StatRow label='Social Security survivor benefit' value={formatCurrency(data.ssSurvivorAnnual)} />
          <div style={{ height: 1, background: 'rgba(31,61,44,0.08)', margin: '10px 0' }} />
          <StatRow label='Total annual to spouse' value={formatCurrency(data.annualToSpouse)} bold />
          <StatRow label='Approximately monthly' value={formatCurrency(data.monthlyToSpouse) + '/mo'} muted />
        </div>
      )}

      <div style={{ background: colors.brassPale, border: `1px solid ${colors.brass}`, borderRadius: 12, padding: '14px 18px', fontSize: '0.85rem', color: colors.slate700, lineHeight: 1.55 }}>
        <strong style={{ color: colors.brassDeep, fontFamily: FONT_SERIF }}>Notes:</strong> The 10× income benchmark is a
        starting heuristic. The honest answer depends on your spouse's income, dependents' education timeline, and
        outstanding debt. Pre-retirement death-in-service has different survivor rules than retirement-then-death.
        FEGLI lapses or reduces dramatically at age 65 — this calculation is for the pre-retirement scenario.
      </div>
    </>
  )
}

function DisabilityOutput({ data, annualSalary }) {
  return (
    <>
      <GapCard title='Year one' status={data.replacementYearOne >= 0.7 ? 'covered' : 'shortfall'}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: '2.4rem', fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
          {formatCurrency(data.firstYearMonthly)}/mo
        </div>
        <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.78)' }}>
          {(data.replacementYearOne * 100).toFixed(0)}% of your current salary. 60% from FERS plus full SSDI estimate.
        </div>
      </GapCard>

      <div style={{ background: '#ffffff', border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.1rem', fontWeight: 600, color: colors.pine, marginBottom: 14, letterSpacing: '-0.01em' }}>
          After year one (until age 62)
        </h3>
        <StatRow label='Total monthly' value={formatCurrency(data.afterYearOneMonthly)} bold />
        <StatRow label='As % of pre-disability salary' value={`${(data.replacementAfter * 100).toFixed(0)}%`} muted />
        <div style={{ marginTop: 12, fontSize: '0.86rem', color: colors.slate700, lineHeight: 1.6 }}>
          Drops to <strong>40% of high-3</strong> from FERS, with 60% of SSDI offset. Continues until age 62, then
          converts to a regular FERS retirement annuity computed as if you'd worked to 62 (with the disability years
          counted as service).
        </div>
      </div>

      <div style={{ background: colors.brassPale, border: `1px solid ${colors.brass}`, borderRadius: 12, padding: '14px 18px', fontSize: '0.85rem', color: colors.slate700, lineHeight: 1.55 }}>
        <strong style={{ color: colors.brassDeep, fontFamily: FONT_SERIF }}>Notes:</strong> FERS Disability requires
        18+ months of service and OPM approval. You must apply for SSDI within one year of FERS approval. The 60% / 40%
        replacement is generous compared to private long-term-disability policies (often 50%-60%) — but it stops at 62.
        After 62 you receive only your earned FERS annuity, which can be lower if disability struck early in your
        career.
      </div>
    </>
  )
}

