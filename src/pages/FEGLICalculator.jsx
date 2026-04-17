import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ComposedChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import Seo from '../components/Seo'
import { authFetch } from '../lib/authFetch'
import ConsultantCTA from '../components/ConsultantCTA'
import {
  FEGLI_RATES,
  FEGLI_SOURCE_URL,
  getRateBracket,
  basicCoverageForSalary,
  coverageBreakdown,
  monthlyPremium,
  buildCostProjection,
} from '../data/fegliRates'

/**
 * FEGLI Life Insurance Calculator — T2.1 rebuild.
 *
 * The previous version treated the rate table as the hero and buried the
 * user-specific numbers. This version flips it: the personal cost projection
 * chart is the primary element and the OPM reference material is collapsed.
 * Layout loosely follows PLAN.md Sections 1–10.
 */

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

const COLORS = {
  navy: '#0f172a',
  navyMid: '#1e3a5f',
  maroon: '#7b1c2e',
  gold: '#b8860b',
  goldLight: '#d4af37',
  mutedRed: '#9b3a4d',
  bgCream: '#faf9f6',
  cardBg: '#ffffff',
  border: '#cbd5e1',
  text: '#1e293b',
  subtle: '#475569',
  muted: '#64748b',
  warnBg: '#fffbeb',
  warnBorder: '#f59e0b',
}

const FONT_SERIF = "'Merriweather', Georgia, 'Times New Roman', serif"
const FONT_SANS = "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"

const fmt$ = (n) => '$' + Math.round(Number(n) || 0).toLocaleString()
const fmt$2 = (n) => '$' + (Number(n) || 0).toFixed(2)

export default function FEGLICalculator() {
  // Section 1 — Inputs
  const [salary, setSalary] = useState('')
  const [currentAge, setCurrentAge] = useState('')
  const [retireAge, setRetireAge] = useState('62')
  const [postal, setPostal] = useState(false)
  const [alreadyRetired, setAlreadyRetired] = useState(false)

  // Section 2 — Coverage Elections
  const [basicOn, setBasicOn] = useState(true)
  const [optionAOn, setOptionAOn] = useState(false)
  const [optionBMult, setOptionBMult] = useState('0')
  const [optionCMult, setOptionCMult] = useState('0')

  // Section 3 — Post-Retirement Reductions
  const [basicReduction, setBasicReduction] = useState('75')
  const [optionBReduction, setOptionBReduction] = useState('full')
  const [optionCReduction, setOptionCReduction] = useState('full')

  // UI state
  const [rateTableOpen, setRateTableOpen] = useState(false)
  const [formulasOpen, setFormulasOpen] = useState(false)
  const [viewAsTable, setViewAsTable] = useState(false)

  // Lead capture
  const [captureName, setCaptureName] = useState('')
  const [captureEmail, setCaptureEmail] = useState('')
  const [capturePhone, setCapturePhone] = useState('')
  const [captureSent, setCaptureSent] = useState(false)
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureError, setCaptureError] = useState('')

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Safe requirement of Basic disable — confirm dialog
  const toggleBasic = () => {
    if (basicOn) {
      const ok = typeof window !== 'undefined' && window.confirm(
        'Are you sure? Basic FEGLI is the foundation of your coverage and a requirement to elect any optional coverage. Disable anyway?'
      )
      if (!ok) return
    }
    const nextBasic = !basicOn
    setBasicOn(nextBasic)
    if (!nextBasic) { setOptionAOn(false); setOptionBMult('0'); setOptionCMult('0') } // optional coverage requires Basic
  }

  // Derived numbers
  const inputsValid = Number(salary) > 0 && Number(currentAge) > 0
  const ageNum = Number(currentAge) || 0
  const retireNum = alreadyRetired ? ageNum : Number(retireAge) || 62
  const salaryNum = Number(salary) || 0
  const optB = Number(optionBMult) || 0
  const optC = Number(optionCMult) || 0

  const elections = useMemo(() => ({
    basicReduction,
    optionBReduction,
    optionCReduction,
  }), [basicReduction, optionBReduction, optionCReduction])

  const projection = useMemo(() => inputsValid ? buildCostProjection({
    currentAge: ageNum,
    retireAge: retireNum,
    salary: salaryNum,
    postal,
    basic: basicOn,
    optionA: optionAOn,
    optionBMult: optB,
    optionCMult: optC,
    elections,
  }) : [], [inputsValid, ageNum, retireNum, salaryNum, postal, basicOn, optionAOn, optB, optC, elections])

  const coverage = useMemo(() => coverageBreakdown({
    salary: salaryNum,
    basic: basicOn,
    optionA: optionAOn,
    optionBMult: optB,
    optionCMult: optC,
  }), [salaryNum, basicOn, optionAOn, optB, optC])

  const todayPoint = projection[0]
  const retirementPoint = projection.find(p => p.age === retireNum)
  const age75Point = projection.find(p => p.age === 75)

  // Live per-option cost at current age (drives Section 2 card sublabels)
  const currentCosts = useMemo(() => inputsValid ? monthlyPremium({
    age: ageNum, salary: salaryNum, postal, basic: basicOn, optionA: optionAOn,
    optionBMult: optB, optionCMult: optC,
  }) : { basic: 0, optionA: 0, optionB: 0, optionC: 0, total: 0 }, [inputsValid, ageNum, salaryNum, postal, basicOn, optionAOn, optB, optC])

  // Per-option current-age cost IGNORING the toggle (for the "off" sublabel preview)
  const previewCost = useMemo(() => inputsValid ? {
    basic: monthlyPremium({ age: ageNum, salary: salaryNum, postal, basic: true, optionA: false, optionBMult: 0, optionCMult: 0 }).basic,
    optionA: monthlyPremium({ age: ageNum, salary: salaryNum, postal, basic: true, optionA: true, optionBMult: 0, optionCMult: 0 }).optionA,
    optionB1: monthlyPremium({ age: ageNum, salary: salaryNum, postal, basic: true, optionA: false, optionBMult: 1, optionCMult: 0 }).optionB,
    optionC1: monthlyPremium({ age: ageNum, salary: salaryNum, postal, basic: true, optionA: false, optionBMult: 0, optionCMult: 1 }).optionC,
  } : { basic: 0, optionA: 0, optionB1: 0, optionC1: 0 }, [inputsValid, ageNum, salaryNum, postal])

  // Summary sentence
  const summaryText = useMemo(() => {
    if (!inputsValid) return 'Enter your salary and age above to see your personal FEGLI cost projection.'
    const b25 = Math.round((coverage.basic * 0.25) / 1000) * 1000
    const allFull = (basicReduction === '75') && optionBReduction === 'full' && optionCReduction === 'full'
    const bNoRed = optB > 0 && optionBReduction === 'none'
    const allNoRed = basicReduction === 'none' && (optB === 0 || optionBReduction === 'none') && (optC === 0 || optionCReduction === 'none')
    const at75 = age75Point?.total || 0
    if (allFull) {
      return `Your FEGLI costs drop to $0 at age 65 when reductions take effect. You'll retain roughly ${fmt$(b25)} of Basic coverage for life at no cost.`
    }
    if (bNoRed) {
      return `You've elected No Reduction on Option B. Premium continues climbing after 65 — by age 75, you'll pay roughly ${fmt$(at75)}/month. Most retirees reduce at this age.`
    }
    if (allNoRed) {
      const at65 = projection.find(p => p.age === 65)?.total || 0
      const at80 = projection.find(p => p.age === 80)?.total || 0
      return `You're keeping all coverage at full face value. Monthly premium will be about ${fmt$(at65)} at 65, ${fmt$(at75)} at 75, ${fmt$(at80)} at 80.`
    }
    return `At retirement your monthly FEGLI cost is projected at ${fmt$(retirementPoint?.total || 0)}. By age 75 it is ${fmt$(at75)}.`
  }, [inputsValid, coverage.basic, basicReduction, optionBReduction, optionCReduction, optB, optC, age75Point, projection, retirementPoint])

  // Email capture handler
  const handleCapture = async (e) => {
    e.preventDefault()
    setCaptureError('')
    setCaptureLoading(true)
    try {
      const res = await fetch('/.netlify/functions/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: captureName,
          email: captureEmail,
          phone: capturePhone,
          source: 'Calculator - FEGLI',
          notes: JSON.stringify({
            salary: salaryNum, age: ageNum, retireAge: retireNum, postal, alreadyRetired,
            elections, basicOn, optionAOn, optionBMult: optB, optionCMult: optC,
            coverage, currentCosts, age75: age75Point?.total,
          }).slice(0, 2000),
        }),
      })
      if (!res.ok) throw new Error('failed')
      setCaptureSent(true)
      // T2.13: send projection email via send-results-email (requires auth — silently skipped for anonymous visitors)
      authFetch('/.netlify/functions/send-results-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fegli-calculator',
          email: captureEmail,
          data: {
            name: captureName,
            totalCoverage: fmt$(coverage.total),
            monthlyCost: fmt$(currentCosts.total),
            breakdown: [
              { label: 'Total Coverage', value: fmt$(coverage.total), type: 'total' },
              { label: 'Current Monthly Cost', value: fmt$(currentCosts.total), type: 'cost' },
              { label: 'Projected Cost at Age 75', value: fmt$(age75Point?.total || 0), type: 'cost' },
            ],
          },
        }),
      }).catch(() => {})
    } catch {
      setCaptureError('Something went wrong. Please try again.')
    } finally {
      setCaptureLoading(false)
    }
  }

  // Styles — inline to match site pattern
  const s = styles

  const multipleOptions = (
    <>
      <option value="0">Not elected</option>
      <option value="1">1×</option>
      <option value="2">2×</option>
      <option value="3">3×</option>
      <option value="4">4×</option>
      <option value="5">5×</option>
    </>
  )

  return (
    <main id="main-content" style={s.page}>
      <Seo
        title="FEGLI Calculator — Federal Life Insurance"
        description="Calculate your FEGLI coverage, monthly premiums by age bracket, and post-65 reduction options. Current OPM rates modeled for Basic plus Options A, B, and C."
        path="/calculators/fegli"
      />

      <div style={s.container(isMobile)}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.badge}>Free Tool — No Account Required</div>
          <h1 style={s.h1}>FEGLI Life Insurance Calculator</h1>
          <p style={s.sub}>
            Model your Federal Employees' Group Life Insurance (FEGLI) coverage, monthly premiums at every age bracket, and the impact of your post-65 reduction elections — all in one chart.
          </p>
          <div style={s.disclaimer}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            This calculator provides estimates for educational purposes only. Current OPM FEGLI rates (set effective 10/1/2021). Actual benefits may differ. This is not financial advice — consult a qualified federal benefits advisor for personalized guidance. FedBenefitsAid is not affiliated with OPM or the U.S. government.
          </div>
        </header>

        {/* Main 2-column grid on desktop, stacked on mobile */}
        <div style={s.layout(isMobile)}>
          {/* LEFT COLUMN */}
          <div style={s.leftCol}>

            {/* Section 1 — Inputs */}
            <div style={s.card}>
              <div style={s.cardTitle}>1. Your Details</div>
              <div style={s.grid2}>
                <Field label="Annual Gross Salary ($)">
                  <input type="number" min="0" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 95000" style={s.input} />
                </Field>
                <Field label="Current Age">
                  <input type="number" min="18" max="100" value={currentAge} onChange={e => setCurrentAge(e.target.value)} placeholder="e.g. 55" style={s.input} />
                </Field>
              </div>
              {!alreadyRetired && (
                <Field label="Planned Retirement Age">
                  <input type="number" min="45" max="80" value={retireAge} onChange={e => setRetireAge(e.target.value)} placeholder="e.g. 62" style={s.input} />
                </Field>
              )}
              <div style={s.toggleRow}>
                <ToggleCheckbox checked={postal} onChange={e => setPostal(e.target.checked)} label="USPS Postal Employee" hint="USPS pays the full employee share of Basic — your Basic premium is $0." />
                <ToggleCheckbox checked={alreadyRetired} onChange={e => setAlreadyRetired(e.target.checked)} label="I'm already retired" hint="Hides the 'planned retirement age' input and applies reduction elections immediately." />
              </div>
            </div>

            {/* Section 2 — Coverage Elections */}
            <div style={s.card}>
              <div style={s.cardTitle}>2. Coverage Elections</div>
              <div style={s.electionsGrid(isMobile)}>
                <ElectionCard
                  title="Basic"
                  on={basicOn} onToggle={toggleBasic}
                  coverage={basicOn ? fmt$(coverage.basic) : fmt$(basicCoverageForSalary(salaryNum))}
                  cost={basicOn ? fmt$2(currentCosts.basic) : fmt$2(previewCost.basic)}
                  explainer="Salary rounded up to the next $1,000, plus $2,000. Required to elect any optional coverage."
                  accent={COLORS.navy}
                />
                <ElectionCard
                  title="Option A — Standard"
                  on={optionAOn} onToggle={() => basicOn && setOptionAOn(!optionAOn)}
                  disabled={!basicOn}
                  coverage={optionAOn ? '$10,000' : '$10,000'}
                  cost={optionAOn ? fmt$2(currentCosts.optionA) : fmt$2(previewCost.optionA)}
                  explainer="Flat $10,000 supplemental coverage. Required to have Basic in force."
                  accent={COLORS.maroon}
                />
                <ElectionCard
                  title="Option B — Additional"
                  on={optB > 0} onToggle={() => basicOn && setOptionBMult(optB > 0 ? '0' : '1')}
                  disabled={!basicOn}
                  coverage={fmt$(Math.ceil(salaryNum / 1000) * 1000 * (optB || 1))}
                  cost={optB > 0 ? fmt$2(currentCosts.optionB) : fmt$2(previewCost.optionB1)}
                  explainer="1–5 multiples of your salary (rounded up to $1,000). Scales with age."
                  accent={COLORS.gold}
                >
                  {optB > 0 && basicOn && (
                    <div style={s.inlineField}>
                      <label style={s.inlineLabel}>Multiples</label>
                      <select value={optionBMult} onChange={e => setOptionBMult(e.target.value)} style={s.selectSm}>
                        {multipleOptions}
                      </select>
                    </div>
                  )}
                </ElectionCard>
                <ElectionCard
                  title="Option C — Family"
                  on={optC > 0} onToggle={() => basicOn && setOptionCMult(optC > 0 ? '0' : '1')}
                  disabled={!basicOn}
                  coverage={optC > 0 ? `${fmt$(5000 * optC)} spouse · ${fmt$(2500 * optC)} per child` : '$5,000 spouse · $2,500 per child'}
                  cost={optC > 0 ? fmt$2(currentCosts.optionC) : fmt$2(previewCost.optionC1)}
                  explainer="$5,000 per multiple for spouse, $2,500 per multiple per child. 1–5 multiples."
                  accent={COLORS.mutedRed}
                >
                  {optC > 0 && basicOn && (
                    <div style={s.inlineField}>
                      <label style={s.inlineLabel}>Multiples</label>
                      <select value={optionCMult} onChange={e => setOptionCMult(e.target.value)} style={s.selectSm}>
                        {multipleOptions}
                      </select>
                    </div>
                  )}
                </ElectionCard>
              </div>
            </div>

            {/* Section 3 — Reductions */}
            {(basicOn || optionAOn || optB > 0 || optC > 0) && (
              <div style={s.card}>
                <div style={s.cardTitle}>3. Post-Retirement Reduction Elections</div>
                <p style={s.cardHint}>These choices take effect at age 65 (or at retirement if you retire 65 or later). They determine whether coverage tapers and whether the premium goes to $0.</p>
                <div style={s.grid2}>
                  {basicOn && (
                    <Field label="Basic Reduction">
                      <select value={basicReduction} onChange={e => setBasicReduction(e.target.value)} style={s.select}>
                        <option value="75">75% Reduction (default) — premium $0 at 65, coverage tapers to 25%</option>
                        <option value="50">50% Reduction — premium continues at 50% rate, coverage tapers to 50%</option>
                        <option value="none">No Reduction — coverage stays at 100%, premium continues</option>
                      </select>
                    </Field>
                  )}
                  {optionAOn && (
                    <Field label="Option A Reduction" hint="Full Reduction is the only choice OPM offers on Option A.">
                      <select value="full" disabled style={{ ...s.select, opacity: 0.7, cursor: 'not-allowed' }}>
                        <option value="full">Full Reduction — coverage drops to $0 over 50 months starting at 65</option>
                      </select>
                    </Field>
                  )}
                  {optB > 0 && (
                    <Field label="Option B Reduction">
                      <select value={optionBReduction} onChange={e => setOptionBReduction(e.target.value)} style={s.select}>
                        <option value="full">Full Reduction — coverage drops to $0 at 65, premium $0</option>
                        <option value="none">No Reduction — coverage stays at 100%, premium escalates with age</option>
                      </select>
                    </Field>
                  )}
                  {optC > 0 && (
                    <Field label="Option C Reduction">
                      <select value={optionCReduction} onChange={e => setOptionCReduction(e.target.value)} style={s.select}>
                        <option value="full">Full Reduction — coverage drops to $0 at 65, premium $0</option>
                        <option value="none">No Reduction — coverage stays at 100%, premium escalates with age</option>
                      </select>
                    </Field>
                  )}
                </div>
              </div>
            )}

            {/* Section 4 — HERO CHART */}
            <div style={s.heroCard}>
              <h2 style={s.heroTitle}>Your Personal Cost Projection</h2>
              <p style={s.heroSub}>Monthly premium you'll pay at every age from today through 80, given your specific salary, elections, and reduction choices.</p>

              {/* Headline pill cards */}
              <div style={s.pillRow(isMobile)}>
                <Pill label="Cost today" value={fmt$(todayPoint?.total || 0)} subtitle={inputsValid ? `Age ${ageNum}` : ''} />
                <Pill label="Cost at retirement" value={fmt$(retirementPoint?.total || 0)} subtitle={inputsValid ? `Age ${retireNum}` : ''} />
                <Pill label="Cost at age 75" value={fmt$(age75Point?.total || 0)} subtitle="Retiree" />
              </div>

              <p style={s.summary}>{summaryText}</p>

              {/* Chart */}
              {inputsValid && projection.length > 0 && !viewAsTable && (
                <div style={{ width: '100%', height: 380, marginTop: 20 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={projection} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="age"
                        type="number"
                        domain={[ageNum, 80]}
                        ticks={Array.from(new Set([ageNum, retireNum, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].filter(v => v >= ageNum && v <= 80))).sort((a,b)=>a-b)}
                        tick={{ fill: COLORS.subtle, fontSize: 12, fontFamily: FONT_SANS }}
                        label={{ value: 'Age', position: 'insideBottom', offset: -4, fill: COLORS.subtle, fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(v) => '$' + Math.round(v)}
                        tick={{ fill: COLORS.subtle, fontSize: 12, fontFamily: FONT_SANS }}
                        label={{ value: 'Monthly cost', angle: -90, position: 'insideLeft', fill: COLORS.subtle, fontSize: 12 }}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT_SANS, paddingTop: 8 }} iconType="square" />
                      <Area type="stepAfter" dataKey="basic"   stackId="1" name="Basic"    stroke={COLORS.navy}     fill={COLORS.navy}     fillOpacity={0.78} isAnimationActive={false} />
                      <Area type="stepAfter" dataKey="optionA" stackId="1" name="Option A" stroke={COLORS.maroon}   fill={COLORS.maroon}   fillOpacity={0.82} isAnimationActive={false} />
                      <Area type="stepAfter" dataKey="optionB" stackId="1" name="Option B" stroke={COLORS.gold}     fill={COLORS.gold}     fillOpacity={0.86} isAnimationActive={false} />
                      <Area type="stepAfter" dataKey="optionC" stackId="1" name="Option C" stroke={COLORS.mutedRed} fill={COLORS.mutedRed} fillOpacity={0.82} isAnimationActive={false} />
                      <ReferenceLine x={ageNum} stroke={COLORS.maroon} strokeDasharray="4 4" label={{ value: `Today · ${ageNum}`, position: 'top', fill: COLORS.maroon, fontSize: 11, fontWeight: 700 }} />
                      {!alreadyRetired && retireNum !== ageNum && retireNum <= 80 && (
                        <ReferenceLine x={retireNum} stroke={COLORS.navyMid} strokeDasharray="4 4" label={{ value: `Retirement · ${retireNum}`, position: 'top', fill: COLORS.navyMid, fontSize: 11, fontWeight: 700 }} />
                      )}
                      {ageNum <= 65 && (
                        <ReferenceLine x={65} stroke={COLORS.gold} strokeDasharray="2 4" label={{ value: 'Age 65 reductions', position: 'top', fill: COLORS.gold, fontSize: 11, fontWeight: 700 }} />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {inputsValid && projection.length > 0 && viewAsTable && (
                <div style={{ overflowX: 'auto', marginTop: 20 }}>
                  <table style={s.dataTable}>
                    <thead>
                      <tr>
                        <th scope="col" style={s.th}>Age</th>
                        <th scope="col" style={s.th}>Basic</th>
                        <th scope="col" style={s.th}>Option A</th>
                        <th scope="col" style={s.th}>Option B</th>
                        <th scope="col" style={s.th}>Option C</th>
                        <th scope="col" style={s.th}>Total / month</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projection.filter(p => [ageNum, retireNum, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].includes(p.age)).map(p => (
                        <tr key={p.age}>
                          <td style={s.td}>{p.age}</td>
                          <td style={s.td}>{fmt$2(p.basic)}</td>
                          <td style={s.td}>{fmt$2(p.optionA)}</td>
                          <td style={s.td}>{fmt$2(p.optionB)}</td>
                          <td style={s.td}>{fmt$2(p.optionC)}</td>
                          <td style={{ ...s.td, fontWeight: 700 }}>{fmt$2(p.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {inputsValid && (
                <div style={{ textAlign: 'right', marginTop: 12 }}>
                  <button type="button" onClick={() => setViewAsTable(v => !v)} style={s.linkBtn} aria-pressed={viewAsTable}>
                    {viewAsTable ? 'Show chart' : 'View as table (screen-reader friendly)'}
                  </button>
                </div>
              )}

              {!inputsValid && (
                <div style={s.emptyState}>
                  Enter your <strong>annual gross salary</strong> and <strong>current age</strong> to see your projection.
                </div>
              )}
            </div>

            {/* Section 5 — What Happens When You Retire */}
            <WhatHappensSection />

            {/* Section 6 — Decision Helper */}
            <DecisionHelper />
          </div>

          {/* RIGHT COLUMN — sticky sidebar */}
          <aside style={s.sidebar(isMobile)}>
            <div style={s.sidebarInner}>
              <div style={s.sidebarLabel}>Your Coverage Summary</div>
              <div style={s.sidebarBigLabel}>Total Life Insurance Coverage</div>
              <div style={s.sidebarBigValue}>{fmt$(coverage.total)}</div>
              {coverage.optionC.perChild > 0 && (
                <div style={s.sidebarNote}>
                  + {fmt$(coverage.optionC.perChild)} per eligible child (Option C)
                </div>
              )}

              <div style={s.sidebarDivider} />

              <div style={s.sidebarRow}><span>Monthly cost today</span><strong>{fmt$(currentCosts.total)}</strong></div>
              <div style={s.sidebarRow}><span>Annual cost today</span><strong>{fmt$(currentCosts.total * 12)}</strong></div>
              <div style={{ ...s.sidebarRow, color: COLORS.muted, fontSize: '0.8rem' }}><span>Biweekly (26 pay periods)</span><span>{fmt$2(currentCosts.total * 12 / 26)}</span></div>

              <div style={s.sidebarDivider} />

              <div style={s.sidebarLabel}>Coverage Breakdown</div>
              <div style={s.sidebarRow}><span>Basic</span><span>{fmt$(coverage.basic)}</span></div>
              <div style={s.sidebarRow}><span>Option A</span><span>{fmt$(coverage.optionA)}</span></div>
              <div style={s.sidebarRow}><span>Option B</span><span>{fmt$(coverage.optionB)}</span></div>
              <div style={s.sidebarRow}><span>Option C (spouse)</span><span>{fmt$(coverage.optionC.spouse)}</span></div>

              <div style={s.sidebarDivider} />

              {/* Email capture */}
              {!captureSent ? (
                <form onSubmit={handleCapture} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontFamily: FONT_SERIF, fontWeight: 700, color: COLORS.navy, fontSize: '0.95rem' }}>Email me this projection</div>
                  <input type="text" placeholder="Your name" value={captureName} onChange={e => setCaptureName(e.target.value)} style={s.input} required />
                  <input type="email" placeholder="you@example.com" value={captureEmail} onChange={e => setCaptureEmail(e.target.value)} style={s.input} required />
                  <input type="tel" placeholder="Phone (optional)" value={capturePhone} onChange={e => setCapturePhone(e.target.value)} style={s.input} />
                  {captureError && <div role="alert" style={{ color: COLORS.maroon, fontSize: '0.85rem' }}>{captureError}</div>}
                  <button type="submit" disabled={captureLoading} style={s.primaryBtn}>
                    {captureLoading ? 'Sending…' : 'Email me my projection'}
                  </button>
                </form>
              ) : (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 14, fontSize: '0.9rem', color: '#14532d' }}>
                  Sent. Check <strong>{captureEmail}</strong> (and spam) for your projection. If you signed in, you'll also get a copy by email.
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Section 7 — Full OPM Rate Table */}
        <CollapsibleCard
          open={rateTableOpen} onToggle={() => setRateTableOpen(v => !v)}
          trigger="Show full OPM rate table (all age brackets)"
        >
          <RateTable currentAge={ageNum} retireAge={retireNum} />
        </CollapsibleCard>

        {/* Section 8 — Formulas */}
        <CollapsibleCard
          open={formulasOpen} onToggle={() => setFormulasOpen(v => !v)}
          trigger="How these costs are calculated"
        >
          <FormulasSection />
        </CollapsibleCard>

        {/* Section 10 — Important Notes */}
        <div style={s.notesBox}>
          <div style={s.notesTitle}>Important Notes</div>
          <ul style={s.notesList}>
            <li>Rates shown are the <strong>monthly employee share</strong>. Payroll deducts the biweekly equivalent.</li>
            <li>Premiums jump at every 5-year bracket starting at age 35 for Options A, B, and C.</li>
            <li>Basic rate is flat at every age; only coverage changes as salary grows.</li>
            <li>Options can be elected or changed during Open Season or following a qualifying life event (marriage, birth, adoption, divorce).</li>
            <li>This is an estimate. Consult <a href={FEGLI_SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.maroon }}>OPM</a> for official rates and election rules.</li>
          </ul>
        </div>

        <ConsultantCTA compact />
      </div>
    </main>
  )
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: 4, fontFamily: FONT_SANS }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, fontFamily: FONT_SANS }}>{hint}</div>}
    </label>
  )
}

function ToggleCheckbox({ checked, onChange, label, hint }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '8px 0' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ marginTop: 3, accentColor: COLORS.maroon }} />
      <div>
        <div style={{ fontWeight: 600, color: COLORS.text, fontSize: '0.9rem' }}>{label}</div>
        {hint && <div style={{ fontSize: '0.8rem', color: COLORS.muted, lineHeight: 1.4 }}>{hint}</div>}
      </div>
    </label>
  )
}

function ElectionCard({ title, on, onToggle, disabled, coverage, cost, explainer, accent, children }) {
  const bg = on ? `${accent}08` : COLORS.cardBg
  const borderColor = on ? accent : COLORS.border
  return (
    <div style={{
      background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 12,
      padding: 16, opacity: disabled ? 0.55 : 1, transition: 'all 0.15s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{ fontWeight: 700, color: COLORS.navy, fontSize: '1rem', fontFamily: FONT_SERIF }}>{title}</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <input type="checkbox" checked={on} onChange={onToggle} disabled={disabled} style={{ accentColor: accent }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: on ? accent : COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{on ? 'On' : 'Off'}</span>
        </label>
      </div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Coverage</div>
      <div style={{ fontFamily: FONT_SERIF, fontSize: '1.15rem', fontWeight: 800, color: on ? COLORS.navy : COLORS.muted, marginBottom: 8 }}>{coverage}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Monthly cost at your age</div>
      <div style={{ fontFamily: FONT_SERIF, fontSize: '1.05rem', fontWeight: 700, color: on ? accent : COLORS.muted }}>{cost}</div>
      <p style={{ fontSize: '0.8rem', color: COLORS.subtle, lineHeight: 1.5, marginTop: 10 }}>{explainer}</p>
      {children}
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  const rows = [
    { label: 'Basic', color: COLORS.navy, value: point.basic },
    { label: 'Option A', color: COLORS.maroon, value: point.optionA },
    { label: 'Option B', color: COLORS.gold, value: point.optionB },
    { label: 'Option C', color: COLORS.mutedRed, value: point.optionC },
  ].filter(r => r.value > 0)
  return (
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontFamily: FONT_SANS, fontSize: 13, minWidth: 180 }}>
      <div style={{ fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Age {label}</div>
      {rows.length === 0 ? (
        <div style={{ color: COLORS.muted }}>$0 / month (no premium)</div>
      ) : (
        rows.map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: r.color, display: 'inline-block', borderRadius: 2 }} />
              {r.label}
            </span>
            <span>{fmt$2(r.value)}</span>
          </div>
        ))
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${COLORS.border}`, fontWeight: 700 }}>
        <span>Total</span><span>{fmt$2(point.total)}</span>
      </div>
    </div>
  )
}

function Pill({ label, value, subtitle }) {
  return (
    <div style={{ flex: 1, background: COLORS.bgCream, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '16px 18px', textAlign: 'center', minWidth: 0 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: FONT_SERIF, fontSize: '1.6rem', fontWeight: 900, color: COLORS.navy, letterSpacing: '-0.01em' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.78rem', color: COLORS.subtle, marginTop: 4 }}>{subtitle}</div>}
    </div>
  )
}

function WhatHappensSection() {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>What Happens When You Retire</div>

      <h4 style={styles.subHead}>The 5-Year Rule</h4>
      <p style={styles.bodyText}>
        To carry any FEGLI coverage into retirement, you <strong>must have been continuously enrolled in that coverage for the 5 years immediately before retirement</strong> (or, if less than 5 years, for all periods of eligible federal service). Coverage enrolled in during Open Season or at a qualifying life event counts toward the 5 years from the effective date of enrollment. You cannot add new FEGLI coverage at retirement — only keep what you've already had.
      </p>

      <h4 style={styles.subHead}>Your Reduction Election Choices</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              <th scope="col" style={styles.th}>Option</th>
              <th scope="col" style={styles.th}>Your choices</th>
              <th scope="col" style={styles.th}>What this means at 65+</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}><strong>Basic</strong></td>
              <td style={styles.td}>75% Reduction · 50% Reduction · No Reduction</td>
              <td style={styles.td}>75% → coverage tapers to 25% of face value, premium $0. 50% → tapers to 50%, small continuing premium. No Reduction → keeps full coverage, pays the highest ongoing premium.</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Option A</strong></td>
              <td style={styles.td}>Full Reduction only</td>
              <td style={styles.td}>$10,000 coverage declines 2% per month starting at 65 until it reaches $0. No premium after 65.</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Option B</strong></td>
              <td style={styles.td}>Full Reduction · No Reduction (per multiple)</td>
              <td style={styles.td}>Full → coverage drops to $0 over 50 months, premium $0. No Reduction → keeps full face, pays the (steep) age-banded premium.</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Option C</strong></td>
              <td style={styles.td}>Full Reduction · No Reduction (per multiple)</td>
              <td style={styles.td}>Same pattern as Option B — coverage either phases out to $0 or continues at full face with escalating premium.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 style={styles.subHead}>Pre-65 Retiree vs Post-65 Retiree</h4>
      <p style={styles.bodyText}>
        If you retire <strong>before age 65</strong>, your coverage stays at 100% and you keep paying the same age-banded premium until your 65th birthday — only then do your Reduction elections take effect. If you retire <strong>at 65 or later</strong>, reductions (if any) begin the first month after retirement. Either way, once reductions start they play out over 37–50 months depending on the election.
      </p>
    </div>
  )
}

function DecisionHelper() {
  return (
    <div style={{ ...styles.card, background: '#fffdf5', border: `1px solid ${COLORS.goldLight}55` }}>
      <div style={styles.cardTitle}>Should I keep FEGLI?</div>
      <p style={styles.bodyText}>Three situations that cover most federal retirees. These are <em>educational heuristics</em>, not personal advice.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        <Scenario
          when="Mortgage paid, independent kids, spouse has own income"
          then="Basic at 75% Reduction is usually enough. Dropping Options B and C before or at retirement saves significantly — Option B premiums triple between 60 and 70 even without adjusting coverage."
        />
        <Scenario
          when="Young dependents or a spouse who relies on your income"
          then="Consider No Reduction on Option B at least into your 70s. Premiums escalate roughly 3× between 60 and 70, then another 2× by 75 — but the face value protects your family when the risk is highest."
        />
        <Scenario
          when="Significant retirement savings + other life insurance"
          then="Full Reduction on all optional coverage usually makes sense. Basic 75% Reduction gives you about 25% of your BIA for life at no cost — a freebie worth keeping."
        />
      </div>
      <p style={styles.bodyText} >These heuristics are a starting point, not a decision. <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.maroon, fontWeight: 700 }}>Book a free consultation →</a></p>
    </div>
  )
}

function Scenario({ when, then }) {
  return (
    <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>If</div>
      <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 6, fontSize: '0.95rem', fontFamily: FONT_SERIF }}>{when}</div>
      <div style={{ fontSize: '0.88rem', color: COLORS.text, lineHeight: 1.55 }}>{then}</div>
    </div>
  )
}

function CollapsibleCard({ open, onToggle, trigger, children }) {
  return (
    <div style={styles.card}>
      <button type="button" onClick={onToggle} aria-expanded={open} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: FONT_SANS }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.navy, fontFamily: FONT_SERIF }}>{trigger}</div>
        <div style={{ fontSize: '1.2rem', color: COLORS.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>▾</div>
      </button>
      {open && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  )
}

function RateTable({ currentAge, retireAge }) {
  const currentBracket = getRateBracket(Number(currentAge) || 0)
  const retireBracket = getRateBracket(Number(retireAge) || 0)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.dataTable}>
        <thead>
          <tr>
            <th scope="col" style={styles.th}>Age Group</th>
            <th scope="col" style={styles.th}>Basic (per $1,000)</th>
            <th scope="col" style={styles.th}>Option A ($10,000 flat)</th>
            <th scope="col" style={styles.th}>Option B (per $1,000)</th>
            <th scope="col" style={styles.th}>Option C (1× Multiple)</th>
            <th scope="col" style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {FEGLI_RATES.map((b) => {
            const isToday = currentAge && currentBracket.label === b.label
            const isRetire = retireAge && retireBracket.label === b.label && !isToday
            const bg = isToday ? 'rgba(123,28,46,0.08)' : isRetire ? 'rgba(30,58,95,0.08)' : 'transparent'
            return (
              <tr key={b.label} style={{ background: bg }}>
                <td style={{ ...styles.td, fontWeight: 700 }}>{b.label}</td>
                <td style={styles.td}>{fmt$2(b.basicPer1000)}</td>
                <td style={styles.td}>{fmt$2(b.optionA)}</td>
                <td style={styles.td}>{fmt$2(b.optionBPer1000)}</td>
                <td style={styles.td}>{fmt$2(b.optionCPerMultiple)}</td>
                <td style={styles.td}>
                  {isToday && <span style={{ color: COLORS.maroon, fontSize: '0.78rem', fontWeight: 700 }}>← Today</span>}
                  {isRetire && <span style={{ color: COLORS.navyMid, fontSize: '0.78rem', fontWeight: 700 }}>← Retirement</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={{ fontSize: '0.8rem', color: COLORS.muted, marginTop: 10 }}>
        Rates from OPM, effective October 1, 2021. <a href={FEGLI_SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.maroon }}>Official OPM rate chart →</a>
      </p>
    </div>
  )
}

function FormulasSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: FONT_SANS }}>
      <Formula
        title="Basic"
        body="(Coverage ÷ 1,000) × monthly Basic rate. Coverage = salary rounded up to next $1,000 + $2,000."
        example="$95,000 salary → $97,000 coverage → (97 × $0.3467) = $33.63 / month."
      />
      <Formula
        title="Option A"
        body="Flat monthly rate from the table (age-banded). Coverage is $10,000 regardless of age."
        example="Age 55–59 → $3.90 / month."
      />
      <Formula
        title="Option B"
        body="(salary × multiples ÷ 1,000) × monthly Option B rate. Multiples 1–5."
        example="$95k salary, 1× multiple, age 55 → (95 × $0.390) = $37.05 / month."
      />
      <Formula
        title="Option C"
        body="Flat monthly rate × number of multiples. 1× covers $5,000 spouse + $2,500 per child."
        example="Age 45–49, 2 multiples → (2 × $1.15) = $2.30 / month."
      />
    </div>
  )
}

function Formula({ title, body, example }) {
  return (
    <div style={{ background: COLORS.bgCream, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12 }}>
      <div style={{ fontWeight: 700, color: COLORS.navy, marginBottom: 4, fontFamily: FONT_SERIF }}>{title}</div>
      <div style={{ fontSize: '0.9rem', color: COLORS.text, lineHeight: 1.5 }}>{body}</div>
      <div style={{ fontSize: '0.82rem', color: COLORS.muted, marginTop: 4, fontStyle: 'italic' }}>Example: {example}</div>
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    background: COLORS.bgCream,
    fontFamily: FONT_SANS,
    color: COLORS.text,
  },
  container: (isMobile) => ({
    maxWidth: 1320,
    margin: '0 auto',
    padding: isMobile ? '24px 16px 64px' : '32px 32px 80px',
  }),
  header: {
    marginBottom: 32,
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '6px 14px',
    borderRadius: 100,
    background: 'rgba(123,28,46,0.08)',
    color: COLORS.maroon,
    marginBottom: 14,
  },
  h1: {
    fontFamily: FONT_SERIF,
    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
    fontWeight: 900,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: COLORS.navy,
    marginBottom: 12,
  },
  sub: {
    fontSize: '1.05rem',
    lineHeight: 1.65,
    color: COLORS.subtle,
    maxWidth: 720,
    marginBottom: 16,
  },
  disclaimer: {
    background: COLORS.warnBg,
    border: `1px solid ${COLORS.warnBorder}`,
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: '0.82rem',
    color: '#92400e',
    lineHeight: 1.55,
    maxWidth: 920,
  },
  layout: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
    gap: 28,
    alignItems: 'start',
  }),
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    minWidth: 0,
  },
  sidebar: (isMobile) => ({
    position: isMobile ? 'static' : 'sticky',
    top: isMobile ? 'auto' : 84,
  }),
  sidebarInner: {
    background: COLORS.navy,
    color: '#fff',
    borderRadius: 16,
    padding: '22px 22px 24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
  },
  sidebarLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  sidebarBigLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  sidebarBigValue: {
    fontFamily: FONT_SERIF,
    fontSize: '2rem',
    fontWeight: 900,
    color: COLORS.goldLight,
    letterSpacing: '-0.02em',
    marginBottom: 8,
  },
  sidebarNote: {
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  sidebarDivider: {
    height: 1,
    background: 'rgba(255,255,255,0.12)',
    margin: '16px 0',
  },
  sidebarRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: '0.88rem',
    marginBottom: 5,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: '22px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontFamily: FONT_SERIF,
    fontWeight: 800,
    fontSize: '1.1rem',
    color: COLORS.navy,
    marginBottom: 14,
    letterSpacing: '-0.01em',
  },
  cardHint: {
    fontSize: '0.85rem',
    color: COLORS.muted,
    lineHeight: 1.55,
    marginBottom: 12,
    marginTop: -6,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
    marginBottom: 4,
  },
  electionsGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 14,
  }),
  toggleRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 6,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    fontSize: '0.92rem',
    fontFamily: FONT_SANS,
    color: COLORS.text,
    background: '#fff',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    fontSize: '0.9rem',
    fontFamily: FONT_SANS,
    color: COLORS.text,
    background: '#fff',
    boxSizing: 'border-box',
  },
  selectSm: {
    padding: '6px 10px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    fontSize: '0.85rem',
    fontFamily: FONT_SANS,
    color: COLORS.text,
    background: '#fff',
  },
  inlineField: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  inlineLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: COLORS.subtle,
  },
  heroCard: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: '28px 28px 24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  heroTitle: {
    fontFamily: FONT_SERIF,
    fontWeight: 900,
    fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
    color: COLORS.navy,
    letterSpacing: '-0.02em',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: '0.95rem',
    color: COLORS.subtle,
    lineHeight: 1.55,
    marginBottom: 18,
    maxWidth: 720,
  },
  pillRow: (isMobile) => ({
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
    marginBottom: 16,
  }),
  summary: {
    fontSize: '0.95rem',
    color: COLORS.text,
    lineHeight: 1.6,
    padding: '12px 14px',
    background: 'rgba(15,23,42,0.04)',
    borderLeft: `3px solid ${COLORS.navyMid}`,
    borderRadius: 6,
  },
  emptyState: {
    padding: '32px 20px',
    textAlign: 'center',
    color: COLORS.muted,
    background: COLORS.bgCream,
    borderRadius: 10,
    marginTop: 12,
    fontSize: '0.95rem',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: COLORS.maroon,
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: FONT_SANS,
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.88rem',
    fontFamily: FONT_SANS,
  },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    borderBottom: `2px solid ${COLORS.border}`,
    background: COLORS.bgCream,
    color: COLORS.navy,
    fontWeight: 700,
    fontSize: '0.82rem',
  },
  td: {
    padding: '8px 10px',
    borderBottom: `1px solid #e2e8f0`,
    color: COLORS.text,
    verticalAlign: 'top',
  },
  subHead: {
    fontFamily: FONT_SERIF,
    fontWeight: 700,
    fontSize: '0.98rem',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: '0.93rem',
    color: COLORS.text,
    lineHeight: 1.65,
    marginBottom: 10,
  },
  notesBox: {
    background: '#f8fafc',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: '16px 20px',
    marginTop: 20,
  },
  notesTitle: {
    fontFamily: FONT_SERIF,
    fontWeight: 700,
    fontSize: '0.92rem',
    color: COLORS.navy,
    marginBottom: 8,
  },
  notesList: {
    margin: 0,
    paddingLeft: 20,
    fontSize: '0.85rem',
    color: COLORS.subtle,
    lineHeight: 1.7,
  },
  primaryBtn: {
    background: COLORS.maroon,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '11px 18px',
    fontSize: '0.92rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT_SANS,
  },
}
