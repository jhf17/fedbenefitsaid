import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { QUIZ_MODULES, QUIZ_QUESTIONS } from '../data/quizData'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function Quiz() {
  const { topicId } = useParams()
  const navigate = useNavigate()

  const module = QUIZ_MODULES.find(m => m.id === topicId)
  const questions = QUIZ_QUESTIONS[topicId] || []

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null) // index or null
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Reset state when topic changes
  useEffect(() => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setAnswered(false)
    setScore(0)
    setIsComplete(false)
  }, [topicId])

  if (!module || questions.length === 0) {
    return (
      <div style={styles.center}>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.errorTitle}>Module not found</div>
          <Link to="/training" className="btn btn-navy" style={{ marginTop: 16 }}>
            Back to Training
          </Link>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIdx]
  const isCorrect = selectedOption === currentQ.correct
  const progress = ((currentIdx) / questions.length) * 100

  const handleSelect = (optionIdx) => {
    if (answered) return
    setSelectedOption(optionIdx)
    setAnswered(true)
    if (optionIdx === currentQ.correct) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setIsComplete(true)
    } else {
      setCurrentIdx(i => i + 1)
      setSelectedOption(null)
      setAnswered(false)
    }
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setAnswered(false)
    setScore(0)
    setIsComplete(false)
  }

  const handleAskAI = () => {
    const msg = `I'm studying federal benefits and just answered a quiz question. The question was: "${currentQ.question}" The correct answer is: "${currentQ.options[currentQ.correct]}". Can you explain why this is correct and help me understand the key rules around this topic? ${currentQ.citation ? `(Reference: ${currentQ.citation})` : ''}`
    navigate('/chat', { state: { preloadMessage: msg } })
  }

  // Score screen
  if (isComplete) {
    const pct = Math.round((score / questions.length) * 100)
    const grade = pct >= 80 ? 'Strong' : pct >= 60 ? 'Passing' : 'Needs Review'
    const gradeColor = pct >= 80 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626'

    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={styles.scoreCard}>
          <div style={styles.scoreHeader}>
            <div style={styles.scoreLabel}>Quiz Complete</div>
            <div style={styles.moduleTitle}>{module.title}</div>
          </div>

          <div style={styles.scoreCircle}>
            <div style={{ ...styles.scoreNumber, color: gradeColor }}>{pct}%</div>
            <div style={styles.scoreDetail}>{score} / {questions.length} correct</div>
          </div>

          <div style={{ ...styles.gradeBadge, background: gradeColor + '18', color: gradeColor, border: `1.5px solid ${gradeColor}40` }}>
            {grade}
          </div>

          <p style={styles.scoreMsg}>
            {pct >= 80
              ? 'Excellent work. You have a strong grasp of this topic.'
              : pct >= 60
              ? 'Good effort. Review the questions you missed and consider asking the AI for deeper explanations.'
              : 'This topic warrants more study. Use the AI chat and reference guide to reinforce your understanding.'}
          </p>

          <div style={styles.scoreActions}>
            <button onClick={handleRestart} className="btn btn-outline" style={{ flex: 1 }}>
              Try Again
            </button>
            <button
              onClick={() => navigate('/chat', { state: { preloadMessage: `I just completed the "${module.title}" quiz and scored ${score}/${questions.length} (${pct}%). Can you give me a brief summary of the most important rules and numbers I should know about this topic?` } })}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Review with AI
            </button>
          </div>

          <Link to="/training" style={styles.backLink}>
            Back to all modules
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>
          <Link to="/training" style={styles.backBtn}>
            &#8592; Training
          </Link>
          <div style={styles.moduleLabel}>{module.title}</div>
          <div style={styles.questionCount}>
            {currentIdx + 1} / {questions.length}
          </div>
        </div>
        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </div>

      {/* Quiz card */}
      <div style={styles.quizWrap}>
        <div style={styles.quizCard}>
          {/* Question */}
          <div style={styles.questionLabel}>Question {currentIdx + 1}</div>
          <h2 style={styles.questionText}>{currentQ.question}</h2>

          {/* Options */}
          <div style={styles.options}>
            {currentQ.options.map((option, i) => {
              let optStyle = styles.option
              if (answered) {
                if (i === currentQ.correct) {
                  optStyle = { ...styles.option, ...styles.optionCorrect }
                } else if (i === selectedOption && i !== currentQ.correct) {
                  optStyle = { ...styles.option, ...styles.optionWrong }
                } else {
                  optStyle = { ...styles.option, ...styles.optionDimmed }
                }
              } else if (selectedOption === i) {
                optStyle = { ...styles.option, ...styles.optionSelected }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  style={optStyle}
                >
                  <span style={{
                    ...styles.optionLabel,
                    background: answered && i === currentQ.correct ? '#059669' : answered && i === selectedOption && i !== currentQ.correct ? '#dc2626' : '#e2e8f0',
                    color: answered && (i === currentQ.correct || (i === selectedOption && i !== currentQ.correct)) ? 'white' : '#64748b',
                  }}>
                    {OPTION_LABELS[i]}
                  </span>
                  <span style={styles.optionText}>{option}</span>
                </button>
              )
            })}
          </div>

          {/* Feedback panel */}
          {answered && (
            <div style={{ ...styles.feedback, ...(isCorrect ? styles.feedbackCorrect : styles.feedbackWrong) }}>
              <div style={styles.feedbackHeader}>
                <span style={{ ...styles.feedbackBadge, background: isCorrect ? '#059669' : '#dc2626' }}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
                {currentQ.citation && (
                  <span style={styles.citation}>{currentQ.citation}</span>
                )}
              </div>
              <p style={styles.feedbackText}>{currentQ.explanation}</p>

              <button onClick={handleAskAI} style={styles.askAIBtn}>
                Ask the AI about this topic
              </button>
            </div>
          )}

          {/* Next button */}
          {answered && (
            <div style={styles.nextWrap}>
              <button onClick={handleNext} className="btn btn-navy" style={{ minWidth: 160 }}>
                {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question'}
              </button>
            </div>
          )}
        </div>

        {/* Running score */}
        <div style={styles.scoreBar}>
          <span style={styles.scoreBarLabel}>Score</span>
          <span style={styles.scoreBarValue}>{score} / {currentIdx + (answered ? 1 : 0)}</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  center: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
  },
  errorTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 8,
  },
  topBar: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 64,
    zIndex: 10,
  },
  topBarInner: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 24px',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    fontSize: '0.85rem',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: 500,
    flexShrink: 0,
  },
  moduleLabel: {
    flex: 1,
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1e3a5f',
    textAlign: 'center',
  },
  questionCount: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    fontWeight: 600,
    flexShrink: 0,
  },
  progressTrack: {
    height: 3,
    background: '#e2e8f0',
  },
  progressFill: {
    height: '100%',
    background: '#1e3a5f',
    transition: 'width 0.3s ease',
  },
  quizWrap: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    margin: '0 auto',
    padding: '40px 24px 60px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  quizCard: {
    background: 'white',
    borderRadius: 16,
    border: '1.5px solid #e2e8f0',
    padding: '36px 36px 28px',
  },
  questionLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 12,
  },
  questionText: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.5,
    marginBottom: 28,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 4,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    background: 'white',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.12s ease',
    fontFamily: 'inherit',
  },
  optionSelected: {
    border: '1.5px solid #1e3a5f',
    background: '#f0f4ff',
  },
  optionCorrect: {
    border: '1.5px solid #059669',
    background: '#ecfdf5',
    cursor: 'default',
  },
  optionWrong: {
    border: '1.5px solid #dc2626',
    background: '#fef2f2',
    cursor: 'default',
  },
  optionDimmed: {
    opacity: 0.5,
    cursor: 'default',
  },
  optionLabel: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
    transition: 'all 0.12s ease',
  },
  optionText: {
    fontSize: '0.93rem',
    color: '#1e293b',
    lineHeight: 1.45,
  },
  feedback: {
    marginTop: 20,
    borderRadius: 12,
    padding: '20px 22px',
    border: '1.5px solid',
  },
  feedbackCorrect: {
    background: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  feedbackWrong: {
    background: '#fef2f2',
    borderColor: '#fecaca',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  feedbackBadge: {
    color: 'white',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '3px 12px',
    borderRadius: 20,
  },
  citation: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontStyle: 'italic',
  },
  feedbackText: {
    fontSize: '0.9rem',
    color: '#334155',
    lineHeight: 1.65,
    marginBottom: 16,
  },
  askAIBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#1e3a5f',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: '0.83rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  },
  nextWrap: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  scoreBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '8px 0',
  },
  scoreBarLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  scoreBarValue: {
    fontSize: '0.88rem',
    color: '#1e3a5f',
    fontWeight: 700,
  },
  // Score screen
  scoreCard: {
    background: 'white',
    borderRadius: 20,
    border: '1.5px solid #e2e8f0',
    padding: '48px 40px 40px',
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
  },
  scoreHeader: {
    marginBottom: 32,
  },
  scoreLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 6,
  },
  moduleTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  scoreCircle: {
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: '3.5rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1,
    marginBottom: 6,
  },
  scoreDetail: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: 500,
  },
  gradeBadge: {
    display: 'inline-block',
    padding: '5px 18px',
    borderRadius: 20,
    fontSize: '0.82rem',
    fontWeight: 700,
    marginBottom: 20,
  },
  scoreMsg: {
    fontSize: '0.9rem',
    color: '#475569',
    lineHeight: 1.6,
    marginBottom: 28,
  },
  scoreActions: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
  },
  backLink: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: 500,
  },
}
