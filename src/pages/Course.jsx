import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { QUIZ_MODULES, QUIZ_QUESTIONS } from '../data/quizData'

const DIFFICULTY_COLOR = {
  Beginner:     { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  Intermediate: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  Advanced:     { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
}

export default function Course() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8fafc' }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <div style={styles.headerBadge}>Training</div>
          <h1 style={styles.h1}>Federal Benefits Training</h1>
          <p style={styles.sub}>
            Test and reinforce your knowledge across all major federal benefit areas.
            Each module ends with an option to ask the AI for deeper explanations.
          </p>
          <div style={styles.headerMeta}>
            <span style={styles.metaItem}>{QUIZ_MODULES.length} modules</span>
            <span style={styles.metaDot} />
            <span style={styles.metaItem}>
              {Object.values(QUIZ_QUESTIONS).reduce((sum, qs) => sum + qs.length, 0)} questions
            </span>
            <span style={styles.metaDot} />
            <span style={styles.metaItem}>Requires login</span>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="container" style={{ padding: '48px 24px 80px' }}>
        <div style={styles.grid}>
          {QUIZ_MODULES.map(module => {
            const questions = QUIZ_QUESTIONS[module.id] || []
            const diff = DIFFICULTY_COLOR[module.difficulty]
            return (
              <div key={module.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.cardTitle}>{module.title}</div>
                  <span style={{ ...styles.diffBadge, background: diff.bg, color: diff.text, border: `1px solid ${diff.border}` }}>
                    {module.difficulty}
                  </span>
                </div>
                <p style={styles.cardDesc}>{module.description}</p>
                <div style={styles.cardMeta}>
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                </div>
                <Link
                  to={`/training/quiz/${module.id}`}
                  className="btn btn-navy btn-full"
                  style={{ marginTop: 'auto' }}
                >
                  Start Quiz
                </Link>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div style={styles.footerNote}>
          More questions are being added across all modules. Have a question about a topic?{' '}
          <Link to="/chat" style={{ color: '#2563eb', fontWeight: 600 }}>Ask the AI</Link>
          {' '}or{' '}
          <a href="https://calendly.com/jhf17/30min" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
            book a free consultation
          </a>.
        </div>
      </div>
    </div>
  )
}

const styles = {
  header: {
    background: 'linear-gradient(160deg, #1e3a5f 0%, #2d4f7c 100%)',
    color: 'white',
    padding: '52px 0 44px',
  },
  headerBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: 20,
    marginBottom: 16,
  },
  h1: {
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginBottom: 12,
  },
  sub: {
    fontSize: '1rem',
    opacity: 0.85,
    lineHeight: 1.65,
    maxWidth: 600,
    marginBottom: 20,
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: '0.82rem',
    opacity: 0.75,
    fontWeight: 500,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.4)',
    display: 'inline-block',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  },
  card: {
    background: 'white',
    borderRadius: 14,
    padding: '24px 24px 20px',
    border: '1.5px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#0f172a',
    lineHeight: 1.3,
    flex: 1,
  },
  diffBadge: {
    fontSize: '0.72rem',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: 1.55,
    flex: 1,
  },
  cardMeta: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontWeight: 600,
  },
  footerNote: {
    marginTop: 48,
    textAlign: 'center',
    fontSize: '0.88rem',
    color: '#64748b',
    lineHeight: 1.6,
  },
}
