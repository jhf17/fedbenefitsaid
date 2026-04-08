import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

export default function Landing() {
  useEffect(() => { document.title = 'FedBenefitsAid — Federal Retirement Benefits, Simplified' }, [])

  return (
    <main id="main-content">
      <Hero />
      <TrustBar />
      <Tools />
      <HowItWorks />
      <ConsultationCTA />
      <Footer />
    </main>
  )
}

function Hero() {
  return (
    <section data-hero-section="" style={heroStyles.section}>
      <div className="container">
        <div style={heroStyles.inner}>
          <div style={heroStyles.badge}>
            For U.S. Federal Employees
          </div>

          <h1 style={heroStyles.h1}>
            Your Federal Retirement Benefits,{' '}
            <span style={heroStyles.highlight}>Finally Clear</span>
          </h1>

          <p style={heroStyles.sub}>
            FERS. TSP. FEHB. FEGLI. Medicare. Social Security. It's complicated —
            and one wrong decision can cost you thousands. FedBenefitsAid makes it
            simple, accurate, and free to explore.
          </p>

          <div data-hero-actions="" style={heroStyles.actions}>
            <Link to="/assessment" className="btn btn-xl" style={{ background: '#7b1c2e', color: 'white', fontWeight: 700 }}>
              Take the Assessment
            </Link>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xl" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
              Book Free Consultation
            </a>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/signup" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.35)', paddingBottom: 2, fontWeight: 500 }}>
              Create a free account to unlock AI Chat <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div style={heroStyles.meta}>
            <span style={heroStyles.metaItem}>Free forever — no account needed</span>
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
    { label: '11 benefit areas covered' },
    { label: '2026 official figures' },
    { label: 'Instant AI answers' },
    { label: 'Expert consultations available' },
    { label: 'No data sold, ever' },
  ]
  return (
    <section style={trustStyles.section}>
      <div className="container">
        <div data-trust-inner="" style={trustStyles.inner}>
          {items.map((item, i) => (
            <div key={i} style={trustStyles.item}>
              <span style={trustStyles.dot} aria-hidden="true" />
              <span style={trustStyles.text}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Tools() {
  const tools = [
    {
      id: 'calculator',
      title: 'Retirement Calculator',
      description: 'Calculate your complete retirement picture — FERS pension, FERS Supplement, TSP projections, FEHB costs, and Social Security estimates.',
      features: ['FERS & CSRS pension estimate', 'FERS Supplement eligibility', 'TSP & FEHB included', 'No account required'],
      accent: '#7b1c2e',
      cta: { text: 'Calculate Now', to: '/calculator' },
      highlight: true,
    },
    {
      id: 'assessment',
      title: 'Retirement Readiness Assessment',
      description: 'Take a quick quiz about your federal career and get a personalized retirement readiness checklist. See where you stand and what steps to take next.',
      features: ['Personalized score', 'Action checklist', '2-minute quiz', 'No account required'],
      accent: '#059669',
      cta: { text: 'Start Assessment', to: '/assessment' },
      highlight: true,
    },
    {
      id: 'ai-chat',
      title: 'AI Benefits Chat',
      description: 'Ask questions in plain English about your federal benefits. The AI learns your situation and tailors every answer to your specific circumstances.',
      features: ['Personalized answers', 'Cites OPM regulations', 'Builds your profile', 'Unlimited questions'],
      accent: '#2563eb',
      cta: { text: 'Start Chatting', to: '/signup' },
    },
    {
      id: 'reference',
      title: 'Reference Guide',
      description: 'Browse our comprehensive library covering 11 benefit categories. Get the rules, numbers, and common pitfalls for every topic.',
      features: ['11 benefit categories', 'Key numbers at a glance', 'Common pitfalls', 'Searchable & downloadable'],
      accent: '#1e3a5f',
      cta: { text: 'Explore Guide', to: '/reference' },
    },
    {
      id: 'resources',
      title: 'Resources & Forms',
      description: 'One-stop shop for official OPM forms, government portals, benefit rate tables, and retirement guides. Everything you need in one place.',
      features: ['Official OPM forms', 'Government links', 'Rate tables & guides', '2026 updates'],
      accent: '#64748b',
      cta: { text: 'Browse Resources', to: '/resources' },
    },
  ]

  return (
    <section className="section" style={{ background: '#f8fafc' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2 style={toolsStyles.h2}>Everything you need to understand your benefits</h2>
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
  const cardStyle = {
    ...toolCardStyles.card,
    ...(isHighlighted && toolCardStyles.cardHighlight),
    borderTopColor: tool.accent,
  }

  return (
    <div style={cardStyle}>
      {isHighlighted && (
        <div style={toolCardStyles.badge} aria-label="Featured tool">
          ★ Primary Tool
        </div>
      )}
      <div style={toolCardStyles.accentLine} style={{ background: tool.accent }} />
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
          <Link to={tool.cta.to} className="btn btn-full" style={{
            background: tool.accent,
            color: 'white',
            fontWeight: 700,
            padding: '10px 16px',
            borderRadius: 8,
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'block',
          }}>
            {tool.cta.text}
          </Link>
        ) : (
          <a href={tool.cta.href} target="_blank" rel="noopener noreferrer" className="btn btn-full" style={{
            background: tool.accent,
            color: 'white',
            fontWeight: 700,
            padding: '10px 16px',
            borderRadius: 8,
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'block',
          }}>
            {tool.cta.text}
          </a>
        )}
      </div>
    </div>
  )
}

function HowItWorks() {
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
    <section className="section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2 style={howStyles.h2}>How it works</h2>
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
  return (
    <section data-consultation-section="" style={consultationStyles.section}>
      <div className="container">
        <div style={consultationStyles.inner}>
          <h2 style={consultationStyles.h2}>
            Ready for expert guidance?
          </h2>
          <p style={consultationStyles.sub}>
            Sometimes you need to talk to a real person. Book a free 30-minute consultation with a federal retirement specialist at Federal Market Associates. No sales pitch. Just honest, expert advice.
          </p>
          <div data-consultation-actions="" style={consultationStyles.actions}>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-xl" style={{ background: 'white', color: '#1e3a5f', fontWeight: 700 }}>
              Book Free Consultation
            </a>
            <Link to="/reference" className="btn btn-outline btn-xl" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
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
    background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)',
    padding: '96px 0 80px',
  },
  inner: {
    maxWidth: 680,
    textAlign: 'center',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    padding: '6px 18px',
    borderRadius: 20,
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 28,
  },
  h1: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    marginBottom: 20,
  },
  highlight: {
    background: 'linear-gradient(120deg, #1e5fa8 0%, #5ba3e0 45%, #c2e0f7 75%, #e8f4fd 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 1px 2px rgba(30,90,168,0.18))',
  },
  sub: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.7,
    marginBottom: 40,
    maxWidth: 560,
    margin: '0 auto 40px',
  },
  actions: {
    display: 'flex',
    gap: 12,
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
    color: 'rgba(255,255,255,0.78)',
    fontWeight: 500,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.35)',
    display: 'inline-block',
  },
}

const trustStyles = {
  section: {
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
    padding: '14px 0',
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
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#1e3a5f',
    flexShrink: 0,
    display: 'inline-block',
  },
  text: {
    color: '#475569',
    fontWeight: 500,
    fontSize: '0.84rem',
  },
}

const toolsStyles = {
  h2: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: 12,
  },
  sub: {
    fontSize: '1.05rem',
    color: '#64748b',
    maxWidth: 640,
    margin: '0 auto',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
}

const toolCardStyles = {
  card: {
    background: 'white',
    borderRadius: 12,
    padding: '28px 24px',
    border: '1.5px solid #e2e8f0',
    borderTop: '4px solid',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  cardHighlight: {
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    border: '1.5px solid #d1d5db',
  },
  badge: {
    position: 'absolute',
    top: -13,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1e3a5f',
    color: 'white',
    padding: '4px 12px',
    borderRadius: 16,
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  accentLine: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 10,
  },
  desc: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: 18,
    flex: 1,
  },
  features: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    marginBottom: 20,
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.85rem',
    color: '#475569',
    marginBottom: 8,
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
  h2: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: 12,
  },
  sub: {
    fontSize: '1.05rem',
    color: '#64748b',
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  step: {
    textAlign: 'center',
    padding: '32px 24px',
    background: 'white',
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
  },
  stepNum: {
    width: 44,
    height: 44,
    background: '#1e3a5f',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.1rem',
    margin: '0 auto 16px',
  },
  stepTitle: {
    fontSize: '1rem',
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
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1a4d8f 100%)',
    padding: '80px 0',
  },
  inner: {
    textAlign: 'center',
    maxWidth: 680,
    margin: '0 auto',
    color: 'white',
  },
  h2: {
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginBottom: 16,
  },
  sub: {
    fontSize: '1.05rem',
    opacity: 0.85,
    lineHeight: 1.6,
    marginBottom: 36,
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

// Mobile responsive styles
if (typeof document !== 'undefined') {
  const landingStyle = document.createElement('style')
  landingStyle.setAttribute('data-landing-responsive', '')
  landingStyle.textContent = `
    @media (max-width: 1024px) {
      [data-tools-grid] {
        grid-template-columns: repeat(2, 1fr) !important;
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
      }
      [data-hero-actions] a,
      [data-hero-actions] .btn {
        width: 100% !important;
        max-width: 320px !important;
        text-align: center !important;
        justify-content: center !important;
      }

      /* Trust bar */
      [data-trust-inner] {
        flex-direction: column !important;
        gap: 10px !important;
        align-items: flex-start !important;
        padding: 4px 16px !important;
      }

      /* Tools grid - stack to single column */
      [data-tools-grid] {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }

      /* How it works - stack to single column */
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
      }
      [data-consultation-actions] a,
      [data-consultation-actions] .btn {
        width: 100% !important;
        max-width: 320px !important;
        text-align: center !important;
        justify-content: center !important;
      }

      /* Footer */
      [data-footer-inner] {
        flex-direction: column !important;
        gap: 32px !important;
      }
      [data-footer-links] {
        gap: 28px !important;
      }
      [data-footer-bottom] {
        flex-direction: column !important;
        text-align: center !important;
        gap: 4px !important;
      }

      /* Global container override */
      .container {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      .section {
        padding-top: 48px !important;
        padding-bottom: 48px !important;
      }
    }

    @media (max-width: 480px) {
      /* Extra small screens - further adjustments */
      [data-hero-section] {
        padding: 40px 0 36px !important;
      }
      [data-trust-inner] {
        gap: 8px !important;
      }

      /* Tools grid on small screens */
      [data-tools-grid] {
        gap: 16px !important;
      }
    }

    /* Accessibility & Focus states */
    [data-hero-actions] .btn:focus,
    [data-consultation-actions] .btn:focus,
    .btn:focus {
      outline: 2px solid white !important;
      outline-offset: 2px !important;
    }

    /* Ensure sufficient color contrast for links */
    [data-footer-links] a:visited {
      color: #cbd5e1 !important;
    }

    [data-footer-links] a:hover {
      color: white !important;
    }
  `
  if (!document.querySelector('[data-landing-responsive]')) {
    document.head.appendChild(landingStyle)
  }
}
