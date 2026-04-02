import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'

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

function getStoredQuestions() {
  try {
    const stored = localStorage.getItem('fbaChatUsage')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Support both old {date,count} format and new plain number
      if (typeof parsed === 'number') return parsed
      if (parsed && typeof parsed.count === 'number') return parsed.count
    }
  } catch { /* ignore bad data */ }
  return 0
}

function setStoredQuestions(count) {
  localStorage.setItem('fbaChatUsage', JSON.stringify(count))
}

export default function Chat() {
  const { user } = useAuth()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: 'Hi! I\'m your federal benefits AI assistant. You have **' + (isAdmin ? 'unlimited' : FREE_LIMIT + ' free') + ' questions**. What would you like to know about your federal benefits?',
    ts: Date.now(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionsUsed, setQuestionsUsed] = useState(() => getStoredQuestions())
  const [showPaywall, setShowPaywall] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    if (!isAdmin && questionsUsed >= FREE_LIMIT) { setShowPaywall(true); return }

    setInput('')
    const newMessages = [...messages, { role: 'user', text: q, ts: Date.now() }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const apiMessages = newMessages
        .filter(m => m.role === 'user' || (m.role === 'assistant' && messages.indexOf(m) > 0))
        .map(m => ({ role: m.role, content: m.text }))

      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      const reply = data.content || 'Sorry, I could not generate a response. Please try again.'
      const used = questionsUsed + 1
      if (!isAdmin) {
        setQuestionsUsed(used)
        setStoredQuestions(used)
      }
      setMessages(prev => [...prev, { role: 'assistant', text: reply, ts: Date.now() }])

      if (!isAdmin && used >= FREE_LIMIT) {
        setTimeout(() => setShowPaywall(true), 800)
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again in a moment.',
        ts: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const remaining = FREE_LIMIT - questionsUsed

  return (
    <div style={styles.chatPage}>
      {/* Header */}
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderInner}>
          <div>
            <div style={styles.chatTitle}>Federal Benefits AI</div>
          </div>
          <div style={styles.counterPill}>
            {isAdmin
              ? 'Unlimited (admin)'
              : remaining > 0
                ? `${remaining} free question${remaining !== 1 ? 's' : ''} left`
                : 'Free questions used'}
          </div>
        </div>
        {!isAdmin && remaining <= 1 && remaining > 0 && (
          <div style={styles.upgradeBar}>
            Almost there &mdash; <strong>1 free question left.</strong>{' '}
            <button onClick={() => setShowPaywall(true)} style={styles.upgradeBarBtn}>
              Unlock unlimited &rarr;
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
            placeholder={!isAdmin && questionsUsed >= FREE_LIMIT ? 'Upgrade to continue chatting...' : 'Ask about your retirement, TSP, FEHB...'}
            disabled={(!isAdmin && questionsUsed >= FREE_LIMIT) || loading}
            style={styles.input}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading || (!isAdmin && questionsUsed >= FREE_LIMIT)}
            style={styles.sendBtn}
          >
            &rarr;
          </button>
        </div>
        <p style={styles.inputNote}>AI can make mistakes &mdash; verify important decisions with OPM or your HR office.</p>
      </div>

      {/* Paywall Modal (non-dismissible) */}
      {showPaywall && (
        <div style={styles.paywallOverlay}>
          <div style={styles.paywallCard}>
            <h2 style={styles.paywallTitle}>You've used your {FREE_LIMIT} free questions</h2>
            <p style={styles.paywallSub}>
              Unlock unlimited AI chat &mdash; personalized answers to every benefits question,
              any time, for just a few dollars a month.
            </p>

            <div style={styles.plans}>
              <div style={styles.planCard}>
                <div style={styles.planName}>AI Chat</div>
                <div style={styles.planPrice}><span style={styles.planDollar}>$</span>9.99<span style={styles.planPer}>/mo</span></div>
                <ul style={styles.planFeatures}>
                  <li>&#10003; Unlimited questions</li>
                  <li>&#10003; Retirement calculations</li>
                  <li>&#10003; FEHB, TSP, FEGLI guidance</li>
                  <li>&#10003; Agency-tailored answers</li>
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
                  <li>&#10003; Everything in AI Chat</li>
                  <li>&#10003; 350+ quiz questions</li>
                  <li>&#10003; 11 benefit modules</li>
                  <li>&#10003; Progress tracking</li>
                </ul>
                <Link to="/signup" className="btn btn-navy" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
                  Get Bundle
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
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

}
