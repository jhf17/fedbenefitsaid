import { Link } from 'react-router-dom'
import { useState } from 'react'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

export default function About() {
  const [imgFailed, setImgFailed] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title="About FedBenefitsAid — A free education resource for federal employees"
        description="FedBenefitsAid is a free, education-first resource built to help federal employees understand FERS, TSP, FEHB, FEGLI, Medicare, and retirement eligibility. Built and maintained by Jack Fitzgerald, a Federal Retirement Consultant with Federal Market Associates."
        path="/about"
      />

      {/* HERO — education-first positioning */}
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
            background: 'radial-gradient(circle at 90% 10%, rgba(176,141,90,0.18) 0%, transparent 55%)',
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
            About FedBenefitsAid
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
              maxWidth: 760,
            }}
          >
            A go-to education resource{' '}
            <span style={{ color: colors.brassLight, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              for federal employees.
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.85)', maxWidth: 680, marginBottom: 12 }}>
            FedBenefitsAid is a free, education-first website built to help federal employees make sense of their benefits and retirement eligibility — FERS, TSP, FEHB, FEGLI, Medicare, Social Security, and survivor coverage, all in one place.
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', maxWidth: 680 }}>
            The calculators are free. The reference library is free. The meeting is free. We made the site so anyone in federal service could answer most of their own questions without picking up the phone.
          </p>
        </div>
      </header>

      {/* WHAT YOU'LL FIND HERE — quick orientation strip */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
          }}
        >
          <OfferCard
            label="Calculators"
            title="Run the numbers"
            body="FERS pension, FEGLI cost-over-time, full income picture, retirement what-ifs. The same tools we use on consultations, free for everyone."
            href="/calculators"
            cta="Open calculators"
          />
          <OfferCard
            label="Reference"
            title="Look up the rules"
            body="Eleven topic areas — every figure cited to OPM, IRS, SSA, CMS, or TSP. Updated each benefit year."
            href="/reference"
            cta="Open the library"
          />
          <OfferCard
            label="Assessment"
            title="Find what fits your question"
            body="Tell us what you're trying to figure out and we'll point you to the right calculator, the right library section, or a free meeting."
            href="/assessment"
            cta="Start the assessment"
          />
        </div>
      </section>

      {/* SECTION: Who you'll meet with (FMA + FRC) */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '64px 24px 24px' }}>
        <SectionHeader eyebrow="If you book a meeting" title="Who you'll be meeting with." />
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
            borderRadius: 18,
            padding: '32px 36px',
            boxShadow: '0 4px 20px rgba(20,42,29,0.05)',
            marginBottom: 20,
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            gap: 32,
            alignItems: 'center',
          }}
          className="fma-card"
        >
          <div
            style={{
              width: 180,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {!logoFailed ? (
              <img
                src="/fma-logo.png"
                alt="Federal Market Associates"
                onError={() => setLogoFailed(true)}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  fontFamily: FONT_SERIF,
                  fontWeight: 700,
                  fontSize: '2rem',
                  color: colors.pine,
                  letterSpacing: '-0.02em',
                }}
              >
                FMA
              </div>
            )}
          </div>
          <div>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 14 }}>
              When you book a meeting through this site, you'll be meeting with a <strong>Federal Retirement Consultant (FRC) with Federal Market Associates</strong>. That's the practice behind FedBenefitsAid.
            </p>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 14 }}>
              <strong>Federal Market Associates (FMA)</strong> is an education-focused company that works exclusively with federal employees — walking through FERS pensions, TSP, FEHB, FEGLI, Medicare timing, and the rest of the federal retirement picture so the decisions you face feel less like a black box.
            </p>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: colors.slate500, marginBottom: 0 }}>
              Every FRC at FMA specializes in the federal benefits system — the same rules, the same OPM forms, the same Medicare and FEHB interactions you'll find on this site.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Why the meeting is free */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '16px 24px 24px' }}>
        <SectionHeader eyebrow="No cost, no time limit, no pressure" title="Why the meeting is free." />
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
            borderRadius: 18,
            padding: '32px 36px',
            boxShadow: '0 4px 20px rgba(20,42,29,0.05)',
          }}
        >
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 18 }}>
            Every Federal Retirement Consultant at Federal Market Associates is also <strong>licensed in life and health insurance</strong>. That's how the practice gets paid — when a product is placed, FMA is compensated by the insurance carrier, not by you.
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 18 }}>
            So why is the meeting free? Because we'd rather earn your trust through honest education than through a sales pitch. Most federal employees come in with a question (or three) about their pension, FEGLI, FEHB-and-Medicare timing, or TSP withdrawals — and most of those questions have answers that don't involve buying anything. We walk through them anyway.
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 18 }}>
            Where a product <em>does</em> fit — typically when there's a real gap in income replacement, survivor coverage, long-term care, or what FEGLI premiums will do at 65 — we're equipped to show you how that product interacts with your federal benefits, and we'd be glad to be the one to place it. If it doesn't fit, we say so on the call.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            <Bullet>The meeting is always free. There's no set time limit and no per-session billing.</Bullet>
            <Bullet>If we can't add value, we'll say so on the call and point you back to the calculators or library.</Bullet>
            <Bullet>If a product fits and you want to look at it, we'll show you how it interacts with your federal benefits. If it doesn't, nothing follows.</Bullet>
            <Bullet>Insurance and annuity products are not available in California, New York, or Arkansas. The education side of the site is open to everyone.</Bullet>
          </ul>
        </div>
      </section>

      {/* SECTION: About Jack — founder's story */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 24px' }}>
        <SectionHeader eyebrow="Built by a practitioner" title="Why I made this site." />
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
            borderRadius: 20,
            padding: '40px',
            boxShadow: '0 8px 32px rgba(20,42,29,0.06)',
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            gap: 36,
            alignItems: 'flex-start',
          }}
          className="founder-card"
        >
          <div
            style={{
              width: 180,
              height: 180,
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
                alt="Jack Fitzgerald, Federal Retirement Consultant at Federal Market Associates"
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
              Founder · Federal Retirement Consultant · Federal Market Associates
            </div>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 14 }}>
              I built FedBenefitsAid because I kept seeing the same misconceptions over and over — about how the FERS Supplement actually works, what happens to FEGLI premiums at 65, whether to enroll in Medicare Part B, when MRA matters and when it doesn't. The official sources are accurate but scattered. The unofficial ones are clean-looking and usually wrong.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 14 }}>
              The site started as something I made for myself — a place where the 2026 figures were correct, the rules cited their primary sources, and the calculators showed their work. Once it existed, I realized it doubled as the cleanest possible reference to send my own clients between meetings. So I made it public.
            </p>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.65, color: colors.slate500 }}>
              If you book a meeting, you'll talk to me or another FRC at FMA — your choice of phone or video, your choice of how long the conversation runs. Free, with no second-meeting expectation if it isn't useful.
            </p>
          </div>
        </div>
      </section>

      {/* COMPLIANCE BOX */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px 32px' }}>
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
            FedBenefitsAid and Federal Market Associates are independent. We are <strong>not affiliated with, endorsed by, or authorized to speak on behalf of</strong> the U.S. Office of Personnel Management (OPM), the federal government, or any agency. Every figure quoted on this site cites its primary government source.
          </p>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: colors.slate500 }}>
            Insurance and annuity products discussed during consultations are not available in California, New York, or Arkansas. Information on this site is for education and does not constitute personalized financial, tax, or legal advice.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: `linear-gradient(180deg, ${colors.cream} 0%, ${colors.bone} 100%)`,
          padding: '72px 24px 96px',
          marginTop: 16,
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
            Have a question that needs more than a calculator? Book a free meeting — phone or video, no agenda you didn't bring.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
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
              Book a meeting
              <span aria-hidden>→</span>
            </Link>
            <Link
              to="/calculators"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '15px 32px',
                background: 'transparent',
                color: colors.pine,
                border: `1px solid ${colors.pine}`,
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              Browse the calculators
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .founder-card, .fma-card {
            grid-template-columns: 1fr !important;
            text-align: center;
            padding: 28px !important;
          }
          .founder-card > div:first-child, .fma-card > div:first-child {
            margin: 0 auto;
          }
        }
      `}</style>
    </main>
  )
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: colors.brassDeep,
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)',
          fontWeight: 600,
          color: colors.pine,
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        {title}
      </h2>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: '0.98rem', lineHeight: 1.6, color: colors.slate700 }}>
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: colors.brass,
          marginTop: 8,
        }}
      />
      <span>{children}</span>
    </li>
  )
}

function OfferCard({ label, title, body, href, cta }) {
  return (
    <Link
      to={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 24px',
        background: '#ffffff',
        border: `1px solid ${colors.borderSubtle || 'rgba(31,61,44,0.08)'}`,
        borderRadius: 14,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 12px rgba(20,42,29,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,42,29,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(20,42,29,0.04)'
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: colors.brassDeep,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <h3
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.15rem',
          fontWeight: 600,
          color: colors.pine,
          marginBottom: 8,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.92rem', lineHeight: 1.55, color: colors.slate700, marginBottom: 12, flex: 1 }}>{body}</p>
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.brassDeep, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {cta} <span aria-hidden>→</span>
      </span>
    </Link>
  )
}
