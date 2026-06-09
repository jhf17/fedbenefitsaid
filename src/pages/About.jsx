import { Link } from 'react-router-dom'
import { useState } from 'react'
import Seo from '../components/Seo'
import { colors, fonts } from '../constants/theme'
import { brand } from '../constants/brand'

const FONT_SERIF = fonts.serif
const FONT_SANS = fonts.sans

const PRIMARY = colors.primary
const PRIMARY_DARK = colors.primaryDark
const PRIMARY_LIGHT = colors.primaryLight
const ACCENT = colors.accent
const ACCENT_DARK = colors.accentDark
const ACCENT_LIGHT = colors.accentLight

// The consultants on the page. Add a member and they appear automatically —
// drop in Kevin's headshot + name when ready (see the commented entry).
const TEAM = [
  {
    name: 'Jack Fitzgerald',
    title: 'Federal Retirement Consultant',
    photo: '/Founder.png',
    bio:
      "Working with federal employees nationwide, I specialize in breaking down the complexities of the federal pension system, Thrift Savings Plan (TSP), and the fragmented nature of federal retirement benefits in a clear, practical way. My approach is rooted in education and analysis. I help clients evaluate trade-offs, understand long-term implications, and approach retirement decisions with clarity and confidence.\n\nI am licensed in Life and Health insurance and hold the FRC designation. I graduated from the University of Connecticut with a degree in Economics and am based in Canton, Connecticut.",
  },
  {
    name: 'Kevin Ferreira',
    title: 'Federal Retirement Consultant',
    photo: '/kevin.jpg',
    bio:
      "Kevin has a way of making the dense parts click and taking the time to understand where you're actually coming from — not just what's on the spreadsheet. He knows the federal benefit rules cold, and he's the one people tend to stay in touch with long after the first call.",
  },
]

export default function About() {
  return (
    <main style={{ minHeight: '100vh', background: colors.cream, fontFamily: FONT_SANS, color: colors.charcoal }}>
      <Seo
        title={`About ${brand.shortName} — Independent federal benefits education`}
        description={`${brand.name} is an independent federal benefits practice. We work with federal employees one at a time on FERS, CSRS, TSP, FEHB, FEGLI, Medicare, and Social Security. The meeting is free.`}
        path="/about"
      />

      {/* HERO */}
      <header
        style={{
          background: `linear-gradient(165deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 55%, ${PRIMARY_LIGHT} 100%)`,
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
            background: `radial-gradient(circle at 88% 12%, ${rgba(ACCENT_LIGHT, 0.18)} 0%, transparent 55%)`,
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
              color: ACCENT_LIGHT,
              marginBottom: 18,
            }}
          >
            About {brand.shortName}
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
              maxWidth: 780,
            }}
          >
            A small practice with{' '}
            <span style={{ color: ACCENT_LIGHT, fontStyle: 'italic', fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              one specialty.
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.85)', maxWidth: 660, marginBottom: 14 }}>
            We work with federal employees, one at a time, on the parts of retirement the government doesn't make easy.
            FERS, CSRS, TSP, FEHB, FEGLI, Medicare, Social Security. That is our entire job.
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', maxWidth: 660 }}>
            If you don't work for the U.S. government, we are probably not the right people to help you. If you do, the
            calculators on this site are free, the library is free, and the meeting is free.
          </p>
        </div>
      </header>

      {/* WHAT YOU'LL FIND HERE */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px 16px' }}>
        <SectionHeader eyebrow="On this site" title="Two ways to use it." />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 18,
          }}
        >
          <OfferCard
            label="Calculators"
            title="Run the numbers."
            body="FERS pension scenarios, CSRS, special provisions, FEGLI costs through age 80, the full retirement income picture. Same calculators we use in consultations."
            href="/calculators"
            cta="Open the calculators"
          />
          <OfferCard
            label="Library"
            title="Look up the rules."
            body="Eleven topic areas, every figure cited to OPM, IRS, SSA, CMS, or TSP. Updated each benefit year so 2026 is actually 2026."
            href="/reference"
            cta="Open the library"
          />
        </div>
      </section>

      {/* WHY THE MEETING IS FREE — business model honesty */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '64px 24px 24px' }}>
        <SectionHeader eyebrow="What we charge" title="The meeting is free. Here is why." />
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${colors.primaryBorder}`,
            borderRadius: 18,
            padding: '32px 36px',
            boxShadow: '0 4px 20px rgba(20,30,55,0.05)',
          }}
        >
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 18 }}>
            Every consultant at {brand.shortName} is also licensed in life and health insurance. When a product is the
            right fit for someone we are working with and they want our help placing it, the insurance carrier pays the
            commission. That is how the practice covers its costs.
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 18 }}>
            What that means in practice: most conversations are pure education. You bring a question about FEHB and
            Medicare timing, or your FERS Supplement, or whether to keep FEGLI past 65, and we walk through the answer.
            Nothing follows. We have spent the last week doing exactly that and will spend the next week doing it again.
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 18 }}>
            When something more does fit — usually a gap in income replacement, survivor coverage, or what FEGLI does
            to your monthly cost after retirement — we can show you what private alternatives look like alongside your
            federal package. If they don't beat what you already have, we'll tell you that on the call.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            <Bullet>No time limit on the meeting. Some run 30 minutes. Some run 90. Whatever the question needs.</Bullet>
            <Bullet>No second-meeting expectation if the first wasn't useful.</Bullet>
            <Bullet>If we can't add value, we'll point you back at the library or the calculators and let you go.</Bullet>
            <Bullet>Insurance and annuity products aren't available in California, New York, or Arkansas. The education
            side is open to everyone in U.S. federal service.</Bullet>
          </ul>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '40px 24px 24px' }}>
        <SectionHeader eyebrow="The team" title="Who you'll work with." />
        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: colors.slate700, marginBottom: 30, maxWidth: 780 }}>
          {brand.name} exists because we kept watching federal employees make decisions they didn't have to make. The
          FERS Supplement surrendered for the wrong reason. FEGLI premiums that double at 60 and again at 65 with no
          warning. Medicare Part B delayed on a break-room rumor and penalized for life. The official sources are
          accurate — they're also scattered across four agencies and written for attorneys. So we built this site as
          the version we wished existed: the 2026 figures correct, every rule cited to OPM and the IRS, and the
          calculators showing their work. Book a meeting and you'll talk to one of us — phone or Zoom, your call, no
          agenda you didn't bring.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: TEAM.length > 1 ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
            gap: 20,
          }}
        >
          {TEAM.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      {/* COMPLIANCE */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px 32px' }}>
        <div
          style={{
            background: colors.accentPale,
            border: `1px solid ${colors.accentBorder}`,
            borderRadius: 12,
            padding: '20px 24px',
          }}
        >
          <h3
            style={{
              fontFamily: FONT_SERIF,
              fontSize: '1.05rem',
              fontWeight: 700,
              color: ACCENT_DARK,
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}
          >
            Not affiliated with the U.S. government.
          </h3>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: colors.slate700, marginBottom: 8 }}>
            {brand.name} is independent. We are not affiliated with, endorsed by, or authorized to speak on behalf of
            the Office of Personnel Management, the federal government, or any agency. Every figure quoted on this site
            cites a primary government source.
          </p>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: colors.slate500 }}>
            Insurance and annuity products discussed in consultations are not available in California, New York, or
            Arkansas. Nothing on this site is personalized financial, tax, or legal advice.
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
              color: PRIMARY,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              marginBottom: 14,
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            Have a question?
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: colors.slate700, marginBottom: 28 }}>
            Most of what people ask has a clear answer, and most of it doesn't need a meeting. If yours does, the
            meeting is free.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to="/consultation"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '15px 32px',
                background: ACCENT,
                color: '#ffffff',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: `0 8px 24px ${rgba(ACCENT, 0.32)}`,
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ACCENT_DARK
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = ACCENT
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
                color: PRIMARY,
                border: `1px solid ${PRIMARY}`,
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

    </main>
  )
}

function TeamCard({ member }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = member.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${colors.primaryBorder}`,
        borderRadius: 18,
        padding: '30px 30px 32px',
        boxShadow: '0 6px 24px rgba(20,30,55,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          background: `linear-gradient(135deg, ${PRIMARY_LIGHT}, ${PRIMARY_DARK})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: FONT_SERIF,
          fontSize: '2rem',
          fontWeight: 600,
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
          boxShadow: '0 12px 32px rgba(15,29,61,0.22)',
          border: `3px solid ${ACCENT}`,
          marginBottom: 20,
        }}
        aria-label={member.name}
      >
        {member.photo && !imgFailed ? (
          <img
            src={member.photo}
            alt={`${member.name}, ${brand.shortName}`}
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          initials
        )}
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: '1.4rem',
          fontWeight: 600,
          color: PRIMARY,
          letterSpacing: '-0.01em',
          marginBottom: 4,
          fontVariationSettings: '"opsz" 144, "SOFT" 50',
        }}
      >
        {member.name}
      </div>
      <div
        style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: ACCENT_DARK,
          marginBottom: 16,
        }}
      >
        {member.title} · {brand.shortName}
      </div>
      {member.bio.split('\n\n').map((para, i) => (
        <p key={i} style={{ fontSize: '0.97rem', lineHeight: 1.66, color: colors.slate700, margin: i === 0 ? 0 : '14px 0 0' }}>{para}</p>
      ))}
    </div>
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
          color: ACCENT_DARK,
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
          color: PRIMARY,
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
          background: ACCENT,
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
        border: `1px solid ${colors.primaryBorder}`,
        borderRadius: 14,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 12px rgba(20,30,55,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,30,55,0.08)'
        e.currentTarget.style.borderColor = colors.accentBorder
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(20,30,55,0.04)'
        e.currentTarget.style.borderColor = colors.primaryBorder
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ACCENT_DARK,
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
          color: PRIMARY,
          marginBottom: 8,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.92rem', lineHeight: 1.55, color: colors.slate700, marginBottom: 12, flex: 1 }}>{body}</p>
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: ACCENT_DARK, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {cta} <span aria-hidden>→</span>
      </span>
    </Link>
  )
}

function rgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
