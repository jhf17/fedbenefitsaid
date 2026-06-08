import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Seo from '../components/Seo'
import { colors, fonts, rules, elevation } from '../constants/theme'
import { brand } from '../constants/brand'
import { DATA_LAST_UPDATED } from '../config/site'
import WavingFlag from '../components/WavingFlag'
import { Diamond, IconIndividual, IconCalculator, IconInstitution } from '../components/Glyphs'
import RetirementEligibilityWidget from '../components/RetirementEligibilityWidget'
import Button from '../components/fma/Button'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans
const FONT_MONO = fonts.mono

// === Brand palette (FMA navy + oxblood maroon, with a thread of brass) ===
const NAVY = brand.colors.primary
const NAVY_DARK = brand.colors.primaryDark
const NAVY_LIGHT = brand.colors.primaryLight
const MAROON = brand.colors.accent
const MAROON_LIGHT = brand.colors.accentLight
const BRASS = colors.brass
const BRASS_LIGHT = colors.brassLight
// Parchment + ink neutrals
const { paper: PAPER, paperDeep: PAPER_DEEP, surface: SURFACE, surfaceRaised: WHITE, ink: INK, inkSoft: INK_SOFT, inkFaint: INK_FAINT } = colors

const tnum = { fontVariantNumeric: 'tabular-nums' }

function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: brand.url,
    logo: `${brand.url}${brand.logo.type === 'image' ? brand.logo.src : '/fma-logo.png'}`,
    description: brand.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${brand.url}/consultation`,
      availableLanguage: 'English',
    },
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}

// Real, current-benefit-year figures (from src/data/refData.js). Shown in the
// "by the numbers" band — useful, and proof that the site is genuinely current.
const FIGURES = [
  { value: '1.1%', label: 'FERS multiplier', note: 'age 62 · 20+ yrs' },
  { value: '$202.90', label: 'Medicare Part B', note: 'standard / mo · 2026' },
  { value: '$24,500', label: 'TSP deferral limit', note: 'elective · 2026' },
  { value: '57', label: 'Earliest MRA', note: 'born 1970 or later' },
  { value: '$8,000', label: 'TSP catch-up', note: 'age 50–59 · 2026' },
  { value: '$11,250', label: 'TSP “super” catch-up', note: 'age 60–63 · 2026' },
  { value: '$24,480', label: 'FERS Supplement test', note: 'earnings limit · 2026' },
  { value: '5%', label: 'Full TSP match', note: 'contribute 5% to capture it' },
  { value: '50%', label: 'Full survivor annuity', note: '≈10% reduction to yours' },
  { value: '80%', label: 'CSRS pension cap', note: 'reached ~41 yr 11 mo' },
  { value: '36 mo', label: 'High-3 window', note: 'highest consecutive pay' },
  { value: '5 yrs', label: 'FEHB into retirement', note: 'enrolled to carry it for life' },
]

const SERVICES = [
  {
    icon: IconIndividual,
    eyebrow: 'For individuals',
    title: 'Free 1-on-1 consultations',
    body:
      'Phone or video, no time limit, no sales pitch. A Federal Retirement Consultant walks through your FERS or CSRS pension, TSP withdrawal options, FEHB + Medicare coordination, Social Security timing, and FEGLI — and you leave with a personalized retirement summary to keep. Bring any question about your own situation, right down to the specific forms and paperwork.',
    bullets: ['You keep a personalized retirement summary', 'Ask anything — even forms & paperwork', 'Phone or Zoom · no obligation'],
    cta: { to: '/consultation', label: 'Book a consultation' },
  },
  {
    icon: IconCalculator,
    eyebrow: 'For everyone',
    title: 'Free calculators & reference library',
    body:
      'Run your own numbers — side-by-side retirement scenarios, FEGLI premium curves through age 80, your full retirement income picture. Plus a benefits library kept current for the 2026 OPM, IRS, and SSA figures.',
    bullets: ['No signup. No login.', 'Math runs in your browser', 'Every figure cites its source'],
    cta: { to: '/calculators', label: 'Open the calculators' },
  },
  {
    icon: IconInstitution,
    eyebrow: 'For agencies',
    title: 'On-site benefits education',
    body:
      'Bring a Federal Retirement Consultant to your HR team or workforce. On-site or virtual briefings tailored to career stage — entry, mid-career, and pre-retirement. Built to support, not replace, your benefits office.',
    bullets: ['On-site or virtual delivery', 'Career-stage curricula', 'CAGE code in progress'],
    cta: { to: '/consultation', label: 'Request a briefing' },
  },
]

const TOPICS = [
  { name: 'FERS', sub: 'Pension formula, MRA, supplement', href: '/calculators/fers' },
  { name: 'CSRS', sub: '1.5 / 1.75 / 2.0% multipliers, 80% cap', href: '/calculators/csrs' },
  { name: 'TSP', sub: 'Drawdown — will it last vs. guaranteed', href: '/calculators/tsp-drawdown' },
  { name: 'Social Security', sub: 'Claiming age, in your income picture', href: '/calculators/income-picture' },
  { name: 'FEHB', sub: 'Carrying coverage into retirement', href: '/reference' },
  { name: 'FEGLI', sub: 'Premiums by age, basic + optional', href: '/calculators/fegli' },
  { name: 'Medicare', sub: 'Part A/B/D, IRMAA, FEHB coordination', href: '/reference' },
  { name: 'Special Provisions', sub: 'LEO, FF, ATC, USSS — 1.7% formula', href: '/calculators/special' },
]

const PRINCIPLES = [
  {
    title: 'Educate first',
    body:
      'We walk through your benefits using current government data — OPM, IRS, SSA, TSP. You leave the first conversation knowing how your benefits actually work.',
  },
  {
    title: 'Answer the real questions',
    body:
      'Bring the questions you have not gotten a straight answer to. We will not pretend to know what we don’t — and we will not lecture you about products.',
  },
  {
    title: 'Help only if you ask',
    body:
      'If education surfaces something worth acting on, we will tell you. If you want help comparing private alternatives, we can — only when you ask.',
  },
]

// The "boast" — differentiators that are all literally true of the tools:
// in-browser with nothing stored (PensionScenarioCalculator: "Everything
// happens in your browser. Nothing is stored or sent."), every figure cited
// (Tools.jsx / Reference), current for the benefit year (DATA_LAST_UPDATED),
// and the signature side-by-side scenarios.
const TOOL_DIFFERENTIATORS = [
  'Runs entirely in your browser — nothing stored, nothing sent',
  'No signup, no login, no email wall',
  'Every figure cited to OPM, IRS, SSA & TSP',
  'Side-by-side scenarios — compare any retirement date',
]

function formatLastUpdated(yyyyDashMm) {
  if (!yyyyDashMm) return ''
  const [y, m] = yyyyDashMm.split('-')
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthIdx = Math.max(0, Math.min(11, parseInt(m, 10) - 1))
  return `${months[monthIdx]} ${y}`
}

// Small letterspaced label with a leading brass rule — the recurring "eyebrow".
function Eyebrow({ children, onDark = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <span style={{ width: 28, height: 1, background: onDark ? rules.brassOnDark : BRASS, opacity: onDark ? 1 : 0.8 }} />
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: onDark ? BRASS_LIGHT : colors.brassDeepInk,
        }}
      >
        {children}
      </span>
    </div>
  )
}

export default function LandingFMA() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)
  const revealRefs = useRef([])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.04 }
    )
    revealRefs.current.forEach((el) => el && observer.observe(el))
    return () => revealRefs.current.forEach((el) => el && observer.unobserve(el))
  }, [])

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  const SECTION_X = isMobile ? 20 : 48
  const MAXW = 1180


  return (
    <div style={{ fontFamily: FONT_SANS, color: INK, background: PAPER, overflowX: 'hidden' }}>
      <Seo
        title="Federal Market Associates — Independent federal benefits education"
        description={brand.description}
        path="/"
        rawTitle
      />
      <OrganizationJsonLd />

      {/* Masthead band removed 2026-06-03 — it duplicated the navbar logo and pushed the
          value proposition below the fold (entirely, on mobile). The brand mark lives in the
          navbar; the homepage now leads straight with the hero. */}

      {/* ===================== HERO ===================== */}
      <section
        style={{
          position: 'relative',
          background: `linear-gradient(168deg, ${NAVY_DARK} 0%, ${NAVY} 52%, ${NAVY_LIGHT} 118%)`,
          color: '#fff',
          padding: isMobile ? '38px 20px 60px' : '60px 48px 96px',
          overflow: 'hidden',
          borderTop: `1px solid ${rules.brassOnDark}`,
        }}
      >
        {/* engraved guilloché watermark, bleeding off the top-right */}
        {/* signature: a line-art "blueprint" U.S. flag, waving slowly (see WavingFlag) */}
        <WavingFlag
          color={BRASS_LIGHT}
          opacity={isMobile ? 0.16 : 0.2}
          width={isMobile ? 540 : 920}
          style={{ position: 'absolute', top: isMobile ? 40 : 18, right: isMobile ? -130 : -40 }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: MAXW,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.15fr) minmax(0,0.85fr)',
            gap: isMobile ? 40 : 56,
            alignItems: 'center',
          }}
        >
          {/* left — message */}
          <div className="fma-rise">
            {/* brand lockup — FMA monogram (echoes the logo's navy/oxblood/navy) + full name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 24 }}>
              <span style={{ fontFamily: FONT_SERIF, fontWeight: 700, fontSize: '1.4rem', letterSpacing: '0.01em', lineHeight: 1 }}>
                <span style={{ color: '#fff' }}>F</span>
                <span style={{ color: '#fff' }}>M</span>
                <span style={{ color: '#fff' }}>A</span>
              </span>
              <span style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.25)' }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: BRASS_LIGHT }}>
                Federal Market Associates
              </span>
            </div>
            <h1
              style={{
                fontFamily: FONT_SERIF,
                fontSize: isMobile ? 'clamp(2.4rem, 11vw, 3.2rem)' : 'clamp(2.9rem, 5vw, 4.4rem)',
                fontWeight: 600,
                lineHeight: 1.02,
                letterSpacing: '-0.022em',
                fontVariationSettings: '"opsz" 144, "SOFT" 40',
                margin: '0 0 22px',
                color: '#fff',
              }}
            >
              Federal benefits,
              <br />
              <span style={{ color: BRASS_LIGHT, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                explained.
              </span>
            </h1>
            <p
              style={{
                fontSize: isMobile ? '1.06rem' : '1.18rem',
                lineHeight: 1.58,
                color: 'rgba(255,255,255,0.82)',
                maxWidth: 540,
                margin: '0 0 34px',
              }}
            >
              Independent federal benefits education and 1-on-1 advisory for federal employees — and on-site briefings
              for the agencies that serve them. Free calculators. No signup. No pressure.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Button to="/consultation" variant="primary" arrow>Book a free consultation</Button>
              <Button to="/calculators" variant="ghost">Try the free calculators</Button>
            </div>

            {/* sourcing / trust line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: isMobile ? 8 : 14,
                marginTop: 30,
                fontFamily: FONT_MONO,
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              <span>Sourced from OPM · IRS · SSA · TSP</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: BRASS_LIGHT }} />
              <span>Current as of {formatLastUpdated(DATA_LAST_UPDATED)}</span>
            </div>
          </div>

          {/* right — the "benefit estimate" artifact */}
          <HeroArtifact isMobile={isMobile} className="fma-rise-late" />
        </div>
      </section>

      {/* ===================== FIGURES BAND (auto-rotating) ===================== */}
      <FiguresBand isMobile={isMobile} />

      {/* ===================== SERVICES (editorial) ===================== */}
      <section ref={addReveal} className="reveal" style={{ background: PAPER, padding: isMobile ? '64px 20px' : '104px 48px' }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, marginBottom: isMobile ? 40 : 64 }}>
            <Eyebrow>What we do</Eyebrow>
            <SectionTitle>Three ways we help with federal benefits.</SectionTitle>
            <p style={{ color: INK_SOFT, lineHeight: 1.62, marginTop: 16, fontSize: '1.05rem', maxWidth: 600 }}>
              All free. All education-first. Use one or all three — they work together.
            </p>
          </div>

          {/* featured service (01) */}
          <ServiceFeatured service={SERVICES[0]} isMobile={isMobile} />

          {/* supporting services (02, 03) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 0,
              marginTop: isMobile ? 8 : 18,
              borderTop: `1px solid ${rules.ink}`,
            }}
          >
            {[SERVICES[1], SERVICES[2]].map((s, i) => (
              <ServiceSupport key={s.title} service={s} index={i + 2} isMobile={isMobile} divider={!isMobile && i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHAT WE COVER (reference index) ===================== */}
      <section ref={addReveal} className="reveal" style={{ background: SURFACE, padding: isMobile ? '64px 20px' : '104px 48px', borderTop: `1px solid ${rules.ink}` }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: isMobile ? 36 : 56 }}>
            <Eyebrow>What we cover</Eyebrow>
            <SectionTitle>The full federal benefits picture.</SectionTitle>
            <p style={{ color: INK_SOFT, lineHeight: 1.62, marginTop: 16, fontSize: '1.05rem', maxWidth: 600 }}>
              Every topic links to a calculator or the reference library — both free, no signup.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', columnGap: isMobile ? 0 : 56 }}>
            {TOPICS.map((t, i) => (
              <CoverRow key={t.name} topic={t} n={i + 1} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== THE TOOLS (boast) ===================== */}
      <section ref={addReveal} className="reveal" style={{ background: PAPER_DEEP, padding: isMobile ? '64px 20px' : '104px 48px', borderTop: `1px solid ${rules.ink}` }}>
        <div
          style={{
            maxWidth: MAXW,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
            gap: isMobile ? 40 : 64,
            alignItems: 'center',
          }}
        >
          {/* left — the boast */}
          <div>
            <Eyebrow>The tools</Eyebrow>
            <SectionTitle>There isn’t another federal benefits site that works like this.</SectionTitle>
            <p style={{ color: INK_SOFT, lineHeight: 1.66, marginTop: 18, fontSize: '1.05rem', maxWidth: 540 }}>
              These are the same calculators we use in consultations — opened up to everyone, free. They run the real
              OPM, IRS, and SSA formulas right in your browser, lay your scenarios out side by side, and cite every
              figure they use. No signup. No email wall. No watered-down “estimate” that skips the rules that change
              the answer.
            </p>
            <ul style={{ listStyle: 'none', margin: '24px 0 28px', padding: 0 }}>
              {TOOL_DIFFERENTIATORS.map((d) => (
                <li
                  key={d}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: `1px solid ${rules.ink}`, fontSize: '0.96rem', color: INK }}
                >
                  <span style={{ color: BRASS, flexShrink: 0, display: 'flex' }}><Diamond size={9} /></span>
                  {d}
                </li>
              ))}
            </ul>
            <CardLink to="/calculators">Open the calculators</CardLink>
          </div>

          {/* right — faithful side-by-side comparison (the calculator's signature feature) */}
          <ScenarioCompare isMobile={isMobile} />
        </div>
      </section>

      {/* ===================== THE DELIVERABLE (what a meeting gives you) ===================== */}
      <section ref={addReveal} className="reveal" style={{ background: SURFACE, padding: isMobile ? '64px 20px' : '104px 48px', borderTop: `1px solid ${rules.ink}` }}>
        <div
          style={{
            maxWidth: MAXW,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) minmax(0,0.92fr)',
            gap: isMobile ? 40 : 64,
            alignItems: 'center',
          }}
        >
          <div>
            <Eyebrow>What you walk away with</Eyebrow>
            <SectionTitle>Book a meeting, leave with a plan in writing.</SectionTitle>
            <p style={{ color: INK_SOFT, lineHeight: 1.66, marginTop: 18, fontSize: '1.05rem', maxWidth: 540 }}>
              You don’t leave a consultation with a sales pitch — you leave with a personalized{' '}
              <strong style={{ color: INK }}>Retirement Summary</strong>. Your pension and survivor options, Social
              Security, TSP income, and FEGLI — built from your real numbers and laid out on one page you can actually
              read. Yours to keep.
            </p>
            <ul style={{ listStyle: 'none', margin: '24px 0 28px', padding: 0 }}>
              {[
                'Built from your real numbers, during the meeting',
                'Every source on one clean page — not a 40-page packet',
                'Pension, Social Security, TSP & FEGLI, together',
                'Yours to keep — PDF or printed',
              ].map((d) => (
                <li
                  key={d}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: `1px solid ${rules.ink}`, fontSize: '0.96rem', color: INK }}
                >
                  <span style={{ color: BRASS, flexShrink: 0, display: 'flex' }}><Diamond size={9} /></span>
                  {d}
                </li>
              ))}
            </ul>
            <Button to="/consultation" variant="primary" arrow>Book a free consultation</Button>
          </div>

          <DeliverableArtifact isMobile={isMobile} />
        </div>
      </section>

      {/* ===================== PRINCIPLES (inscribed, dark) ===================== */}
      <section
        ref={addReveal}
        className="reveal"
        style={{ position: 'relative', background: NAVY, color: '#fff', padding: isMobile ? '64px 20px' : '104px 48px', overflow: 'hidden' }}
      >
        <div style={{ position: 'relative', maxWidth: MAXW, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: isMobile ? 40 : 56 }}>
            <Eyebrow onDark>How we work</Eyebrow>
            <SectionTitle onDark>Education first. Always.</SectionTitle>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 32 : 44 }}>
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} style={{ paddingTop: 22, borderTop: `1px solid ${rules.brassOnDark}` }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: '0.8rem', fontWeight: 600, color: BRASS_LIGHT, letterSpacing: '0.08em', marginBottom: 14, ...tnum }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.3rem', fontWeight: 600, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
                  {p.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.74)', lineHeight: 1.64, fontSize: '0.96rem', margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ELIGIBILITY (interactive closer — replaces the old CTA) ===================== */}
      <section ref={addReveal} className="reveal" style={{ background: PAPER, padding: isMobile ? '64px 20px' : '100px 48px', borderTop: `1px solid ${rules.ink}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <RetirementEligibilityWidget isMobile={isMobile} fontSerifOverride={FONT_SERIF} fontSansOverride={FONT_SANS} />
        </div>
      </section>

      {/* reveal animation */}
      <style>{`
        .reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal.visible { opacity: 1; transform: none; }
        @keyframes figFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .fig-rot { animation: figFade 0.55s ease; }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } .fig-rot { animation: none; } }
      `}</style>
    </div>
  )
}

/* ============================ sub-components ============================ */

// The "by the numbers" band, auto-rotating through pages of real 2026 figures.
// Pauses on hover; respects prefers-reduced-motion (no auto-advance, no fade).
function FiguresBand({ isMobile }) {
  const PER = 4
  const pages = []
  for (let i = 0; i < FIGURES.length; i += PER) pages.push(FIGURES.slice(i, i + PER))
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (pages.length <= 1 || paused) return
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setPage((p) => (p + 1) % pages.length), 4500)
    return () => clearInterval(id)
  }, [paused, pages.length])
  const current = pages[page] || []
  return (
    <section
      style={{ background: NAVY_DARK, color: '#fff', borderTop: `1px solid ${rules.brassOnDark}`, borderBottom: `1px solid ${rules.brassOnDark}`, padding: isMobile ? '6px 20px 14px' : '0 48px 16px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div key={page} className="fig-rot" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)' }}>
          {current.map((f, i) => {
            const leftBorder = (!isMobile && i > 0) || (isMobile && i % 2 === 1)
            const topBorder = isMobile && i > 1
            return (
              <div key={f.label} style={{ padding: isMobile ? '20px 14px' : '30px 28px', borderLeft: leftBorder ? `1px solid ${rules.onDark}` : 'none', borderTop: topBorder ? `1px solid ${rules.onDark}` : 'none' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: isMobile ? '1.4rem' : '1.9rem', fontWeight: 600, color: BRASS_LIGHT, letterSpacing: '-0.01em', ...tnum }}>{f.value}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginTop: 6 }}>{f.label}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: '0.68rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{f.note}</div>
              </div>
            )
          })}
        </div>
        {pages.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 7, padding: isMobile ? '12px 0 2px' : '16px 0 4px' }}>
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Show figure set ${i + 1} of ${pages.length}`}
                style={{ width: i === page ? 22 : 8, height: 8, borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer', background: i === page ? BRASS_LIGHT : 'rgba(255,255,255,0.28)', transition: 'all 0.3s ease' }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function SectionTitle({ children, onDark = false }) {
  return (
    <h2
      style={{
        fontFamily: FONT_SERIF,
        fontSize: 'clamp(1.9rem, 3.4vw, 2.7rem)',
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: '-0.018em',
        color: onDark ? '#fff' : NAVY,
        margin: 0,
        fontVariationSettings: '"opsz" 144, "SOFT" 50',
      }}
    >
      {children}
    </h2>
  )
}

// The hero centerpiece: a framed FERS result styled like an official benefit
// statement. Mirrors the actual FERS calculator's result card exactly — leads
// with the monthly pension, shows the eligibility category, "High-3 used", and
// "Multiplier" (see PensionScenarioCalculator → ScenarioCard). Worked example:
// High-3 $80,000 × 25 yrs × 1.1% (age 62, 20+ yrs) = $22,000/yr → $1,833/mo.
function HeroArtifact({ isMobile, className = '' }) {
  // Cursor-reactive 3D tilt — the "instrument" leans toward your pointer, spring-damped (Emil).
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 140, damping: 18, mass: 0.4 })
  const sy = useSpring(py, { stiffness: 140, damping: 18, mass: 0.4 })
  const rotateY = useTransform(sx, [-0.5, 0.5], [9, -9])
  const rotateX = useTransform(sy, [-0.5, 0.5], [-9, 9])
  const handleTilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const resetTilt = () => { px.set(0); py.set(0) }
  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0' }}>
      <span style={{ fontSize: '0.84rem', color: INK_SOFT }}>{label}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: '0.9rem', fontWeight: 600, color: INK, ...tnum }}>{value}</span>
    </div>
  )
  return (
    <div className={className} style={{ justifySelf: isMobile ? 'center' : 'end', width: '100%', maxWidth: 380 }}>
      <motion.div
        onPointerMove={isMobile ? undefined : handleTilt}
        onPointerLeave={isMobile ? undefined : resetTilt}
        style={{ position: 'relative', rotateX: isMobile ? 0 : rotateX, rotateY: isMobile ? 0 : rotateY, transformPerspective: 1000, willChange: 'transform' }}
      >
      {/* stacked "page" behind, for document depth */}
      <div style={{ position: 'absolute', inset: 0, transform: 'translate(10px, 12px) rotate(1.4deg)', background: '#e7ebf3', borderRadius: 8, border: `1px solid ${rules.ink}` }} aria-hidden />
      <div
        style={{
          position: 'relative',
          background: WHITE,
          borderRadius: 8,
          border: `1px solid ${rules.inkStrong}`,
          boxShadow: elevation.artifact,
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 4, background: `linear-gradient(90deg, ${MAROON}, ${BRASS})` }} />
        <div style={{ padding: isMobile ? '20px 20px 18px' : '24px 24px 20px' }}>
          {/* header — mirrors the calculator's scenario card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: INK_FAINT }}>Sample · FERS calculator</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.18rem', fontWeight: 600, color: NAVY, marginTop: 2, letterSpacing: '-0.01em' }}>FERS pension</div>
              <div style={{ fontSize: '0.78rem', color: INK_SOFT, marginTop: 2 }}>Age 62 · 25 yr of service</div>
            </div>
          </div>

          {/* eligibility category badge — the calculator's exact label */}
          <div style={{ display: 'inline-block', padding: '5px 11px', background: colors.accentPale, border: `1px solid ${rules.brass}`, borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, color: colors.brassDeepInk, marginBottom: 14 }}>
            Immediate Unreduced · Age 62 + 20
          </div>

          {/* headline figure — monthly, exactly as the tool leads */}
          <div style={{ fontFamily: FONT_MONO, fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 2 }}>Monthly pension</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: FONT_SERIF, fontSize: '2.4rem', fontWeight: 600, color: NAVY, letterSpacing: '-0.02em', ...tnum }}>$1,833</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.8rem', color: INK_SOFT }}>/ mo</span>
          </div>

          <div style={{ borderTop: `1px solid ${rules.ink}` }}>
            {row('Annual pension', '$22,000')}
            <div style={{ borderTop: `1px solid ${rules.ink}` }} />
            {row('High-3 used', '$80,000')}
            <div style={{ borderTop: `1px solid ${rules.ink}` }} />
            {row('Multiplier', '1.1%')}
          </div>

          {/* footnote — matches the tool's "pre-tax, today's dollars, no COLA" note */}
          <div style={{ marginTop: 14, fontFamily: FONT_MONO, fontSize: '0.66rem', lineHeight: 1.5, color: INK_FAINT, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span>Illustrative · pre-tax, no COLA</span>
            <Link to="/calculators/fers" style={{ color: MAROON, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Run yours →</Link>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  )
}

function ServiceFeatured({ service, isMobile }) {
  const Icon = service.icon
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.1fr) minmax(0,0.9fr)',
        gap: isMobile ? 22 : 48,
        padding: isMobile ? '28px 0' : '36px 0',
        borderTop: `2px solid ${NAVY}`,
        borderBottom: `1px solid ${rules.ink}`,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <span style={{ color: NAVY }}><Icon size={30} /></span>
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.06em', color: MAROON }}>01</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: INK_FAINT }}>{service.eyebrow}</span>
        </div>
        <h3 style={{ fontFamily: FONT_SERIF, fontSize: isMobile ? '1.6rem' : '1.95rem', fontWeight: 600, color: NAVY, margin: '0 0 14px', letterSpacing: '-0.015em', lineHeight: 1.12 }}>
          {service.title}
        </h3>
        <p style={{ color: INK_SOFT, lineHeight: 1.64, fontSize: '1rem', margin: 0, maxWidth: 520 }}>{service.body}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <ul style={{ listStyle: 'none', margin: '0 0 22px', padding: 0 }}>
          {service.bullets.map((b) => (
            <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${rules.ink}`, fontSize: '0.96rem', color: INK }}>
              <span style={{ color: BRASS, flexShrink: 0, display: 'flex' }}><Diamond size={9} /></span>
              {b}
            </li>
          ))}
        </ul>
        <CardLink to={service.cta.to}>{service.cta.label}</CardLink>
      </div>
    </div>
  )
}

function ServiceSupport({ service, index, isMobile, divider }) {
  const Icon = service.icon
  return (
    <div
      style={{
        paddingTop: isMobile ? 28 : 34,
        paddingBottom: isMobile ? 28 : 34,
        paddingRight: divider ? 48 : 0,
        paddingLeft: !isMobile && !divider ? 48 : 0,
        borderRight: divider ? `1px solid ${rules.ink}` : 'none',
        borderBottom: isMobile ? `1px solid ${rules.ink}` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span style={{ color: NAVY }}><Icon size={26} /></span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.06em', color: MAROON }}>0{index}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: INK_FAINT }}>{service.eyebrow}</span>
      </div>
      <h3 style={{ fontFamily: FONT_SERIF, fontSize: '1.4rem', fontWeight: 600, color: NAVY, margin: '0 0 12px', letterSpacing: '-0.01em', lineHeight: 1.16 }}>
        {service.title}
      </h3>
      <p style={{ color: INK_SOFT, lineHeight: 1.62, fontSize: '0.95rem', margin: '0 0 18px' }}>{service.body}</p>
      <ul style={{ listStyle: 'none', margin: '0 0 18px', padding: 0 }}>
        {service.bullets.map((b) => (
          <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: '0.9rem', color: INK_SOFT }}>
            <span style={{ color: BRASS, flexShrink: 0, display: 'flex' }}><Diamond size={8} /></span>
            {b}
          </li>
        ))}
      </ul>
      <CardLink to={service.cta.to}>{service.cta.label}</CardLink>
    </div>
  )
}

function CardLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: NAVY, fontSize: '0.92rem', fontWeight: 600, textDecoration: 'none', borderBottom: `2px solid ${BRASS}`, paddingBottom: 2, alignSelf: 'flex-start', transition: 'gap 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.gap = '12px'; e.currentTarget.style.color = MAROON }}
      onMouseLeave={(e) => { e.currentTarget.style.gap = '7px'; e.currentTarget.style.color = NAVY }}
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  )
}

// A reference-index row — reads like the contents page of a benefits manual.
function CoverRow({ topic, n, isMobile }) {
  return (
    <Link
      to={topic.href}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: isMobile ? '16px 0' : '18px 4px', borderBottom: `1px solid ${rules.ink}`, textDecoration: 'none', transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '12px'; e.currentTarget.style.background = 'rgba(26,45,92,0.05)' }}
      onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = isMobile ? '0' : '4px'; e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ fontFamily: FONT_MONO, fontSize: '0.78rem', color: BRASS, fontWeight: 600, ...tnum }}>{String(n).padStart(2, '0')}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontFamily: FONT_SERIF, fontSize: '1.22rem', fontWeight: 600, color: NAVY, letterSpacing: '-0.01em' }}>{topic.name}</span>
        <span style={{ display: 'block', fontSize: '0.85rem', color: INK_SOFT, marginTop: 2 }}>{topic.sub}</span>
      </span>
      <span aria-hidden style={{ color: BRASS, fontSize: '1.05rem' }}>→</span>
    </Link>
  )
}

// Faithful recreation of the FERS calculator's "side-by-side" result — two
// scenarios for the same employee (same High-3), retiring at 60 vs 62. Figures
// are the exact OPM-formula output the live tool produces:
//   60: $95,000 × 30 yr × 1.0% = $28,500/yr → $2,375/mo  (MRA+30, Supplement to 62)
//   62: $95,000 × 32 yr × 1.1% = $33,440/yr → $2,787/mo  (Age 62+20, 1.1% kicker)
function ScenarioCompare({ isMobile }) {
  const col = (heading, sub, badge, monthly, annual, mult, note) => (
    <div style={{ flex: 1, minWidth: 0, padding: isMobile ? '14px 12px' : '16px 18px' }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: MAROON, fontWeight: 600 }}>{heading}</div>
      <div style={{ fontSize: '0.74rem', color: INK_SOFT, marginTop: 3 }}>{sub}</div>
      <div style={{ display: 'inline-block', marginTop: 9, padding: '3px 8px', background: colors.accentPale, border: `1px solid ${rules.brass}`, borderRadius: 5, fontSize: '0.62rem', fontWeight: 600, color: colors.brassDeepInk, lineHeight: 1.3 }}>{badge}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 12 }}>
        <span style={{ fontFamily: FONT_SERIF, fontSize: '1.9rem', fontWeight: 600, color: NAVY, letterSpacing: '-0.02em', ...tnum }}>{monthly}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '0.7rem', color: INK_SOFT }}>/mo</span>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', color: INK_SOFT, marginTop: 4, ...tnum }}>{annual}/yr · {mult}</div>
      <div style={{ fontSize: '0.68rem', color: colors.brassDeepInk, marginTop: 8, minHeight: 26, lineHeight: 1.35 }}>{note}</div>
    </div>
  )
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 440, justifySelf: isMobile ? 'center' : 'end' }}>
      {/* stacked "page" behind */}
      <div style={{ position: 'absolute', inset: 0, transform: 'translate(9px, 11px) rotate(-1.2deg)', background: '#e7ebf3', borderRadius: 8, border: `1px solid ${rules.ink}` }} aria-hidden />
      <div style={{ position: 'relative', background: WHITE, borderRadius: 8, border: `1px solid ${rules.inkStrong}`, boxShadow: elevation.artifact, overflow: 'hidden' }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${BRASS}, ${MAROON})` }} />
        <div style={{ padding: isMobile ? '18px 16px 16px' : '22px 22px 18px' }}>
          {/* header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: INK_FAINT }}>FERS calculator</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.18rem', fontWeight: 600, color: NAVY, marginTop: 2, letterSpacing: '-0.01em' }}>Side by side</div>
            </div>
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: '0.7rem', color: INK_SOFT, marginTop: 8, ...tnum }}>High-3 $95,000 · same employee, two retirement dates</div>

          {/* two scenarios */}
          <div style={{ display: 'flex', marginTop: 12, borderTop: `1px solid ${rules.ink}` }}>
            {col('Retire at 60', 'Age 60 · 30 yr', 'MRA + 30', '$2,375', '$28,500', '1.0%', '+ FERS Supplement until 62')}
            <div style={{ width: 1, background: rules.ink, alignSelf: 'stretch' }} aria-hidden />
            {col('Retire at 62', 'Age 62 · 32 yr', 'Age 62 + 20 · 1.1% kicker', '$2,787', '$33,440', '1.1%', '')}
          </div>

          {/* footer */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${rules.ink}`, fontFamily: FONT_MONO, fontSize: '0.64rem', color: INK_FAINT, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span>Updates live as you type</span>
            <Link to="/calculators/fers" style={{ color: MAROON, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Run yours →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// A miniature of the actual Retirement Summary deliverable — same figures the
// real document leads with ($11,000 working → $7,951 retired, ~72%). Shows
// clients on the homepage exactly what a meeting produces.
function DeliverableArtifact({ isMobile }) {
  const row = (k, v) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0' }}>
      <span style={{ fontSize: '0.84rem', color: INK_SOFT }}>{k}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: '0.88rem', fontWeight: 600, color: INK, ...tnum }}>{v}</span>
    </div>
  )
  return (
    <div style={{ position: 'relative', justifySelf: isMobile ? 'center' : 'end', width: '100%', maxWidth: 400 }}>
      <div style={{ position: 'absolute', inset: 0, transform: 'translate(10px, 12px) rotate(1.3deg)', background: '#e7ebf3', borderRadius: 8, border: `1px solid ${rules.ink}` }} aria-hidden />
      <div style={{ position: 'relative', background: WHITE, borderRadius: 8, border: `1px solid ${rules.inkStrong}`, boxShadow: elevation.artifact, overflow: 'hidden' }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${MAROON}, ${BRASS})` }} />
        <div style={{ padding: isMobile ? '20px 20px 18px' : '24px 24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: '0.64rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: INK_FAINT }}>Retirement Summary</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.18rem', fontWeight: 600, color: NAVY, marginTop: 2, letterSpacing: '-0.01em' }}>Prepared for you</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ background: SURFACE, border: `1px solid ${rules.ink}`, borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK_FAINT }}>Working today</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.35rem', fontWeight: 600, color: INK, ...tnum }}>$11,000</div>
            </div>
            <div style={{ background: colors.accentPale, border: `1px solid ${rules.brass}`, borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK_FAINT }}>In retirement</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: '1.35rem', fontWeight: 600, color: NAVY, ...tnum }}>$7,951</div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${rules.ink}` }}>
            {row('Pension', '$3,400')}
            <div style={{ borderTop: `1px solid ${rules.ink}` }} />
            {row('Social Security', '$2,100')}
            <div style={{ borderTop: `1px solid ${rules.ink}` }} />
            {row('TSP income', '$2,901')}
          </div>

          <div style={{ marginTop: 12, fontFamily: FONT_MONO, fontSize: '0.64rem', color: INK_FAINT, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span>Replaces ~72% of take-home</span>
            <span style={{ color: MAROON, fontWeight: 600 }}>PDF or printed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
