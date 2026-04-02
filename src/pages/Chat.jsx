import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'

const DEPARTMENTS = [
  'Department of Defense (DoD)',
  'Department of Veterans Affairs (VA)',
  'Department of Homeland Security (DHS)',
  'Department of Health and Human Services (HHS)',
  'Department of the Treasury',
  'Department of Justice (DOJ)',
  'Department of State',
  'Department of Agriculture (USDA)',
  'Department of Transportation (DOT)',
  'Department of Energy (DOE)',
  'Department of the Interior (DOI)',
  'Department of Labor (DOL)',
  'Department of Commerce',
  'Department of Education',
  'Department of Housing and Urban Development (HUD)',
  'U.S. Postal Service (USPS)',
  'Social Security Administration (SSA)',
  'Office of Personnel Management (OPM)',
  'Environmental Protection Agency (EPA)',
  'National Aeronautics and Space Administration (NASA)',
  'General Services Administration (GSA)',
  'Other Federal Agency',
]

const ADMIN_EMAILS = ['jhf17@icloud.com']
const FREE_LIMIT = 3

const STARTER_PROMPTS = [
  'When can I retire with full benefits?',
  'How does the FERS supplement work?',
  'What happens to my FEHB in retirement?',
  'How is my annuity calculated?',
  'Should I keep TSP contributions at max?',
  'What is the MRA+10 option?',
]

export default function Chat() {
  const { user } = useAuth()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)
  const [department, setDepartment] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionsUsed, setQuestionsUsed] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleConfirm = () => {
    if (!department) return
    setConfirmed(true)
    setMessages([{
      role: 'assistant',
      text: `Hi! I'm your federal benefits AI assistant. I see you're with **${department}** Ã¢ÂÂ I'll keep that context in mind as we talk.\n\nYou have **${isAdmin ? 'unlimited' : FREE_LIMIT + ' free'} questions**. What would you like to know about your federal benefits?`,
      ts: Date.now(),
    }])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSend = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    if (questionsUsed >= FREE_LIMIT) { setShowPaywall(true); return }

    setInput('')
    const newMessages = [...messages, { role: 'user', text: q, ts: Date.now() }]
    setMessages(newMessages)
    setLoading(true)

    // Simulate AI response (replace with real Claude API call)
    await new Promise(r => setTimeout(r, 1200))
    const reply = await getFakeReply(q, department)
    const used = questionsUsed + 1
    setQuestionsUsed(used)
    setMessages(prev => [...prev, { role: 'assistant', text: reply, ts: Date.now() }])
    setLoading(false)

    if (used >= FREE_LIMIT) {
      setTimeout(() => setShowPaywall(true), 800)
    }
  }

  const remaining = FREE_LIMIT - questionsUsed

  if (!confirmed) {
    return (
      <div style={styles.page}>
        <div style={styles.setupCard}>
          <div style={styles.setupIcon}>Ã°ÂÂ¤Â</div>
          <h1 style={styles.setupTitle}>Federal Benefits AI Chat</h1>
          <p style={styles.setupSub}>
            Get personalized answers about your FERS annuity, TSP, FEHB, FEGLI,
            and retirement eligibility Ã¢ÂÂ tailored to your specific situation.
          </p>

          <div style={styles.freeTag}>
            Ã¢ÂÂ &nbsp;{FREE_LIMIT} free questions Ã¢ÂÂ no account required
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Your Agency / Department <span style={{ color: '#ef4444' }}>*</span></label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              style={styles.select}
            >
              <option value="">Select your department...</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <p style={styles.fieldNote}>
              This helps tailor answers to your agency's specific rules and retirement options.
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!department}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1rem', padding: '13px 0', marginTop: 8 }}
          >
            Start Chatting Ã¢ÂÂ
          </button>

          <p style={styles.legalNote}>
            AI answers are for informational purposes only and do not constitute official benefits advice.
            Always verify with your HR office or OPM.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.chatPage}>
      {/* Header */}
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderInner}>
          <div>
            <div style={styles.chatTitle}>Federal Benefits AI</div>
            <div style={styles.chatDept}>{department}</div>
          </div>
          <div style={styles.counterPill}>
            {remaining > 0
              ? `${remaining} free question${remaining !== 1 ? 's' : ''} left`
              : 'Free questions used'}
          </div>
        </div>
        {remaining <= 1 && remaining > 0 && (
          <div style={styles.upgradeBar}>
            Almost there Ã¢ÂÂ <strong>1 free question left.</strong>{' '}
            <button onClick={() => setShowPaywall(true)} style={styles.upgradeBarBtn}>
              Unlock unlimited Ã¢ÂÂ
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.msgRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && <div style={styles.avatar}>AI</div>}
            <div style={m.role === 'user' ? styles.userBubble : styles.aiBubble}>
              {m.text.split('\n').map((line, j) => {
                const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                return <p key={j} style={{ margin: j > 0 ? '6px 0 0' : 0 }} dangerouslySetInnerHTML={{ __html: bold }} />
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
            <div style={styles.avatar}>AI</div>
            <div style={styles.aiBubble}>
              <div style={styles.typing}><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts (only before first user message) */}
      {messages.length === 1 && (
        <div style={styles.starters}>
          {STARTER_PROMPTS.map(p => (
            <button key={p} onClick={() => handleSend(p)} style={styles.starterBtn}>{p}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputRow}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={questionsUsed >= FREE_LIMIT ? 'Upgrade to continue chattingÃ¢ÂÂ¦' : 'Ask about your retirement, TSP, FEHBÃ¢ÂÂ¦'}
            disabled={questionsUsed >= FREE_LIMIT || loading}
            style={styles.input}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading || questionsUsed >= FREE_LIMIT}
            style={styles.sendBtn}
          >
            Ã¢ÂÂ
          </button>
        </div>
        <p style={styles.inputNote}>AI can make mistakes Ã¢ÂÂ verify important decisions with OPM or your HR office.</p>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div style={styles.paywallOverlay} onClick={e => e.target === e.currentTarget && setShowPaywall(false)}>
          <div style={styles.paywallCard}>
            <div style={styles.paywallEmoji}>Ã°ÂÂÂ</div>
            <h2 style={styles.paywallTitle}>You've used your {FREE_LIMIT} free questions</h2>
            <p style={styles.paywallSub}>
              Unlock unlimited AI chat Ã¢ÂÂ personalized answers to every benefits question,
              any time, for just a few dollars a month.
            </p>

            <div style={styles.plans}>
              <div style={styles.planCard}>
                <div style={styles.planName}>AI Chat</div>
                <div style={styles.planPrice}><span style={styles.planDollar}>$</span>9.99<span style={styles.planPer}>/mo</span></div>
                <ul style={styles.planFeatures}>
                  <li>Ã¢ÂÂ Unlimited questions</li>
                  <li>Ã¢ÂÂ Retirement calculations</li>
                  <li>Ã¢ÂÂ FEHB, TSP, FEGLI guidance</li>
                  <li>Ã¢ÂÂ Agency-tailored answers</li>
                </ul>
                <Link to="/signup" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
                  Get AI Chat
                </Link>
              </div>

              <div style={{ ...styles.planCard, ...styles.planCardFeatured }}>
                <div style={styles.bestBadge}>BEST VALUE</div>
                <div style={styles.planName}>Training + AI Chat</div>
                <div style={styles.planPrice}><span style={styles.planDollar}>$</span>29.99<span style={styles.planPer}>/mo</span></div>
                <ul style={styles.planFeatures}>
                  <li>Ã¢ÂÂ Everything in AI Chat</li>
                  <li>Ã¢ÂÂ 350+ quiz questions</li>
                  <li>Ã¢ÂÂ 11 benefit modules</li>
                  <li>Ã¢ÂÂ Progress tracking</li>
                </ul>
                <Link to="/signup" className="btn btn-navy" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
                  Get Bundle
                </Link>
              </div>
            </div>

            <button onClick={() => setShowPaywall(false)} style={styles.paywallClose}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Placeholder AI response Ã¢ÂÂ replace with real Claude API call
async function getFakeReply(question, department) {
  const q = question.toLowerCase()
  if (q.includes('retire') && (q.includes('when') || q.includes('eligible'))) {
    return `**FERS Retirement Eligibility** (${department})\n\nYour eligibility depends on your age and years of creditable service:\n\nÃ¢ÂÂ¢ **Immediate unreduced annuity:** Age 62 with 5 years, age 60 with 20 years, or MRA (56Ã¢ÂÂ57) with 30 years\nÃ¢ÂÂ¢ **MRA+10 option:** At your MRA with 10Ã¢ÂÂ29 years Ã¢ÂÂ available now, but annuity reduced 5% per year under 62 unless you postpone\nÃ¢ÂÂ¢ **Early out / VERA:** Check with your agency Ã¢ÂÂ sometimes offered with reduced penalties\n\nWhat are your current age and years of service? I can give you a more specific answer.`
  }
  if (q.includes('fehb') || q.includes('health')) {
    return `**FEHB in Retirement**\n\nTo keep FEHB coverage into retirement, you must:\n\nÃ¢ÂÂ¢ **Be enrolled** in FEHB for the **5 consecutive years** immediately before retirement (or since your first opportunity)\nÃ¢ÂÂ¢ Retire on an **immediate annuity** (not deferred)\n\nOnce you meet the 5-year rule, you keep the same coverage with the same government share of premiums Ã¢ÂÂ typically 72% of the weighted average.\n\nIf you're under 62 and receiving the FERS supplement, your FEHB premiums come out of your annuity, not a paycheck.`
  }
  if (q.includes('tsp') || q.includes('thrift')) {
    return `**TSP in Retirement**\n\nYour TSP options at retirement:\n\nÃ¢ÂÂ¢ **Leave it** in TSP Ã¢ÂÂ low fees, good fund options\nÃ¢ÂÂ¢ **Withdraw** via monthly payments, life annuity, or lump sum\nÃ¢ÂÂ¢ **Roll over** to IRA (traditional Ã¢ÂÂ traditional, Roth Ã¢ÂÂ Roth)\n\nAt 73 you must start **Required Minimum Distributions (RMDs)** unless still working.\n\n**Key tip:** The TSP G Fund is unique Ã¢ÂÂ it earns long-term bond rates with no risk of loss. Most outside IRAs don't offer anything comparable.\n\nWould you like to talk through withdrawal strategies or contribution limits?`
  }
  if (q.includes('supplement') || q.includes('fers supplement')) {
    return `**FERS Supplement**\n\nThe FERS supplement bridges the gap between your retirement date and age 62 (when Social Security becomes available).\n\nÃ¢ÂÂ¢ **Who gets it:** FERS employees who retire on an immediate annuity before 62 with 30 years at MRA, or at 60 with 20 years\nÃ¢ÂÂ¢ **Amount:** Roughly equal to the Social Security benefit you earned while a federal employee\nÃ¢ÂÂ¢ **Earnings test applies:** Reduced $1 for every $2 earned above ~$22,320/yr (2025 limit) if you work after retirement\nÃ¢ÂÂ¢ **Ends at 62:** Not a permanent benefit\n\nDo you want help estimating what your supplement might be worth?`
  }
  return `That's a great question about **${question.length > 60 ? question.substring(0, 60) + '...' : question}**.\n\nFor ${department} employees, this involves several FERS-specific rules I'd be happy to walk through. Could you share a bit more context Ã¢ÂÂ specifically your approximate age, years of federal service, and whether you're FERS or CSRS? That'll help me give you the most accurate answer.\n\n*(Note: This is a preview response. Full AI integration powered by Claude API coming soon.)*`
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
  },
  setupCard: {
    background: 'white',
    borderRadius: 20,
    border: '1.5px solid #e2e8f0',
    padding: '48px 40px',
    maxWidth: 520,
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  setupIcon: { fontSize: '2.5rem', marginBottom: 16 },
  setupTitle: { fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.02em' },
  setupSub: { color: '#475569', lineHeight: 1.6, fontSize: '0.97rem', marginBottom: 20 },
  freeTag: {
    display: 'inline-flex', alignItems: 'center',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    color: '#166534', borderRadius: 20, padding: '6px 14px',
    fontSize: '0.83rem', fontWeight: 600, marginBottom: 28,
  },
  fieldWrap: { marginBottom: 20 },
  label: { display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', marginBottom: 8 },
  select: {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
    color: '#0f172a', background: 'white', cursor: 'pointer',
    outline: 'none',
  },
  fieldNote: { fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 },
  legalNote: { fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: 20, lineHeight: 1.5 },

  chatPage: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: '#f8fafc' },
  chatHeader: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5f8a 100%)',
    color: 'white', flexShrink: 0,
  },
  chatHeaderInner: {
    maxWidth: 760, margin: '0 auto', padding: '16px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  chatTitle: { fontWeight: 700, fontSize: '1rem' },
  chatDept: { fontSize: '0.78rem', opacity: 0.7, marginTop: 2 },
  counterPill: {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 20, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600,
  },
  upgradeBar: {
    background: 'rgba(251,191,36,0.15)', borderTop: '1px solid rgba(251,191,36,0.3)',
    padding: '8px 20px', fontSize: '0.83rem', textAlign: 'center', color: '#fde68a',
  },
  upgradeBarBtn: {
    background: 'none', border: 'none', color: '#fbbf24',
    fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem', padding: 0,
  },

  messages: {
    flex: 1, overflowY: 'auto', padding: '24px 16px',
    display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760,
    width: '100%', margin: '0 auto', boxSizing: 'border-box',
  },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: '#1e3a5f',
    color: 'white', fontWeight: 700, fontSize: '0.65rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  aiBubble: {
    background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '18px 18px 18px 4px',
    padding: '12px 16px', maxWidth: '78%', fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.65,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  userBubble: {
    background: '#1e3a5f', color: 'white',
    borderRadius: '18px 18px 4px 18px',
    padding: '12px 16px', maxWidth: '78%', fontSize: '0.9rem', lineHeight: 1.65,
  },
  typing: {
    display: 'flex', gap: 4, alignItems: 'center', height: 20,
  },

  starters: {
    maxWidth: 760, width: '100%', margin: '0 auto',
    padding: '0 16px 12px',
    display: 'flex', flexWrap: 'wrap', gap: 8,
  },
  starterBtn: {
    background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 20,
    padding: '7px 14px', fontSize: '0.82rem', color: '#334155',
    cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
  },

  inputArea: {
    background: 'white', borderTop: '1px solid #e2e8f0',
    padding: '12px 16px 16px', flexShrink: 0,
  },
  inputRow: {
    display: 'flex', gap: 10, maxWidth: 760, margin: '0 auto',
    alignItems: 'center',
  },
  input: {
    flex: 1, padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
    outline: 'none', fontFamily: 'inherit',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#1e3a5f', color: 'white', border: 'none',
    fontSize: '1.2rem', cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700,
  },
  inputNote: {
    fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center',
    maxWidth: 760, margin: '8px auto 0',
  },

  paywallOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: 16,
  },
  paywallCard: {
    background: 'white', borderRadius: 20, padding: '40px 32px',
    maxWidth: 580, width: '100%', textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  paywallEmoji: { fontSize: '2.5rem', marginBottom: 12 },
  paywallTitle: { fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 },
  paywallSub: { color: '#475569', fontSize: '0.93rem', lineHeight: 1.6, marginBottom: 28 },

  plans: { display: 'flex', gap: 14, marginBottom: 20 },
  planCard: {
    flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 14,
    padding: '20px 18px', textAlign: 'left',
  },
  planCardFeatured: {
    border: '2px solid #1e3a5f', background: '#f8faff', position: 'relative',
  },
  bestBadge: {
    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
    background: '#1e3a5f', color: 'white', fontSize: '0.65rem',
    fontWeight: 800, letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 20,
  },
  planName: { fontWeight: 700, fontSize: '0.9rem', color: '#475569', marginBottom: 6 },
  planPrice: { fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 },
  planDollar: { fontSize: '1rem', fontWeight: 700, verticalAlign: 'super' },
  planPer: { fontSize: '0.85rem', fontWeight: 500, color: '#64748b' },
  planFeatures: {
    listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6,
    fontSize: '0.82rem', color: '#475569',
  },

  paywallClose: {
    background: 'none', border: 'none', color: '#94a3b8',
    cursor: 'pointer', fontSize: '0.88rem', padding: 8,
  },
}
