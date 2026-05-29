import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { brand } from '../constants/brand'
import { DATA_LAST_UPDATED } from '../config/site'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

// Brand-pulled palette
const NAVY = brand.colors.primary
const NAVY_DARK = brand.colors.primaryDark
const NAVY_LIGHT = brand.colors.primaryLight
const MAROON = brand.colors.accent
const MAROON_LIGHT = brand.colors.accentLight

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

// Benefit topics we educate on — each links to the most relevant page in the shared app
const TOPICS = [
  { name: 'FERS', sub: 'Pension formula, MRA, supplement', href: '/calculators/fers' },
  { name: 'CSRS', sub: '1.5/1.75/2.0% multipliers, 80% cap', href: '/calculators/csrs' },
  { name: 'TSP', sub: 'Contribution limits, withdrawal options', href: '/reference' },
  { name: 'Social Security', sub: 'Bend points, WEP/GPO context', href: '/reference' },
  { name: 'FEHB', sub: 'Carrying coverage into retirement', href: '/reference' },
  { name: 'FEGLI', sub: 'Premiums by age, basic + optional', href: '/calculators/fegli' },
  { name: 'Medicare', sub: 'Part A/B/D, IRMAA, FEHB coordination', href: '/reference' },
  { name: 'Special Provisions', sub: 'LEO, FF, ATC, USSS — 1.7% formula', href: '/calculators/special' },
]

const APPROACH = [
  {
    n: '01',
    title: 'Educate first',
    body:
      'We walk through your benefits using current government data — OPM, IRS, SSA, TSP. You leave the first conversation knowing how your benefits actually work.',
  },
  {
    n: '02',
    title: 'Answer the questions you have',
    body:
      'Bring the questions you have not been able to get a straight answer to. We will not pretend to know what we don\'t — and we will not lecture you about products.',
  },
  {
    n: '03',
    title: 'Help only if you ask',
    body:
      'If education surfaces something worth acting on, we will tell you. If you want help comparing private alternatives, we can do that too — only when you ask.',
  },
]

// Concrete services FMA offers — shown right after the hero.
const SERVICES = [
  {
    eyebrow: 'For individuals',
    title: 'Free 1-on-1 consultations',
    body:
      'Phone or video. No time limit, no sales pitch. A Federal Retirement Consultant walks through your FERS or CSRS pension, TSP withdrawal options, FEHB + Medicare coordination, Social Security timing, and FEGLI cost curves — at your career stage.',
    bullets: [
      'Phone or Zoom — your choice',
      'No prep required',
      'No obligation, no upsell',
    ],
    cta: { to: '/consultation', label: 'Book a consultation' },
  },
  {
    eyebrow: 'For everyone',
    title: 'Free calculators & reference library',
    body:
      'Run your own numbers. Side-by-side retirement scenarios, FEGLI premium curves through age 80, retirement income picture, "what if" coverage. Plus a current-year benefits library updated for 2026 OPM, IRS, and SSA figures.',
    bullets: [
      'No signup. No login.',
      'Math runs in your browser',
      'Every figure cites its source',
    ],
    cta: { to: '/calculators', label: 'Open the calculators' },
  },
  {
    eyebrow: 'For agencies',
    title: 'On-site benefits education',
    body:
      'Bring a Federal Retirement Consultant to your HR team or workforce. On-site or virtual benefits briefings tailored to career stage — entry, mid-career, and pre-retirement. Built to support (not replace) your benefits office.',
    bullets: [
      'On-site or virtual delivery',
      'Career-stage curricula',
      'CAGE code in progress',
    ],
    cta: { to: '/consultation', label: 'Request a briefing' },
  },
]

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
      { threshold: 0.05 }
    )
    revealRefs.current.forEach((el) => el && observer.observe(el))
    return () => revealRefs.current.forEach((el) => el && observer.unobserve(el))
  }, [])

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  return (
    <div style={{ fontFamily: FONT_SANS, color: colors.charcoal, background: colors.cream, overflowX: 'hidden' }}>
      <Seo
        title="Federal Market Associates — Independent federal benefits education"
        description={brand.description}
        path="/"
        rawTitle
      />
      <OrganizationJsonLd />

      {/* === HERO === */}
      <section
        style={{
          background: `linear-gradient(165deg, ${NAVY_DARK} 0%, ${NAVY} 55%, ${NAVY_LIGHT} 100%)`,
          color: '#ffffff',
          padding: isMobile ? '56px 20px 72px' : '96px 48px 112px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.35fr) minmax(0, 1fr)',
            gap: isMobile ? 32 : 56,
            alignItems: 'center',
          }}
        >
          {/* Left: text */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 14px',
                borderRadius: 999,
                background: `rgba(123, 28, 46, 0.18)`,
                border: `1px solid rgba(163, 51, 74, 0.45)`,
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#ffffff',
                marginBottom: 28,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: MAROON_LIGHT, display: 'inline-block' }} />
              Independent education · Updated {formatLastUpdated(DATA_LAST_UPDATED)}
            </div>

            <h1
              style={{
                fontFamily: FONT_SERIF,
                fontSize: isMobile ? 'clamp(2rem, 9vw, 3rem)' : 'clamp(2.4rem, 4.6vw, 3.9rem)',
                fontWeight: 600,
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                fontVariationSettings: '"opsz" 144, "SOFT" 50',
                maxWidth: 720,
                marginBottom: 22,
                color: '#ffffff',
              }}
            >
              Federal benefits,
              <br />
              <span style={{ color: MAROON_LIGHT, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                explained.
              </span>
            </h1>

            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: isMobile ? '1.05rem' : '1.16rem',
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.82)',
                maxWidth: 580,
                marginBottom: 36,
                fontWeight: 400,
              }}
            >
              Independent federal benefits education and 1-on-1 advisory for federal employees — and on-site briefings
              for the agencies that serve them. Free calculators. No signup. No pressure.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link
                to="/consultation"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '15px 28px',
                  background: MAROON,
                  color: '#ffffff',
                  borderRadius: 10,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  boxShadow: '0 8px 24px rgba(123, 28, 46, 0.32)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = brand.colors.accentDark
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = MAROON
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Book a free consultation
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/calculators"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '15px 28px',
                  background: 'transparent',
                  color: '#ffffff',
                  borderRadius: 10,
                  fontSize: '1rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.35)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                }}
              >
                Try the free calculators
              </Link>
            </div>
          </div>

          {/* Right: FMA brand panel — cream card with prominent logo */}
          <div
            style={{
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'flex-end',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 18,
                padding: isMobile ? '28px 24px' : '36px 28px',
                width: isMobile ? '100%' : '100%',
                maxWidth: isMobile ? 320 : 360,
                boxShadow: '0 18px 48px rgba(15, 29, 61, 0.32)',
                border: '1px solid rgba(212, 184, 138, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18,
              }}
            >
              <img
                src="/fma-logo.png"
                alt="Federal Market Associates"
                style={{
                  width: '100%',
                  maxWidth: 260,
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: NAVY,
                  textAlign: 'center',
                }}
              >
                Federal Market Associates
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: '0.82rem',
                  color: '#475569',
                  textAlign: 'center',
                  lineHeight: 1.5,
                  borderTop: `1px solid rgba(26,45,92,0.1)`,
                  paddingTop: 14,
                }}
              >
                Independent federal benefits education
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === OUR SERVICES === */}
      <section
        ref={addReveal}
        className="reveal"
        style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: '#ffffff' }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ marginBottom: isMobile ? 36 : 56, maxWidth: 760 }}>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: MAROON,
                marginBottom: 14,
              }}
            >
              What we do
            </div>
            <h2
              style={{
                fontFamily: FONT_SERIF,
                fontSize: isMobile ? '1.9rem' : '2.6rem',
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: NAVY,
                margin: 0,
              }}
            >
              Three ways FMA helps with federal benefits.
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.6, marginTop: 16, fontSize: '1.02rem' }}>
              All free. All education-first. Use one or all three — they work together.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? 18 : 22,
            }}
          >
            {SERVICES.map((s, i) => (
              <article
                key={s.title}
                style={{
                  background: '#ffffff',
                  border: `1px solid ${hexToRgba(NAVY, 0.1)}`,
                  borderRadius: 16,
                  padding: isMobile ? 22 : 28,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Brass-toned accent number */}
                <div
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: MAROON,
                    marginBottom: 8,
                  }}
                >
                  0{i + 1}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    marginBottom: 10,
                  }}
                >
                  {s.eyebrow}
                </div>
                <h3
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: isMobile ? '1.32rem' : '1.45rem',
                    fontWeight: 600,
                    lineHeight: 1.18,
                    color: NAVY,
                    marginBottom: 14,
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.94rem', marginBottom: 16 }}>{s.body}</p>
                <ul style={{ listStyle: 'none', margin: 0, marginBottom: 22, padding: 0 }}>
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 10,
                        color: '#1f2937',
                        fontSize: '0.9rem',
                        padding: '4px 0',
                      }}
                    >
                      <span style={{ color: MAROON, fontWeight: 700, fontSize: '1.05rem', lineHeight: 1 }}>·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 'auto' }}>
                  <Link
                    to={s.cta.to}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: NAVY,
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      borderBottom: `1px solid ${hexToRgba(NAVY, 0.2)}`,
                      paddingBottom: 2,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = NAVY }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = hexToRgba(NAVY, 0.2) }}
                  >
                    {s.cta.label}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* === WHAT WE COVER === */}
      <section
        ref={addReveal}
        className="reveal"
        style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: '#ffffff' }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ marginBottom: isMobile ? 36 : 56, maxWidth: 720 }}>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: MAROON,
                marginBottom: 14,
              }}
            >
              What we cover
            </div>
            <h2
              style={{
                fontFamily: FONT_SERIF,
                fontSize: isMobile ? '1.9rem' : '2.6rem',
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: NAVY,
                margin: 0,
              }}
            >
              The full federal benefits picture.
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.6, marginTop: 16, fontSize: '1.02rem' }}>
              Click any topic to start with the calculator or the reference library — both free, no signup.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: isMobile ? 12 : 16,
            }}
          >
            {TOPICS.map((t) => (
              <Link
                key={t.name}
                to={t.href}
                style={{
                  display: 'block',
                  padding: isMobile ? '18px 16px' : '22px 20px',
                  borderRadius: 12,
                  background: colors.cream,
                  border: `1px solid ${hexToRgba(NAVY, 0.08)}`,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = hexToRgba(MAROON, 0.4)
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(20,42,29,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = hexToRgba(NAVY, 0.08)
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SERIF,
                    fontWeight: 600,
                    fontSize: '1.18rem',
                    color: NAVY,
                    marginBottom: 6,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {t.name}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>{t.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === HOW WE WORK === */}
      <section
        ref={addReveal}
        className="reveal"
        style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: colors.cream }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ marginBottom: isMobile ? 36 : 56, maxWidth: 720 }}>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: MAROON,
                marginBottom: 14,
              }}
            >
              How we work
            </div>
            <h2
              style={{
                fontFamily: FONT_SERIF,
                fontSize: isMobile ? '1.9rem' : '2.6rem',
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: NAVY,
                margin: 0,
              }}
            >
              Education first. Always.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? 24 : 32,
            }}
          >
            {APPROACH.map((a) => (
              <div key={a.n}>
                <div
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: '2.4rem',
                    fontWeight: 600,
                    color: MAROON,
                    lineHeight: 1,
                    marginBottom: 12,
                    fontVariationSettings: '"opsz" 144, "SOFT" 50',
                  }}
                >
                  {a.n}
                </div>
                <h3
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: '1.32rem',
                    fontWeight: 600,
                    color: NAVY,
                    marginBottom: 12,
                    lineHeight: 1.25,
                  }}
                >
                  {a.title}
                </h3>
                <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.96rem' }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section
        ref={addReveal}
        className="reveal"
        style={{
          padding: isMobile ? '72px 20px' : '108px 48px',
          background: `linear-gradient(165deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`,
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: isMobile ? '2rem' : '2.8rem',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.015em',
              marginBottom: 18,
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Ready to ask the questions you have been holding?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: isMobile ? '1.02rem' : '1.16rem',
              lineHeight: 1.55,
              marginBottom: 36,
              maxWidth: 640,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Free consultation. No sales pitch. Schedule a phone or video call with a Federal Retirement Consultant.
          </p>
          <Link
            to="/consultation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 32px',
              background: MAROON,
              color: '#ffffff',
              borderRadius: 10,
              fontSize: '1.04rem',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.01em',
              boxShadow: '0 8px 24px rgba(123, 28, 46, 0.32)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = brand.colors.accentDark
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = MAROON
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Book a free consultation
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

// ===== utilities (local) =====
function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function formatLastUpdated(yyyyDashMm) {
  if (!yyyyDashMm) return ''
  const [y, m] = yyyyDashMm.split('-')
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const monthIdx = Math.max(0, Math.min(11, parseInt(m, 10) - 1))
  return `${months[monthIdx]} ${y}`
}
