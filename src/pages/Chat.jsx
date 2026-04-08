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
  const [loading, setLoadingEtrue)
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
      <aside style={styles.sidebar} aria-label="Chat sidebar">
        <div style={styles.sidebarTop}>
          <h2 style={styles.sidebarTitle}>Federal Benefits AI</h2>
          <div style={styles.sidebarUser}>
            Signed in as<br />
            <strong>{user?.email}</strong>
          </div>
        </div>

        <div style={styles.sidebarSection} role="group" aria-label="Quick question suggestions">
          <h3 style={styles.sidebarLabel}>Quick Questions</h3>
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
      </aside>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {/* Messages */}
        <div style={styles.messages} role="log" aria-label="Chat messages" aria-live="polite">
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
                <div style={styles.avatar} aria-hidden="true">🤖</div>
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
                <div style={styles.userAvatar} aria-hidden="true">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
              <div style={styles.avatar} aria-hidden="true">🤖</div>
              <div style={{ ...styles.bubble, ...styles.bubbleAI, ...styles.typingBubble }}>
                <TypingIndicator />
              </div>
            </div>
          )}

          {error && (
            <div style={styles.errorMsg} role="alert">
              <span aria-hidden="true">⚠️</span> {error}
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
              aria-label="Type your message about federal benefits"
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
                : null
              })}
            </ul>
          )
        }

        // Heading detection (lines starting with **)
        if (para.startsWith('**'���bb&�V�G5v�F��r��r����&WGW&�
��^O^�_H�[O^���۝�ZY����۝�^�N�	��M\�[I�X\��[��_O���\�K��\X�J�
�
���	��_B����
B�B���]\��
��^O^�_H�[O^��X\��[���۝�^�N�	��Lܙ[I�[�RZY��K��H_O���ܛX]Y^^^�\�_Hς����
B�J_B��]���
B�B���[��[ۈ�ܛX]Y^
�^JH����^�
��^
����ۜ�\��H^��]
�
�
����W
�
���B��]\��
����\�˛X\

\�JHO��H	H�OOHH���ۙ��^O^�_O��\�O���ۙψ�\��
_B�ς�
B�B���[��[ۈ\[��[�X�]܊
H�]\��
�]��[O^��\�^N�	ٛ^	��\�[Yے][\Έ	��[�\��Y[�Έ	�	�_O����K�K�X\
HO�
�]���^O^�_B��[O^��Y���ZY�����ܙ\��Y]\Έ	�L	I���X��ܛ�[��	��ML؎	��[�[X][ێ���[��HK���X\�KZ[�[�]	�H
���\�[��[�]X�_B�ς�
Y_B��[O����^Y��[Y\���[��H	K�	KL	H��[�ٛܛN��[��]VJ
N�B��	H��[�ٛܛN��[��]VJM�
N�B�B�O��[O���]���
B�B���ۜ��[\�HY�N�\�^N�	ٛ^	��ZY��	��[�L�H�
I���X��ܛ�[��	�َ�Y����ݙ\���Έ	�Y[���K��YX�\���Y����X��ܛ�[��	��]I���ܙ\��Y��	�\��Y�L�N�	��\�^N�	ٛ^	���^\�X�[ێ�	���[[����^��[�Έ�ݙ\���Έ	�]]���K��YX�\���Y[�Έ	̍M�M�	���ܙ\����N�	�\��Y�L�N�	��K��YX�\�]N��۝�ZY����۝�^�N�	�\�[I����܎�	��YL�MY���X\��[����N��K��YX�\�\�\���۝�^�N�	���[I����܎�	�͍����[�RZY��K�K�K��YX�\��X�[ێ�Y[�Έ	�M�	���^�K�K��YX�\�X�[��۝�^�N�	��̜�[I���۝�ZY������܎�	��ML؎	��^�[�ٛܛN�	�\\��\�I��]\��X�[�Έ	���[I��X\��[����N��K��Y��\�[ې���\�^N�	؛������Y�	�L	I��^[Yێ�	�Y�	���X��ܛ�[��	ۛۙI���ܙ\��	ۛۙI��Y[�Έ	�L	���ܙ\��Y]\Έ��۝�^�N�	����[I����܎�	����MMI���\��܎�	��[�\���[�RZY��K��X\��[����N����[��][ێ�	ؘX��ܛ�[��\���K��]\�XN��^�K�\�^N�	ٛ^	���^\�X�[ێ�	���[[���ݙ\���Έ	�Y[���X^�Y���X\��[��	�]]����Y�	�L	I��K�Y\��Y�\Έ�^�K�ݙ\����N�	�]]���Y[�Έ	̍�	��\�^N�	ٛ^	���^\�X�[ێ�	���[[����\�M��K�Y\��Y�T��Έ\�^N�	ٛ^	��[Yے][\Έ	ٛ^Y[�	���\��K�]�]\���Y�̋�ZY��̋��ܙ\��Y]\Έ	�L	I���X��ܛ�[��	��Y�������\�^N�	ٛ^	��[Yے][\Έ	��[�\����\�Y�P�۝[��	��[�\����۝�^�N�	�\�[I���^��[�Έ�X\��[����N���K�\�\�]�]\���Y�̋�ZY��̋��ܙ\��Y]\Έ	�L	I���X��ܛ�[��	��YL�MY�����܎�	��]I��\�^N�	ٛ^	��[Yے][\Έ	��[�\����\�Y�P�۝[��	��[�\����۝�^�N�	��\�[I���۝�ZY�����^��[�Έ�X\��[����N���K��X��N�X^�Y�	�̉I��Y[�Έ	�L�M�	���ܙ\��Y]\ΈM��[�RZY��K���K��X��U\�\���X��ܛ�[��	��YL�MY�����܎�	��]I���ܙ\����T�Y��Y]\Έ��۝�^�N�	��Lܙ[I��K��X��PRN��X��ܛ�[��	��]I����܎�	��YL�L؉���ܙ\����SY��Y]\Έ��ܙ\��	�\��Y�L�N�	�����Y�Έ	�\��ؘJ�JI��K�\[�НX��N�Y[�Έ	�L�M�	��K�\��ܓ\�Έ�X��ܛ�[��	�ٙY�������ܙ\��	�\��YٙX�X�I���ܙ\��Y]\ΈL�Y[�Έ	�L�M�	���۝�^�N�	���[I����܎�	��̍�����\�^N�	ٛ^	��[Yے][\Έ	��[�\����\�Y�P�۝[��	��X�KX�]�Y[����\�L��K�\��ܑ\�Z\�Έ�X��ܛ�[��	ۛۙI���ܙ\��	ۛۙI����܎�	��̍������\��܎�	��[�\����۝�ZY�����۝�^�N�	��ܙ[I���۝�[Z[N�	�[�\�]	���^��[�Έ�K�[�]\�XN�Y[�Έ	�L��M�	���ܙ\���	�\��Y�L�N�	���X��ܛ�[��	��]I��K�[�]ܘ\�\�^N�	ٛ^	���\��[Yے][\Έ	ٛ^Y[�	���X��ܛ�[��	�َ�Y�����ܙ\��	�K�\��Y�L�N�	���ܙ\��Y]\ΈM�Y[�Έ	�M	���[��][ێ�	؛ܙ\�X��܈�M\���K�^\�XN��^�K��ܙ\��	ۛۙI���X��ܛ�[��	��[��\�[�	���\�^�N�	ۛۙI���][�N�	ۛۙI���۝�[Z[N�	�[�\�]	���۝�^�N�	��M\�[I����܎�	��YL�L؉��[�RZY��K���Z[�ZY����X^ZY��M��ݙ\����N�	�]]���K��[�����Y�͋�ZY��͋��ܙ\��Y]\ΈL��X��ܛ�[��	��YL�MY�����܎�	��]I���ܙ\��	ۛۙI���\��܎�	��[�\����۝�^�N�	�K�\�[I���۝�ZY����\�^N�	ٛ^	��[Yے][\Έ	��[�\����\�Y�P�۝[��	��[�\����^��[�Έ��[��][ێ�	��X�]H�M\���K�[�]��N��۝�^�N�	���\�[I����܎�	��ML؎	��^[Yێ�	��[�\���X\��[����[�RZY��K��K�B