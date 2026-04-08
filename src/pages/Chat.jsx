import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import ConsultantCTA from '../components/ConsultantCTA'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Hi! I'm your federal benefits assistant. I'm here to give you precise, sourced answers about your FERS pension, TSP, FEHB, FEGLI, Medicare, Social Security, and more.

The more you tell me about your situation, the better I can tailor my answers — things like your years of service, your agency, your retirement timeline, and your family situation all affect your benefits significantly.

What would you like to know?`,
}

export default function Chat() {
  const { user } = useAuth()
  const location = useLocation()
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { document.title = 'AI Retirement Assistant | FedBenefitsAid' }, [])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const calcSentRef = useRef(false)

  // If navigated from calculator with results, auto-send them
  useEffect(() => {
    const calcResults = location.state?.calculatorResults
    if (calcResults && !calcSentRef.current) {
      calcSentRef.current = true
      const msg = `Here are my retirement calculator results — can you help me understand them and point out anything I should be aware of?\n\n${calcResults}`
      setTimeout(() => sendMessage(msg), 400)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setInput('')
    setError('')
    setLoading(true)
    if (inputRef.current) inputRef.current.style.height = 'auto'

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error: ${res.status}`)
      }

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const suggestions = [
    'How is my FERS pension calculated?',
    'What is the FEHB 5-year rule?',
    'Should I contribute Traditional or Roth TSP?',
    'When should I claim Social Security?',
    'What happens to my FEHB in retirement?',
    'Explain the FERS Supplement',
  ]

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.sidebarTitle}>Federal Benefits AI</div>
          <div style={styles.sidebarUser}>
            Signed in as<br />
            <strong>{user?.email}</strong>
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <div style={styles.sidebarLabel}>Quick Questions</div>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              disabled={loading}
              style={styles.suggestionBtn}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '0 16px 16px' }}>
          <ConsultantCTA compact />
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea} role="main" aria-label="Chat conversation">
        {/* Messages */}
        <div style={styles.messages} role="log" aria-live="polite" aria-label="Chat messages">
          <div style={{ flex: '1 1 auto' }} />
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={styles.avatar}>🤖</div>
              )}
              <div
                style={{
                  ...styles.bubble,
                  ...(msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI),
                }}
              >
                <MessageContent content={msg.content} />
              </div>
              {msg.role === 'user' && (
                <div style={styles.userAvatar}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
              <div style={styles.avatar}>🤖</div>
              <div style={{ ...styles.bubble, ...styles.bubbleAI, ...styles.typingBubble }}>
                <TypingIndicator />
              </div>
            </div>
          )}

          {error && (
            <div style={styles.errorMsg}>
              ⚠️ {error}
              <button onClick={() => setError('')} style={styles.errorDismiss}>Dismiss</button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          <div style={styles.inputWrap}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your federal benefits... (Enter to send, Shift+Enter for new line)"
              disabled={loading}
              style={styles.textarea}
              rows={1}
              aria-label="Message input"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={styles.sendBtn}
              aria-label="Send message"
            >
              {loading ? <span className="spinner" /> : '↑'}
            </button>
          </div>
          <div style={styles.inputNote}>
            AI answers are for educational purposes. Always verify with OPM or a qualified advisor for official decisions.
            <span style={{ margin: '0 8px', color: '#cbd5e1' }}>·</span>
            <Link to="/reference" style={{ color: '#2563eb' }}>Browse Reference Guide</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Renders message content with basic markdown-like formatting
function MessageContent({ content }) {
  if (!content) return null

  // Split on double newlines to get paragraphs
  const paragraphs = content.split(/\n\n+/)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {paragraphs.map((para, i) => {
        // Bullet list detection
        if (para.match(/^[-•*]\s/m) || para.match(/^\d+\.\s/m)) {
          const lines = para.split('\n')
          return (
            <ul key={i} style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {lines.map((line, j) => {
                const clean = line.replace(/^[-•*\d.]+\s/, '')
                return clean ? (
                  <li key={j} style={{ fontSize: '0.93rem', lineHeight: 1.6 }}>
                    <FormattedText text={clean} />
                  </li>
                ) : null
              })}
            </ul>
          )
        }

        // Heading detection (lines starting with **)
        if (para.startsWith('**') && para.endsWith('**')) {
          return (
            <p key={i} style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
              {para.replace(/\*\*/g, '')}
            </p>
          )
        }

        return (
          <p key={i} style={{ margin: 0, fontSize: '0.93rem', lineHeight: 1.65 }}>
            <FormattedText text={para} />
          </p>
        )
      })}
    </div>
  )
}

function FormattedText({ text }) {
  // Bold text: **text**
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#94a3b8',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    background: '#f8fafc',
    overflow: 'hidden',
  },
  sidebar: {
    width: 280,
    background: 'white',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'auto',
  },
  sidebarTop: {
    padding: '24px 16px 16px',
    borderBottom: '1px solid #e2e8f0',
  },
  sidebarTitle: {
    fontWeight: 800,
    fontSize: '1rem',
    color: '#1e3a5f',
    marginBottom: 8,
  },
  sidebarUser: {
    fontSize: '0.8rem',
    color: '#64748b',
    lineHeight: 1.5,
  },
  sidebarSection: {
    padding: '16px',
    flex: 1,
  },
  sidebarLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
  },
  suggestionBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: '0.82rem',
    color: '#334155',
    cursor: 'pointer',
    lineHeight: 1.4,
    marginBottom: 2,
    transition: 'background 0.1s',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxWidth: 820,
    margin: '0 auto',
    width: '100%',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 24px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
    marginBottom: 2,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#1e3a5f',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 700,
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '72%',
    padding: '12px 16px',
    borderRadius: 16,
    lineHeight: 1.6,
  },
  bubbleUser: {
    background: '#1e3a5f',
    color: 'white',
    borderBottomRightRadius: 4,
    fontSize: '0.93rem',
  },
  bubbleAI: {
    background: 'white',
    color: '#1e293b',
    borderBottomLeftRadius: 4,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  typingBubble: {
    padding: '12px 16px',
  },
  errorMsg: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: '0.88rem',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  errorDismiss: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.83rem',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  inputArea: {
    padding: '12px 24px 16px',
    borderTop: '1px solid #e2e8f0',
    background: 'white',
  },
  inputWrap: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 14,
    padding: '8px 8px 8px 14px',
    transition: 'border-color 0.15s',
  },
  textarea: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    color: '#1e293b',
    lineHeight: 1.6,
    minHeight: 24,
    maxHeight: 160,
    overflowY: 'auto',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#1e3a5f',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.15s',
  },
  inputNote: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 1.4,
  },
}
