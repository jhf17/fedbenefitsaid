import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const navy = '#0f172a'
const maroon = '#7b1c2e'
const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

// ============================================================
// 10 QUESTIONS — organized by retirement planning category
// ============================================================
const QUESTIONS = [
  {
    id: 'years_until',
    category: 'income',
    question: 'How many years until you plan to retire?',
    sub: 'This helps us tailor your checklist to your timeline.',
    options: [
      { label: 'Less than 2 years', value: 'lt2', weight: 3 },
      { label: '2–5 years', value: '2to5', weight: 2 },
      { label: '6–10 years', value: '6to10', weight: 1 },
      { label: '10+ years', value: 'gt10', weight: 0 },
    ]
  },
  {
    id: 'years_service',
    category: 'pension',
    question: 'How many years of federal service do you have?',
    sub: 'Your pension calculation depends heavily on your creditable service.',
    options: [
      { label: 'Under 5 years', value: 'lt5', weight: 0 },
      { label: '5–15 years', value: '5to15', weight: 1 },
      { label: '16–25 years', value: '16to25', weight: 2 },
      { label: '25+ years', value: 'gt25', weight: 3 },
    ]
  },
  {
    id: 'retirement_system',
    category: 'pension',
    question: 'Which federal retirement system are you under?',
    sub: 'Most employees hired after 1987 are under FERS. Employees hired after 2013 are FERS-FRAE.',
    options: [
      { label: 'FERS (hired 1987–2012)', value: 'fers', weight: 2 },
      { label: 'FERS-FRAE (hired after 2013)', value: 'frae', weight: 2 },
      { label: 'CSRS (hired before 1987)', value: 'csrs', weight: 2 },
      { label: "I'm not sure", value: 'unknown', weight: 0 },
    ]
  },
  {
    id: 'ran_estimate',
    category: 'pension',
    question: 'Have you run an official retirement estimate?',
    sub: 'This is the calculation from your HR office showing your projected pension amount.',
    options: [
      { label: 'Yes, within the last year', value: 'recent', weight: 3 },
      { label: 'Yes, but more than 2 years ago', value: 'old', weight: 1 },
      { label: "No, I haven't", value: 'no', weight: 0 },
      { label: "I didn't know I could request one", value: 'unknown', weight: 0 },
    ]
  },
  {
    id: 'sick_leave',
    category: 'pension',
    question: 'Do you know how unused sick leave affects your pension?',
    sub: 'Your accumulated sick leave can add months or even years to your pension calculation.',
    options: [
      { label: 'Yes, I know exactly how it works', value: 'yes', weight: 3 },
      { label: "I've heard it matters but don't know the details", value: 'partial', weight: 1 },
      { label: "No, I didn't know sick leave affects my pension", value: 'no', weight: 0 },
    ]
  },
  {
    id: 'tsp_planning',
    category: 'tsp',
    question: 'Have you reviewed your TSP withdrawal strategy?',
    sub: 'How you withdraw from TSP in retirement can significantly affect your tax burden and income.',
    options: [
      { label: 'Yes, I have a clear withdrawal plan', value: 'yes', weight: 3 },
      { label: "I've started looking into it", value: 'partial', weight: 1 },
      { label: "No, I haven't thought about withdrawals yet", value: 'no', weight: 0 },
      { label: "I'm not sure what my options are", value: 'unknown', weight: 0 },
    ]
  },
  {
    id: 'ss_strategy',
    category: 'income',
    question: 'Do you have a Social Security claiming strategy?',
    sub: 'When you claim Social Security can mean tens of thousands of dollars difference over your lifetime.',
    options: [
      { label: 'Yes, I know when I plan to claim and why', value: 'yes', weight: 3 },
      { label: "I know the basics but haven't decided", value: 'partial', weight: 1 },
      { label: "No, I haven't thought about it", value: 'no', weight: 0 },
      { label: "I checked my estimate at ssa.gov", value: 'checked', weight: 2 },
    ]
  },
  {
    id: 'fehb_knowledge',
    category: 'healthcare',
    question: 'Do you know how your FEHB health insurance works in retirement?',
    sub: 'You must meet certain requirements to keep FEHB coverage, and the costs change.',
    options: [
      { label: 'Yes, I understand the 5-year rule and costs', value: 'yes', weight: 3 },
      { label: 'Somewhat — I know I can keep it but not the details', value: 'partial', weight: 1 },
      { label: "No, I assumed it just continues automatically", value: 'no', weight: 0 },
    ]
  },
  {
    id: 'medicare_coordination',
    category: 'healthcare',
    question: 'Do you understand how Medicare coordinates with FEHB?',
    sub: 'At age 65, Medicare becomes available and interacts with your federal health insurance in important ways.',
    options: [
      { label: 'Yes, I know how they work together', value: 'yes', weight: 3 },
      { label: "I know I'll need Medicare but not how it fits with FEHB", value: 'partial', weight: 1 },
      { label: "No, this is new to me", value: 'no', weight: 0 },
      { label: "I'm not close to 65 yet", value: 'na', weight: 2 },
    ]
  },
  {
    id: 'fegli_review',
    category: 'income',
    question: 'Have you reviewed your FEGLI life insurance for retirement?',
    sub: 'FEGLI premiums increase significantly after retirement. Many retirees overpay for coverage they no longer need.',
    options: [
      { label: 'Yes, I know what I plan to keep or drop', value: 'yes', weight: 3 },
      { label: "I know costs go up but haven't reviewed options", value: 'partial', weight: 1 },
      { label: "No, I haven't looked at FEGLI", value: 'no', weight: 0 },
      { label: "I didn't know FEGLI changes in retirement", value: 'unknown', weight: 0 },
    ]
  },
]

// ============================================================
// CATEGORY DEFINITIONS
// ============================================================
const CATEGORIES = {
  pension: { label: 'Pension Readiness', icon: '$', color: '#1e3a5f' },
  tsp: { label: 'TSP Strategy', icon: 'T', color: '#2563eb' },
  healthcare: { label: 'Healthcare Planning', icon: '+', color: '#059669' },
  income: { label: 'Income Optimization', icon: '%', color: '#7b1c2e' },
}

// ============================================================
// SCORING
// ============================================================
function getCategoryScores(answers) {
  const cats = {}
  Object.keys(CATEGORIES).forEach(catId => {
    const qs = QUESTIONS.filter(q => q.category === catId)
    let score = 0
    let max = 0
    qs.forEach(q => {
      const chosen = q.options.find(o => o.value === answers[q.id])
      const qMax = Math.max(...q.options.map(o => o.weight))
      if (chosen) score += chosen.weight
      max += qMax
    })
    const pct = max > 0 ? score / max : 0
    let level, levelColor
    if (pct >= 0.7) { level = 'Strong'; levelColor = '#065f46' }
    else if (pct >= 0.4) { level = 'Needs Work'; levelColor = '#92400e' }
    else { level = 'Gap'; levelColor = '#991b1b' }
    cats[catId] = { score, max, pct, level, levelColor }
  })
  return cats
}

function getOverallResult(catScores) {
  const totalScore = Object.values(catScores).reduce((s, c) => s + c.score, 0)
  const totalMax = Object.values(catScores).reduce((s, c) => s + c.max, 0)
  const pct = totalMax > 0 ? totalScore / totalMax : 0

  if (pct >= 0.7) {
    return {
      level: 'On Track',
      color: '#065f46',
      bg: '#d1fae5',
      icon: '\u2713',
      summary: 'You have a solid foundation. A few targeted steps will put you in an excellent position for retirement.',
    }
  } else if (pct >= 0.4) {
    return {
      level: 'Needs Attention',
      color: '#92400e',
      bg: '#fef3c7',
      icon: '!',
      summary: 'There are important gaps in your retirement planning. The good news: you have time to address them with the right steps.',
    }
  } else {
    return {
      level: 'Action Required',
      color: '#991b1b',
      bg: '#fee2e2',
      icon: '\u2717',
      summary: 'You have significant planning gaps that could cost you money in retirement. Let\u2019s build a clear action plan.',
    }
  }
}

// ============================================================
// SMART CHECKLIST GENERATOR
// ============================================================
function getChecklist(answers) {
  const items = []
  const yearsUntil = answers.years_until
  const yearsService = answers.years_service
  const system = answers.retirement_system

  // --- PENSION ---
  if (answers.retirement_system === 'unknown') {
    items.push({
      priority: 'high',
      category: 'pension',
      task: 'Confirm your retirement system (FERS, FERS-FRAE, or CSRS) with your HR office. This determines your entire pension formula.',
    })
  }

  if (['no', 'unknown'].includes(answers.ran_estimate)) {
    const serviceNote = yearsService === 'gt25'
      ? ' With 25+ years of service, your pension is likely your single largest retirement asset.'
      : yearsService === '16to25'
      ? ' With 16-25 years of service, your pension will be a significant income source.'
      : ''
    items.push({
      priority: 'high',
      category: 'pension',
      task: `Request an official retirement estimate from your HR office.${serviceNote} This will show your projected monthly pension, survivor benefit options, and earliest eligibility date.`,
    })
  } else if (answers.ran_estimate === 'old') {
    items.push({
      priority: 'medium',
      category: 'pension',
      task: 'Update your retirement estimate \u2014 yours is more than 2 years old. Salary changes and additional service time can significantly change your numbers.',
    })
  }

  if (['no', 'partial'].includes(answers.sick_leave)) {
    items.push({
      priority: 'medium',
      category: 'pension',
      task: answers.sick_leave === 'no'
        ? 'Learn how unused sick leave adds to your pension. Under FERS, your accumulated sick leave hours are converted to additional months of service in your pension calculation \u2014 this can add hundreds of dollars per month to your pension.'
        : 'Review exactly how your sick leave balance converts to pension credit. Check your last Leave and Earnings Statement for your current balance, then use the FERS sick leave conversion chart to see what it adds.',
    })
  }

  // --- TSP ---
  if (['no', 'unknown'].includes(answers.tsp_planning)) {
    items.push({
      priority: 'high',
      category: 'tsp',
      task: 'Review your TSP withdrawal options before retirement. You have three choices: monthly payments, single withdrawal, or a TSP life annuity. Each has different tax implications. Use the FedBenefitsAid calculator to model the 4% withdrawal rule against your balance.',
    })
  } else if (answers.tsp_planning === 'partial') {
    items.push({
      priority: 'medium',
      category: 'tsp',
      task: 'Finalize your TSP withdrawal strategy. Compare monthly installments vs. the 4% rule vs. a TSP annuity. Consider your tax bracket in retirement \u2014 spreading withdrawals can reduce your tax burden.',
    })
  }

  // --- SOCIAL SECURITY ---
  if (['no'].includes(answers.ss_strategy)) {
    items.push({
      priority: 'high',
      category: 'income',
      task: 'Create a Social Security claiming strategy. Start by checking your estimated benefit at ssa.gov/myaccount. Claiming at 62 vs. 67 vs. 70 can mean a 40-77% difference in your monthly check. For FERS employees, this decision interacts with your FERS Supplement.',
    })
  } else if (answers.ss_strategy === 'partial') {
    items.push({
      priority: 'medium',
      category: 'income',
      task: 'Finalize your Social Security claiming age. If you have a FERS Supplement (payable until 62), delaying Social Security to your Full Retirement Age (67) or later can maximize your lifetime income.',
    })
  } else if (answers.ss_strategy === 'checked') {
    items.push({
      priority: 'medium',
      category: 'income',
      task: 'Good \u2014 you\u2019ve checked your estimate. Now decide your claiming age. Delaying from 62 to 67 increases your monthly benefit by about 40%. Delaying to 70 adds another 24%.',
    })
  }

  // --- FEHB ---
  if (['no'].includes(answers.fehb_knowledge)) {
    items.push({
      priority: 'high',
      category: 'healthcare',
      task: 'Learn the FEHB 5-year rule now: you must be enrolled in FEHB for the 5 consecutive years immediately before retirement (or since your first eligibility) to keep it. If you dropped coverage at any point, verify you still qualify.',
    })
  } else if (answers.fehb_knowledge === 'partial') {
    items.push({
      priority: 'medium',
      category: 'healthcare',
      task: 'Review your FEHB plan choice for retirement. As a retiree, you\u2019ll pay the same percentage as active employees. Consider whether Self Only vs. Self + One makes sense if your spouse will have their own coverage.',
    })
  }

  // --- MEDICARE ---
  if (['no'].includes(answers.medicare_coordination)) {
    items.push({
      priority: 'high',
      category: 'healthcare',
      task: 'Understand how Medicare and FEHB work together. Most federal retirees should enroll in Medicare Part A (free) and Part B ($185/mo in 2026) at 65. Medicare becomes your primary insurer, and FEHB becomes secondary \u2014 this combination often results in little to no out-of-pocket costs.',
    })
  } else if (answers.medicare_coordination === 'partial') {
    items.push({
      priority: 'medium',
      category: 'healthcare',
      task: 'Decide whether to enroll in Medicare Part B at 65. If you have FEHB, Part B is optional but recommended \u2014 the combination virtually eliminates out-of-pocket medical costs. Compare the $185/mo premium against your current FEHB copays.',
    })
  }

  // --- FEGLI ---
  if (['no', 'unknown'].includes(answers.fegli_review)) {
    items.push({
      priority: 'high',
      category: 'income',
      task: answers.fegli_review === 'unknown'
        ? 'Important: FEGLI premiums increase dramatically in retirement, especially after age 65. Basic coverage stays affordable, but Options B and C become very expensive. Review your coverage now and consider whether private term life insurance is a better value.'
        : 'Review your FEGLI elections before retirement. Many retirees keep expensive Options B and C coverage they no longer need. Basic coverage (free after age 65 with the 75% reduction) is often sufficient.',
    })
  } else if (answers.fegli_review === 'partial') {
    items.push({
      priority: 'medium',
      category: 'income',
      task: 'Run the numbers on your FEGLI options. Compare the post-retirement cost of Options A, B, and C against private term life insurance quotes. Most retirees save significantly by dropping optional FEGLI coverage.',
    })
  }

  // --- TIMELINE-BASED ---
  if (yearsUntil === 'lt2') {
    items.push({
      priority: 'high',
      category: 'pension',
      task: 'With less than 2 years to go: submit your retirement application at least 3-6 months before your target date. Contact your HR office to start the paperwork process now.',
    })
    items.push({
      priority: 'high',
      category: 'income',
      task: 'Make your FEGLI life insurance election \u2014 you must decide within 30 days of retirement what coverage to keep. This cannot be changed later.',
    })
  }

  // --- UNIVERSAL ---
  items.push({
    priority: 'medium',
    category: 'pension',
    task: 'Use the FedBenefitsAid retirement calculator to model your full income picture \u2014 pension, TSP, and Social Security combined.',
  })
  items.push({
    priority: 'low',
    category: 'income',
    task: 'Book a free 30-minute consultation with a federal benefits specialist to review your complete plan.',
  })

  return items
}

const priorityColors = {
  high: { bg: '#fee2e2', text: '#991b1b', label: 'High Priority', border: '#fca5a5' },
  medium: { bg: '#fef3c7', text: '#92400e', label: 'Important', border: '#fcd34d' },
  low: { bg: '#dbeafe', text: '#1d4ed8', label: 'Recommended', border: '#93c5fd' },
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Assessment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [showScore, setShowScore] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)

  // Email capture state
  const [captureName, setCaptureName] = useState('')
  const [captureEmail, setCaptureEmail] = useState('')
  const [capturePhone, setCapturePhone] = useState('')
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureError, setCaptureError] = useState('')

  const question = QUESTIONS[step]
  const totalSteps = QUESTIONS.length
  const progress = ((step) / totalSteps) * 100

  const handleSelect = (value) => setSelected(value)

  const handleNext = () => {
    const newAnswers = { ...answers, [question.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (step + 1 >= totalSteps) {
      setShowScore(true)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      const prevQ = QUESTIONS[step - 1]
      setSelected(answers[prevQ.id] || null)
      setStep(step - 1)
    }
  }

  const handleUnlockChecklist = async () => {
    if (!captureEmail) {
      setCaptureError('Please enter your email address.')
      return
    }
    setCaptureError('')
    setCaptureLoading(true)
    try {
      await fetch('/.netlify/functions/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: captureName,
          email: captureEmail,
          phone: capturePhone,
          source: 'Assessment',
        }),
      })
    } catch {
      // Silent fail
    }
    setCaptureLoading(false)
    setShowChecklist(true)
  }

  // If user is already logged in, auto-fill and skip gate
  const handleUnlockForUser = () => {
    setShowChecklist(true)
  }

  const catScores = showScore ? getCategoryScores(answers) : null
  const result = showScore ? getOverallResult(catScores) : null
  const checklist = showScore ? getChecklist(answers) : []

  // ============================================================
  // RESULTS SCREEN
  // ============================================================
  if (showScore) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(160deg, ${navy} 0%, #1e3a5f 100%)`, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Your Results</div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 700, margin: '0 0 16px' }}>Retirement Readiness Assessment</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: result.bg, borderRadius: 50, padding: '10px 24px' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: result.color }}>{result.icon}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: result.color }}>{result.level}</span>
          </div>
          <p style={{ color: '#cbd5e1', maxWidth: 540, margin: '16px auto 0', fontSize: 15, lineHeight: 1.6 }}>{result.summary}</p>
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
          {/* Category Breakdown */}
          <h2 style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 16 }}>Your Scores by Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
            {Object.entries(CATEGORIES).map(([catId, cat]) => {
              const cs = catScores[catId]
              const barPct = Math.round(cs.pct * 100)
              return (
                <div key={catId} style={{ background: '#fff', borderRadius: 12, padding: '16px 14px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, background: cat.color + '15', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 800, color: cat.color, fontSize: '0.85rem' }}>{cat.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{cat.label}</div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: barPct + '%', background: cs.levelColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cs.levelColor }}>{cs.level}</div>
                </div>
              )
            })}
          </div>

          {/* EMAIL GATE or CHECKLIST */}
          {!showChecklist ? (
            <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #e2e8f0', padding: '32px 28px', textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 8 }}>
                Unlock Your Personalized Checklist
              </div>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
                Based on your answers, we built a step-by-step action plan tailored to your situation. Enter your email to see it — plus get free access to our retirement tools.
              </p>

              {user ? (
                <div>
                  <p style={{ fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 16 }}>
                    You are signed in — your checklist is ready.
                  </p>
                  <button onClick={handleUnlockForUser} style={{ background: maroon, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%', maxWidth: 320 }}>
                    Show My Checklist
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: 360, margin: '0 auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={captureName}
                      onChange={e => setCaptureName(e.target.value)}
                      style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={captureEmail}
                      onChange={e => setCaptureEmail(e.target.value)}
                      required
                      style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      value={capturePhone}
                      onChange={e => setCapturePhone(e.target.value)}
                      style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  {captureError && (
                    <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{captureError}</div>
                  )}
                  <button
                    onClick={handleUnlockChecklist}
                    disabled={captureLoading}
                    style={{ background: maroon, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: captureLoading ? 'not-allowed' : 'pointer', width: '100%', opacity: captureLoading ? 0.7 : 1 }}
                  >
                    {captureLoading ? 'Loading...' : 'Show My Checklist'}
                  </button>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
                    No spam. We will only contact you about your retirement planning.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* PERSONALIZED CHECKLIST */}
              <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 8 }}>Your Personalized Action Plan</h2>
              <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
                {checklist.filter(i => i.priority === 'high').length} high-priority items based on your answers. Tackle these first.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {checklist.map((item, i) => {
                  const p = priorityColors[item.priority]
                  const cat = CATEGORIES[item.category]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${p.border}` }}>
                      <div style={{ flexShrink: 0, width: 22, height: 22, border: `2px solid ${p.text}`, borderRadius: 4, marginTop: 1 }} />
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 14, color: navy, fontWeight: 500, lineHeight: 1.6 }}>{item.task}</div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: p.text, background: p.bg, padding: '2px 8px', borderRadius: 4 }}>{p.label}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{cat.label}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTAs */}
              <div style={{ background: `linear-gradient(135deg, ${navy} 0%, #1e3a5f 100%)`, borderRadius: 16, padding: '32px 24px', textAlign: 'center', marginBottom: 24 }}>
                <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Take the next step</div>
                <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px' }}>
                  Use our free tools to start checking items off your list, or book a free consultation to walk through everything with an expert.
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate('/calculator')} style={{ background: maroon, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Run the Calculator
                  </button>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
                    Book Free Consultation
                  </a>
                  <button onClick={() => navigate(user ? '/chat' : '/signup')} style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 10, padding: '14px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    {user ? 'Ask the AI' : 'Create Free Account'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Retake */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={() => { setStep(0); setAnswers({}); setSelected(null); setShowScore(false); setShowChecklist(false); setCaptureEmail(''); setCaptureName(''); setCapturePhone('') }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              Retake assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // QUESTION SCREEN
  // ============================================================
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: `linear-gradient(160deg, ${navy} 0%, #1e3a5f 100%)`, padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Free Tool</div>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 700, margin: '0 0 8px' }}>Retirement Readiness Assessment</h1>
        <p style={{ color: '#cbd5e1', fontSize: 14, margin: 0 }}>10 questions. Get your personalized federal retirement action plan.</p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
            <span>Question {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
            <div style={{ height: '100%', width: progress + '%', background: maroon, borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Category indicator */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: CATEGORIES[question.category].color, background: CATEGORIES[question.category].color + '15', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {CATEGORIES[question.category].label}
          </span>
        </div>

        {/* Question Card */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: navy, margin: '0 0 6px', lineHeight: 1.4 }}>{question.question}</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>{question.sub}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  border: selected === opt.value ? `2px solid ${maroon}` : '2px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: selected === opt.value ? '#fdf2f4' : '#fff',
                  color: selected === opt.value ? maroon : navy,
                  fontSize: 14,
                  fontWeight: selected === opt.value ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12 }}>
          {step > 0 && (
            <button
              onClick={handleBack}
              style={{ flex: 0, padding: '14px 20px', background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selected === null}
            style={{
              flex: 1,
              background: selected !== null ? maroon : '#e2e8f0',
              color: selected !== null ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: 10,
              padding: '14px',
              fontSize: 15,
              fontWeight: 700,
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {step + 1 === totalSteps ? 'See My Results' : 'Next Question \u2192'}
          </button>
        </div>
      </div>
    </div>
  )
}
