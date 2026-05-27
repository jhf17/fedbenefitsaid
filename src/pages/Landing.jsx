import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Seo from '../components/Seo'
import RetirementEligibilityWidget from '../components/RetirementEligibilityWidget'
import AmericanFlag from '../components/AmericanFlag'
import { colors, fonts } from '../constants/theme'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FedBenefitsAid',
    url: 'https://fedbenefitsaid.com',
    logo: 'https://fedbenefitsaid.com/fma-logo.png',
    description:
      'Independent educational platform helping U.S. federal employees navigate FERS, TSP, FEHB, FEGLI, Medicare, and Social Security.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: 'https://fedbenefitsaid.com/consultation',
      availableLanguage: 'English',
    },
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}

const TOOLS = [
  {
    title: 'FERS Pension',
    blurb: 'Build unlimited retirement-date scenarios. Side-by-side pension, supplement, and lifetime totals — for the standard FERS system.',
    href: '/calculators/fers',
    cta: 'Run the calculator',
    status: 'live',
  },
  {
    title: 'CSRS Pension',
    blurb: 'The tiered 1.5/1.75/2.0% formula and 80% cap — built for CSRS retirees, separate from FERS rules.',
    href: '/calculators/csrs',
    cta: 'Run the calculator',
    status: 'live',
  },
  {
    title: 'Special Provisions Pension',
    blurb: 'For LEO, firefighters, ATC, Capitol Police, SS-UD, NMC — the 1.7%/1.0% formula with the 50+20 and any-age+25 paths.',
    href: '/calculators/special',
    cta: 'Run the calculator',
    status: 'live',
  },
  {
    title: 'FEGLI Cost Over Time',
    blurb: 'See exactly how your federal life-insurance premiums change after age 50, 60, 65 — through age 80.',
    href: '/calculators/fegli',
    cta: 'See the chart',
    status: 'live',
  },
  {
    title: 'Retirement Income Gap',
    blurb: 'Pension + Social Security + TSP withdrawals vs your current take-home — net of federal/state tax and FEHB/Medicare. Honest gap math.',
    href: '/calculators/income-gap',
    cta: 'Run the calculator',
    status: 'live',
  },
  {
    title: '"What if…" Coverage',
    blurb: 'What your federal benefits actually pay if you die or become disabled. FEGLI, FERS Survivor, Social Security, FERS Disability — honest math.',
    href: '/calculators/what-if',
    cta: 'Run the calculator',
    status: 'live',
  },
]

const PILLARS = [
  {
    label: 'Always current',
    body:
      'Every figure on this site — FERS multipliers, FEGLI rates, TSP limits, Medicare premiums, COLA — is updated for the current benefit year and cites its government source.',
  },
  {
    label: 'Honest education',
    body:
      'No paywall. No login. No 14-question quiz before you can read anything. The calculators run client-side; nothing leaves your browser unless you choose to share it.',
  },
  {
    label: 'Talk when you\'re ready',
    body:
      'If something a calculator surfaces is worth a real conversation, you can book a free meeting with a Federal Retirement Consultant at Federal Market Associates — phone or video, no set time limit. No pressure. No upsell.',
  },
]

export default function Landing() {
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
        title="FedBenefitsAid — Federal retirement, by the numbers."
        description="Free calculators, current OPM data, and honest education for federal employees — FERS, TSP, FEHB, FEGLI, and Medicare. No signup. No upsell."
        path="/"
        rawTitle
      />
      <OrganizationJsonLd />

      {/* === HERO === */}
      <section
        style={{
          background: `linear-gradient(165deg, ${colors.pineDeep} 0%, ${colors.pine} 55%, ${colors.pineLight} 100%)`,
          color: '#ffffff',
          padding: isMobile ? '64px 20px 80px' : '108px 48px 120px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle texture */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 80% 0%, rgba(176,141,90,0.18) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(176,141,90,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            maxWidth: 1140,
            margin: '0 auto',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.35fr) minmax(0, 1fr)',
            gap: isMobile ? 36 : 48,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(176,141,90,0.18)',
                border: '1px solid rgba(176,141,90,0.4)',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: colors.brassLight,
                marginBottom: 28,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.brassLight, display: 'inline-block' }} />
              Updated April 2026 · Sourced from OPM, IRS, SSA
            </div>

            <h1
              style={{
                fontFamily: FONT_SERIF,
                fontSize: isMobile ? 'clamp(2rem, 9vw, 3rem)' : 'clamp(2.6rem, 5vw, 4.2rem)',
                fontWeight: 600,
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                fontVariationSettings: '"opsz" 144, "SOFT" 50',
                maxWidth: 720,
                marginBottom: 24,
                color: '#ffffff',
              }}
            >
              Your federal retirement,
              <br />
              <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                by the numbers.
              </span>
            </h1>

            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: isMobile ? '1.05rem' : '1.18rem',
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.82)',
                maxWidth: 560,
                marginBottom: 40,
                fontWeight: 400,
              }}
            >
              Free calculators, current government data, and honest education for the choices federal employees make at
              retirement. No signup. No upsell.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link
                to="/calculator"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '15px 28px',
                  background: colors.brass,
                  color: '#ffffff',
                  borderRadius: 10,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  boxShadow: '0 8px 24px rgba(176,141,90,0.32)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.brassDeep
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.brass
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Run the FERS calculator
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/assessment"
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
                Take the readiness check
              </Link>
            </div>
          </div>

          {/* American flag — decorative */}
          <div
            style={{
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'flex-end',
              alignItems: 'center',
              opacity: 0.95,
              marginTop: isMobile ? 8 : 0,
            }}
          >
            <AmericanFlag width={isMobile ? 96 : 144} />
          </div>
        </div>
      </section>

      {/* === TOOLS GRID === */}
      <section
        ref={addReveal}
        className="reveal"
        style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: colors.cream }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ marginBottom: isMobile ? 36 : 56, maxWidth: 720 }}>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: colors.brassDeep,
                marginBottom: 12,
              }}
            >
              The calculators
            </div>
            <h2
              style={{
                fontFamily: FONT_SERIF,
                fontSize: isMobile ? '1.9rem' : '2.6rem',
                fontWeight: 600,
                color: colors.pine,
                lineHeight: 1.12,
                letterSpacing: '-0.015em',
                marginBottom: 14,
                fontVariationSettings: '"opsz" 144, "SOFT" 50',
              }}
            >
              Start with the numbers.
            </h2>
            <p style={{ fontSize: '1.08rem', lineHeight: 1.65, color: colors.slate700, maxWidth: 600 }}>
              Five minutes with a calculator gives you more clarity than an afternoon reading OPM bulletins. Run one, write down what surprised you, then come back for the next.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 20,
            }}
          >
            {TOOLS.map((tool) => (
              <ToolCard key={tool.title} tool={tool} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </section>

      {/* === ELIGIBILITY WIDGET === */}
      <section
        ref={addReveal}
        className="reveal"
        style={{
          padding: isMobile ? '60px 20px' : '96px 48px',
          background: colors.ivory,
          borderTop: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
          borderBottom: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <RetirementEligibilityWidget
            isMobile={isMobile}
            fontSerifOverride={FONT_SERIF}
            fontSansOverride={FONT_SANS}
          />
        </div>
      </section>

      {/* === WHY === */}
      <section
        ref={addReveal}
        className="reveal"
        style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: colors.cream }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: isMobile ? 36 : 64 }}>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: colors.brassDeep,
                marginBottom: 12,
              }}
            >
              Why this site exists
            </div>
            <h2
              style={{
                fontFamily: FONT_SERIF,
                fontSize: isMobile ? '1.9rem' : '2.6rem',
                fontWeight: 600,
                color: colors.pine,
                lineHeight: 1.12,
                letterSpacing: '-0.015em',
                fontVariationSettings: '"opsz" 144, "SOFT" 50',
              }}
            >
              Three things every federal benefits site should be — and rarely is.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? 24 : 36,
            }}
          >
            {PILLARS.map((p, i) => (
              <div
                key={p.label}
                style={{
                  padding: isMobile ? 24 : 32,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
                  boxShadow: '0 1px 3px rgba(20,42,29,0.04)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: colors.brass,
                    marginBottom: 12,
                  }}
                >
                  0{i + 1}
                </div>
                <h3
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    color: colors.pine,
                    marginBottom: 12,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {p.label}
                </h3>
                <p style={{ fontSize: '0.98rem', lineHeight: 1.65, color: colors.slate700 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section
        style={{
          background: `linear-gradient(180deg, ${colors.pine} 0%, ${colors.pineDeep} 100%)`,
          padding: isMobile ? '72px 20px' : '120px 48px',
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: isMobile ? '1.9rem' : '2.8rem',
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: '-0.015em',
              marginBottom: 18,
              color: '#ffffff',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Have a question that needs more than a calculator?
          </h2>
          <p
            style={{
              fontSize: isMobile ? '1.02rem' : '1.15rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.78)',
              marginBottom: 32,
              maxWidth: 600,
              margin: '0 auto 32px',
            }}
          >
            Book a free meeting — phone or video, no set time limit. We'll figure out what you actually need to know — and what's safe to ignore.
          </p>
          <Link
            to="/consultation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 36px',
              background: colors.brass,
              color: '#ffffff',
              borderRadius: 10,
              fontSize: '1.05rem',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.01em',
              boxShadow: '0 12px 32px rgba(176,141,90,0.32)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.brassDeep
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.brass
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Book a meeting
            <span aria-hidden>→</span>
          </Link>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: 18 }}>
            Free · No obligation · Available in most states (excluding CA, NY, AR for product placement)
          </p>
        </div>
      </section>

      {/* Reveal animation styles */}
      <style>{`
        .reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>
    </div>
  )
}

function ToolCard({ tool, isMobile }) {
  const isLive = tool.status === 'live'
  const card = (
    <div
      style={{
        position: 'relative',
        padding: isMobile ? 24 : 32,
        background: '#ffffff',
        borderRadius: 18,
        border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
        boxShadow: '0 1px 3px rgba(20,42,29,0.04)',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isLive ? 1 : 0.78,
      }}
      onMouseEnter={(e) => {
        if (!isLive) return
        e.currentTarget.style.borderColor = colors.brass
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(20,42,29,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(31,61,44,0.08)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(20,42,29,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {!isLive && (
        <span
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            padding: '3px 10px',
            background: colors.brassPale,
            color: colors.brassDeep,
            borderRadius: 999,
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Coming soon
        </span>
      )}
      <h3
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.45rem',
          fontWeight: 600,
          color: colors.pine,
          marginBottom: 12,
          letterSpacing: '-0.01em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        {tool.title}
      </h3>
      <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 22, flex: 1 }}>
        {tool.blurb}
      </p>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.92rem',
          fontWeight: 600,
          color: isLive ? colors.brassDeep : colors.slate500,
        }}
      >
        {tool.cta}
        {isLive && <span aria-hidden>→</span>}
      </div>
    </div>
  )

  if (!isLive) return card
  return (
    <Link to={tool.href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {card}
    </Link>
  )
}
