import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

// ============================================================
// FEGLI RATES (effective 10/1/2021 from OPM.gov)
// ============================================================

const FEGLI_OPTION_A_RATES = {
  employee: { '<35': 0.20, '35-39': 0.20, '40-44': 0.30, '45-49': 0.60, '50-54': 1.00, '55-59': 1.80, '60+': 6.00 },
  annuitant: { '<35': 0.43, '35-39': 0.43, '40-44': 0.65, '45-49': 1.30, '50-54': 2.17, '55-59': 3.90, '60-64': 13.00, '65-69': 13.00, '70-74': 13.00, '75-79': 13.00, '80+': 13.00 }
}

const FEGLI_OPTION_B_RATES = {
  employee: { '<35': 0.02, '35-39': 0.02, '40-44': 0.03, '45-49': 0.06, '50-54': 0.10, '55-59': 0.18, '60-64': 0.40, '65-69': 0.48, '70-74': 0.86, '75-79': 1.80, '80+': 2.88 },
  annuitant: { '<35': 0.043, '35-39': 0.043, '40-44': 0.065, '45-49': 0.130, '50-54': 0.217, '55-59': 0.390, '60-64': 0.867, '65-69': 1.040, '70-74': 1.863, '75-79': 3.900, '80+': 6.240 }
}

const FEGLI_OPTION_C_RATES = {
  employee: { '<35': 0.20, '35-39': 0.24, '40-44': 0.37, '45-49': 0.53, '50-54': 0.83, '55-59': 1.33, '60-64': 2.43, '65-69': 2.83, '70-74': 3.83, '75-79': 5.76, '80+': 7.80 },
  annuitant: { '<35': 0.43, '35-39': 0.52, '40-44': 0.80, '45-49': 1.15, '50-54': 1.80, '55-59': 2.88, '60-64': 5.27, '65-69': 6.13, '70-74': 8.30, '75-79': 12.48, '80+': 16.90 }
}

const FEGLI_BASIC_EMPLOYEE = 0.1600
const FEGLI_BASIC_POSTAL = 0.00
const FEGLI_BASIC_ANNUITANT = 0.3467

function getAgeBracket(age) {
  if (age < 35) return '<35'
  if (age < 40) return '35-39'
  if (age < 45) return '40-44'
  if (age < 50) return '45-49'
  if (age < 55) return '50-54'
  if (age < 60) return '55-59'
  if (age < 65) return '60-64'
  if (age < 70) return '65-69'
  if (age < 75) return '70-74'
  if (age < 80) return '75-79'
  return '80+'
}

function getRate(rateTable, age) {
  const bracket = getAgeBracket(age)
  return rateTable[bracket] || 0
}

function fmt(n) {
  if (n == null || isNaN(n)) return '$0'
  return '$' + Math.round(n).toLocaleString('en-US')
}

function calcFEGLI(salary, currentAge, retireAge, optA, optBMult, optCMult, basicReduction, optAReduction, optBReduction, optCReduction, isPostal = false, retirementStatus = 'active') {
  // Basic Insurance (BIA)
  const bia = Math.ceil(salary / 1000) * 1000 + 2000

  // Current (employee) costs - all ages
  const basicBiwRate = isPostal ? FEGLI_BASIC_POSTAL : FEGLI_BASIC_EMPLOYEE
  const basicBiw = (bia / 1000) * basicBiwRate
  const optABiw = optA ? (10000 / 10000) * getRate(FEGLI_OPTION_A_RATES.employee, currentAge) : 0
  const optBPerK = parseFloat(optBMult) || 0
  const optBBiw = optBPerK > 0 ? optBPerK * (salary / 1000) * getRate(FEGLI_OPTION_B_RATES.employee, currentAge) : 0
  const optCPerMult = parseFloat(optCMult) || 0
  const optCBiw = optCPerMult > 0 ? optCPerMult * getRate(FEGLI_OPTION_C_RATES.employee, currentAge) : 0

  const totalBiw = basicBiw + optABiw + optBBiw + optCBiw
  const totalMonthly = totalBiw * 26 / 12
  const totalAnnual = totalBiw * 26

  // Post-retirement costs at various ages
  const projectionAges = [60, 65, 70, 75, 80]
  const retireCosts = {}

  projectionAges.forEach(projAge => {
    let basicMo = 0, optAMo = 0, optBMo = 0, optCMo = 0

    if (projAge < 65) {
      // Before 65: annuitant rates apply
      basicMo = (bia / 1000) * {
        '75': 0.3467,  // 75% reduction: $0.3467/mo per $1000 until 65, then FREE
        '50': 1.0967,  // 50% reduction: $1.0967/mo per $1000 until 65
        'no': 2.5967   // No reduction: $2.5967/mo per $1000
      }[basicReduction]

      optAMo = optA ? getRate(FEGLI_OPTION_A_RATES.annuitant, projAge) : 0
      optBMo = optBPerK > 0 ? optBPerK * (salary / 1000) * getRate(FEGLI_OPTION_B_RATES.annuitant, projAge) : 0
      optCMo = optCPerMult > 0 ? optCPerMult * getRate(FEGLI_OPTION_C_RATES.annuitant, projAge) : 0
    } else {
      // At 65 and beyond
      if (basicReduction === '75') {
        basicMo = 0  // Coverage reduces to 25% of BIA, but after 65 reduction is free
      } else if (basicReduction === '50') {
        basicMo = (bia / 1000) * 0.75  // 50% reduction: stays at $0.75/mo per $1000
      } else {
        basicMo = (bia / 1000) * 2.25  // No reduction: stays at $2.25/mo per $1000
      }

      if (optAReduction === 'full') {
        optAMo = 0  // Coverage reduces to $0 with full reduction
      } else {
        optAMo = getRate(FEGLI_OPTION_A_RATES.annuitant, projAge)
      }

      if (optBReduction === 'full') {
        optBMo = 0
      } else {
        optBMo = optBPerK > 0 ? optBPerK * (salary / 1000) * getRate(FEGLI_OPTION_B_RATES.annuitant, projAge) : 0
      }

      if (optCReduction === 'full') {
        optCMo = 0
      } else {
        optCMo = optCPerMult > 0 ? optCPerMult * getRate(FEGLI_OPTION_C_RATES.annuitant, projAge) : 0
      }
    }

    retireCosts[projAge] = {
      monthly: basicMo + optAMo + optBMo + optCMo,
      annual: (basicMo + optAMo + optBMo + optCMo) * 12
    }
  })

  return {
    bia,
    optA: optA ? 10000 : 0,
    optB: optBPerK * (salary / 1000),
    optC: optCPerMult * 5000,  // Per OPM: 1 multiple = $5,000 spouse + $2,500 per eligible child
    totalCoverage: bia + (optA ? 10000 : 0) + (optBPerK * (salary / 1000)) + (optCPerMult * 5000),
    currentCostBiw: totalBiw,
    currentCostMonthly: totalMonthly,
    currentCostAnnual: totalAnnual,
    retireCosts
  }
}

export default function FEGLICalculator() {
  useEffect(() => { document.title = 'FEGLI Life Insurance Calculator | FedBenefitsAid' }, [])

  const [fegliSalary, setFegliSalary] = useState('')
  const [fegliAge, setFegliAge] = useState('')
  const [fegliRetireAge, setFegliRetireAge] = useState('')
  const [fegliOptA, setFegliOptA] = useState(true)
  const [fegliOptBMult, setFegliOptBMult] = useState('1')
  const [fegliOptCSpouse, setFegliOptCSpouse] = useState(false)
  const [fegliOptCChildren, setFegliOptCChildren] = useState(false)
  const [fegliOptCMult, setFegliOptCMult] = useState('0')
  const [fegliBasicReduction, setFegliBasicReduction] = useState('75')
  const [fegliOptAReduction, setFegliOptAReduction] = useState('full')
  const [fegliOptBReduction, setFegliOptBReduction] = useState('full')
  const [fegliOptCReduction, setFegliOptCReduction] = useState('full')
  const [fegliIsPostal, setFegliIsPostal] = useState(false)
  const [fegliRetirementStatus, setFegliRetirementStatus] = useState('active')
  const [fegliResults, setFegliResults] = useState(null)
  const [errors, setErrors] = useState([])

  const [captureEmail, setCaptureEmail] = useState('')
  const [captureName, setCaptureName] = useState('')
  const [capturePhone, setCapturePhone] = useState('')
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureSent, setCaptureSent] = useState(false)
  const [captureError, setCaptureError] = useState('')

  function calculate() {
    const errs = []
    const salary = parseFloat(fegliSalary)
    const age = parseFloat(fegliAge)
    if (!salary || salary <= 0) errs.push('Enter your annual gross salary.')
    if (!age || age <= 0) errs.push('Enter your current age.')
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    const result = calcFEGLI(salary, age, parseFloat(fegliRetireAge) || 62, fegliOptA, fegliOptBMult, fegliOptCMult, fegliBasicReduction, fegliOptAReduction, fegliOptBReduction, fegliOptCReduction, fegliIsPostal, fegliRetirementStatus)
    setFegliResults(result)
    setTimeout(() => {
      document.getElementById('fegli-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleEmailCapture = async (e) => {
    e.preventDefault()
    setCaptureError('')
    setCaptureLoading(true)
    try {
      const res = await fetch('/.netlify/functions/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: captureName, email: captureEmail, phone: capturePhone, source: 'FEGLI Calculator' }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setCaptureSent(true)

      // Send results email (fire-and-forget)
      if (fegliResults) {
        const breakdown = [
          { label: 'Basic Insurance (BIA)', value: fmt(fegliResults.bia), type: 'coverage' },
          fegliResults.optA > 0 ? { label: 'Option A', value: fmt(fegliResults.optA), type: 'coverage' } : null,
          fegliResults.optB > 0 ? { label: 'Option B', value: fmt(fegliResults.optB), type: 'coverage' } : null,
          fegliResults.optC > 0 ? { label: 'Option C (Family)', value: fmt(fegliResults.optC), type: 'coverage' } : null,
          { label: 'Total Coverage', value: fmt(fegliResults.totalCoverage), type: 'total' },
          { label: 'Current Monthly Cost', value: fmt(fegliResults.currentCostMonthly), type: 'cost' },
          { label: 'Current Annual Cost', value: fmt(fegliResults.currentCostAnnual), type: 'cost' },
        ].filter(Boolean)

        fetch('/.netlify/functions/send-results-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'fegli-calculator',
            email: captureEmail,
            data: {
              name: captureName,
              totalCoverage: fmt(fegliResults.totalCoverage),
              monthlyCost: fmt(fegliResults.currentCostMonthly),
              breakdown,
            },
          }),
        }).catch(() => {})
      }
    } catch {
      setCaptureError('Something went wrong. Please try again.')
    } finally {
      setCaptureLoading(false)
    }
  }

  const s = styles

  return (
    <main id="main-content" style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.badge}>Free Tool - No Account Required</div>
          <h1 style={s.h1}>FEGLI Life Insurance Calculator</h1>
          <p style={s.subtitle}>
            Understand your Federal Employees' Group Life Insurance (FEGLI) coverage, costs, and retirement impact.
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div style={s.disclaimerBanner}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          This calculator provides estimates for educational purposes only. FEGLI rates and coverage are based on OPM data effective 10/1/2021. Actual benefits may differ. This is not financial advice — consult a qualified federal benefits advisor for personalized guidance. FedBenefitsAid is not affiliated with OPM or the U.S. government.
        </div>

        {/* Back to Calculators link */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/calculators" style={{ fontSize: '0.85rem', color: '#7b1c2e', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Calculators
          </Link>
        </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Your Information</div>
              <Field label="Annual Gross Salary ($)">
                <input
                  type="number" min="20000"
                  value={fegliSalary}
                  onChange={e => setFegliSalary(e.target.value)}
                  placeholder="e.g. 95000"
                  style={s.input}
                />
              </Field>

              <div style={{ marginTop: 16 }}>
                <Field label="Current Age">
                  <input
                    type="number" min="25" max="80"
                    value={fegliAge}
                    onChange={e => setFegliAge(e.target.value)}
                    placeholder="e.g. 50"
                    style={s.input}
                  />
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Employment Status">
                  <select value={fegliRetirementStatus} onChange={e => setFegliRetirementStatus(e.target.value)} style={s.select}>
                    <option value="active">Active Employee</option>
                    <option value="retired-pre65">Retired (Under 65)</option>
                    <option value="retired-65plus">Retired (Age 65+)</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={fegliIsPostal}
                    onChange={e => setFegliIsPostal(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#7b1c2e' }}
                  />
                  <span style={{ fontWeight: 600 }}>USPS Postal Employee</span>
                </label>
                {fegliIsPostal && (
                  <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: 6, marginLeft: 28 }}>USPS pays 100% of your Basic insurance premium</div>
                )}
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Planned Retirement Age">
                  <input
                    type="number" min="50" max="75"
                    value={fegliRetireAge}
                    onChange={e => setFegliRetireAge(e.target.value)}
                    placeholder="e.g. 62"
                    style={s.input}
                  />
                </Field>
              </div>
            </div>

            {/* Coverage Elections Card */}
            <div style={s.card}>
              <div style={s.cardTitle}>Coverage Elections</div>

              <div style={{ marginBottom: 20 }}>
                <Toggle
                  checked={fegliOptA}
                  onChange={e => setFegliOptA(e.target.checked)}
                  label="Option A"
                  sublabel="Standard life insurance – $10,000"
                />
              </div>

              <Field label="Option B – Multiples of salary">
                <select value={fegliOptBMult} onChange={e => setFegliOptBMult(e.target.value)} style={s.select}>
                  <option value="0">Not elected</option>
                  <option value="1">1 multiple</option>
                  <option value="2">2 multiples</option>
                  <option value="3">3 multiples</option>
                  <option value="4">4 multiples</option>
                  <option value="5">5 multiples</option>
                </select>
              </Field>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Option C – Family Coverage</div>
                <div style={{ background: '#f8f7f4', borderRadius: 8, padding: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#0f172a', marginBottom: 10 }}>
                    <input type="checkbox" checked={fegliOptCSpouse} onChange={e => { setFegliOptCSpouse(e.target.checked); if (!e.target.checked && !fegliOptCChildren) setFegliOptCMult('0'); if (e.target.checked && fegliOptCMult === '0') setFegliOptCMult('1'); }}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#7b1c2e' }} />
                    <span><strong>Spouse</strong> — $5,000 per multiple</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#0f172a', marginBottom: 12 }}>
                    <input type="checkbox" checked={fegliOptCChildren} onChange={e => { setFegliOptCChildren(e.target.checked); if (!e.target.checked && !fegliOptCSpouse) setFegliOptCMult('0'); if (e.target.checked && fegliOptCMult === '0') setFegliOptCMult('1'); }}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#7b1c2e' }} />
                    <span><strong>Children</strong> — $2,500 per child per multiple</span>
                  </label>
                  {(fegliOptCSpouse || fegliOptCChildren) && (
                    <Field label="Number of Multiples (1–5)">
                      <select value={fegliOptCMult} onChange={e => setFegliOptCMult(e.target.value)} style={s.select}>
                        <option value="1">1 multiple</option>
                        <option value="2">2 multiples</option>
                        <option value="3">3 multiples</option>
                        <option value="4">4 multiples</option>
                        <option value="5">5 multiples</option>
                      </select>
                    </Field>
                  )}
                  {(fegliOptCSpouse || fegliOptCChildren) && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 10, lineHeight: 1.5 }}>
                      {fegliOptCSpouse && <div>Spouse coverage: {fmt(parseInt(fegliOptCMult) * 5000)}</div>}
                      {fegliOptCChildren && <div>Each child: {fmt(parseInt(fegliOptCMult) * 2500)}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reduction Elections Card */}
            <div style={s.card}>
              <div style={s.cardTitle}>Post-Retirement Reductions at Age 65</div>

              <Field label="Basic Insurance">
                <select value={fegliBasicReduction} onChange={e => setFegliBasicReduction(e.target.value)} style={s.select}>
                  <option value="75">75% Reduction – Coverage becomes free after 65</option>
                  <option value="50">50% Reduction – Moderate cost; keep more coverage</option>
                  <option value="no">No Reduction – Full coverage; highest cost</option>
                </select>
              </Field>

              <div style={{ marginTop: 16 }}>
                <Field label="Option A">
                  <select value={fegliOptAReduction} onChange={e => setFegliOptAReduction(e.target.value)} style={s.select}>
                    <option value="full">Full Reduction – Coverage reduces to $0 after 65</option>
                    <option value="none">No Reduction – Keep coverage for life</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Option B">
                  <select value={fegliOptBReduction} onChange={e => setFegliOptBReduction(e.target.value)} style={s.select}>
                    <option value="full">Full Reduction – Coverage drops at 65</option>
                    <option value="none">No Reduction – Continue paying; coverage continues</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Option C">
                  <select value={fegliOptCReduction} onChange={e => setFegliOptCReduction(e.target.value)} style={s.select}>
                    <option value="full">Full Reduction – Coverage drops at 65</option>
                    <option value="none">No Reduction – Continue paying; coverage continues</option>
                  </select>
                </Field>
              </div>
            </div>

            <button onClick={calculate} style={s.button}>Calculate My FEGLI Coverage</button>

            {errors.length > 0 && (
              <div role="alert" style={s.errorBox}>
                {errors.map((err, i) => <div key={i} style={{ marginBottom: i < errors.length - 1 ? 8 : 0 }}>{err}</div>)}
              </div>
            )}

            {/* Coverage Summary Cards - Inline */}
            {fegliResults && (
              <div id="fegli-results"></div>
            )}
            {fegliResults && (
              <div>
                <div style={s.card}>
                  <div style={s.cardTitle}>Your Coverage Breakdown</div>
                  <div style={s.grid2}>
                    <div style={{ ...s.resultBox, borderLeft: '4px solid #7b1c2e' }}>
                      <div style={s.resultLabel}>Basic Insurance</div>
                      <div style={s.resultValue}>{fmt(fegliResults.bia)}</div>
                    </div>
                    {fegliResults.optA > 0 && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #0f172a' }}>
                        <div style={s.resultLabel}>Option A</div>
                        <div style={s.resultValue}>{fmt(fegliResults.optA)}</div>
                      </div>
                    )}
                    {fegliResults.optB > 0 && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #1e3a5f' }}>
                        <div style={s.resultLabel}>Option B</div>
                        <div style={s.resultValue}>{fmt(fegliResults.optB)}</div>
                      </div>
                    )}
                    {fegliResults.optC > 0 && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #64748b' }}>
                        <div style={s.resultLabel}>Option C – Family</div>
                        <div style={s.resultValue}>{fmt(fegliResults.optC)}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 6 }}>
                          {fegliOptCSpouse && <span>Spouse: {fmt(parseInt(fegliOptCMult) * 5000)}</span>}
                          {fegliOptCSpouse && fegliOptCChildren && <span> + </span>}
                          {fegliOptCChildren && <span>Children: {fmt(parseInt(fegliOptCMult) * 2500)}/ea</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>Total Coverage</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#7b1c2e' }}>{fmt(fegliResults.totalCoverage)}</div>
                  </div>
                </div>

                {/* Current Costs Card */}
                <div style={s.card}>
                  <div style={s.cardTitle}>Current Monthly Cost</div>
                  <div style={s.grid2}>
                    <div style={{ ...s.resultBox, borderLeft: '4px solid #7b1c2e' }}>
                      <div style={s.resultLabel}>Monthly Deduction</div>
                      <div style={s.resultValue}>{fmt(fegliResults.currentCostMonthly)}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 8 }}>Biweekly: {fmt(fegliResults.currentCostBiw)}</div>
                    </div>
                    <div style={{ ...s.resultBox, borderLeft: '4px solid #0f172a' }}>
                      <div style={s.resultLabel}>Annual Cost</div>
                      <div style={s.resultValue}>{fmt(fegliResults.currentCostAnnual)}</div>
                    </div>
                  </div>
                </div>

                {/* Cost at Key Ages */}
                <div style={s.card}>
                  <div style={s.cardTitle}>Projected Costs at Key Ages</div>
                  <div style={s.grid2}>
                    {fegliResults.retireCosts['65'] && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #1e3a5f' }}>
                        <div style={s.resultLabel}>Age 65 (Monthly)</div>
                        <div style={s.resultValue}>{fmt(fegliResults.retireCosts['65'].monthly)}</div>
                      </div>
                    )}
                    {fegliResults.retireCosts['75'] && (
                      <div style={{ ...s.resultBox, borderLeft: '4px solid #1e3a5f' }}>
                        <div style={s.resultLabel}>Age 75 (Monthly)</div>
                        <div style={s.resultValue}>{fmt(fegliResults.retireCosts['75'].monthly)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* How to Calculate Section */}
            <div style={s.card}>
              <div style={s.cardTitle}>How FEGLI Costs Are Calculated</div>
              <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.8 }}>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#0f172a' }}>Basic Insurance:</strong> (Coverage ÷ 1,000) × Rate per $1,000 = Monthly Cost
                  <br /><span style={{ fontSize: '0.85rem', color: '#64748b' }}>Regular employees pay $0.3250 per $1,000 biweekly; Postal employees pay $0.00</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#0f172a' }}>Option A:</strong> Fixed monthly rate from age brackets
                  <br /><span style={{ fontSize: '0.85rem', color: '#64748b' }}>$0.20–$6.00 biweekly (employee rates) or $0.43–$13.00 monthly (annuitant rates)</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#0f172a' }}>Option B:</strong> (Salary × Multiples ÷ 1,000) × Rate per $1,000 = Monthly Cost
                  <br /><span style={{ fontSize: '0.85rem', color: '#64748b' }}>Per $1,000 of coverage elected</span>
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Option C:</strong> Fixed rate × Number of Multiples = Monthly Cost
                  <br /><span style={{ fontSize: '0.85rem', color: '#64748b' }}>One multiple = $5,000 spouse + $2,500 per eligible child</span>
                </div>
              </div>
            </div>

            {/* FEGLI Rate Table */}
            <div style={s.card}>
              <div style={s.cardTitle}>FEGLI Premium Rate Table (Biweekly / Monthly)</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>Rates effective 10/1/2021. Postal employees: $0.00 for Basic (employer pays).</p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: 20 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8f7f4' }}>
                      <th scope="col" style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Age</th>
                      <th scope="col" style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Basic</th>
                      <th scope="col" style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Option A</th>
                      <th scope="col" style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Option B/K</th>
                      <th scope="col" style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#0f172a' }}>Option C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { age: 'Under 35', bracket: '<35', bia: '$0.33', a: '$0.20', b: '$0.02', c: '$0.20' },
                      { age: '35–39', bracket: '35-39', bia: '$0.33', a: '$0.20', b: '$0.02', c: '$0.24' },
                      { age: '40–44', bracket: '40-44', bia: '$0.33', a: '$0.30', b: '$0.03', c: '$0.37' },
                      { age: '45–49', bracket: '45-49', bia: '$0.33', a: '$0.60', b: '$0.06', c: '$0.53' },
                      { age: '50–54', bracket: '50-54', bia: '$0.33', a: '$1.00', b: '$0.10', c: '$0.83' },
                      { age: '55–59', bracket: '55-59', bia: '$0.33', a: '$1.80', b: '$0.18', c: '$1.33' },
                      { age: '60–64', bracket: '60-64', bia: '$0.33', a: '$6.00', b: '$0.40', c: '$2.43' },
                      { age: '65–69', bracket: '65-69', bia: '$0.33', a: '$6.00', b: '$0.48', c: '$2.83' },
                      { age: '70–74', bracket: '70-74', bia: '$0.33', a: '$6.00', b: '$0.86', c: '$3.83' },
                      { age: '75–79', bracket: '75-79', bia: '$0.33', a: '$6.00', b: '$1.80', c: '$5.76' },
                      { age: '80+', bracket: '80+', bia: '$0.33', a: '$6.00', b: '$2.88', c: '$7.80' },
                    ].map((row, idx) => {
                      const currentBracket = fegliAge ? getAgeBracket(parseFloat(fegliAge)) === row.bracket : false
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: currentBracket ? '#fffbeb' : 'transparent' }}>
                          <td style={{ padding: '10px 8px', color: '#475569', fontWeight: currentBracket ? 700 : 400 }}>
                            {row.age}
                            {currentBracket && <span style={{ color: '#7b1c2e', marginLeft: 8 }}>← You</span>}
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: '#475569' }}>{row.bia}</td>
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: '#475569' }}>{row.a}</td>
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: '#475569' }}>{row.b}</td>
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: '#475569' }}>{row.c}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Rates shown are <strong>employee</strong> rates (biweekly). Annuitant (retiree) rates for Options A, B, C are typically higher. Consult OPM for full annuitant rate table.</p>
            </div>

            {/* Cost Projection Over Time */}
            {fegliResults && (
              <div style={s.card}>
                <div style={s.cardTitle}>Cost Projection Over Time</div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 16 }}>Estimated monthly and annual costs at key ages, based on your elections.</p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8f7f4' }}>
                        <th scope="col" style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Age</th>
                        <th scope="col" style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Monthly Cost</th>
                        <th scope="col" style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>Annual Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[60, 65, 70, 75, 80].map((age) => {
                        const costs = fegliResults.retireCosts[age]
                        const isCurrent = parseFloat(fegliAge) >= age - 2 && parseFloat(fegliAge) < age + 5
                        return (
                          <tr key={age} style={{ borderBottom: '1px solid #e2e8f0', background: isCurrent ? '#fffbeb' : 'transparent' }}>
                            <td style={{ padding: '8px', color: '#475569', fontWeight: isCurrent ? 700 : 400 }}>
                              Age {age}
                              {isCurrent && <span style={{ color: '#7b1c2e', marginLeft: 8 }}>← Current bracket</span>}
                            </td>
                            <td style={{ textAlign: 'right', padding: '8px', color: '#475569' }}>{fmt(costs.monthly)}</td>
                            <td style={{ textAlign: 'right', padding: '8px', fontWeight: 600, color: '#0f172a' }}>{fmt(costs.annual)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* Email Capture + CTA - only after calculating */}
            {fegliResults && (<>
            <div style={s.card}>
              <div style={s.cardTitle}>Save & Share Your Results</div>
              {captureSent ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>Results saved!</p>
                  <p style={{ color: '#4ade80', fontSize: 14, margin: 0 }}>Check your email for a summary of your numbers.</p>
                </div>
              ) : (
                <form onSubmit={handleEmailCapture}>
                  <div style={s.grid2}>
                    <Field label="Name">
                      <input
                        type="text"
                        value={captureName}
                        onChange={e => setCaptureName(e.target.value)}
                        placeholder="Your full name"
                        style={s.input}
                        required
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        value={captureEmail}
                        onChange={e => setCaptureEmail(e.target.value)}
                        placeholder="your@email.com"
                        style={s.input}
                        required
                      />
                    </Field>
                  </div>
                  <Field label="Phone (optional)">
                    <input
                      type="tel"
                      value={capturePhone}
                      onChange={e => setCapturePhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      style={s.input}
                    />
                  </Field>
                  {captureError && <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{captureError}</div>}
                  <button
                    type="submit"
                    disabled={captureLoading}
                    style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: captureLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {captureLoading ? 'Sending...' : 'Email My Results'}
                  </button>
                </form>
              )}
            </div>

            {/* Consultation CTA */}
            <div style={s.card}>
              <div style={s.cardTitle}>Need help choosing the right FEGLI coverage?</div>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                Want a second opinion on your FEGLI elections? Book a free 30-minute consultation to review your coverage options, costs, and alternatives for your family situation.
              </p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', background: '#7b1c2e', color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
              >
                Book Free Consultation
              </a>
            </div>
            </>)}

            {/* Important Assumptions */}
            <div style={s.assumptionsBox}>
              <div style={s.assumptionsTitle}>Calculation Notes & Assumptions</div>
              <div style={s.assumptionsGrid}>
                <div style={s.assumptionItem}>
                  <strong>Basic Insurance:</strong> BIA = Gross Salary (rounded to nearest $1,000) + $2,000. Regular employees pay $0.3250/K biweekly; Postal employees pay $0.00.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Option A:</strong> $10,000 fixed coverage. Rates increase sharply at age 60+. Annuitant rates apply in retirement.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Option B:</strong> Multiple of salary. Cost = (Salary × Multiples) ÷ 1,000 × Age-Based Rate.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Option C:</strong> Family coverage. One multiple = $5,000 for spouse + $2,500 per eligible child. Up to 5 multiples.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Reduction Elections:</strong> Basic has 3 options: 75% (free after 65), 50% (reduced cost), or No Reduction. Options A/B/C reduce by 2% per month after 65 with Full Reduction (to $0) or keep coverage with No Reduction.
                </div>
                <div style={s.assumptionItem}>
                  <strong>Postal Employees:</strong> No cost for Basic Insurance (employer pays 100%). Options A, B, C rates are the same.
                </div>
              </div>
            </div>

      </div>
    </main>
  )
}

function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        aria-label={label}
      />
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? '#7b1c2e' : '#cbd5e1',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: '#64748b' }}>{sublabel}</div>}
      </div>
    </label>
  )
}

function Field({ label, hint, children }) {
  const id = 'field-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={fieldStyles.label}>{label}</label>
      {React.isValidElement(children) ? React.cloneElement(children, { id }) : children}
      {hint && <div style={fieldStyles.hint}>{hint}</div>}
    </div>
  )
}

const fieldStyles = {
  label: { fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif" },
  hint:  { fontSize: '0.73rem', color: '#64748b', lineHeight: 1.4 },
}

const styles = {
  page: { minHeight: '100vh', background: '#faf9f6', paddingBottom: 80 },
  container: { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },

  header: { textAlign: 'center', marginBottom: 36, background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)', color: '#fff', padding: '48px 32px', borderRadius: 12, marginLeft: -20, marginRight: -20, paddingLeft: 'calc(20px + 32px)', paddingRight: 'calc(20px + 32px)' },
  badge: { display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, marginBottom: 14 },
  h1: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif", letterSpacing: '-0.02em', marginBottom: 12 },
  subtitle: { fontSize: '1rem', color: 'rgba(255,255,255,0.85)', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 },

  disclaimerBanner: { background: '#f8f7f4', borderLeft: '3px solid #cbd5e1', padding: '12px 16px', fontSize: '12px', color: '#475569', borderRadius: 6, marginBottom: 24 },

  card: { background: '#fff', borderRadius: 12, padding: 32, marginBottom: 24, boxShadow: '0 1px 3px rgba(15,23,42,0.08)' },
  cardTitle: { fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7b1c2e', marginBottom: 20 },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },

  input: { border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px', fontSize: '0.95rem', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif", width: '100%', boxSizing: 'border-box' },
  select: { border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px', fontSize: '0.95rem', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif", background: '#fff', width: '100%', boxSizing: 'border-box' },

  resultBox: { background: '#f8f7f4', borderRadius: 8, padding: 16, borderLeft: '3px solid #cbd5e1' },
  resultLabel: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 },
  resultValue: { fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' },

  button: { background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 36px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif", marginTop: 8, marginBottom: 8 },

  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, color: '#991b1b', fontSize: '0.9rem', marginTop: 16, marginBottom: 16 },

  assumptionsBox: { background: '#f0f9ff', borderRadius: 12, padding: 24, marginTop: 24, marginBottom: 24 },
  assumptionsTitle: { fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f172a', marginBottom: 16 },
  assumptionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 },
  assumptionItem: { fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 },
}
