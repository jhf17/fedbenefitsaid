import { Link } from 'react-router-dom'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

export default function Landing() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <CalculatorCTA />
      <Features />
      <HowItWorks />
      <ConsultCTA />
      <Footer />
    </main>
  )
}

function Hero() {
  return (
    <section style={hero.section}>
      <div className="container">
        <div style={hero.inner}>
          <div style={hero.badge}>For U.S. Federal Employees</div>
          <h1 style={hero.h1}>
            Your Federal Retirement Benefits,{' '}
            <span style={hero.highlight}>Finally Clear</span>
          </h1>
          <p style={hero.sub}>
            FERS. TSP. FEHB. FEGLI. Medicare. Social Security.
            One wrong decision can cost you tens of thousands of dollars.
            FedBenefitsAid gives you the accurate information and tools you need - completely free.
          </p>
          <div style={hero.btnRow}>
            <Link to="/calculator" style={hero.btnPrimary}>
              Calculate My Retirement Income
            </Link>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={hero.btnSecondary}>
              Talk to a Specialist
            </a>
          </div>
          <div style={hero.fineprint}>
            Free forever - no account needed for calculator and reference guide
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustBar() {
  const items = [
    { icon: '2026', label: 'Updated for 2026' },
    { icon: 'OPM', label: 'OPM-sourced figures' },
    { icon: '11', label: 'Benefit categories covered' },
    { icon: 'AI', label: 'Instant AI answers' },
    { icon: '$0', label: 'Free to use' },
  ]
  return (
    <div style={trust.bar}>
      <div className="container">
        <div style={trust.inner}>
          {items.map((item, i) => (
            <div key={i} style={trust.item}>
              <div style={trust.icon}>{item.icon}</div>
              <div style={trust.label}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CalculatorCTA() {
  return (
    <section style={calcCTA.section}>
      <div className="container">
        <div style={calcCTA.inner}>
          <div style={calcCTA.content}>
            <div style={calcCTA.badge}>New Tool</div>
            <h2 style={calcCTA.h2}>See Your Complete Retirement Income Picture</h2>
            <p style={calcCTA.sub}>
              Enter your service years, High-3 salary, and TSP balance. In seconds,
              see your estimated pension, TSP income, Social Security, and total monthly
              retirement income - side by side, with full calculation breakdowns.
            </p>
            <div style={calcCTA.bullets}>
              {[
                'FERS, CSRS, and Special Provision (LEO/FF/ATC) calculations',
                'TSP projection with growth rate you control',
                'Social Security estimate at any claiming age',
                'MRA+10 early retirement penalty calculator',
                'Survivor benefit impact on your monthly check',
                'All figures verified against 2026 OPM rules',
              ].map((b, i) => (
                <div key={i} style={calcCTA.bullet}>
                  <span style={calcCTA.check}>&#10003;</span>
                  {b}
                </div>
              ))}
            </div>
            <Link to="/calculator" style={calcCTA.btn}>
              Open Free Calculator
            </Link>
          </div>
          <div style={calcCTA.preview}>
            <div style={calcCTA.previewCard}>
              <div style={calcCTA.previewLabel}>Estimated Total Monthly Income</div>
              <div style={calcCTA.previewAmount}>$6,840</div>
              <div style={calcCTA.previewSub}>$82,080 per year</div>
              <div style={calcCTA.previewBreakdown}>
                {[
                  { label: 'FERS Pension', value: '$3,120/mo', color: '#1e3a5f' },
                  { label: 'TSP Income (4% rule)', value: '$1,750/mo', color: '#2d5f8a' },
                  { label: 'Social Security', value: '$1,970/mo', color: '#3b82f6' },
                  { label: 'Medicare Part B', value: '-$185/mo', color: '#ef4444' },
                ].map((row, i) => (
                  <div key={i} style={calcCTA.previewRow}>
                    <span style={calcCTA.previewRowLabel}>{row.label}</span>
                    <span style={{ ...calcCTA.previewRowValue, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={calcCTA.previewNote}>Sample output - your numbers will vary</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      title: 'Free Calculator',
      tag: 'FREE',
      desc: 'Calculate your complete retirement income: FERS or CSRS pension, TSP projection, Social Security, and Medicare. Includes FERS Supplement, survivor benefit impact, and MRA+10 penalty. All 2026 figures.',
      checks: ['FERS, CSRS, LEO/FF/ATC', 'TSP projection tool', 'Social Security estimate', 'No account required'],
      link: '/calculator',
      linkText: 'Open Calculator',
      accent: '#1e3a5f',
    },
    {
      title: 'Reference Guide',
      tag: 'FREE',
      desc: 'Browse our complete library covering all 11 federal benefit categories. Key rules, eligibility requirements, 2026 figures, and common mistakes to avoid. Updated continuously.',
      checks: ['11 benefit categories', 'Key numbers at a glance', 'Common pitfalls highlighted', 'No account required'],
      link: '/reference',
      linkText: 'Browse Guide',
      accent: '#475569',
    },
    {
      title: 'AI Benefits Chat',
      tag: 'FREE',
      desc: 'Ask any question in plain English and get precise, sourced answers. The AI covers every federal and military benefit topic - pensions, TSP, FEHB, FEGLI, VA disability, SBP, and more.',
      checks: ['Every federal benefit topic', 'Military benefits included', 'Cites OPM and CFR sources', 'Free account required'],
      link: '/chat',
      linkText: 'Start Chatting',
      accent: '#475569',
      featured: true,
    },
    {
      title: 'Expert Consultation',
      tag: 'FREE',
      desc: 'Book a free 30-minute call with a licensed federal benefits specialist at Federal Market Associates. Get personalized guidance on your specific situation - pension, TSP strategy, insurance, and more.',
      checks: ['Licensed specialists', '30 minutes, no cost', 'FERS and CSRS covered', 'No obligation'],
      link: CALENDLY_URL,
      linkText: 'Book Free Call',
      external: true,
      accent: '#16a34a',
    },
  ]

  return (
    <section style={feat.section}>
      <div className="container">
        <div style={feat.header}>
          <h2 style={feat.h2}>Everything you need to understand your benefits</h2>
          <p style={feat.sub}>Four ways to get answers - from self-service to expert guidance. All free.</p>
        </div>
        <div style={feat.grid}>
          {features.map((f, i) => (
            <div key={i} style={{ ...feat.card, ...(f.featured ? feat.cardFeatured : {}) }}>
              {f.featured && <div style={feat.featuredBadge}>Most Popular</div>}
              <div style={feat.tagRow}>
                <span style={{ ...feat.tag, background: f.accent === '#16a34a' ? '#dcfce7' : '#dbeafe', color: f.accent === '#16a34a' ? '#15803d' : '#1e40af' }}>
                  {f.tag}
                </span>
              </div>
              <h3 style={feat.cardTitle}>{f.title}</h3>
              <p style={feat.cardDesc}>{f.desc}</p>
              <ul style={feat.checks}>
                {f.checks.map((c, j) => (
                  <li key={j} style={feat.checkItem}>
                    <span style={feat.checkMark}>&#10003;</span>
                    {c}
                  </li>
                ))}
              </ul>
              {f.external ? (
                <a href={f.link} target="_blank" rel="noopener noreferrer" style={{ ...feat.btn, background: f.accent }}>
                  {f.linkText}
                </a>
              ) : (
                <Link to={f.link} style={{ ...feat.btn, background: f.featured ? '#1e3a5f' : '#f1f5f9', color: f.featured ? '#fff' : '#1e3a5f' }}>
                  {f.linkText}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '1',
      title: 'Run your numbers',
      desc: 'Open the free calculator and enter your years of service, High-3 salary, and TSP balance. Get your complete retirement income estimate in under a minute.',
    },
    {
      n: '2',
      title: 'Explore the reference guide',
      desc: 'Dig into any benefit category - FEHB rules, FEGLI options, survivor benefits, Medicare coordination. Every topic explained clearly with exact 2026 figures.',
    },
    {
      n: '3',
      title: 'Ask the AI anything',
      desc: 'Create a free account and ask the AI your specific questions. It covers every federal and military benefit topic and cites OPM regulations and CFR sections.',
    },
    {
      n: '4',
      title: 'Talk to a specialist when ready',
      desc: 'When you\'re ready to make real decisions, book a free 30-minute consultation with a licensed federal benefits specialist. No pressure, no obligation.',
    },
  ]
  return (
    <section style={how.section}>
      <div className="container">
        <div style={how.header}>
          <h2 style={how.h2}>From confused to confident</h2>
          <p style={how.sub}>Most federal employees spend years not fully understanding their benefits. You don\'t have to.</p>
        </div>
        <div style={how.steps}>
          {steps.map((s, i) => (
            <div key={i} style={how.step}>
              <div style={how.stepNum}>{s.n}</div>
              <div style={how.stepContent}>
                <div style={how.stepTitle}>{s.title}</div>
                <div style={how.stepDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ConsultCTA() {
  return (
    <section style={cta.section}>
      <div className="container">
        <div style={cta.inner}>
          <h2 style={cta.h2}>Ready to make confident retirement decisions?</h2>
          <p style={cta.sub}>
            The average federal employee has $40,000+ in benefits decisions to make before retirement.
            A free 30-minute call with a specialist at Federal Market Associates can give you a
            clear, personalized plan - at no cost and no obligation.
          </p>
          <div style={cta.btnRow}>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={cta.btnPrimary}>
              Book Free Consultation
            </a>
            <Link to="/calculator" style={cta.btnSecondary}>
              Try the Calculator First
            </Link>
          </div>
          <div style={cta.trust}>
            No cost. No obligation. No sales pressure. 30 minutes with a licensed specialist.
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={foot.footer}>
      <div className="container">
        <div style={foot.inner}>
          <div style={foot.brand}>
            <div style={foot.logo}>
              <span style={foot.logoMark}>FBA</span>
              <span style={foot.logoText}>FedBenefitsAid</span>
            </div>
            <div style={foot.tagline}>Federal retirement benefits, made simple.</div>
            <div style={foot.disclaimer}>
              FedBenefitsAid provides educational information only and does not constitute
              financial, legal, or tax advice. Always verify benefit information with OPM
              or a qualified federal benefits advisor.
            </div>
          </div>
          <div style={foot.links}>
            <div style={foot.col}>
              <div style={foot.colTitle}>Resources</div>
              <Link to="/reference" style={foot.link}>Reference Guide</Link>
              <Link to="/calculator" style={foot.link}>Retirement Calculator</Link>
              <Link to="/chat" style={foot.link}>AI Chat</Link>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={foot.link}>Book Free Call</a>
            </div>
            <div style={foot.col}>
              <div style={foot.colTitle}>Federal Market Associates</div>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={foot.link}>Schedule Consultation</a>
            </div>
            <div style={foot.col}>
              <div style={foot.colTitle}>Account</div>
              <Link to="/login" style={foot.link}>Log In</Link>
              <Link to="/signup" style={foot.link}>Sign Up</Link>
            </div>
          </div>
        </div>
        <div style={foot.bottom}>
          <div>
            &copy; 2026 FedBenefitsAid. All rights reserved.
            Information updated for 2026. Not affiliated with OPM or the U.S. government.
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// STYLES
// ============================================================

const hero = {
  section: { background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #1e4080 100%)', padding: '80px 0 72px', color: '#fff' },
  inner: { maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '0 20px' },
  badge: { display: 'inline-block', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 16px', borderRadius: 20, marginBottom: 20 },
  h1: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' },
  highlight: { color: '#60a5fa' },
  sub: { fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 36, maxWidth: 580, margin: '0 auto 36px' },
  btnRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 },
  btnPrimary: { background: '#22c55e', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' },
  btnSecondary: { background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' },
  fineprint: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' },
}

const trust = {
  bar: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '20px 0' },
  inner: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 40px' },
  item: { display: 'flex', alignItems: 'center', gap: 10 },
  icon: { background: '#1e3a5f', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 5, letterSpacing: '0.04em' },
  label: { fontSize: '0.85rem', fontWeight: 500, color: '#475569' },
}

const calcCTA = {
  section: { padding: '72px 0', background: '#fff' },
  inner: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' },
  content: {},
  badge: { display: 'inline-block', background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: 20, marginBottom: 14 },
  h2: { fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.02em' },
  sub: { fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, marginBottom: 24 },
  bullets: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 },
  bullet: { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem', color: '#334155' },
  check: { color: '#16a34a', fontWeight: 800, flexShrink: 0, marginTop: 1 },
  btn: { display: 'inline-block', background: '#1e3a5f', color: '#fff', padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' },
  preview: {},
  previewCard: { background: '#1e3a5f', borderRadius: 16, padding: '28px 24px', color: '#fff' },
  previewLabel: { fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  previewAmount: { fontSize: 'clamp(2.2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1, marginBottom: 6 },
  previewSub: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: 24 },
  previewBreakdown: { display: 'flex', flexDirection: 'column', gap: 0 },
  previewRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  previewRowLabel: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' },
  previewRowValue: { fontSize: '0.9rem', fontWeight: 700, color: '#fff' },
  previewNote: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 14, textAlign: 'center' },
}

const feat = {
  section: { padding: '72px 0', background: '#f8fafc' },
  header: { textAlign: 'center', marginBottom: 48 },
  h2: { fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' },
  sub: { fontSize: '1rem', color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 },
  card: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '28px 24px', display: 'flex', flexDirection: 'column', position: 'relative' },
  cardFeatured: { border: '2px solid #1e3a5f' },
  featuredBadge: { position: 'absolute', top: -12, left: 24, background: '#1e3a5f', color: '#fff', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20 },
  tagRow: { marginBottom: 12 },
  tag: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 10px', borderRadius: 20 },
  cardTitle: { fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 },
  cardDesc: { fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: 16, flex: 1 },
  checks: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 },
  checkItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#475569' },
  checkMark: { color: '#16a34a', fontWeight: 800, flexShrink: 0 },
  btn: { display: 'block', textAlign: 'center', padding: '10px 16px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', marginTop: 'auto' },
}

const how = {
  section: { padding: '72px 0', background: '#fff' },
  header: { textAlign: 'center', marginBottom: 48 },
  h2: { fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' },
  sub: { fontSize: '1rem', color: '#64748b' },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 },
  step: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  stepNum: { width: 40, height: 40, background: '#1e3a5f', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 },
  stepContent: {},
  stepTitle: { fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 6 },
  stepDesc: { fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 },
}

const cta = {
  section: { padding: '72px 0', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: '#fff' },
  inner: { maxWidth: 620, margin: '0 auto', textAlign: 'center', padding: '0 20px' },
  h2: { fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' },
  sub: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36 },
  btnRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 },
  btnPrimary: { background: '#22c55e', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' },
  btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' },
  trust: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' },
}

const foot = {
  footer: { background: '#0f172a', color: '#94a3b8', padding: '56px 0 32px' },
  inner: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, marginBottom: 40 },
  brand: { maxWidth: 340 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoMark: { background: '#1e3a5f', color: '#fff', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em', padding: '4px 8px', borderRadius: 6 },
  logoText: { fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' },
  tagline: { fontSize: '0.88rem', color: '#94a3b8', marginBottom: 12 },
  disclaimer: { fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 },
  links: { display: 'flex', gap: 40, flexWrap: 'wrap' },
  col: { display: 'flex', flexDirection: 'column', gap: 8 },
  colTitle: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: 4 },
  link: { fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none' },
  bottom: { borderTop: '1px solid #1e293b', paddingTop: 24, fontSize: '0.78rem', color: '#475569' },
}
