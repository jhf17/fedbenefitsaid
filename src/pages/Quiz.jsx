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
   