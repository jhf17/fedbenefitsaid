import { Link } from 'react-router-dom'
import { useState } from 'react'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const PRINCIPLES = [
  {
    title: 'Education first.',
    body: 'You should be able to make sense of FERS, TSP, FEHB, FEGLI, and Medicare without booking a call. The site is built so the calculators and library are enough for most decisions. The call is for the cases where they aren\'t.',
  },
  {
    title: 'Numbers we can defend.',
    body: 'Every figure on this site cites a primary government source — OPM, IRS, SSA, CMS, FRTIB. When the rules change at year-end, the figures get updated and the "last updated" date moves with them.',
  },
  {
    title: 'No quiet conflicts.',
    body: 'You\'re not an account. You don\'t get auto-enrolled in anything. We don\'t store your calculator inputs, and the only way you\'ll hear from us after a call is if you ask us to follow up.',
  },
]

export default function About() {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="About FedBenefitsAid — Federal Market Associates"
        description="FedBenefitsAid is the public education arm of Federal Market Associates — a practice focused on helping federal employees understand FERS, TSP, FEHB, FEGLI, and Medicare. Free tools. Honest answers."
        path="/about"
      />

      {/* HERO */}
      <header
        style={{
          background: `linear-gradient(165deg, ${colors.pineDeep} 0%, ${colors.pine} 55%, ${colors.pineLight} 100%)`,
          color: '#ffffff',
          padding: '88px 24px 96px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 90% 10%, rgba(176,141,90,0.18) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: colors.brassLight,
              marginBottom: 18,
            }}
          >
            About
          </div>
          <h1
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              marginBottom: 22,
              maxWidth: 720,
            }}
          >
            An education-first practice <br />
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              for federal employees.
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 640 }}>
            FedBenefitsAid is the public face of Federal Market Associates — a practice focused on helping U.S.
            federal employees understand the benefits they've earned. The site is free. The calculators are free. The
            15-minute call is free.
          </p>
        </div>
      </header>

      {/* FOUNDER CARD */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '64px 24px 32px' }}>
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
            borderRadius: 20,
            padding: '40px',
            boxShadow: '0 8px 32px rgba(20,42,29,0.06)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 36,
            alignItems: 'center',
          }}
          className="founder-card"
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              background: `linear-gradient(135deg, ${colors.sage}, ${colors.pine})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontFamily: FONT_SERIF,
              fontSize: '2.6rem',
              fontWeight: 600,
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              boxShadow: '0 12px 32px rgba(31,61,44,0.18)',
              border: `3px solid ${colors.brass}`,
            }}
            aria-label="Jack Fitzgerald"
          >
            {!imgFailed ? (
              <img
                src="/founder.jpg"
                alt="Jack Fitzgerald, Federal Market Associates"
                onError={() => setImgFailed(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              'JF'
            )}
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontSize: '1.6rem',
                fontWeight: 600,
                color: colors.pine,
                marginBottom: 4,
                letterSpacing: '-0.01em',
                fontVariationSettings: '"opsz" 144, "SOFT" 50',
              }}
            >
              Jack Fitzgerald
            </div>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: colors.brassDeep,
                marginBottom: 14,
              }}
            >
              Federal Market Associates
            </div>
            <p style={{ fontSize: '1rem', lineHeight: 1.65, color: colors.slate700, marginBottom: 14 }}>
              I work with federal employees full time — from young hires through career retirees and surviving spouses
              — on the parts of FERS, TSP, FEHB, FEGLI, and Medicare that nobody quite explains in onboarding. The
              calculators on this site are the same ones I use on calls, just stripped down so anyone can run them.
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: colors.slate500 }}>
              When you book a call, you'll talk to me — not a queue, not an intake coordinator. The first 15 minutes are
              free; if you decide you want a longer conversation, we'll schedule one. If you don't, the calculators are
              still here.
            </p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '36px 24px 48px' }}>
        <div style={{ marginBottom: 32 }}>
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
            How we work
          </div>
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: '2rem',
              fontWeight: 600,
              color: colors.pine,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Three principles, no fine print.
          </h2>
        </div>
        <div style={{ display: 'grid', gap: 20 }}>
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: 28,
                border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
                display: 'grid',
                gridTemplateColumns: '52px 1fr',
                gap: 20,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: colors.sagePale,
                  color: colors.pine,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT_SERIF,
                  fontWeight: 600,
                  fontSize: '1.3rem',
                  fontVariationSettings: '"opsz" 144, "SOFT" 50',
                }}
              >
                0{i + 1}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: colors.pine,
                    marginBottom: 8,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {p.title}
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: 1.65, color: colors.slate700 }}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPLIANCE BOX */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '24px 24px 32px' }}>
        <div
          style={{
            background: colors.brassPale,
            border: `1px solid ${colors.brass}`,
            borderRadius: 12,
            padding: '20px 24px',
          }}
        >
          <h3
            style={{
              fontFamily: FONT_SERIF,
              fontSize: '1.05rem',
              fontWeight: 700,
              color: colors.brassDeep,
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}
          >
            Not affiliated with the U.S. government
          </h3>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: colors.slate700, marginBottom: 8 }}>
            FedBenefitsAid and Federal Market Associates are independent. We are <strong>not affiliated with, endorsed
            by, or authorized to speak on behalf of</strong> the U.S. Office of Personnel Management (OPM), the federal
            government, or any agency. Every figure quoted on this site cites its primary government source.
          </p>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: colors.slate500 }}>
            Insurance and annuity products discussed during consultations are not available in California, New York, or
            Arkansas. Information here does not constitute personalized financial, tax, or legal advice.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: `linear-gradient(180deg, ${colors.cream} 0%, ${colors.bone} 100%)`,
          padding: '72px 24px 96px',
          marginTop: 32,
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: '2rem',
              fontWeight: 600,
              color: colors.pine,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              marginBottom: 14,
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Ready when you are.
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 28 }}>
            Have a question that needs more than a calculator? Book a free 15-minute call.
          </p>
          <Link
            to="/consultation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '15px 32px',
              background: colors.brass,
              color: '#ffffff',
              borderRadius: 10,
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(176,141,90,0.32)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
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
            Book a 15-minute call
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .founder-card {
            grid-template-columns: 1fr !important;
            text-align: center;
            padding: 28px !important;
          }
          .founder-card > div:first-child {
            margin: 0 auto;
          }
        }
      `}</style>
    </main>
  )
}
