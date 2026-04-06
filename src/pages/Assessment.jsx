import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const navy = '#0f172a'
const maroon = '#7b1c2e'

const QUESTIONS = [
  {
    id: 'years_until',
    question: 'How many years until you plan to retire?',
    sub: 'This helps us tailor your checklist to your timeline.',
    options: [
      { label: 'Less than 2 years', value: 1, weight: 3 },
      { label: '2–5 years', value: 2, weight: 2 },
      { label: '6–10 years', value: 3, weight: 1 },
      { label: '10+ years', value: 4, weight: 0 },
    ]
  },
  {
    id: 'years_service',
    question: 'How many years of federal service do you have?',
    sub: 'Your pension calculation depends heavily on your years of service.',
    options: [
      { label: 'Under 5 years', value: 1, weight: 0 },
      { label: '5–10 years', value: 2, weight: 1 },
      { label: '11–20 years', value: 3, weight: 2 },
      { label: '20+ years', value: 4, weight: 3 },
    ]
  },
  {
    id: 'retirement_system',
    question: 'Which federal retirement system are you under?',
    sub: 'Most employees hired after 1987 are under FERS.',
    options: [
      { label: 'FERS (hired after 1987)', value: 'fers', weight: 2 },
      { label: 'FERS-FRAE (hired after 2013)', value: 'frae', weight: 2 },
      { label: 'CSRS (hired before 1987)', value: 'csrs', weight: 2 },
      { label: "I'm not sure", value: 'unknown', weight: 0 },
    ]
  },
  {
    id: 'ran_estimate',
    question: 'Have you run an official FERS retirement estimate?',
    sub: 'This is the official pension calculation from your HR office.',
    options: [
      { label: 'Yes, I have a current estimate', value: 'yes', weight: 3 },
      { label: 'Yes, but it was more than 2 years ago', value: 'old', weight: 1 },
      { label: "No, I haven't", value: 'no', weight: 0 },
      { label: "What's a retirement estimate?", value: 'unknown', weight: 0 },
    ]
  },
  {
    id: 'tsp_planning',
    question: 'Have you reviewed your TSP withdrawal strategy?',
    sub: 'Your TSP decisions at retirement can significantly affect your income.',
    options: [
      { label: 'Yes, I have a clear plan', value: 'yes', weight: 3 },
      { label: "I've looked into it", value: 'partial', weight: 1 },
      { label: "No, haven't thought about it", value: 'no', weight: 0 },
      { label: "What's TSP?", value: 'unknown', weight: 0 },
    ]
  },
  {
    id: 'fehb_fegli',
    question: 'Do you know how your FEHB health insurance works in retirement?',
    sub: 'Many employees are surprised to learn their coverage changes after retirement.',
    options: [
      { label: 'Yes, fully understand it', value: 'yes', weight: 3 },
      { label: 'Somewhat familiar', value: 'partial', weight: 1 },
      { label: "No, I don't know", value: 'no', weight: 0 },
    ]
  }
]

function getResult(answers) {
  let score = 0
  let maxScore = 0
  
  QUESTIONS.forEach(q => {
    const chosen = q.options.find(o => o.value === answers[q.id])
    const max = Math.max(...q.options.map(o => o.weight))
    if (chosen) score += chosen.weight
    maxScore += max
  })

  const pct = score / maxScore

  if (pct >= 0.75) {
    return {
      level: 'On Track',
      color: '#065f46',
      bg: '#d1fae5',
      icon: '✓',
      summary: 'You have a solid foundation. A few targeted steps will put you in an excellent position.',
    }
  } else if (pct >= 0.45) {
    return {
      level: 'Needs Attention',
      color: '#92400e',
      bg: '#fef3c7',
      icon: '!',
      summary: 'There are important gaps in your retirement planning that should be addressed soon.',
    }
  } else {
    return {
      level: 'Action Required',
      color: '#991b1b',
      bg: '#fee2e2',
      icon: '✗',
      summary: 'You have significant planning gaps. The good news: there is still time to get on track with the right steps.',
    }
  }
}

function getChecklist(answers) {
  const items = []

  if (!['yes'].includes(answers.retirement_system)) {
    items.push({ priority: 'high', task: 'Confirm your retirement system (FERS/CSRS) with your HR office' })
  }
  if (['no', 'unknown'].includes(answers.ran_estimate)) {
    items.push({ priority: 'high', task: 'Request an official retirement estimate from your HR office' })
  }
  if (answers.ran_estimate === 'old') {
    items.push({ priority: 'medium', task: 'Update your retirement estimate — it should be within 1 year of your target date' })
  }
  if (['no', 'unknown'].includes(answers.tsp_planning)) {
    items.push({ priority: 'high', task: 'Review your TSP balance and decide on a withdrawal strategy' })
  }
  if (answers.tsp_planning === 'partial') {
    items.push({ priority: 'medium', task: 'Finalize your TSP withdrawal plan (lump sum, installments, or annuity)' })
  }
  if (['no'].includes(answers.fehb_fegli)) {
    items.push({ priority: 'high', task: 'Review FEHB rules for retirees — you must meet the 5-year rule to keep coverage' })
  }
  if (answers.fehb_fegli === 'partial') {
    items.push({ priority: 'medium', task: 'Confirm your FEHB self + family vs. self-only plan decision for retirement' })
  }
  
  // Universal checklist items
  if (answers.years_until <= 2) {
    items.push({ priority: 'high', task: 'Submit your retirement application at least 3 months before your target date' })
    items.push({ priority: 'high', task: 'Review your FEGLI life insurance elections before retirement' })
  }
  items.push({ priority: 'medium', task: 'Use the FedBenefitsAid calculator to estimate your FERS pension amount' })
  items.push({ priority: 'medium', task: 'Review your Social Security benefit estimate at ssa.gov' })
  items.push({ priority: 'low', task: 'Consider a free consultation to walk through all your options' })

  return items
}

const priorityColors = {
  high: { bg: '#fee2e2', text: '#991b1b', label: 'High Priority' },
  medium: { bg: '#fef3c7', text: '#92400e', label: 'Important' },
  low: { bg: '#dbeafe', text: '#1d4ed8', label: 'Consider' },
}

export default function Assessment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const question = QUESTIONS[step]
  const totalSteps = QUESTIONS.length
  const progress = ((step) / totalSteps) * 100

  const handleSelect = (value) => setSelected(value)

  const handleNext = () => {
    const newAnswers = { ...answers, [question.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (step + 1 >= totalSteps) {
      setShowResults(true)
    } else {
      setStep(step + 1)
    }
  }

  const result = showResults ? getResult(answers) : null
  const checklist = showResults ? getChecklist(answers) : []

  if (showResults) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ background: `linear-gradient(160deg, ${navy} 0%, #1e3a5f 100%)`, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Your Results</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Retirement Readiness Assessment</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: result.bg, borderRadius: 50, padding: '10px 24px' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: result.color }}>{result.icon}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: result.color }}>{result.level}</span>
          </div>
          <p style={{ color: '#cbd5e1', maxWidth: 540, margin: '16px auto 0', fontSize: 15, lineHeight: 1.6 }}>{result.summary}</p>
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 8 }}>Your Personalized Checklist</h2>
          <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Based on your answers, here are the steps you should take — in order of importance.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {checklist.map((item, i) => {
              const p = priorityColors[item.priority]
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${p.text}` }}>
                  <div style={{ flexShrink: 0, width: 20, height: 20, border: `2px solid ${p.text}`, borderRadius: 4, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 14, color: navy, fontWeight: 500, lineHeight: 1.5 }}>{item.task}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: p.text, marginTop: 4 }}>{p.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: `linear-gradient(135deg, ${navy} 0%, #1e3a5f 100%)`, borderRadius: 14, padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Get personalized help with your checklist</div>
            <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Our tools are free. A 30-minute consultation can clarify everything on your list.</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/calculator')} style={{ background: maroon, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Run Your Calculator
              </button>
              <button onClick={() => navigate(user ? '/chat' : '/signup')} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {user ? 'Ask the AI' : 'Create Free Account'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => { setStep(0); setAnswers({}); setSelected(null); setShowResults(false); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              Retake assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: `linear-gradient(160deg, ${navy} 0%, #1e3a5f 100%)`, padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Free Tool</div>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>Retirement Readiness Assessment</h1>
        <p style={{ color: '#cbd5e1', fontSize: 14, margin: 0 }}>6 questions. Get your personalized federal retirement checklist.</p>
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

        {/* Question Card */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: maroon, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Question {step + 1}</div>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: navy, margin: '0 0 6px', lineHeight: 1.4 }}>{question.question}</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>{question.sub}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  border: selected === opt.value ? `2px solid ${maroon}` : '2px solid #e2e8f0',
                  borderRadius: 10, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                  background: selected === opt.value ? '#fdf2f4' : '#fff',
                  color: selected === opt.value ? maroon : navy,
                  fontSize: 14, fontWeight: selected === opt.value ? 600 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={selected === null}
          style={{
            width: '100%', background: selected !== null ? maroon : '#e2e8f0',
            color: selected !== null ? '#fff' : '#94a3b8', border: 'none', borderRadius: 10,
            padding: '14px', fontSize: 15, fontWeight: 700, cursor: selected !== null ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease'
          }}
        >
          {step + 1 === totalSteps ? 'See My Results' : 'Next Question →'}
        </button>
      </div>
    </div>
  )
}
