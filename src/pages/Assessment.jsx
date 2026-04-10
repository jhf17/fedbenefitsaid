import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const navy = '#0f172a'
const secondaryNavy = '#1e3a5f'
const maroon = '#7b1c2e'
const gold = '#c9a84c'
const cream = '#faf9f6'
const lightGray = '#f8f7f4'
const amberWarm = '#b45309'
const muteCorral = '#9f563a'
const emerald = '#047857'
const fontSerif = "'Merriweather', Georgia, 'Times New Roman', serif"
const fontSans = "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"
const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

// ============================================================
// 14 QUESTIONS — organized by retirement planning category
// ============================================================
const QUESTIONS = [
  {
    id: 'current_age',
    category: 'income',
    question: 'How old are you?',
    sub: 'Your age determines your MRA, Medicare eligibility, Social Security options, and FEGLI costs.',
    options: [
      { label: 'Under 50', value: 'lt50', weight: 0 },
      { label: '50–56', value: '50to56', weight: 1 },
      { label: '57–61', value: '57to61', weight: 2 },
      { label: '62 or older', value: 'gte62', weight: 3 },
    ]
  },
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
    sub: 'Most employees hired after 1987 are under FERS. Employees hired in 2013 are FERS-RAE; 2014 or later are FERS-FRAE.',
    options: [
      { label: 'FERS (hired 1987–2012)', value: 'fers', weight: 2 },
      { label: 'FERS-RAE/FRAE (hired 2013 or later)', value: 'frae', weight: 2 },
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
  {
    id: 'vera_vsip',
    category: 'pension',
    question: 'Are you aware of VERA and VSIP early retirement options?',
    sub: 'Many federal agencies are currently offering Voluntary Early Retirement Authority (VERA) and Voluntary Separation Incentive Payments (VSIP) as part of workforce restructuring.',
    options: [
      { label: 'Yes, I know my agency\'s current offerings', value: 'yes', weight: 3 },
      { label: 'I\'ve heard of them but don\'t know the details', value: 'partial', weight: 1 },
      { label: 'No, this is new to me', value: 'no', weight: 0 },
      { label: 'Not applicable — I\'m not considering early retirement', value: 'na', weight: 2 },
    ]
  },
  {
    id: 'survivor_benefits',
    category: 'survivor',
    question: 'Have you reviewed your survivor benefit elections?',
    sub: 'Survivor benefits protect your spouse or dependents if you pass away. Elections affect your pension amount and your family\'s financial security.',
    options: [
      { label: 'I haven\'t looked into survivor benefits yet', value: 'none', weight: 0 },
      { label: 'I know they exist but haven\'t reviewed my options', value: 'aware', weight: 1 },
      { label: 'I\'ve reviewed them but haven\'t made a final decision', value: 'reviewed', weight: 2 },
      { label: 'I\'ve made my election and understand the cost/benefit tradeoff', value: 'decided', weight: 3 },
    ]
  },
  {
    id: 'financial_readiness',
    category: 'financial',
    question: 'How confident are you in your overall financial readiness for retirement?',
    sub: 'Beyond federal benefits, your savings, debt, and spending plan all affect whether you can retire comfortably.',
    options: [
      { label: 'I haven\'t started planning beyond my federal benefits', value: 'none', weight: 0 },
      { label: 'I have some savings but no clear retirement budget', value: 'some', weight: 1 },
      { label: 'I have a rough plan but haven\'t stress-tested it', value: 'rough', weight: 2 },
      { label: 'I have a detailed plan covering income, expenses, and contingencies', value: 'detailed', weight: 3 },
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
  survivor: { label: 'Survivor Benefits', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>', color: '#dc2626' },
  financial: { label: 'Financial Readiness', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 10.26 24 10.26 17.55 16.5 19.64 24.76 12 18.52 4.36 24.76 6.45 16.5 0 10.26 8.91 10.26 12 2"></polygon></svg>', color: '#d97706' },
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
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>',
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
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      summary: 'You have significant planning gaps that could cost you money in retirement. Let\'s build a clear action plan.',
    }
  }
}

// ============================================================
// HELPER: Generate personalized summary
// ============================================================
function generatePersonalizedSummary(catScores, answers) {
  const sorted = Object.entries(catScores).sort((a, b) => a[1].pct - b[1].pct)
  const weakest = sorted.slice(0, 2).map(([id]) => CATEGORIES[id].label.toLowerCase())
  const strongest = sorted.slice(-2).map(([id]) => CATEGORIES[id].label.toLowerCase()).reverse()

  const yearsUntil = answers.years_until
  const isImmediate = yearsUntil === 'lt2'

  let summary = 'You have '
  if (strongest.length > 0) {
    summary += `a solid foundation in ${strongest.join(' and ')}, but `
  }
  summary += `your ${weakest.join(' and ')} need${weakest.length > 1 ? '' : 's'} attention`
  if (isImmediate) {
    summary += ' before you retire'
  }
  summary += '.'

  return summary
}

// ============================================================
// HELPER: Generate contextual insights for snapshot
// ============================================================
function generateCategoryInsight(catId, answers, catScore) {
  if (catId === 'pension') {
    if (answers.ran_estimate === 'no' || answers.ran_estimate === 'unknown') {
      return 'You haven\'t requested an official retirement estimate — this is your first priority'
    }
    if (answers.vera_vsip === 'no') {
      return 'Check if your agency is offering VERA or VSIP before making retirement decisions'
    }
    return `Pension readiness at ${Math.round(catScore.pct * 100)}%`
  }
  if (catId === 'tsp') {
    if (answers.tsp_planning === 'no' || answers.tsp_planning === 'unknown') {
      return 'You need a TSP withdrawal strategy before retiring'
    }
    return `TSP strategy at ${Math.round(catScore.pct * 100)}%`
  }
  if (catId === 'healthcare') {
    if (answers.fehb_knowledge === 'no') {
      return 'The 5-year FEHB rule is critical — you must verify you\'re eligible'
    }
    if (answers.medicare_coordination === 'no' || answers.medicare_coordination === 'partial') {
      return 'Medicare and FEHB coordination will save you thousands — learn how they work together'
    }
    return `Healthcare planning at ${Math.round(catScore.pct * 100)}%`
  }
  if (catId === 'income') {
    if (answers.ss_strategy === 'no') {
      return 'Your Social Security claiming age could change your lifetime benefit by 77%'
    }
    if (answers.fegli_review === 'no' || answers.fegli_review === 'unknown') {
      return 'FEGLI costs explode after age 65 — review and drop unnecessary coverage'
    }
    return `Income optimization at ${Math.round(catScore.pct * 100)}%`
  }
  if (catId === 'survivor') {
    if (answers.survivor_benefits === 'none' || answers.survivor_benefits === 'aware') {
      return 'Survivor benefit elections are irrevocable — make this decision carefully now'
    }
    return `Survivor benefits at ${Math.round(catScore.pct * 100)}%`
  }
  if (catId === 'financial') {
    if (answers.financial_readiness === 'none' || answers.financial_readiness === 'some') {
      return 'Federal pension typically covers 30-40% of pre-retirement income — you need a full plan'
    }
    return `Financial readiness at ${Math.round(catScore.pct * 100)}%`
  }
  return `${CATEGORIES[catId].label} at ${Math.round(catScore.pct * 100)}%`
}

// ============================================================
// HELPER: Generate "Where You Stand" text
// ============================================================
function generateWhereYouStand(catId, answers) {
  if (catId === 'pension') {
    const system = answers.retirement_system
    const years = answers.years_service
    const estimate = answers.ran_estimate
    const sick = answers.sick_leave

    let text = 'Your pension is the foundation of your retirement income. '
    if (system === 'unknown') {
      text += 'First, confirm whether you\'re under FERS, FERS-RAE/FRAE, or CSRS — each has a different formula. '
    } else {
      text += `As a ${system === 'csrs' ? 'CSRS' : 'FERS'} employee, `
      if (system === 'csrs') {
        text += 'your pension formula is 2% times years of service times High-3 salary. '
      } else {
        text += 'your formula is 1% (or 1.1% if age 62+ with 20+ years) times years of service times High-3 salary. '
      }
    }
    if (estimate === 'no' || estimate === 'unknown') {
      text += 'You need an official retirement estimate from your HR office showing your projected monthly pension.'
    } else if (estimate === 'old') {
      text += 'Your estimate is over 2 years old — your salary may have changed significantly since then.'
    } else {
      text += 'You have a recent estimate, which is excellent.'
    }
    if (sick === 'yes') {
      text += ' Your sick leave will add months of additional service credit.'
    }
    return text
  }

  if (catId === 'tsp') {
    const planning = answers.tsp_planning
    let text = 'Your TSP balance is a significant retirement asset. How you withdraw it affects taxes and longevity. '
    if (planning === 'no' || planning === 'unknown') {
      text += 'You need to understand your four options: monthly installments, single withdrawal, life annuity, or combination. Each has different tax implications and timing requirements.'
    } else if (planning === 'partial') {
      text += 'You\'ve started researching — the next step is modeling your specific withdrawal strategy against your balance and retirement income goals.'
    } else {
      text += 'You have a clear plan, which puts you ahead of most federal employees.'
    }
    return text
  }

  if (catId === 'healthcare') {
    const fehb = answers.fehb_knowledge
    const medicare = answers.medicare_coordination
    let text = 'Healthcare is your second-largest retirement expense after housing. Federal retirees have exceptional options. '
    if (fehb === 'no') {
      text += 'The 5-year FEHB rule is critical: you must be enrolled in FEHB for 5 consecutive years before retirement to keep it as a retiree. '
    } else {
      text += 'You understand the FEHB 5-year rule. '
    }
    if (medicare === 'no' || medicare === 'partial') {
      text += 'At 65, Medicare becomes available and coordinates with FEHB — this combination virtually eliminates out-of-pocket costs.'
    } else {
      text += 'You know how Medicare and FEHB work together.'
    }
    return text
  }

  if (catId === 'income') {
    const ss = answers.ss_strategy
    const fegli = answers.fegli_review
    const current_age = answers.current_age
    let text = 'Your total retirement income comes from three sources: federal pension, TSP, and Social Security. '
    if (ss === 'no') {
      text += 'Your Social Security claiming age is one of the most important decisions you\'ll make — claiming at 62 vs. 70 can mean a 77% difference in lifetime benefits. '
    } else {
      text += 'You\'re thinking strategically about Social Security. '
    }
    if (fegli === 'no' || fegli === 'unknown') {
      text += 'FEGLI premiums increase dramatically after age 65; most retirees save money by dropping expensive optional coverage.'
    } else {
      text += 'You\'re reviewing your FEGLI elections.'
    }
    return text
  }

  if (catId === 'survivor') {
    const survivor = answers.survivor_benefits
    let text = 'Survivor benefits protect your family if you pass away before or after retirement. The election is irrevocable after retirement. '
    if (survivor === 'none' || survivor === 'aware') {
      text += 'You need to understand the cost-benefit of full survivor (50% to spouse, 10% pension reduction), partial (25%, 5% reduction), or none.'
    } else if (survivor === 'reviewed') {
      text += 'You\'ve reviewed your options but haven\'t decided — make this decision before retirement.'
    } else {
      text += 'You\'ve made your election and understand the tradeoff.'
    }
    return text
  }

  if (catId === 'financial') {
    const readiness = answers.financial_readiness
    let text = 'Federal pension typically replaces only 30-40% of your pre-retirement income. TSP and Social Security must fill the gap. '
    if (readiness === 'none' || readiness === 'some') {
      text += 'You need a comprehensive plan that covers your full income sources, expense assumptions, inflation, and longevity.'
    } else if (readiness === 'rough') {
      text += 'You have a rough plan — stress-test it against worst-case scenarios (market downturns, inflation spikes, unexpected expenses).'
    } else {
      text += 'You have a detailed, stress-tested plan.'
    }
    return text
  }

  return 'Review this category carefully.'
}

// ============================================================
// HELPER: Get key facts for category
// ============================================================
function getCategoryFacts(catId) {
  if (catId === 'pension') {
    return [
      { label: 'FERS formula', value: 'High-3 × Years of Service × 1% (or 1.1% if 62+ with 20+ years)' },
      { label: 'Sick leave credit', value: '2,087 hours = 1 year of service. 174 hours ≈ 1 additional month' },
      { label: 'Minimum requirement', value: 'Request official estimate from HR before retiring' },
      { label: 'Military service', value: 'May be creditable with deposit — ask HR' },
    ]
  }
  if (catId === 'tsp') {
    return [
      { label: 'Withdrawal options', value: 'Monthly, lump sum, annuity, or combination' },
      { label: 'Tax treatment', value: 'Traditional TSP is taxed as ordinary income on withdrawal' },
      { label: 'Roth TSP', value: 'Not subject to Required Minimum Distributions (RMDs)' },
      { label: 'RMD age', value: '73 (born 1951-1959) or 75 (born 1960+)' },
    ]
  }
  if (catId === 'healthcare') {
    return [
      { label: '5-year FEHB rule', value: 'Must be enrolled continuously 5 years before retirement' },
      { label: 'Government subsidy', value: 'Pays ~72% of FEHB premium in retirement' },
      { label: 'Medicare Part B', value: '$202.90/month in 2026' },
      { label: 'Medicare + FEHB', value: 'Combination virtually eliminates out-of-pocket costs' },
    ]
  }
  if (catId === 'income') {
    return [
      { label: 'FERS Supplement', value: 'Bridges income gap for early retirees until age 62' },
      { label: 'WEP/GPO repeal', value: 'Repealed January 2025 — CSRS now get full Social Security' },
      { label: 'Social Security (62 vs. 70)', value: 'Claiming later increases monthly benefit by 77%' },
      { label: 'FEGLI after 65', value: 'Basic is free with 75% reduction; Options B/C become very expensive' },
    ]
  }
  if (catId === 'survivor') {
    return [
      { label: 'Full survivor', value: '50% of pension to spouse, costs 10% reduction' },
      { label: 'Partial survivor', value: '25% to spouse, costs 5% reduction' },
      { label: 'Election timing', value: 'Must elect within 30 days of retirement — irrevocable' },
      { label: 'Spousal consent', value: 'Required if electing no survivor benefits' },
    ]
  }
  if (catId === 'financial') {
    return [
      { label: 'Pension replacement', value: 'Federal pension covers ~30-40% of pre-retirement income' },
      { label: 'Three income sources', value: 'Pension + TSP + Social Security must fund full retirement' },
      { label: 'Biggest unknowns', value: 'Healthcare costs, inflation, and longevity risk' },
      { label: 'Emergency fund', value: '6-12 months expenses in liquid savings smooths the transition' },
    ]
  }
  return []
}

// ============================================================
// HELPER: Get key forms for category
// ============================================================
function getCategoryForms(catId) {
  if (catId === 'pension') {
    return [
      { form: 'SF-3107', desc: 'FERS Retirement Application' },
      { form: 'SF-2801', desc: 'CSRS Application' },
      { form: 'SF-3102', desc: 'FERS Beneficiary Designation' },
      { form: 'RI 25-15', desc: 'Survivor Benefit Election' },
    ]
  }
  if (catId === 'tsp') {
    return [
      { form: 'TSP-70', desc: 'Full Withdrawal Request' },
      { form: 'TSP-77', desc: 'Partial Withdrawal Request' },
      { form: 'TSP-99', desc: 'Beneficiary Designation' },
    ]
  }
  if (catId === 'healthcare') {
    return [
      { form: 'SF-2809', desc: 'FEHB Enrollment Change' },
      { form: 'CMS-40B', desc: 'Medicare Part B Application' },
    ]
  }
  if (catId === 'income') {
    return [
      { form: 'SF-2818', desc: 'FEGLI Election' },
      { form: 'SF-1152', desc: 'FEGLI Beneficiary Designation' },
    ]
  }
  if (catId === 'survivor') {
    return [
      { form: 'RI 25-15', desc: 'Survivor Benefit Election' },
      { form: 'SF-2808', desc: 'CSRS Beneficiary Designation' },
    ]
  }
  if (catId === 'financial') {
    return [
      { form: 'Worksheet', desc: 'Create a retirement budget worksheet' },
      { form: 'Spreadsheet', desc: 'Model income vs. expenses across retirement timeline' },
    ]
  }
  return []
}

// ============================================================
// HELPER: Get recommended next steps
// ============================================================
function getRecommendedSteps(catId, answers) {
  if (catId === 'pension') {
    const steps = []
    if (answers.retirement_system === 'unknown') {
      steps.push('Contact your HR office to confirm your retirement system (FERS, RAE, FRAE, or CSRS)')
    }
    if (answers.ran_estimate === 'no' || answers.ran_estimate === 'unknown') {
      steps.push('Request an official retirement estimate from HR showing your projected pension amount')
    } else if (answers.ran_estimate === 'old') {
      steps.push('Update your retirement estimate with your HR office to reflect salary changes and additional service')
    }
    if (steps.length === 0) {
      steps.push('Review your official estimate and verify the calculation for accuracy')
    }
    return steps
  }

  if (catId === 'tsp') {
    const steps = []
    if (answers.tsp_planning === 'no' || answers.tsp_planning === 'unknown') {
      steps.push('Research your four withdrawal options and their tax implications before retiring')
      steps.push('Use the FedBenefitsAid calculator to model different withdrawal strategies against your balance')
    } else if (answers.tsp_planning === 'partial') {
      steps.push('Finalize your withdrawal strategy (monthly, lump sum, annuity, or mix) and document the decision')
    }
    return steps
  }

  if (catId === 'healthcare') {
    const steps = []
    if (answers.fehb_knowledge === 'no') {
      steps.push('Verify you\'ll be continuously enrolled in FEHB for the 5 years before retirement')
      steps.push('Review your current FEHB plan and confirm you want to keep the same plan in retirement')
    }
    if (answers.medicare_coordination === 'no' || answers.medicare_coordination === 'partial') {
      steps.push('At age 65, enroll in Medicare Part A (free) and Part B ($202.90/mo) — it coordinates with FEHB')
    }
    return steps
  }

  if (catId === 'income') {
    const steps = []
    if (answers.ss_strategy === 'no') {
      steps.push('Check your Social Security estimate at ssa.gov/myaccount')
      steps.push('Model the lifetime difference between claiming at 62, 67, and 70')
    } else if (answers.ss_strategy === 'partial') {
      steps.push('Make a decision: early at 62, Full Retirement Age (67), or delayed at 70')
    }
    if (answers.fegli_review === 'no' || answers.fegli_review === 'unknown') {
      steps.push('Review FEGLI costs after retirement and compare to private term life insurance')
    }
    return steps
  }

  if (catId === 'survivor') {
    const steps = []
    if (answers.survivor_benefits !== 'decided') {
      steps.push('Discuss with your spouse (if married) and decide on full, partial, or no survivor benefits')
      steps.push('Understand the cost: 10% pension reduction for full, 5% for partial')
      steps.push('Make your election at retirement — it cannot be changed afterward')
    }
    return steps
  }

  if (catId === 'financial') {
    const steps = []
    if (answers.financial_readiness === 'none' || answers.financial_readiness === 'some') {
      steps.push('List all expected retirement income sources: pension, TSP, Social Security, other')
      steps.push('Build a detailed retirement budget covering housing, healthcare, inflation, and contingencies')
    } else if (answers.financial_readiness === 'rough') {
      steps.push('Stress-test your plan against market downturns, inflation spikes, and longer-than-expected life')
    }
    return steps
  }

  return []
}

// ============================================================
// HELPER: Build retirement timeline
// ============================================================
function buildRetirementTimeline(answers) {
  const currentAgeVal = answers.current_age
  let currentAge = 50
  if (currentAgeVal === 'lt50') currentAge = 45
  if (currentAgeVal === '50to56') currentAge = 53
  if (currentAgeVal === '57to61') currentAge = 59
  if (currentAgeVal === 'gte62') currentAge = 65

  const yearsUntilVal = answers.years_until
  let yearsUntil = 5
  if (yearsUntilVal === 'lt2') yearsUntil = 1
  if (yearsUntilVal === '2to5') yearsUntil = 3.5
  if (yearsUntilVal === '6to10') yearsUntil = 8
  if (yearsUntilVal === 'gt10') yearsUntil = 15

  const retirementAge = currentAge + yearsUntil

  const milestones = [
    { age: currentAge, label: 'Current Age', shown: true },
    { age: 57, label: 'MRA (57)', shown: currentAge < 57 },
    { age: 62, label: 'Age 62: SS & Supplement', shown: currentAge < 62 },
    { age: 65, label: 'Age 65: Medicare', shown: currentAge < 65 },
    { age: 67, label: 'Age 67: Full Retirement Age', shown: currentAge < 67 },
    { age: 70, label: 'Age 70: Max Social Security', shown: currentAge < 70 },
    { age: 73, label: 'Age 73: RMD (if born 1951-59)', shown: currentAge < 73 },
  ].filter(m => m.shown)

  return { currentAge, retirementAge, milestones }
}

// ============================================================
// EXPANDABLE DETAIL SECTION
// ============================================================
function DetailSection({ catId, answers, catScore }) {
  const [expanded, setExpanded] = useState(false)
  const facts = getCategoryFacts(catId)
  const forms = getCategoryForms(catId)
  const steps = getRecommendedSteps(catId, answers)

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          background: '#fff',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 15,
          fontWeight: 600,
          color: navy,
          fontFamily: fontSans,
        }}
      >
        <span>{CATEGORIES[catId].label}</span>
        <span style={{ fontSize: 16, transition: 'transform 0.2s' }}>
          {expanded ? '▾' : '▸'}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '20px', borderTop: '1px solid #cbd5e1', background: lightGray, fontFamily: fontSans }}>
          {/* Where You Stand */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontFamily: fontSans }}>Where You Stand</h4>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>
              {generateWhereYouStand(catId, answers)}
            </p>
          </div>

          {/* What You Should Know */}
          {facts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontFamily: fontSans }}>What You Should Know</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {facts.map((fact, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flexShrink: 0, minWidth: 80 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{fact.label}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{fact.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Forms & Documents */}
          {forms.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: emerald, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontFamily: fontSans }}>Key Forms & Documents</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {forms.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: '#334155', minWidth: 60 }}>{f.form}</span>
                    <span style={{ color: '#475569' }}>{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Next Steps */}
          {steps.length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontFamily: fontSans }}>Recommended Next Steps</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                    <span style={{ flexShrink: 0, fontWeight: 600, color: navy }}>{i + 1}.</span>
                    <span style={{ color: '#475569', lineHeight: 1.6 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
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
      task: 'Update your retirement estimate — yours is more than 2 years old. Salary changes and additional service time can significantly change your numbers.',
    })
  }

  if (['no', 'partial'].includes(answers.sick_leave)) {
    items.push({
      priority: 'medium',
      category: 'pension',
      task: answers.sick_leave === 'no'
        ? 'Learn how unused sick leave adds to your pension. Under FERS, your accumulated sick leave hours are converted to additional months of service in your pension calculation — this can add hundreds of dollars per month to your pension.'
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
      task: 'Finalize your TSP withdrawal strategy. Compare monthly installments vs. the 4% rule vs. a TSP annuity. Consider your tax bracket in retirement — spreading withdrawals can reduce your tax burden.',
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
      task: 'Good — you\'ve checked your estimate. Now decide your claiming age. Delaying from 62 to 67 increases your monthly benefit by about 40%. Delaying to 70 adds another 24%.',
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
      task: 'Review your FEHB plan choice for retirement. As a retiree, you\'ll pay the same percentage as active employees. Consider whether Self Only vs. Self + One makes sense if your spouse will have their own coverage.',
    })
  }

  // --- MEDICARE ---
  if (['no'].includes(answers.medicare_coordination)) {
    items.push({
      priority: 'high',
      category: 'healthcare',
      task: 'Understand how Medicare and FEHB work together. Most federal retirees should enroll in Medicare Part A (free) and Part B ($202.90/mo in 2026) at 65. Medicare becomes your primary insurer, and FEHB becomes secondary — this combination often results in little to no out-of-pocket costs.',
    })
  } else if (answers.medicare_coordination === 'partial') {
    items.push({
      priority: 'medium',
      category: 'healthcare',
      task: 'Decide whether to enroll in Medicare Part B at 65. If you have FEHB, Part B is optional but recommended — the combination virtually eliminates out-of-pocket medical costs. Compare the $202.90/mo premium against your current FEHB copays.',
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

  // --- VERA/VSIP ---
  if (['no'].includes(answers.vera_vsip)) {
    items.push({
      priority: 'high',
      category: 'pension',
      task: 'Learn about VERA and VSIP immediately. Many federal agencies are actively offering early retirement incentives as part of workforce restructuring. VERA allows retirement at age 50 with 20 years or any age with 25 years. VSIP offers up to $25,000 as a separation incentive. Check with your HR office whether your agency is offering these.',
    })
  } else if (answers.vera_vsip === 'partial') {
    items.push({
      priority: 'medium',
      category: 'pension',
      task: 'Get specific details on your agency\'s VERA/VSIP offerings. Key questions: What are the eligibility dates? Is there a VSIP amount offered? How does VERA affect your FERS Supplement (it starts at MRA, not at early retirement)? What happens to your FEHB?',
    })
  }

  // --- AGE-BASED ---
  if (answers.current_age === 'gte62') {
    items.push({
      priority: 'medium',
      category: 'income',
      task: 'At 62+, you may qualify for the enhanced 1.1% FERS multiplier (requires 20+ years of service). If you\'re close to 20 years, staying a bit longer could significantly boost your pension. Also review your Social Security claiming strategy — delaying past 62 increases your benefit.',
    })
  } else if (answers.current_age === '57to61') {
    items.push({
      priority: 'medium',
      category: 'income',
      task: 'You\'ve reached or passed your Minimum Retirement Age (MRA of 57). If you have 30+ years of service, you\'re eligible for an immediate unreduced FERS pension. With 20+ years, you can retire at 60 with no reduction. Use the calculator to see your numbers.',
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
      task: 'Make your FEGLI life insurance election — you must decide within 30 days of retirement what coverage to keep. This cannot be changed later.',
    })
  }

  // --- UNIVERSAL ---
  items.push({
    priority: 'medium',
    category: 'pension',
    task: 'Use the FedBenefitsAid retirement calculator to model your full income picture — pension, TSP, and Social Security combined.',
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

  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  // Email capture state
  const [captureName, setCaptureName] = useState('')
  const [captureEmail, setCaptureEmail] = useState('')
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureError, setCaptureError] = useState('')
  const [captureSent, setCaptureSent] = useState(false)

  const handleEmailCapture = async (e) => {
    e.preventDefault()
    if (!captureEmail) { setCaptureError('Please enter your email.'); return }
    setCaptureLoading(true)
    setCaptureError('')
    try {
      await fetch('/.netlify/functions/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: captureName || 'Assessment Lead', email: captureEmail, source: 'Assessment' }),
      })
      sendAssessmentEmail(captureEmail, captureName || 'there')
      setCaptureSent(true)
    } catch (err) {
      setCaptureError('Something went wrong. Please try again.')
    } finally {
      setCaptureLoading(false)
    }
  }

  useEffect(() => { document.title = 'Retirement Readiness Assessment | FedBenefitsAid' }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // Calculate overall score percentage for CRM
  const getScorePercent = () => {
    if (!catScores) return 0
    const totalScore = Object.values(catScores).reduce((s, c) => s + c.score, 0)
    const totalMax = Object.values(catScores).reduce((s, c) => s + c.max, 0)
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
  }

  // Send assessment results email (fire-and-forget)
  const sendAssessmentEmail = (toEmail, toName) => {
    if (!catScores) return
    const totalScore = Object.values(catScores).reduce((s, c) => s + c.score, 0)
    const totalMax = Object.values(catScores).reduce((s, c) => s + c.max, 0)

    const categories = Object.entries(CATEGORIES).map(([key, cat]) => {
      const cs = catScores[key]
      if (!cs) return null
      return { key, label: cat.label, description: '', score: cs.score, maxScore: cs.max }
    }).filter(Boolean)

    const cl = getChecklist(answers)
    const actionItems = cl.slice(0, 5).map(item => ({
      priority: item.priority || 'medium',
      title: item.text || item.title || '',
      description: item.explanation || item.desc || '',
    }))

    fetch('/.netlify/functions/send-results-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'assessment',
        email: toEmail,
        data: { name: toName, score: totalScore, categories, actionItems },
      }),
    }).catch(() => {}) // silent fail
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
          source: 'Retirement Checklist',
          assessmentScore: getScorePercent(),
        }),
      })
      sendAssessmentEmail(captureEmail, captureName)
    } catch {
      // Silent fail
    }
    setCaptureLoading(false)
    setShowChecklist(true)
  }

  // If user is already logged in, send score to CRM and show checklist
  const handleUnlockForUser = async () => {
    try {
      await fetch('/.netlify/functions/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          source: 'Retirement Checklist',
          assessmentScore: getScorePercent(),
        }),
      })
      sendAssessmentEmail(user?.email, user?.user_metadata?.full_name || 'there')
    } catch {
      // Silent fail
    }
    setShowChecklist(true)
  }

  const catScores = showScore ? getCategoryScores(answers) : null
  const result = showScore ? getOverallResult(catScores) : null
  const checklist = showScore ? getChecklist(answers) : []
  const { currentAge, retirementAge, milestones } = showScore ? buildRetirementTimeline(answers) : {}

  // ============================================================
  // RESULTS SCREEN — COMPLETELY REDESIGNED
  // ============================================================
  if (showScore) {
    const sorted = Object.entries(catScores).sort((a, b) => a[1].pct - b[1].pct)
    const weakestCats = sorted.slice(0, 2).map(([id]) => id)
    const personalizedSummary = generatePersonalizedSummary(catScores, answers)

    return (
      <main id="main-content" aria-live="polite" aria-atomic="false" style={{ minHeight: '100vh', background: cream, fontFamily: fontSans }} aria-label="Assessment results">
        {/* SECTION 1: Executive Summary Header */}
        <div style={{ background: `linear-gradient(160deg, ${navy} 0%, ${secondaryNavy} 60%)`, padding: '48px 24px 56px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, fontFamily: fontSans }}>Your Results</div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 700, margin: '0 0 24px', fontFamily: fontSerif }}>Retirement Readiness Assessment</h1>

          {/* Score Ring */}
          {(() => {
            const totalScore = Object.values(catScores).reduce((s, c) => s + c.score, 0)
            const totalMax = Object.values(catScores).reduce((s, c) => s + c.max, 0)
            const pct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
            const circumference = 2 * Math.PI * 54
            const offset = circumference - (pct / 100) * circumference
            const ringColor = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'
            return (
              <div style={{ display: 'inline-block', position: 'relative', marginBottom: 20 }}>
                <svg width="130" height="130" viewBox="0 0 130 130" aria-hidden="true">
                  <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle cx="65" cy="65" r="54" fill="none" stroke={ringColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{pct}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>out of 100</div>
                </div>
              </div>
            )
          })()}

          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 600, margin: '0 auto 16px', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.7, fontWeight: 500 }}>
            {personalizedSummary}
          </p>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
          {/* SECTION 2: Retirement Snapshot */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 20, fontFamily: fontSerif }}>Your Retirement Snapshot</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(CATEGORIES).map(([catId, cat]) => {
                const cs = catScores[catId]
                const barPct = Math.round(cs.pct * 100)
                const insight = generateCategoryInsight(catId, answers, cs)
                return (
                  <div key={catId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: navy, fontFamily: fontSans }}>{cat.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', flexShrink: 0, fontFamily: fontSans }}>{barPct}%</span>
                    </div>
                    <div style={{ height: 8, background: '#cbd5e1', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', width: barPct + '%', background: cs.pct >= 0.7 ? '#10b981' : cs.pct >= 0.4 ? amberWarm : muteCorral, borderRadius: 4, transition: 'width 0.8s ease' }} />
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5, fontFamily: fontSans }}>{insight}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION 3: Detailed Analysis - Expandable Sections */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 20, fontFamily: fontSerif }}>Detailed Analysis</h2>
            {Object.keys(CATEGORIES).map((catId) => (
              <DetailSection key={catId} catId={catId} answers={answers} catScore={catScores[catId]} defaultExpanded={weakestCats.includes(catId)} />
            ))}
          </div>

          {/* SECTION 4: Retirement Timeline */}
          <div style={{ marginBottom: 40, background: '#fff', borderRadius: 12, border: '1px solid #cbd5e1', padding: isMobile ? '16px 12px' : '24px 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 20, fontFamily: fontSerif }}>Your Retirement Timeline</h2>
            <div style={{ position: 'relative', height: 'auto' }}>
              {isMobile ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {milestones.map((milestone, i) => {
                      const isFirst = i === 0
                      return (
                        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: isFirst ? navy : '#cbd5e1', border: `3px solid ${isFirst ? navy : '#cbd5e1'}`, marginBottom: 0 }} />
                            {i < milestones.length - 1 && (
                              <div style={{ width: 2, height: 40, background: '#cbd5e1', margin: '8px 0' }} />
                            )}
                          </div>
                          <div style={{ paddingTop: 2 }}>
                            <div style={{ fontSize: 13, fontWeight: isFirst ? 700 : 600, color: navy, fontFamily: fontSans }}>{milestone.label}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontFamily: fontSans }}>Age {milestone.age}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, fontStyle: 'italic', fontFamily: fontSans }}>
                    ↓ Scroll to see all milestones
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative', overflowX: 'auto', paddingBottom: 20 }}>
                  {milestones.map((milestone, i) => {
                    const isLast = i === milestones.length - 1
                    const isFirst = i === 0
                    return (
                      <div key={i} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: isFirst ? navy : '#cbd5e1', border: `3px solid ${isFirst ? navy : '#cbd5e1'}`, marginBottom: 12 }} />
                        <div style={{ fontSize: 12, fontWeight: isFirst ? 700 : 600, color: navy, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: fontSans }}>{milestone.label}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontFamily: fontSans }}>Age {milestone.age}</div>
                        {!isLast && (
                          <div style={{ width: 40, height: 2, background: '#cbd5e1', margin: '12px 12px 0' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Save Your Report (Email Capture) - NOT GATED */}
          <div style={{ marginBottom: 40, background: '#fff', borderRadius: 12, border: '1px solid #cbd5e1', padding: isMobile ? '20px 16px' : '28px 24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 8, fontFamily: fontSerif }}>Save Your Retirement Readiness Report</h3>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px', fontFamily: fontSans }}>
              Get a copy of your personalized analysis sent to your inbox.
            </p>

            {captureSent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <p style={{ color: navy, fontWeight: 600, fontSize: 16, margin: '0 0 4px', fontFamily: fontSans }}>Report sent!</p>
                <p style={{ color: '#475569', fontSize: 14, margin: 0, fontFamily: fontSans }}>Check your inbox for your personalized analysis.</p>
              </div>
            ) : user ? (
              <div>
                <p style={{ fontSize: 14, color: emerald, fontWeight: 600, marginBottom: 16, fontFamily: fontSans }}>You are signed in as {user?.email}</p>
                <button type="button" onClick={() => {
                  setCaptureEmail(user?.email)
                  handleEmailCapture({ preventDefault: () => {} })
                }} style={{ background: maroon, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: fontSans }}>
                  Send My Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailCapture} style={{ maxWidth: 360, margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Full name"
                    aria-label="Full name"
                    value={captureName}
                    onChange={e => setCaptureName(e.target.value)}
                    style={{ padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', fontFamily: fontSans }}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    aria-label="Email address"
                    value={captureEmail}
                    onChange={e => setCaptureEmail(e.target.value)}
                    required
                    style={{ padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', fontFamily: fontSans }}
                  />
                </div>
                {captureError && (
                  <div role="alert" style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, fontFamily: fontSans }}>{captureError}</div>
                )}
                <button type="submit" disabled={captureLoading} style={{ background: maroon, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: captureLoading ? 'not-allowed' : 'pointer', width: '100%', opacity: captureLoading ? 0.7 : 1, fontFamily: fontSans }}>
                  {captureLoading ? 'Sending...' : 'Send My Report'}
                </button>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 10, fontFamily: fontSans }}>
                  We'll send your report and nothing else.
                </div>
              </form>
            )}
          </div>

          {/* SECTION 6: Next Steps */}
          <div style={{ marginBottom: 32, background: lightGray, borderRadius: 12, padding: isMobile ? '20px 16px' : '32px 24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 8, fontFamily: fontSerif }}>Want to talk through your results?</h3>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 540, margin: '0 auto 24px', fontFamily: fontSans }}>
              A certified federal retirement consultant can review your specific numbers and help you build a personalized plan. Free, 30-minute video call.
            </p>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, justifyContent: 'center' }}>
              <button type="button" onClick={() => navigate('/calculator')} style={{ background: '#fff', color: navy, border: '1.5px solid #cbd5e1', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: fontSans, width: isMobile ? '100%' : 'auto' }}>
                Explore the Calculator
              </button>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ background: maroon, color: '#fff', border: '1.5px solid maroon', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'block', fontFamily: fontSans, textAlign: 'center', width: isMobile ? '100%' : 'auto' }}>
                Schedule a Conversation
              </a>
            </div>
          </div>

          {/* SECTION 7: Retake */}
          <div style={{ textAlign: 'center' }}>
            <button type="button" onClick={() => { setStep(0); setAnswers({}); setSelected(null); setShowScore(false); setShowChecklist(false); setCaptureEmail(''); setCaptureName(''); setCaptureSent(false) }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontWeight: 500, fontFamily: fontSans }}>
              Retake assessment
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ============================================================
  // QUESTION SCREEN
  // ============================================================
  return (
    <main id="main-content" aria-live="polite" aria-atomic="false" style={{ minHeight: '100vh', background: cream, fontFamily: fontSans }} aria-label="Retirement readiness assessment quiz">
      <div style={{ background: `linear-gradient(160deg, ${navy} 0%, ${secondaryNavy} 60%)`, padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, fontFamily: fontSans }}>Free Tool</div>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 700, margin: '0 0 8px', fontFamily: fontSerif }}>Retirement Readiness Assessment</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0, fontFamily: fontSans }}>14 questions. Get your personalized federal retirement action plan.</p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6, fontFamily: fontSans }}>
            <span>Question {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ height: 6, background: '#cbd5e1', borderRadius: 3 }}>
            <div style={{ height: '100%', width: progress + '%', background: maroon, borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Category indicator */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: CATEGORIES[question.category].color, background: CATEGORIES[question.category].color + '15', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: fontSans }}>
            {CATEGORIES[question.category].label}
          </span>
        </div>

        {/* Question Card */}
        <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '20px 16px' : '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', marginBottom: 16, border: '1px solid #cbd5e1' }}>
          <h2 id="assessment-question" style={{ fontSize: 19, fontWeight: 700, color: navy, margin: '0 0 6px', lineHeight: 1.4, fontFamily: fontSerif }}>{question.question}</h2>
          <p style={{ fontSize: 13, color: '#475569', margin: '0 0 24px', lineHeight: 1.5, fontFamily: fontSans }}>{question.sub}</p>

          <div role="radiogroup" aria-labelledby="assessment-question" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.options.map(opt => (
              <button type="button"
                role="radio"
                aria-checked={selected === opt.value}
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  border: selected === opt.value ? `2px solid ${maroon}` : '2px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: selected === opt.value ? '#fdf2f4' : '#fff',
                  color: selected === opt.value ? maroon : navy,
                  fontSize: 14,
                  fontWeight: selected === opt.value ? 600 : 400,
                  transition: 'all 0.15s ease',
                  fontFamily: fontSans,
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
            <button type="button"
              onClick={handleBack}
              style={{ flex: 0, padding: '14px 20px', background: '#fff', color: '#64748b', border: '1.5px solid #cbd5e1', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: fontSans }}
            >
              Back
            </button>
          )}
          <button type="button"
            onClick={handleNext}
            disabled={selected === null}
            style={{
              flex: 1,
              background: selected !== null ? maroon : '#cbd5e1',
              color: selected !== null ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: 10,
              padding: '14px',
              fontSize: 15,
              fontWeight: 700,
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              fontFamily: fontSans,
            }}
          >
            {step + 1 === totalSteps ? 'See My Results' : 'Next Question →'}
          </button>
        </div>
      </div>
    </main>
  )
}
