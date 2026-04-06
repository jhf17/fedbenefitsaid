import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { REF_DATA } from '../data/refData'
import ConsultantCTA from '../components/ConsultantCTA'
import { useAuth } from '../App'

export default function Reference() {
  const { user } = useAuth()
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [search, setSearch] = useState('')
  useEffect(() => { document.title = 'Federal Benefits Reference Guide | FedBenefitsAid' }, [])

  const allTopics = useMemo(() =>
    REF_DATA.flatMap(cat => cat.topics.map(t => ({ ...t, cat: cat.cat, color: cat.color, icon: cat.icon }))),
    []
  )

  const searchResults = useMemo(() => {
    if (!search || search.trim().length < 2) return null
    const q = search.toLowerCase()
    return allTopics.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.overview.toLowerCase().includes(q) ||
      t.rules.some(r => r.toLowerCase().includes(q))
    )
  }, [search, allTopics])

  const currentCat = selectedCat ? REF_DATA.find(c => c.cat === selectedCat) : null
  const showTopics = selectedCat && !selectedTopic
  const showDetail = selectedCat && selectedTopic

  const openTopic = (topic, catName) => {
    setSelectedCat(catName)
    setSelectedTopic(topic)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => {
    if (selectedTopic) {
      setSelectedTopic(null)
    } else {
      setSelectedCat(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Page Header */}
      <div style={styles.header}>
        <div className="container">
          {/* Breadcrumb */}
          {selectedCat && (
            <div style={styles.breadcrumb}>
              <button onClick={() => { setSelectedCat(null); setSelectedTopic(null); }} style={styles.breadcrumbBtn}>
                Reference
              </button>
              {selectedCat && <span style={styles.breadcrumbSep}>&rsaquo;</span>}
              {selectedCat && (
                <button
                  onClick={() => setSelectedTopic(null)}
                  style={{ ...styles.breadcrumbBtn, ...(selectedTopic ? {} : styles.breadcrumbActive) }}
                >
                  {selectedCat}
                </button>
              )}
              {selectedTopic && <span style={styles.breadcrumbSep}>&rsaquo;</span>}
              {selectedTopic && (
                <span style={styles.breadcrumbActive}>{selectedTopic.title}</span>
              )}
            </div>
          )}

          <h1 style={styles.h1}>
            {showDetail ? selectedTopic.title :
             showTopics ? selectedCat :
             'Federal Benefits Reference Guide'}
          </h1>
          <p style={styles.sub}>
            {showDetail ? selectedTopic.summary :
             showTopics ? `${currentCat.topics.length} topics covered` :
             'Free, comprehensive reference for all U.S. federal employee benefits - updated for 2026.'}
          </p>

          {/* Search (only on category grid view) */}
          {!selectedCat && (
            <div style={styles.searchWrap}>
              <input
                type="text"
                placeholder="Search any benefit topic (e.g. TSP match, FEHB 5-year rule, MRA+10)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={styles.searchInput}
              />
              {search && (
                <button onClick={() => setSearch('')} style={styles.searchClear}>X</button>
              )}
            </div>
          )}

          {selectedTopic && (
            <button onClick={back} className="btn btn-outline btn-sm" style={{ marginTop: 12, color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}>
              &larr; Back to {selectedCat}
            </button>
          )}
          {showTopics && (
            <button onClick={back} className="btn btn-outline btn-sm" style={{ marginTop: 12, color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}>
              &larr; All Categories
            </button>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Search Results */}
        {searchResults && (
          <div>
            <div style={styles.sectionLabel}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
            </div>
            {searchResults.length === 0 ? (
              <div style={styles.empty}>No results found. Try a different search term.</div>
            ) : (
              <div style={styles.searchGrid}>
                {searchResults.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => openTopic(topic, topic.cat)}
                    style={{ ...styles.searchCard, borderLeftColor: topic.color }}
                  >
                    <div style={styles.searchCardCat}>{topic.cat}</div>
                    <div style={styles.searchCardTitle}>{topic.title}</div>
                    <div style={styles.searchCardSub}>{topic.summary}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Grid */}
        {!searchResults && !selectedCat && (
          <div style={styles.catGrid}>
            {REF_DATA.map(cat => (
              <button
                key={cat.cat}
                onClick={() => setSelectedCat(cat.cat)}
                style={{ ...styles.catCard, borderTopColor: cat.color }}
              >
                <div style={{ ...styles.catAccent, background: cat.color }} />
                <div style={styles.catName}>{cat.cat}</div>
                <div style={styles.catCount}>{cat.topics.length} topics</div>
                <div style={styles.catArrow}>&rarr;</div>
              </button>
            ))}
          </div>
        )}

        {/* Topic List */}
        {showTopics && !searchResults && (
          <div style={styles.topicList}>
            {currentCat.topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                style={styles.topicCard}
              >
                <div style={styles.topicCardLeft}>
                  <div style={styles.topicTitle}>{topic.title}</div>
                  <div style={styles.topicSummary}>{topic.summary}</div>
                  <div style={styles.topicMeta}>
                    {topic.numbers.length} key figures &middot; {topic.rules.length} rules &middot; {topic.watch.length} pitfalls
                  </div>
                </div>
                <div style={{ ...styles.topicArrow, color: currentCat.color }}>&rarr;</div>
              </button>
            ))}
          </div>
        )}

        {/* Topic Detail */}
        {showDetail && (
          <div style={styles.detail}>
            {/* Overview */}
            <div style={styles.detailCard}>
              <h3 style={styles.detailSection}>Overview</h3>
              <p style={styles.detailOverview}>{selectedTopic.overview}</p>
            </div>

            {/* Key Numbers */}
            {selectedTopic.numbers?.length > 0 && (
              <div style={styles.detailCard}>
                <h3 style={styles.detailSection}>Key Numbers</h3>
                <div style={styles.numbersGrid}>
                  {selectedTopic.numbers.map((n, i) => (
                    <div key={i} style={{ ...styles.numberCard, borderTopColor: currentCat?.color }}>
                      <div style={styles.numberValue}>{n.value}</div>
                      <div style={styles.numberLabel}>{n.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {selectedTopic.rules?.length > 0 && (
              <div style={styles.detailCard}>
                <h3 style={styles.detailSection}>Rules & Requirements</h3>
                <ul style={styles.rulesList}>
                  {selectedTopic.rules.map((rule, i) => (
                    <li key={i} style={styles.rule}>
                      <span style={{ ...styles.ruleDot, background: currentCat?.color }} />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Watch Out */}
            {selectedTopic.watch?.length > 0 && (
              <div style={{ ...styles.detailCard, ...styles.watchCard }}>
                <h3 style={styles.detailSection}>Watch Out For</h3>
                <ul style={styles.watchList}>
                  {selectedTopic.watch.map((w, i) => (
                    <li key={i} style={styles.watchItem}>
                      <span style={styles.watchIcon}>!</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTAs */}
            <div style={styles.detailActions}>
              <div style={styles.detailActionCard}>
                <div style={styles.detailActionIcon}>AI</div>
                <div>
                  <div style={styles.detailActionTitle}>Have a specific question about {selectedTopic.title}?</div>

                  <div style={styles.detailActionSub}>Ask the AI &mdash; it will tailor the answer to your specific years of service, salary, and retirement goals.</div>
                </div>
                <Link to={user ? '/chat' : '/signup'} className="btn btn-primary" style={{ flexShrink: 0 }}>
                  Ask AI
                </Link>
              </div>
            </div>

            <ConsultantCTA compact />
          </div>
        )}

        {/* Bottom CTA (on category/topic list views) */}
        {!showDetail && !searchResults && (
          <div style={{ marginTop: 56 }}>
            <ConsultantCTA />
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  header: {
    background: 'linear-gradient(160deg, #1e3a5f 0%, #2d4f7c 100%)',
    color: 'white',
    padding: '40px 0 32px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    fontSize: '0.85rem',
  },
  breadcrumbBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: '2px 4px',
    borderRadius: 4,
    fontFamily: 'inherit',
  },
  breadcrumbActive: {
    color: 'white',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  breadcrumbSep: {
    color: 'rgba(255,255,255,0.4)',
  },
  h1: {
    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginBottom: 8,
  },
  sub: {
    opacity: 0.8,
    fontSize: '1rem',
    marginBottom: 0,
  },
  searchWrap: {
    position: 'relative',
    maxWidth: 600,
    marginTop: 20,
  },
  searchInput: {
    width: '100%',
    background: 'white',
    border: 'none',
    fontSize: '0.95rem',
    paddingRight: 40,
  },
  searchClear: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: 4,
  },
  sectionLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 500,
    marginBottom: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '48px 0',
    fontSize: '1rem',
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 12,
  },
  searchCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderLeft: '4px solid',
    borderRadius: 10,
    padding: '16px 18px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  searchCardCat: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  searchCardTitle: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: '0.95rem',
    marginBottom: 4,
  },
  searchCardSub: {
    fontSize: '0.83rem',
    color: '#64748b',
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
  },
  catCard: {
    background: 'white',
    border: '1.5px solid #e2e8f0',
    borderTop: '4px solid',
    borderRadius: 12,
    padding: '24px 20px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  catAccent: { width: 28, height: 4, borderRadius: 2, marginBottom: 14 },
  catName: { fontWeight: 700, fontSize: '1rem', color: '#0f172a' },
  catCount: { fontSize: '0.8rem', color: '#64748b' },
  catArrow: { color: '#94a3b8', fontSize: '1.1rem', marginTop: 8 },
  topicList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 800,
  },
  topicCard: {
    background: 'white',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12,
    padding: '20px 24px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    transition: 'all 0.15s ease',
  },
  topicCardLeft: { flex: 1 },
  topicTitle: { fontWeight: 700, fontSize: '1.02rem', color: '#0f172a', marginBottom: 4 },
  topicSummary: { fontSize: '0.88rem', color: '#64748b', marginBottom: 6 },
  topicMeta: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 },
  topicArrow: { fontSize: '1.2rem', flexShrink: 0 },
  detail: {
    maxWidth: 780,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  detailCard: {
    background: 'white',
    border: '1.5px solid #e2e8f0',
    borderRadius: 14,
    padding: '28px 32px',
  },
  watchCard: {
    background: '#fffbeb',
    borderColor: '#fde68a',
  },
  detailSection: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 16,
  },
  detailOverview: {
    color: '#334155',
    lineHeight: 1.7,
    fontSize: '0.97rem',
  },
  numbersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
  },
  numberCard: {
    background: '#f8fafc',
    borderTop: '3px solid',
    borderRadius: 8,
    padding: '14px 16px',
  },
  numberValue: {
    fontWeight: 800,
    fontSize: '1.05rem',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: '-0.01em',
  },
  numberLabel: {
    fontSize: '0.78rem',
    color: '#64748b',
    fontWeight: 500,
  },
  rulesList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  rule: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: '0.9rem',
    color: '#334155',
    lineHeight: 1.6,
  },
  ruleDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 6,
  },
  watchList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  watchItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: '0.9rem',
    color: '#92400e',
    lineHeight: 1.6,
  },
  watchIcon: {
    background: '#f59e0b',
    color: 'white',
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '0.75rem',
    flexShrink: 0,
    marginTop: 1,
  },
  detailActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  detailActionCard: {
    background: '#eff6ff',
    border: '1.5px solid #c7d7fc',
    borderRadius: 12,
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  detailActionIcon: { fontSize: '2rem', flexShrink: 0 },
  detailActionTitle: { fontWeight: 600, fontSize: '0.95rem', color: '#1e3a5f', marginBottom: 4 },
  detailActionSub: { fontSize: '0.83rem', color: '#475569' },
}
