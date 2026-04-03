import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../App'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

const STARTER_PROMPTS = [
  'When can I retire with full benefits?',
  'How does the FERS supplement work?',
  'What happens to my FEHB in retirement?',
  'How is my annuity calculated?',
  'What should I do with my TSP at retirement?',
  'What is the MRA+10 option?',
  'How does Social Security coordinate with FERS?',
  'What are my survivor benefit options?',
]

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: "Hi! I'm your federal benefits AI assistant. Ask me anything about FERS, TSP, FEHB, FEGLI, Social Security, Medicare, military benefits, or any other federal retirement topic. What would you like to know?",
    ts: Date.now(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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

    setInput('')
    const newMessages = [...messages, { role: 'user', text: q, ts: Date.now() }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const apiMessages = newMessages
        .filter((m, i) => i > 0)
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
      setMessages(prev => [...prev, { role: 'assistant', text: reply, ts: Date.now() }])

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

  return (
    <div style={styles.chatPage}>
      {/* Header */}
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderInner}>
          <div>
            <div style={styles.chatTitle}>Federal Benefits AI</div>
            <div style={styles.chatSubtitle}>Sourced from OPM, SSA, and verified 2026 figures</div>
          </div>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={styles.consultBtn}>
            Book Free Consultation
          </a>
        </div>
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
              <div style={styles.typing}>
                <span style={styles.dot} /><span style={styles.dot} /><span style={styles.dot} />
              </div>
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
            placeholder="Ask about your retirement, TSP, FEHB, or any federal benefit..."
            disabled={loading}
            style={styles.input}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{ ...styles.sendBtn, ...((!input.trim() || loading) ? styles.sendBtnDisabled : {}) }}
          >
            &rarr;
          </button>
        </div>
        <p style={styles.inputNote}>
          AI can make mistakes - verify important decisions with OPM or your HR office.{' '}
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={styles.noteLink}>
            Book a free expert consultation
          </a>
          {' '}for personalized guidance.
        </p>
      </div>
    </div>
  )
}

const styles = {
  chatPage: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 64px)',
    background: '#f8fafc',
  },
  chatHeader: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5f8a 100%)',
    color: 'white',
    flexShrink: 0,
  },
  chatHeaderInner: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  chatTitle: { fontWeight: 700, fontSize: '1rem' },
  chatSubtitle: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  consultBtn: {
    background: '#22c55e',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: '0.8rem',
    fontWeight: 700,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    maxWidth: 760,
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#1e3a5f',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.65rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiBubble: {
    background: 'white',
    border: '1.5px solid #e2e8f0',
    borderRadius: '18px 18px 18px 4px',
    padding: '12px 16px',
    maxWidth: '78%',
    fontSize: '0.9rem',
    color: '#1e293b',
    lineHeight: 1.65,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  userBubble: {
    background: '#1e3a5f',
    color: 'white',
    borderRadius: '18px 18px 4px 18px',
    padding: '12px 16px',
    maxWidth: '78%',
    fontSize: '0.9rem',
    lineHeight: 1.65,
  },
  typing: {
    display: 'flex',
    gap: 5,
    alignItems: 'center',
    height: 20,
    padding: '0 4px',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#94a3b8',
    display: 'inline-block',
    animation: 'pulse 1.2s infinite',
  },

  starters: {
    maxWidth: 760,
    width: '100%',
    margin: '0 auto',
    padding: '0 16px 12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  starterBtn: {
    background: 'white',
    border: '1.5px solid #e2e8f0',
    borderRadius: 20,
    padding: '7px 14px',
    fontSize: '0.82rem',
    color: '#334155',
    cursor: 'pointer',
    fontWeight: 500,
  },

  inputArea: {
    background: 'white',
    borderTop: '1px solid #e2e8f0',
    padding: '12px 16px 16px',
    flexShrink: 0,
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    maxWidth: 760,
    margin: '0 auto',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#1e3a5f',
    color: 'white',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  sendBtnDisabled: {
    background: '#cbd5e1',
    cursor: 'not-allowed',
  },
  inputNote: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 760,
    margin: '8px auto 0',
  },
  noteLink: {
    color: '#1e3a5f',
    fontWeight: 600,
    textDecoration: 'underline',
  },
}
