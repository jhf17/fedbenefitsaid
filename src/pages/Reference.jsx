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
    <main style={{ minHeight: '100vh', background: '#faf9f6', fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        .ref-cat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; border-left-width: 5px !important; }
        .ref-topic-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07) !important; }
        .ref-search-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07) !important; }
      `}</style>
      {/* Page Header */}
      <header style={styles.header}>
        <div className="container">
          {/* Breadcrumb */}
          {selectedCat && (
            <nav aria-label="Breadcrumb" style={styles.breadcrumb}>
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
                <span style={styles.breadcrumbActive} aria-current="page">{selectedTopic.title}</span>
              )}
            </nav>
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
                aria-label="Search federal benefit topics"
              />
              {search && (
                <button onClick={() => setSearch('')} style={styles.searchClear} aria-label="Clear search">X</button>
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
      </header>

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
                    className="ref-search-card"
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
            {REF_DATA.map(cat => {
              const catIcons = {
                'FERS Pension': <><rect x="3" y="1" width="18" height="22" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M7 7h10M7 11h10M7 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
                'TSP': <><path d="M3 21V8l9-6 9 6v13" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/><path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.5" fill="none"/></>,
                'FEHB': <><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.8" fill="none"/></>,
                'FEGLI': <><path d="M12 2L2 7v6c0 5.55 3.84 10.74 10 12 6.16-1.26 10-6.45 10-12V7L12 2z" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
                'Medicare': <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
                'Social Security': <><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M5.5 21v-2a6.5 6.5 0 0113 0v2" stroke="currentColor" strokeWidth="1.8" fill="none"/></>,
                'CSRS': <><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M2 9h20M9 9v12" stroke="currentColor" strokeWidth="1.5"/></>,
                'Survivor Benefits': <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" fill="none"/></>,
                'Taxation': <><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.8" fill="none" rx="2"/><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
                'Leave & Separation': <><path d="M9 2v4M15 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" fill="none"/></>,
                'Forms & Administration': <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" fill="none"/><rect x="9" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/></>,
              };
              const descriptions = {
                'FERS Pension': 'Eligibility, annuity calculations, service credit rules',
                'TSP': 'Contribution limits, fund options, Roth vs Traditional',
                'FEHB': 'Plan comparison, 5-year rule, premium costs',
                'FEGLI': 'Coverage options, costs at retirement, elections',
                'Medicare': 'Enrollment timing, Part B coordination, costs',
                'Social Security': 'Benefit estimates, WEP/GPO repeal, claiming strategies',
                'CSRS': 'Legacy system rules, offset, survivor benefits',
                'Survivor Benefits': 'Spouse coverage, cost vs benefit, elections',
                'Taxation': 'Annuity taxation, state taxes, TSP withdrawals',
                'Leave & Separation': 'Annual leave payout, separation types, timelines',
                'Forms & Administration': 'Key forms, SF-50, SF-2801, retirement applications',
              };
              return (
                <button
                  className="ref-cat-card"
                  key={cat.cat}
                  onClick={() => setSelectedCat(cat.cat)}
                  style={{ ...styles.catCard, borderLeftColor: cat.color }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${cat.color}12` }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" style={{ color: cat.color }} aria-hidden="true">
                        {catIcons[cat.cat] || <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" fill="none"/>}
                      </svg>
                    </div>
                    <div>
                      <div style={styles.catName}>{cat.cat}</div>
                      <div style={styles.catCount}>{cat.topics.length} topics</div>
                    </div>
                  </div>
                  <div style={styles.catDesc}>{descriptions[cat.cat] || ''}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: cat.color }}>Explore</span>
                    <span style={{ color: cat.color, fontSize: '1rem' }}>&rarr;</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Topic List */}
        {showTopics && !searchResults && (
          <div style={styles.topicList}>
            {currentCat.topics.map(topic => (
              <button
                className="ref-topic-card"
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
              <h2 style={styles.detailSection}>Overview</h2>
              <p style={styles.detailOverview}>{selectedTopic.overview}</p>
            </div>

            {/* Key Numbers */}
            {selectedTopic.numbers?.length > 0 && (
              <div style={styles.detailCard}>
                <h2 style={styles.detailSection}>Key Numbers</h2>
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
                <h2 style={styles.detailSection}>Rules & Requirements</h2>
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
                <h2 style={styles.detailSection}>Watch Out For</h2>
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
    </main>
  )
}

const fontSerif = "'Merriweather', Georgia, 'Times New Roman', serif"
const fontSans = "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"

const styles = {
  header: {
    background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)',
    color: 'white',
    padding: '56px 0 44px',
    fontFamily: fontSans,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    fontSize: '0.85rem',
    fontFamily: fontSans,
  },
  breadcrumbBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: '2px 4px',
    borderRadius: 4,
    fontFamily: fontSans,
    transition: 'color 0.15s',
  },
  breadcrumbActive: {
    color: 'white',
    fontWeight: 600,
    fontSize: '0.85rem',
    fontFamily: fontSans,
  },
  breadcrumbSep: {
    color: 'rgba(255,255,255,0.3)',
  },
  h1: {
    fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
    marginBottom: 12,
    fontFamily: fontSerif,
  },
  sub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '1.05rem',
    lineHeight: 1.6,
    marginBottom: 0,
    maxWidth: 560,
    fontFamily: fontSans,
  },
  searchWrap: {
    position: 'relative',
    maxWidth: 600,
    marginTop: 24,
  },
  searchInput: {
    width: '100%',
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(255,255,255,0.2)',
    fontSize: '0.95rem',
    padding: '14px 44px 14px 18px',
    borderRadius: 10,
    fontFamily: fontSans,
    color: '#0f172a',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  searchClear: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: 4,
    fontFamily: fontSans,
  },
  sectionLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 600,
    marginBottom: 20,
    fontFamily: fontSans,
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '64px 0',
    fontSize: '1rem',
    fontFamily: fontSans,
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 14,
  },
  searchCard: {
    background: 'white',
    border: '1px solid rgba(0,0,0,0.06)',
    borderLeft: '4px solid',
    borderRadius: 14,
    padding: '18px 20px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    fontFamily: fontSans,
  },
  searchCardCat: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 700,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: fontSans,
  },
  searchCardTitle: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: '0.95rem',
    marginBottom: 4,
    fontFamily: fontSerif,
  },
  searchCardSub: {
    fontSize: '0.83rem',
    color: '#64748b',
    lineHeight: 1.5,
    fontFamily: fontSans,
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  catCard: {
    background: 'white',
    border: '1px solid rgba(0,0,0,0.06)',
    borderLeft: '4px solid',
    borderRadius: 14,
    padding: '24px 24px 18px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    fontFamily: fontSans,
    minHeight: 170,
  },
  catName: { fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.2, fontFamily: fontSerif },
  catCount: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginTop: 2, fontFamily: fontSans },
  catDesc: { fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, fontFamily: fontSans },
  topicList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    maxWidth: 800,
  },
  topicCard: {
    background: 'white',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 14,
    padding: '22px 28px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    fontFamily: fontSans,
  },
  topicCardLeft: { flex: 1 },
  topicTitle: { fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginBottom: 6, fontFamily: fontSerif },
  topicSummary: { fontSize: '0.9rem', color: '#64748b', marginBottom: 8, lineHeight: 1.5, fontFamily: fontSans },
  topicMeta: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.02em', fontFamily: fontSans },
  topicArrow: { fontSize: '1.2rem', flexShrink: 0, transition: 'transform 0.2s' },
  detail: {
    maxWidth: 780,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  detailCard: {
    background: 'white',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: '32px 36px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    fontFamily: fontSans,
  },
  watchCard: {
    background: '#fffbeb',
    border: '1px solid rgba(245,158,11,0.15)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  detailSection: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 18,
    fontFamily: fontSerif,
  },
  detailOverview: {
    color: '#334155',
    lineHeight: 1.75,
    fontSize: '0.97rem',
    fontFamily: fontSans,
  },
  numbersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 14,
  },
  numberCard: {
    background: '#faf9f6',
    borderTop: '3px solid',
    borderRadius: 10,
    padding: '16px 18px',
    fontFamily: fontSans,
  },
  numberValue: {
    fontWeight: 800,
    fontSize: '1.15rem',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: '-0.01em',
    fontFamily: fontSerif,
  },
  numberLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 500,
    lineHeight: 1.4,
    fontFamily: fontSans,
  },
  rulesList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  rule: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    fontSize: '0.92rem',
    color: '#334155',
    lineHeight: 1.65,
    fontFamily: fontSans,
  },
  ruleDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 7,
  },
  watchList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  watchItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    fontSize: '0.92rem',
    color: '#92400e',
    lineHeight: 1.65,
    fontFamily: fontSans,
  },
  watchIcon: {
    background: '#f59e0b',
    color: 'white',
    width: 22,
    height: 22,
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
    gap: 14,
  },
  detailActionCard: {
    background: 'linear-gradient(135deg, #f0f4ff 0%, #eff6ff 100%)',
    border: '1px solid rgba(30,58,95,0.08)',
    borderRadius: 14,
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    fontFamily: fontSans,
  },
  detailActionIcon: { fontSize: '2rem', flexShrink: 0 },
  detailActionTitle: { fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', marginBottom: 4, fontFamily: fontSerif },
  detailActionSub: { fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, fontFamily: fontSans },
}
