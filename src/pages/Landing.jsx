import { Link } from 'react-router-dom'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

export default function Landing() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  )
}

function Hero() {
  return (
    <section style={heroStyles.section}>
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

          <div style={heroStyles.actions}>
            <Link to="/calculator" className="btn btn-xl" style={{ background: '#7b1c2e', color: 'white', fontWeight: 700 }}>
              Calculate My Retirement
            </Link>
            <Link to="/reference" className="btn btn-outline btn-xl">
              Explore Reference Guide
            </Link>
          </div>

          <div style={heroStyles.meta}>
            <span style={heroStyles.metaItem}>Free forever — no account needed</span>
            <span style={heroStyles.metaDot} />
            <span style={heroStyles.metaItem}>Updated for 2026 figures</span>
            <span style={heroStyles.metaDot} />
            <span style={heroStyles.metaItem}>11 benefit categories covered</span>
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
        <div style={trustStyles.inner}>
          {items.map((item, i) => (
            <div key={i} style={trustStyles.item}>
              <span style={trustStyles.dot} />
              <span style={trustStyles.text}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="section" style={{ background: '#f8fafc' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2 style={featureStyles.h2}>Everything you need to understand your benefits</h2>
          <p style={featureStyles.sub}>
            Three ways to get the answers you need — from self-service to expert guidance.
          </p>
        </div>

        <div style={featureStyles.grid}>
          <FeatureCard
            badge="FREE"
            badgeColor="free"
            accent="#059669"
            title="Reference Guide"
            description="Browse our complete library of federal benefits information. FERS pension calculations, TSP rules, FEHB 5-year rule, Medicare coordination, Social Security claiming strategies, and more. All updated for 2026."
            bullets={['11 benefit categories', 'Key numbers at a glance', 'Common pitfalls highlighted', 'No account required']}
            cta={<Link to="/reference" className="btn btn-green btn-full">Explore Free</Link>}
          />
          <FeatureCard
            badge="FREE"
            badgeColor="pro"
            accent="#2563eb"
            title="AI Benefits Chat"
            description="Ask questions in plain English and get precise, sourced answers about your federal benefits. The AI learns your situation as you chat — years of service, retirement goals, family circumstances — and tailors every answer."
            bullets={['Personalized to your situation', 'Cites OPM regulations and CFR', 'Builds your benefit profile', 'Unlimited questions']}
            cta={<Link to="/signup" className="btn btn-primary btn-full">Start Free</Link>}
            highlight
          />
          <FeatureCard
            badge="FREE"
            badgeColor="free"
            accent="#1e3a5f"
            title="Expert Consultation"
            description="Sometimes you need a real human expert who understands the nuances of your specific situation. Book a free 30-minute call with a federal retirement specialist at Federal Market Associates."
            bullets={['Certified federal benefits advisors', 'No sales pitch', '30 minutes, completely free', 'Available for FERS and CSRS']}
            cta={
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-navy btn-full">
                Book Free Call
              </a>
            }
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ badge, badgeColor, accent, title, description, bullets, cta, highlight }) {
  return (
    <div style={{
      ...featureCardStyles.card,
      ...(highlight ? { ...featureCardStyles.cardHighlight, borderTopColor: accent } : { borderTopColor: accent }),
    }}>
      {highlight && <div style={featureCardStyles.popularBadge}>Most Popular</div>}
      <div style={featureCardStyles.top}>
        <span className={`badge badge-${badgeColor}`}>{badge}</span>
      </div>
      <div style={{ width: 32, height: 3, background: accent, borderRadius: 2, marginBottom: 16 }} />
      <h3 style={featureCardStyles.title}>{title}</h3>
      <p style={featureCardStyles.desc}>{description}</p>
      <ul style={featureCardStyles.bullets}>
        {bullets.map((b, i) => (
          <li key={i} style={featureCardStyles.bullet}>
            <span style={{ ...featureCardStyles.check, color: accent }}>&#10003;</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div style={featureCardStyles.cta}>{cta}</div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Browse the Free Reference Guide',
      desc: 'Start with our comprehensive library. Search any benefit topic, read the rules that apply to you, and flag the common mistakes that trip people up.',
    },
    {
      num: '2',
      title: 'Chat with AI for Personalized Answers',
      desc: 'Create a free account and ask the AI anything. It remembers what you tell it — your years of service, your agency, your plans — and gives you answers tailored to your situation.',
    },
    {
      num: '3',
      title: 'Book a Free Expert Call When Ready',
      desc: "When you're ready to make real decisions, talk to a federal benefits specialist. Always free, always no pressure, and always focused on what's best for you.",
    },
  ]

  return (
    <section className="section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2 style={howStyles.h2}>How it works</h2>
          <p style={howStyles.sub}>From confused to confident in three simple steps.</p>
        </div>
        <div style={howStyles.steps}>
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

function Testimonials() {
  const items = [
    {
      quote: "I had no idea my MRA+10 retirement would mean losing FEHB during a postponement period. This tool caught it before I filed. Could have been a massive mistake.",
      name: "David M.",
      role: "FERS employee, 28 years, HHS",
    },
    {
      quote: "Asked the AI a question about TSP loans at separation and it explained exactly what would happen tax-wise — cited the specific CFR section. More detailed than anything my HR gave me.",
      name: "Patricia K.",
      role: "CSRS-Offset, 31 years, DOD",
    },
    {
      quote: "Booked the free consultation after browsing the Medicare coordination info. The advisor helped me figure out whether Part B was worth it. Saved me hours of research.",
      name: "Robert S.",
      role: "Recently retired, 35 years, USPS",
    },
  ]

  return (
    <section className="section" style={{ background: '#f8fafc' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: 48 }}>
          <h2 style={testimonialStyles.h2}>Federal employees trust FedBenefitsAid</h2>
        </div>
        <div style={testimonialStyles.grid}>
          {items.map((item, i) => (
            <div key={i} style={testimonialStyles.card}>
              <div style={testimonialStyles.stars}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p style={testimonialStyles.quote}>"{item.quote}"</p>
              <div style={testimonialStyles.author}>
                <div style={testimonialStyles.name}>{item.name}</div>
                <div style={testimonialStyles.role}>{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section style={finalStyles.section}>
      <div className="container">
        <div style={finalStyles.inner}>
 2        <h2 style={finalStyles.h2}>
            Don't leave retirement money on the table.
          </h2>
          <p style={finalStyles.sub}>
            The average federal employee has $40,000+ in benefits complexity decisions to make before retirement.
            Start understanding yours — completely free.
          </p>
          <div style={finalStyles.actions}>
            <Link to="/reference" className="btn btn-outline-white btn-xl">
              Start Free Reference Guide
            </Link>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-xl" style={{ background: 'white', color: '#1e3a5f', fontWeight: 700 }}>
              Book Free Consultation
            </a>
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
        <div style={footerStyles.inner}>
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
          <div style={footerStyles.links}>
            <div style={footerStyles.col}>
              <div style={footerStyles.colTitle}>Resources</div>
              <Link to="/calculator" style={footerStyles.link}>Retirement Calculator</Link>
              <Link to="/reference" style={footerStyles.link}>Reference Guide</Link>
              <Link to="/resources" style={footerStyles.link}>Forms &amp; Resources</Link>
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
            </div>
          </div>
        </div>
        <div style={footerStyles.bottom}>
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
    background: 'linear-gradient(160deg, #f0f4ff 0%, #ffffff 60%)',
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
    background: 'rgba(30,58,95,0.08)',
    color: '#1e3a5f',
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
    color: '#0f172a',
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
    color: '#475569',
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

const featureStyles = {
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
    maxWidth: 560,
    margin: '0 auto',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
}

const featureCardStyles = {
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '32px 28px',
    border: '1.5px solid #e2e8f0',
    borderTop: '4px solid',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardHighlight: {
    boxShadow: '0 8px 30px rgba(37,99,235,0.12)',
    border: '1.5px solid #c7d7fc',
    borderTop: '4px solid',
  },
  popularBadge: {
    position: 'absolute',
    top: -13,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#2563eb',
    color: 'white',
    padding: '4px 16px',
    borderRadius: 20,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  top: { marginBottom: 12 },
  title: { fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 },
  desc: { fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: 20, flex: 1 },
  bullets: { listStyle: 'none', marginBottom: 24 },
  bullet: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#374151', marginBottom: 6 },
  check: { fontWeight: 700, flexShrink: 0, fontSize: '0.95rem' },
  cta: { marginTop: 'auto' },
}

const howStyles = {
  h2: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: 12,
  },
  sub: { fontSize: '1.05rem', color: '#64748b' },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
  },
  step: {
    textAlign: 'center',
    padding: '36px 28px',
    background: 'white',
    borderRadius: 16,
    border: '1.5px solid #e2e8f0',
  },
  stepNum: {
    width: 40,
    height: 40,
    background: '#1e3a5f',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1rem',
    margin: '0 auto 16px',
  },
  stepTitle: { fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 },
  stepDesc: { fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 },
}

const testimonialStyles = {
  h2: {
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: 8,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '28px 24px',
    border: '1.5px solid #e2e8f0',
  },
  stars: { color: '#f59e0b', fontSize: '1rem', marginBottom: 12, letterSpacing: 2 },
  quote: { fontSize: '0.9rem', color: '#334155', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' },
  author: {},
  name: { fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' },
  role: { fontSize: '0.8rem', color: '#64748b', marginTop: 2 },
}

const finalStyles = {
  section: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1a4d8f 100%)',
    padding: '80px 0',
  },
  inner: {
    textAlign: 'center',
    maxWidth: 640,
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
