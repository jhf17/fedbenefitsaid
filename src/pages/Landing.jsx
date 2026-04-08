import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

// Simple CountUp animation hook
function useCountUp(endValue, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return

    let startTime = null
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(endValue * progress))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }

    const frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [endValue, duration, shouldStart])

  return count
}

// Scroll reveal hook with IntersectionObserver
function useScrollReveal() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [])

  return [ref, isVisible]
}

export default function Landing() {
  useEffect(() => { document.title = 'FedBenefitsAid — Federal Retirement Benefits, Simplified' }, [])

  return (
    <main id="main-content">
      <Hero />
      <TrustBar />
      <StatsSection />
      <Tools />
      <HowItWorks />
      <ConsultationCTA />
      <Footer />
    </main>
  )
}

function Hero() {
  const [ref, isVisible] = useScrollReveal()

  return (
    <section data-hero-section="" ref={ref} style={{
      ...heroStyles.section,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.8s ease-out',
    }} aria-labelledby="hero-heading">
      <div className="container">
        <div style={heroStyles.inner}>
          <div style={heroStyles.badge}>
            For U.S. Federal Employees
          </div>

          <h1 id="hero-heading" style={heroStyles.h1}>
            Your Federal Retirement Benefits,{' '}
            <span style={heroStyles.highlight}><em>Finally Clear</em></span>
          </h1>

          <p style={heroStyles.sub}>
            FERS. TSP. FEHB. FEGLI. Medicare. Social Security. It's complicated —
            and one wrong decision can cost you thousands. FedBenefitsAid makes it
            simple, accurate, and free to explore.
          </p>

          <div data-hero-actions="" style={heroStyles.actions}>
            <Link to="/assessment" className="btn btn-xl" style={{ background: '#7b1c2e', color: 'white', fontWeight: 700, padding: '14px 36px', borderRadius: 10, textDecoration: 'none', fontSize: '1rem' }}>
              Take the Assessment
            </Link>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xl" style={{ color: '#1e3a5f', borderColor: '#1e3a5f', border: '2px solid', padding: '12px 34px', borderRadius: 10, textDecoration: 'none', fontSize: '1rem', fontWeight: 700, background: 'transparent' }}>
              Book Free Consultation
            </a>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/signup" style={{ color: '#64748b', fontSize: 14, textDecoration: 'none', borderBottom: '1px solid #cbd5e1', paddingBottom: 2, fontWeight: 500 }}>
              Create a free account to unlock AI Chat <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div style={heroStyles.meta}>
            <span style={heroStyles.metaItem}>Free tools — no credit card ever</span>
            <span style={heroStyles.metaDot} aria-hidden="true" />
            <span style={heroStyles.metaItem}>Updated for 2026 figures</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustBar() {
  const items = [
    { label: '11 benefit areas covered', color: '#7b1c2e' },
    { label: '2026 official figures', color: '#1e3a5f' },
    { label: 'Instant AI answers', color: '#b8942b' },
    { label: 'Expert consultations available', color: '#7b1c2e' },
    { label: 'No data sold, ever', color: '#1e3a5f' },
  ]

  return (
    <section style={trustStyles.section}>
      <div className="container">
        <div data-trust-inner="" style={trustStyles.inner}>
          {items.map((item, i) => (
            <div key={i} style={trustStyles.item}>
              <span style={{ ...trustStyles.dot, background: item.color }} aria-hidden="true" />
              <span style={trustStyles.text}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const [ref, isVisible] = useScrollReveal()
  const stats = [
    { label: '11 Benefit Areas', value: 11, icon: 'star' },
    { label: '2026 Official Figures', value: 2026, icon: 'calendar' },
    { label: 'Free Forever', value: 100, icon: 'check', suffix: '%' },
    { label: 'Expert Consultants', value: 5, icon: 'users', suffix: '+' },
  ]

  return (
    <section data-stats-section="" ref={ref} style={{
      ...statsStyles.section,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.8s ease-out',
    }} aria-labelledby="stats-heading">
      <div className="container">
        <h2 id="stats-heading" style={statsStyles.heading}>Why FedBenefitsAid Works</h2>
        <div data-stats-grid="" style={statsStyles.grid}>
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} shouldAnimate={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ stat, shouldAnimate }) {
  const count = useCountUp(stat.value, 2000, shouldAnimate)

  return (
    <div style={statsStyles.card}>
      <div style={{ ...statsStyles.iconCircle, background: getStatColor(stat.icon) }}>
        <StatIcon icon={stat.icon} />
      </div>
      <div style={statsStyles.number}>
        {count}{stat.suffix || ''}
      </div>
      <div style={statsStyles.label}>{stat.label}</div>
    </div>
  )
}

function StatIcon({ icon }) {
  if (icon === 'star') return <span style={{ fontSize: 24, color: 'white' }}>★</span>
  if (icon === 'calendar') return <span style={{ fontSize: 24, color: 'white' }}>📅</span>
  if (icon === 'check') return <span style={{ fontSize: 24, color: 'white' }}>✓</span>
  if (icon === 'users') return <span style={{ fontSize: 24, color: 'white' }}>👥</span>
  return null
}

function getStatColor(icon) {
  if (icon === 'star') return '#7b1c2e'
  if (icon === 'calendar') return '#1e3a5f'
  if (icon === 'check') return '#b8942b'
  if (icon === 'users') return '#0f172a'
  return '#64748b'
}

function Tools() {
  const [ref, isVisible] = useScrollReveal()

  const tools = [
    {
      id: 'calculator',
      title: 'Retirement Calculator',
      description: 'Calculate your complete retirement picture — FERS pension, FERS Supplement, TSP projections, FEHB costs, and Social Security estimates.',
      features: ['FERS & CSRS pension estimate', 'FERS Supplement eligibility', 'TSP & FEHB included', 'No account required'],
      accent: '#7b1c2e',
      iconName: 'calculator',
      cta: { text: 'Calculate Now', to: '/calculator' },
      highlight: true,
    },
    {
      id: 'assessment',
      title: 'Retirement Readiness Assessment',
      description: 'Take a quick quiz about your federal career and get a personalized retirement readiness checklist. See where you stand and what steps to take next.',
      features: ['Personalized score', 'Action checklist', '2-minute quiz', 'No account required'],
      accent: '#1e3a5f',
      iconName: 'assessment',
      cta: { text: 'Start Assessment', to: '/assessment' },
      highlight: true,
    },
    {
      id: 'ai-chat',
      title: 'AI Benefits Chat',
      description: 'Ask questions in plain English about your federal benefits. The AI learns your situation and tailors every answer to your specific circumstances.',
      features: ['Personalized answers', 'Cites OPM regulations', 'Builds your profile', 'Unlimited questions'],
      accent: '#b8942b',
      iconName: 'chat',
      cta: { text: 'Start Chatting', to: '/signup' },
    },
    {
      id: 'reference',
      title: 'Reference Guide',
      description: 'Browse our comprehensive library covering 11 benefit categories. Get the rules, numbers, and common pitfalls for every topic.',
      features: ['11 benefit categories', 'Key numbers at a glance', 'Common pitfalls', 'Searchable & downloadable'],
      accent: '#0f172a',
      iconName: 'book',
      cta: { text: 'Explore Guide', to: '/reference' },
    },
    {
      id: 'resources',
      title: 'Resources & Forms',
      description: 'One-stop shop for official OPM forms, government portals, benefit rate tables, and retirement guides. Everything you need in one place.',
      features: ['Official OPM forms', 'Government links', 'Rate tables & guides', '2026 updates'],
      accent: '#7b1c2e',
      iconName: 'folder',
      cta: { text: 'Browse Resources', to: '/resources' },
    },
  ]

  return (
    <section data-tools-section="" ref={ref} style={{
      ...toolsStyles.section,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.8s ease-out',
    }} aria-labelledby="tools-heading">
      <div className="container">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2 id="tools-heading" style={toolsStyles.h2}>Everything you need to <em style={{ fontStyle: 'italic' }}>understand</em> your benefits</h2>
          <p style={toolsStyles.sub}>
            Five powerful tools — all free, all designed to help you make confident decisions.
          </p>
        </div>

        <div data-tools-grid="" style={toolsStyles.grid}>
          {tools.map((tool, i) => (
            <ToolCard key={i} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ToolCard({ tool }) {
  const isHighlighted = tool.highlight

  return (
    <div style={{
      ...toolCardStyles.card,
      ...(isHighlighted && toolCardStyles.cardHighlight),
      borderTopColor: tool.accent,
    }}>
      {isHighlighted && (
        <div style={toolCardStyles.badge} aria-label="Featured tool">
          ★ Primary Tool
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <ToolIcon iconName={tool.iconName} accent={tool.accent} />
      </div>

      <h3 style={toolCardStyles.title}>{tool.title}</h3>
      <p style={toolCardStyles.desc}>{tool.description}</p>

      <ul style={toolCardStyles.features}>
        {tool.features.map((f, i) => (
          <li key={i} style={toolCardStyles.feature}>
            <span style={{ ...toolCardStyles.check, color: tool.accent }} aria-hidden="true">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div style={toolCardStyles.ctaWrapper}>
        {tool.cta.to ? (
          <Link to={tool.cta.to} style={{
            background: tool.accent,
            color: 'white',
            fontWeight: 700,
            padding: '12px 20px',
            borderRadius: 10,
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'block',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}>
            {tool.cta.text}
          </Link>
        ) : (
          <a href={tool.cta.href} target="_blank" rel="noopener noreferrer" style={{
            background: tool.accent,
            color: 'white',
            fontWeight: 700,
            padding: '12px 20px',
            borderRadius: 10,
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'block',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}>
            {tool.cta.text}
          </a>
        )}
      </div>
    </div>
  )
}

function ToolIcon({ iconName, accent }) {
  const bgColor = accent + '20'
  const iconStyle = {
    width: 52,
    height: 52,
    background: bgColor,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  }

  if (iconName === 'calculator') {
    return (
      <div style={iconStyle}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="24" height="24" rx="3" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.5"/>
          <line x1="8" y1="12" x2="24" y2="12" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="10" cy="18" r="1.5" fill={accent}/>
          <circle cx="16" cy="18" r="1.5" fill={accent}/>
          <circle cx="22" cy="18" r="1.5" fill={accent}/>
          <circle cx="10" cy="24" r="1.5" fill={accent}/>
          <circle cx="16" cy="24" r="1.5" fill={accent}/>
          <text x="20" y="26" fontSize="8" fill={accent} fontWeight="bold">=</text>
        </svg>
      </div>
    )
  }

  if (iconName === 'assessment') {
    return (
      <div style={iconStyle}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="3" width="14" height="20" rx="2" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.5"/>
          <path d="M9 10h10" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 15h10" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 20h7" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M21 8L23 10L26 7" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    )
  }

  if (iconName === 'chat') {
    return (
      <div style={iconStyle}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8C3 5.23858 5.23858 3 8 3H24C26.7614 3 29 5.23858 29 8V18C29 20.7614 26.7614 23 24 23H8.5L4 27V8Z" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.5"/>
          <circle cx="8" cy="13" r="1.5" fill={accent}/>
          <circle cx="16" cy="13" r="1.5" fill={accent}/>
          <circle cx="24" cy="13" r="1.5" fill={accent}/>
        </svg>
      </div>
    )
  }

  if (iconName === 'book') {
    return (
      <div style={iconStyle}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5C5 3.89543 5.89543 3 7 3H25C26.1046 3 27 3.89543 27 5V25C27 26.1046 26.1046 27 25 27H7C5.89543 27 5 26.1046 5 25V5Z" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.5"/>
          <path d="M16 6V24" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 11H13" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M9 16H13" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M19 11H23" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M19 16H23" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }

  if (iconName === 'folder') {
    return (
      <div style={iconStyle}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6C3 4.89543 3.89543 4 5 4H12L14 7H27C28.1046 7 29 7.89543 29 9V26C29 27.1046 28.1046 28 27 28H5C3.89543 28 3 27.1046 3 26V6Z" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.5"/>
          <circle cx="16" cy="16" r="2.5" fill={accent}/>
        </svg>
      </div>
    )
  }

  return null
}

function HowItWorks() {
  const [ref, isVisible] = useScrollReveal()

  const steps = [
    {
      num: '1',
      title: 'Assess Your Readiness',
      desc: 'Take the Retirement Readiness Assessment to understand where you stand and what you need to focus on.',
    },
    {
      num: '2',
      title: 'Calculate Your Numbers',
      desc: 'Use the Retirement Calculator to see your FERS pension, TSP, and complete financial picture.',
    },
    {
      num: '3',
      title: 'Get Answers & Expert Help',
      desc: 'Use the Reference Guide and AI Chat for detailed information. Book a free consultation if you need personalized guidance.',
    },
  ]

  return (
    <section data-how-section="" ref={ref} style={{
      ...howStyles.section,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.8s ease-out',
    }} aria-labelledby="how-heading">
      <div className="container">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2 id="how-heading" style={howStyles.h2}>How it <em style={{ fontStyle: 'italic' }}>works</em></h2>
          <p style={howStyles.sub}>From confused to confident in three simple steps.</p>
        </div>
        <div data-how-steps="" style={howStyles.steps}>
          {steps.map((step, i) => (
            <div key={i} style={howStyles.step}>
              <div style={howStyles.stepNum}>{step.num}</div>
              <h3 style={howStyles.stepTitle}>{step.title}</h3>
              <p style={howStyles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ConsultationCTA() {
  const [ref, isVisible] = useScrollReveal()

  return (
    <section data-consultation-section="" ref={ref} style={{
      ...consultationStyles.section,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.8s ease-out',
    }} aria-labelledby="consult-heading">
      <div className="container">
        <div style={consultationStyles.inner}>
          <h2 id="consult-heading" style={consultationStyles.h2}>
            Ready for <em style={{ fontStyle: 'italic' }}>expert</em> guidance?
          </h2>
          <p style={consultationStyles.sub}>
            Sometimes you need to talk to a real person. Book a free 30-minute consultation with a federal retirement specialist at Federal Market Associates. No sales pitch. Just honest, expert advice.
          </p>
          <div data-consultation-actions="" style={consultationStyles.actions}>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ background: 'white', color: '#1e3a5f', fontWeight: 700, padding: '14px 36px', borderRadius: 10, textDecoration: 'none', fontSize: '1rem' }}>
              Book Free Consultation
            </a>
            <Link to="/reference" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.8)', border: '2px solid', padding: '12px 34px', borderRadius: 10, textDecoration: 'none', fontSize: '1rem', fontWeight: 700, background: 'transparent' }}>
              Browse Reference Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={footerStyles.footer}>
      <div className="container">
        <div data-footer-inner="" style={footerStyles.inner}>
          <div style={footerStyles.brand}>
            <div style={footerStyles.logoWrap}>
              <span style={footerStyles.logoMark}>FBA</span>
              <span style={footerStyles.logoText}>FedBenefitsAid</span>
            </div>
            <p style={footerStyles.tagline}>
              Federal retirement benefits, made simple.
            </p>
            <p style={footerStyles.disclaimer}>
              FedBenefitsAid provides educational information only and does not constitute financial, legal, or tax advice. Always verify benefit information with OPM or a qualified federal benefits advisor.
            </p>
          </div>
          <div data-footer-links="" style={footerStyles.links}>
            <div style={footerStyles.col}>
              <div style={footerStyles.colTitle}>Tools</div>
              <Link to="/assessment" style={footerStyles.link}>Retirement Assessment</Link>
              <Link to="/calculator" style={footerStyles.link}>Retirement Calculator</Link>
              <Link to="/reference" style={footerStyles.link}>Reference Guide</Link>
              <Link to="/resources" style={footerStyles.link}>Resources & Forms</Link>
              <Link to="/chat" style={footerStyles.link}>AI Chat</Link>
            </div>
            <div style={footerStyles.col}>
              <div style={footerStyles.colTitle}>Consult</div>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={footerStyles.link}>
                Book Free Call
              </a>
              <a href="https://federalmarketassociates.com" target="_blank" rel="noopener noreferrer" style={footerStyles.link}>
                Federal Market Associates
              </a>
            </div>
            <div style={footerStyles.col}>
              <div style={footerStyles.colTitle}>Account</div>
              <Link to="/login" style={footerStyles.link}>Log In</Link>
              <Link to="/signup" style={footerStyles.link}>Sign Up</Link>
              <Link to="/disclaimer" style={footerStyles.link}>Disclaimer</Link>
              <Link to="/privacy" style={footerStyles.link}>Privacy Policy</Link>
              <Link to="/terms" style={footerStyles.link}>Terms of Service</Link>
            </div>
          </div>
        </div>
        <div data-footer-bottom="" style={footerStyles.bottom}>
          <span>© {new Date().getFullYear()} FedBenefitsAid. All rights reserved.</span>
          <span>Information updated for 2026. Not affiliated with OPM or the U.S. government.</span>
        </div>
      </div>
    </footer>
  )
}

// ---- Styles ----

const heroStyles = {
  section: {
    background: 'linear-gradient(160deg, #faf9f6 0%, #f0f4f8 50%, #e8f0fe 100%)',
    padding: '112px 0 96px',
    position: 'relative',
    overflow: 'hidden',
  },
  inner: {
    maxWidth: 720,
    textAlign: 'center',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#0f172a',
    color: '#c9a84c',
    padding: '10px 22px',
    borderRadius: 24,
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  h1: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.12,
    letterSpacing: '-0.03em',
    marginBottom: 24,
  },
  highlight: {
    background: 'linear-gradient(120deg, #7b1c2e 0%, #a0782c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 800,
  },
  sub: {
    fontSize: '1.15rem',
    color: '#475569',
    lineHeight: 1.75,
    marginBottom: 44,
    maxWidth: 580,
    margin: '0 auto 44px',
  },
  actions: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 28,
  },
  meta: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    fontSize: '0.83rem',
    color: '#64748b',
    fontWeight: 500,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#cbd5e1',
    display: 'inline-block',
  },
}

const trustStyles = {
  section: {
    borderTop: '1px solid #e8e5df',
    borderBottom: '1px solid #e8e5df',
    background: '#faf9f6',
    padding: '20px 0',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    flexWrap: 'wrap',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-block',
  },
  text: {
    color: '#475569',
    fontWeight: 500,
    fontSize: '0.85rem',
  },
}

const statsStyles = {
  section: {
    background: '#faf9f6',
    padding: '80px 0',
  },
  heading: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
    fontWeight: 800,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 56,
    letterSpacing: '-0.02em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 28,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '36px 28px',
    border: '1px solid #e8e5df',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  number: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: 8,
  },
  label: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: 500,
  },
}

const toolsStyles = {
  section: {
    background: '#ffffff',
    padding: '88px 0',
  },
  h2: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: 14,
  },
  sub: {
    fontSize: '1.08rem',
    color: '#64748b',
    maxWidth: 640,
    margin: '0 auto',
    lineHeight: 1.7,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 28,
  },
}

const toolCardStyles = {
  card: {
    background: 'white',
    borderRadius: 20,
    padding: '36px 28px',
    border: '1px solid #e8e5df',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  cardHighlight: {
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    border: '1px solid #d4d0ca',
  },
  badge: {
    position: 'absolute',
    top: -14,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1e3a5f',
    color: 'white',
    padding: '5px 14px',
    borderRadius: 16,
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 10,
  },
  desc: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: 20,
    flex: 1,
  },
  features: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    marginBottom: 24,
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.9rem',
    color: '#475569',
    marginBottom: 10,
  },
  check: {
    fontWeight: 700,
    flexShrink: 0,
    fontSize: '1rem',
  },
  ctaWrapper: {
    marginTop: 'auto',
  },
}

const howStyles = {
  section: {
    background: '#faf9f6',
    padding: '88px 0',
  },
  h2: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: 14,
  },
  sub: {
    fontSize: '1.08rem',
    color: '#64748b',
    lineHeight: 1.7,
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 28,
    position: 'relative',
  },
  step: {
    textAlign: 'center',
    padding: '40px 32px',
    background: 'white',
    borderRadius: 20,
    border: '1px solid #e8e5df',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  stepNum: {
    width: 48,
    height: 48,
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5a8f 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.2rem',
    margin: '0 auto 16px',
  },
  stepTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 10,
  },
  stepDesc: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
}

const consultationStyles = {
  section: {
    background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #2a5a99 100%)',
    padding: '96px 0',
    borderRadius: 0,
  },
  inner: {
    textAlign: 'center',
    maxWidth: 700,
    margin: '0 auto',
    color: 'white',
  },
  h2: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginBottom: 20,
  },
  sub: {
    fontSize: '1.08rem',
    opacity: 0.9,
    lineHeight: 1.7,
    marginBottom: 40,
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
}

const footerStyles = {
  footer: {
    background: '#0f172a',
    color: '#94a3b8',
    padding: '56px 0 24px',
  },
  inner: {
    display: 'flex',
    gap: 64,
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  brand: { flex: 1, minWidth: 260, maxWidth: 360 },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoMark: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontWeight: 800,
    fontSize: '0.68rem',
    letterSpacing: '0.06em',
    padding: '4px 7px',
    borderRadius: 5,
  },
  logoText: { color: 'white', fontWeight: 800, fontSize: '1rem' },
  tagline: { color: '#cbd5e1', fontSize: '0.9rem', marginBottom: 12 },
  disclaimer: { fontSize: '0.78rem', lineHeight: 1.6, color: '#64748b' },
  links: { display: 'flex', gap: 48, flexWrap: 'wrap' },
  col: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 120 },
  colTitle: { color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 },
  link: { color: '#94a3b8', fontSize: '0.88rem', textDecoration: 'none' },
  bottom: {
    borderTop: '1px solid #1e293b',
    paddingTop: 20,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: '0.78rem',
    color: '#475569',
  },
}

// Mobile responsive styles & animations
if (typeof document !== 'undefined') {
  const landingStyle = document.createElement('style')
  landingStyle.setAttribute('data-landing-responsive', '')
  landingStyle.textContent = `
    @media (max-width: 1200px) {
      [data-stats-grid] {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      [data-tools-grid] {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      [data-how-steps] {
        grid-template-columns: 1fr !important;
      }
    }

    @media (max-width: 768px) {
      /* Hero section */
      [data-hero-section] {
        padding: 56px 0 48px !important;
      }
      [data-hero-actions] {
        flex-direction: column !important;
        align-items: center !important;
        gap: 10px !important;
      }
      [data-hero-actions] a {
        width: 100% !important;
        max-width: 280px !important;
      }

      /* Trust bar */
      [data-trust-inner] {
        gap: 12px !important;
        padding: 8px 16px !important;
      }
      [data-trust-inner] > div {
        flex: 0 1 calc(50% - 6px) !important;
      }

      /* Stats section */
      [data-stats-grid] {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 16px !important;
      }

      /* Tools grid */
      [data-tools-grid] {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }

      /* How it works */
      [data-how-steps] {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
      }

      /* Consultation CTA */
      [data-consultation-section] {
        padding: 56px 0 !important;
      }
      [data-consultation-actions] {
        flex-direction: column !important;
        align-items: center !important;
        gap: 10px !important;
      }
      [data-consultation-actions] a {
        width: 100% !important;
        max-width: 280px !important;
      }

      /* Footer */
      [data-footer-inner] {
        flex-direction: column !important;
        gap: 32px !important;
      }
      [data-footer-links] {
        gap: 28px !important;
        width: 100% !important;
      }
      [data-footer-bottom] {
        flex-direction: column !important;
        text-align: center !important;
        gap: 4px !important;
      }

      /* Global */
      .container {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      [data-tools-section],
      [data-how-section] {
        padding-top: 48px !important;
        padding-bottom: 48px !important;
      }
    }

    @media (max-width: 480px) {
      [data-hero-section] {
        padding: 40px 0 32px !important;
      }
      [data-trust-inner] {
        gap: 8px !important;
      }
      [data-trust-inner] > div {
        flex: 0 1 100% !important;
      }
      [data-stats-grid] {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      [data-tools-grid] {
        gap: 16px !important;
      }
    }

    /* Prefers reduced motion */
    @media (prefers-reduced-motion: reduce) {
      [data-hero-section],
      [data-tools-section],
      [data-how-section],
      [data-stats-section],
      [data-consultation-section] {
        transition: none !important;
      }
      [data-tools-grid] > div,
      [data-how-steps] > div,
      [data-stats-grid] > div {
        transition: none !important;
      }
    }

    /* Button styles */
    [data-hero-actions] a,
    [data-consultation-actions] a,
    [data-tools-grid] a {
      transition: all 0.2s ease !important;
    }
    [data-hero-actions] a:hover,
    [data-consultation-actions] a:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
    }
    [data-tools-grid] a:hover {
      transform: translateY(-2px) !important;
      opacity: 0.9 !important;
    }

    /* Card hover effects */
    [data-tools-grid] > div {
      transition: all 0.3s ease !important;
    }
    [data-tools-grid] > div:hover {
      transform: translateY(-6px) !important;
      box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important;
    }

    [data-how-steps] > div {
      transition: all 0.3s ease !important;
    }
    [data-how-steps] > div:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
    }

    [data-stats-grid] > div {
      transition: all 0.3s ease !important;
    }
    [data-stats-grid] > div:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
    }

    /* Links */
    [data-footer-links] a {
      transition: color 0.15s ease !important;
    }
    [data-footer-links] a:hover {
      color: white !important;
    }

    /* Focus states for accessibility */
    [data-hero-actions] a:focus,
    [data-consultation-actions] a:focus,
    [data-tools-grid] a:focus {
      outline: 2px solid #2563eb !important;
      outline-offset: 2px !important;
    }
  `
  if (!document.querySelector('[data-landing-responsive]')) {
    document.head.appendChild(landingStyle)
  }
}
