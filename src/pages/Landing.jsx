import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const colors = {
  navy: '#0f172a',
  navyMid: '#1e3a5f',
  maroon: '#7b1c2e',
  cream: '#faf9f6',
  white: '#ffffff',
  gray50: '#f8f7f4',
  gray100: '#f1f0ed',
  gray300: '#cbd5e1',
  gray400: '#64748b',
  gray600: '#475569',
  gray800: '#1e293b',
};

const goldGradient = 'linear-gradient(135deg, #b8860b 0%, #daa520 25%, #f5d77a 45%, #daa520 55%, #b8860b 75%, #cd950c 100%)';
const fontSerif = "'Merriweather', Georgia, 'Times New Roman', serif";
const fontSans = "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif";

export default function Landing() {
  const [cookieConsent, setCookieConsent] = useState(() => {
    try { return document.cookie.includes('fba_consent=1') } catch { return false }
  });

  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      revealRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div id="main-content" style={{ fontFamily: fontSans, color: colors.navy, background: colors.cream, overflowX: 'hidden' }}>
      {/* Financial Disclaimer Banner */}
      <div style={{ background: '#fef3c7', borderBottom: '1px solid #f59e0b', padding: '10px 24px', textAlign: 'center', fontSize: '0.8rem', color: '#92400e', fontFamily: "'Source Sans 3', -apple-system, sans-serif" }}>
        This site provides educational information only and does not constitute financial, legal, or tax advice. FedBenefitsAid is not affiliated with OPM or any government agency. <a href="/disclaimer" style={{ color: '#92400e', fontWeight: 600 }}>Learn more</a>
      </div>

      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
                        .flow-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawLine 3s ease forwards;
        }
        .flow-line.d1 { animation-delay: 0.3s; }
        .flow-line.d2 { animation-delay: 0.6s; }
        .flow-line.d3 { animation-delay: 0.9s; }
        .dome-group {
          opacity: 0;
          animation: fadeUp 1s ease 0.2s forwards;
        }
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* HERO SECTION */}
      <section role="banner" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '64px 48px 0', maxWidth: '1400px', margin: '0 auto', gap: '40px' }}>
        <div style={{ paddingRight: '20px', animation: 'fadeUp 0.8s ease forwards' }}>
          <div style={{ display: 'inline-block', background: colors.navy, fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 20px', borderRadius: '100px', marginBottom: '32px', backgroundImage: goldGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            For U.S. Federal Employees
          </div>
          <h1 style={{ fontFamily: fontSerif, fontSize: 'clamp(2.6rem, 5vw, 3.8rem)', fontWeight: '900', lineHeight: '1.12', letterSpacing: '-0.02em', color: colors.navy, marginBottom: '24px' }}>
            Retirement benefits,<br />
            <em style={{ fontStyle: 'italic', color: colors.maroon }}>finally clear.</em>
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: '1.65', color: colors.gray600, marginBottom: '40px', maxWidth: '480px' }}>
            FERS. TSP. FEHB. Social Security. One wrong decision costs thousands. We give you the tools and expert guidance to make confident retirement decisions.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ background: colors.maroon, color: 'white', fontSize: '0.95rem', fontWeight: '600', padding: '15px 32px', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.25s', border: 'none', cursor: 'pointer', display: 'inline-block' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
              Get Started Free
            </Link>
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" style={{ background: 'transparent', color: colors.navy, fontSize: '0.95rem', fontWeight: '600', padding: '14px 32px', borderRadius: '10px', textDecoration: 'none', border: `2px solid rgba(15,23,42,0.15)`, transition: 'all 0.25s', display: 'inline-block', cursor: 'pointer' }} onMouseEnter={(e) => { e.target.style.borderColor = colors.navy; e.target.style.background = colors.navy; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(15,23,42,0.15)'; e.target.style.background = 'transparent'; e.target.style.color = colors.navy; }}>
              Book a Consultation
            </a>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
          <svg viewBox="0 0 560 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '560px', height: 'auto' }} aria-hidden="true">
            {/* Background circles */}
            <circle cx="280" cy="260" r="200" fill="rgba(201,168,76,0.04)" />
            <circle cx="280" cy="260" r="140" fill="rgba(201,168,76,0.03)" />

            {/* Gradients */}
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b8860b" stopOpacity="0.4" />
                <stop offset="30%" stopColor="#daa520" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#f5d77a" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#daa520" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#b8860b" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b8860b" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#f5d77a" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#b8860b" stopOpacity="0.15" />
              </linearGradient>
              {/* Cloth ripple — fractalNoise for smooth waves, very slow for light breeze */}
                          </defs>

            {/* Flowing lines */}
            <path className="flow-line" d="M40 380 Q150 340 280 320 Q410 300 520 260" stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path className="flow-line d1" d="M60 400 Q170 350 290 340 Q420 330 530 290" stroke="url(#goldGrad2)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path className="flow-line d2" d="M20 360 Q140 330 270 300 Q400 270 510 230" stroke="url(#goldGrad2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path className="flow-line d3" d="M80 420 Q190 370 300 360 Q430 350 540 310" stroke="url(#goldGrad)" strokeWidth="1" fill="none" strokeLinecap="round" />

            {/* Capitol Dome */}
            <g className="dome-group">
              {/* Steps */}
              <rect x="155" y="362" width="250" height="6" rx="1" fill="#1e3a5f" opacity="0.3" />
              <rect x="165" y="356" width="230" height="6" rx="1" fill="#1e3a5f" opacity="0.4" />
              {/* Base */}
              <rect x="175" y="344" width="210" height="12" rx="2" fill="#1e3a5f" opacity="0.9" />
              {/* Columns */}
              <rect x="192" y="284" width="8" height="60" rx="2" fill="#1e3a5f" opacity="0.65" />
              <rect x="215" y="284" width="8" height="60" rx="2" fill="#1e3a5f" opacity="0.65" />
              <rect x="238" y="284" width="8" height="60" rx="2" fill="#1e3a5f" opacity="0.65" />
              <rect x="261" y="284" width="8" height="60" rx="2" fill="#1e3a5f" opacity="0.65" />
              <rect x="284" y="284" width="8" height="60" rx="2" fill="#1e3a5f" opacity="0.65" />
              <rect x="307" y="284" width="8" height="60" rx="2" fill="#1e3a5f" opacity="0.65" />
              <rect x="330" y="284" width="8" height="60" rx="2" fill="#1e3a5f" opacity="0.65" />
              <rect x="353" y="284" width="8" height="60" rx="2" fill="#1e3a5f" opacity="0.65" />
              {/* Upper entablature */}
              <rect x="182" y="272" width="196" height="14" rx="3" fill="#1e3a5f" opacity="0.85" />
              {/* Dome */}
              <path d="M198 274 Q198 204 280 170 Q362 204 362 274" fill="#0f172a" opacity="0.92" />
              {/* Dome highlight */}
              <path d="M218 264 Q222 212 280 186 Q338 212 342 264" fill="#1e3a5f" opacity="0.35" />
              {/* Lantern */}
              <rect x="268" y="155" width="24" height="18" rx="3" fill="#0f172a" />
              {/* Flagpole */}
              <line x1="280" y1="50" x2="280" y2="155" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" />
              {/* Flagpole finial */}
              <circle cx="280" cy="48" r="4.5" fill="url(#goldGrad)" />
              {/* American Flag - 50 stars, 13 stripes, cloth ripple + gentle sway */}
              <g>
                {/* 13 stripes - slightly taller for overlap so ripple doesn't create gaps */}
                {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
                  <rect key={`stripe-${i}`} x="283" y={49.5 + i * 3.5} width="76" height="4.2" fill={i % 2 === 0 ? '#bf0a30' : '#ffffff'} />
                ))}
                {/* Blue canton */}
                <rect x="283" y="50" width="32" height="25" fill="#002868" />
                {/* 50 stars - 5 rows of 6, 4 rows of 5 (staggered) */}
                {[0,1,2,3,4,5].map((j) => <circle key={`s1-${j}`} cx={286.5 + j * 4.2} cy={53} r="0.7" fill="white" />)}
                {[0,1,2,3,4].map((j) => <circle key={`s2-${j}`} cx={288.6 + j * 4.2} cy={55.5} r="0.7" fill="white" />)}
                {[0,1,2,3,4,5].map((j) => <circle key={`s3-${j}`} cx={286.5 + j * 4.2} cy={58} r="0.7" fill="white" />)}
                {[0,1,2,3,4].map((j) => <circle key={`s4-${j}`} cx={288.6 + j * 4.2} cy={60.5} r="0.7" fill="white" />)}
                {[0,1,2,3,4,5].map((j) => <circle key={`s5-${j}`} cx={286.5 + j * 4.2} cy={63} r="0.7" fill="white" />)}
                {[0,1,2,3,4].map((j) => <circle key={`s6-${j}`} cx={288.6 + j * 4.2} cy={65.5} r="0.7" fill="white" />)}
                {[0,1,2,3,4,5].map((j) => <circle key={`s7-${j}`} cx={286.5 + j * 4.2} cy={68} r="0.7" fill="white" />)}
                {[0,1,2,3,4].map((j) => <circle key={`s8-${j}`} cx={288.6 + j * 4.2} cy={70.5} r="0.7" fill="white" />)}
                {[0,1,2,3,4,5].map((j) => <circle key={`s9-${j}`} cx={286.5 + j * 4.2} cy={73} r="0.7" fill="white" />)}
              </g>
            </g>


            {/* Decorative particles */}
            <circle cx="140" cy="200" r="2.5" fill="#daa520" opacity="0.3">
              <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="430" cy="180" r="2" fill="#7b1c2e" opacity="0.2">
              <animate attributeName="opacity" values="0.1;0.3;0.1" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="460" cy="350" r="1.5" fill="#daa520" opacity="0.2">
              <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="120" cy="320" r="1.5" fill="#1e3a5f" opacity="0.15">
              <animate attributeName="opacity" values="0.08;0.2;0.08" dur="4.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section style={{ background: colors.navy, padding: '120px 48px' }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <h2 style={{ fontFamily: fontSerif, fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-0.01em', color: 'white', marginBottom: '16px' }}>
              Your benefits are <em style={{ fontStyle: 'italic', backgroundImage: goldGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>valuable.</em>
              <br />
              Make sure you understand them.
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', maxWidth: '560px', margin: '0 auto' }}>
              The federal benefits system is one of the most generous in America — but also one of the most confusing. FedBenefitsAid makes it simple.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { id: 'personalized', title: 'Personalized to You', desc: 'Every tool adapts to your specific situation — years of service, salary, retirement system, and timeline. No generic advice.' },
              { id: 'accurate', title: 'Current and Accurate', desc: 'All figures updated for 2026. We cite actual OPM regulations so you can verify everything yourself.' },
              { id: 'expert', title: 'Free Tools, Expert Access', desc: 'Every tool is free, forever. When you need human guidance, book a free 30-minute consultation with a federal retirement specialist.' },
            ].map((card, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px 32px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', background: 'rgba(123, 28, 46, 0.1)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b1c2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {card.id === 'personalized' && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                    {card.id === 'accurate' && <><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M9 12l2 2 4-4" /></>}
                    {card.id === 'expert' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                  </svg>
                </div>
                <h3 style={{ fontFamily: fontSerif, fontSize: '1.05rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section style={{ padding: '140px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div ref={addRevealRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block', padding: '6px 14px', borderRadius: '6px', color: colors.maroon, background: 'rgba(123,28,46,0.06)' }}>
              Retirement Calculator
            </div>
            <h2 style={{ fontFamily: fontSerif, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: '700', lineHeight: '1.18', letterSpacing: '-0.01em', marginBottom: '20px', color: colors.navy }}>
              See your complete retirement picture.
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: colors.gray600, marginBottom: '32px', maxWidth: '480px' }}>
              Enter your years of service, high-3 salary, and retirement age. Get a detailed breakdown of your FERS pension, Supplement, TSP, Social Security, and FEHB costs — all in one place.
            </p>
            <Link to="/calculator" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none', color: colors.maroon, transition: 'gap 0.2s', cursor: 'pointer' }}>
              Calculate your retirement →
            </Link>
          </div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', background: colors.white, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', maxWidth: '480px' }}>
            {/* Navy header - total monthly income */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Estimated Total Monthly Retirement Income</div>
              <div style={{ fontFamily: fontSerif, fontSize: '2.2rem', fontWeight: '900', color: 'white' }}>$5,318</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>$63,810 per year</div>
            </div>
            {/* 3 summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', padding: '16px 16px 10px' }}>
              {[
                { icon: '$', label: 'Monthly Pension', value: '$1,543', sub: '$18,513/yr' },
                { icon: 'T', label: 'TSP Income', value: '$918', sub: '4% withdrawal' },
                { icon: 'SS', label: 'Social Security', value: '$2,857', sub: 'At age 67' },
              ].map((card, i) => (
                <div key={i} style={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', borderTop: `2.5px solid ${colors.maroon}`, padding: '12px 10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: colors.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: '700', color: colors.gray600, marginBottom: '8px' }}>{card.icon}</div>
                  <div style={{ fontSize: '0.52rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.maroon, marginBottom: '4px' }}>{card.label}</div>
                  <div style={{ fontFamily: fontSerif, fontSize: '1.15rem', fontWeight: '800', color: colors.navy }}>{card.value}</div>
                  <div style={{ fontSize: '0.65rem', color: colors.gray400, marginTop: '2px' }}>{card.sub}</div>
                </div>
              ))}
            </div>
            {/* Compact income breakdown */}
            <div style={{ padding: '10px 20px 18px' }}>
              <div style={{ fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.navy, marginBottom: '8px' }}>Income Breakdown</div>
              {[
                { label: 'FERS Pension', value: '$1,543', color: '#166534' },
                { label: 'TSP Income', value: '+$918', color: '#166534' },
                { label: 'Social Security', value: '+$2,857', color: '#166534' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.05)' : 'none', fontSize: '0.78rem' }}>
                  <span style={{ color: colors.gray600 }}>{row.label}</span>
                  <span style={{ fontWeight: '700', color: row.color, fontVariantNumeric: 'tabular-nums' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: `2px solid ${colors.navyMid}`, marginTop: '6px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: colors.navy, fontWeight: '600' }}>Total Monthly Income</span>
                <span style={{ fontFamily: fontSerif, fontWeight: '800', color: '#166534', fontSize: '0.95rem' }}>$5,318</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', height: '1px', background: 'rgba(0,0,0,0.06)' }}></div>

      {/* ASSESSMENT */}
      <section style={{ padding: '140px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div ref={addRevealRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div style={{ order: 2 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block', padding: '6px 14px', borderRadius: '6px', color: colors.navyMid, background: 'rgba(30,58,95,0.06)' }}>
              Readiness Assessment
            </div>
            <h2 style={{ fontFamily: fontSerif, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: '700', lineHeight: '1.18', letterSpacing: '-0.01em', marginBottom: '20px', color: colors.navy }}>
              Know exactly where you stand.
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: colors.gray600, marginBottom: '32px', maxWidth: '480px' }}>
              Answer 14 questions across five categories — income, pension, TSP, healthcare, and life insurance. Get a weighted readiness score and a clear checklist of what to focus on next.
            </p>
            <Link to="/assessment" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none', color: colors.navyMid, transition: 'gap 0.2s', cursor: 'pointer' }}>
              Take the assessment →
            </Link>
          </div>
          <div style={{ order: 1, borderRadius: '20px', overflow: 'hidden', background: colors.white, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', maxWidth: '480px' }}>
            {/* Navy header with score */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Your Results</div>
              <div style={{ fontFamily: fontSerif, fontSize: '1.1rem', fontWeight: '800', color: 'white', marginBottom: '14px' }}>Retirement Readiness Assessment</div>
              {/* Score circle */}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '5px solid rgba(255,255,255,0.15)', borderTopColor: '#f5a623', borderRightColor: '#f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', transform: 'rotate(30deg)' }}>
                <div style={{ transform: 'rotate(-30deg)', textAlign: 'center' }}>
                  <div style={{ fontFamily: fontSerif, fontSize: '1.6rem', fontWeight: '900', color: 'white', lineHeight: 1 }}>66</div>
                  <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>out of 100</div>
                </div>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', maxWidth: '320px', margin: '0 auto' }}>
                You have a solid foundation in survivor benefits and healthcare planning, but your TSP strategy and income optimization need attention.
              </p>
            </div>
            {/* Category progress bars */}
            <div style={{ padding: '18px 22px' }}>
              <div style={{ fontFamily: fontSerif, fontSize: '0.85rem', fontWeight: '700', color: colors.navy, marginBottom: '14px' }}>Your Retirement Snapshot</div>
              {[
                { label: 'Pension Readiness', pct: 64, color: '#d97706' },
                { label: 'TSP Strategy', pct: 33, color: '#d97706' },
                { label: 'Healthcare Planning', pct: 100, color: '#059669' },
                { label: 'Income Optimization', pct: 50, color: '#d97706' },
                { label: 'Survivor Benefits', pct: 100, color: '#059669' },
                { label: 'Financial Readiness', pct: 67, color: '#d97706' },
              ].map((cat, i) => (
                <div key={i} style={{ marginBottom: i < 5 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '600', color: colors.gray800 }}>{cat.label}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: colors.gray600 }}>{cat.pct}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: colors.gray100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', width: `${cat.pct}%`, background: cat.color, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', height: '1px', background: 'rgba(0,0,0,0.06)' }}></div>

      {/* AI CHAT */}
      <section style={{ padding: '140px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div ref={addRevealRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block', padding: '6px 14px', borderRadius: '6px', color: '#8a6d1b', background: 'rgba(201,168,76,0.1)' }}>
              AI Benefits Chat
            </div>
            <h2 style={{ fontFamily: fontSerif, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: '700', lineHeight: '1.18', letterSpacing: '-0.01em', marginBottom: '20px', color: colors.navy }}>
              Ask anything.<br />
              Get real answers.
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: colors.gray600, marginBottom: '32px', maxWidth: '480px' }}>
              Ask in plain English about FERS, TSP, FEHB, Social Security, or any benefit topic. Get personalized answers that cite actual OPM regulations and adapt to your situation.
            </p>
            <Link to="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none', color: '#8a6d1b', transition: 'gap 0.2s', cursor: 'pointer' }}>
              Start chatting →
            </Link>
          </div>
          <div style={{ borderRadius: '24px', padding: '40px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: colors.navy }}>
            <div>
              {[
                { user: true, text: "I'm 56 with 28 years of service. Can I retire with a full pension?" },
                { user: false, text: 'Yes — you\'re eligible for an immediate, unreduced FERS retirement. Your pension would be approximately 30.8% of your high-3 salary. Want me to calculate the exact amount?' },
                { user: true, text: 'Yes, my high-3 is $125,000' },
                { user: false, text: 'Your estimated FERS pension: $38,500/year ($3,208/month). You\'d also qualify for the FERS Supplement until age 62.' },
              ].map((bubble, i) => (
                <div key={i} style={{ padding: '14px 18px', borderRadius: '14px', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '10px', maxWidth: '88%', background: bubble.user ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)', color: bubble.user ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)', border: bubble.user ? 'none' : '1px solid rgba(255,255,255,0.08)', borderBottomRightRadius: bubble.user ? '4px' : '14px', borderBottomLeftRadius: bubble.user ? '14px' : '4px', marginLeft: bubble.user ? 'auto' : '0' }}>
                  {bubble.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', height: '1px', background: 'rgba(0,0,0,0.06)' }}></div>

      {/* REFERENCE GUIDE */}
      <section style={{ padding: '140px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div ref={addRevealRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div style={{ order: 2 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block', padding: '6px 14px', borderRadius: '6px', color: colors.navyMid, background: 'rgba(30,58,95,0.06)' }}>
              Reference Guide
            </div>
            <h2 style={{ fontFamily: fontSerif, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: '700', lineHeight: '1.18', letterSpacing: '-0.01em', marginBottom: '20px', color: colors.navy }}>
              Every rule, number, and pitfall — organized.
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: colors.gray600, marginBottom: '32px', maxWidth: '480px' }}>
              Six comprehensive categories covering FERS, CSRS, TSP, FEHB, FEGLI, Social Security, and Medicare. Each topic includes key figures, rules, and common mistakes to watch for.
            </p>
            <Link to="/reference" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none', color: colors.navyMid, transition: 'gap 0.2s', cursor: 'pointer' }}>
              Explore the guide →
            </Link>
          </div>
          <div style={{ order: 1, maxWidth: '500px' }}>
            {/* Mini card grid matching actual reference page — brand colors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { color: '#1e3a5f', title: 'FERS Pension', topics: 6, desc: 'Eligibility, annuity calculations' },
                { color: '#7b1c2e', title: 'TSP', topics: 5, desc: 'Fund options, Roth vs Traditional' },
                { color: '#b8860b', title: 'FEHB', topics: 5, desc: 'Plan comparison, premium costs' },
                { color: '#1e3a5f', title: 'FEGLI', topics: 4, desc: 'Coverage options, elections' },
                { color: '#7b1c2e', title: 'Medicare', topics: 3, desc: 'Enrollment timing, Part B' },
                { color: '#b8860b', title: 'Social Security', topics: 4, desc: 'WEP/GPO, claiming strategies' },
                { color: '#1e3a5f', title: 'CSRS', topics: 2, desc: 'Legacy rules, offset' },
                { color: '#7b1c2e', title: 'Survivor Benefits', topics: 3, desc: 'Spouse coverage, elections' },
              ].map((cat, i) => (
                <div key={i} style={{ background: colors.white, borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', borderLeft: `3px solid ${cat.color}`, padding: '14px 14px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontFamily: fontSerif, fontWeight: '700', fontSize: '0.82rem', color: colors.navy }}>{cat.title}</div>
                  <div style={{ fontSize: '0.65rem', color: colors.gray400 }}>{cat.topics} topics</div>
                  <div style={{ fontSize: '0.68rem', color: colors.gray600, lineHeight: '1.35', marginTop: '2px' }}>{cat.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '600', color: cat.color }}>Explore</span>
                    <span style={{ color: cat.color, fontSize: '0.75rem' }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', height: '1px', background: 'rgba(0,0,0,0.06)' }}></div>

      {/* RESOURCES */}
      <section style={{ padding: '140px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div ref={addRevealRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block', padding: '6px 14px', borderRadius: '6px', color: colors.maroon, background: 'rgba(123,28,46,0.06)' }}>
              Resources and Forms
            </div>
            <h2 style={{ fontFamily: fontSerif, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: '700', lineHeight: '1.18', letterSpacing: '-0.01em', marginBottom: '20px', color: colors.navy }}>
              Official forms, portals, and rate tables in one place.
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: colors.gray600, marginBottom: '32px', maxWidth: '480px' }}>
              Stop hunting across government sites. Every OPM retirement form, benefit rate table, and official portal you need — organized by category and ready to go.
            </p>
            <Link to="/resources" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none', color: colors.maroon, transition: 'gap 0.2s', cursor: 'pointer' }}>
              Browse resources →
            </Link>
          </div>
          <div style={{ borderRadius: '24px', padding: '40px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #fdf9ef, #fefcf5)', border: '1px solid rgba(201,168,76,0.08)' }}>
            <div>
              {[
                { type: 'Form', name: 'SF-3107 — FERS Retirement Application' },
                { type: 'Form', name: 'SF-2801 — CSRS Retirement Application' },
                { type: 'Portal', name: 'OPM Retirement Services Online' },
                { type: 'Rates', name: '2026 FEHB Premium Rates' },
                { type: 'Portal', name: 'TSP.gov — Thrift Savings Plan' },
                { type: 'Rates', name: '2026 FERS COLA Adjustments' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'white', borderRadius: '10px', marginBottom: '8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 8px', borderRadius: '4px', flexShrink: 0, background: item.type === 'Form' ? 'rgba(123,28,46,0.08)' : item.type === 'Portal' ? 'rgba(30,58,95,0.08)' : 'rgba(201,168,76,0.12)', color: item.type === 'Form' ? colors.maroon : item.type === 'Portal' ? colors.navyMid : '#8a6d1b' }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '500', color: colors.navy }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONSULTATION CTA */}
      <section style={{ padding: '140px 48px', textAlign: 'center', background: colors.white }}>
        <div ref={addRevealRef} className="reveal">
          <h2 style={{ fontFamily: fontSerif, fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '900', lineHeight: '1.12', letterSpacing: '-0.02em', marginBottom: '20px', color: colors.navy }}>
            Need to talk to<br />
            <em style={{ fontStyle: 'italic', color: colors.maroon }}>a real person?</em>
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: colors.gray600, maxWidth: '500px', margin: '0 auto 44px' }}>
            Book a free 30-minute call with a federal retirement specialist at Federal Market Associates. No sales pitch — just honest guidance.
          </p>
          <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" style={{ background: '#7b1c2e', color: '#ffffff', fontSize: '1.1rem', fontWeight: '600', padding: '18px 48px', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.25s', border: 'none', cursor: 'pointer', display: 'inline-block' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
            Book Free Consultation
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: colors.navy, color: 'rgba(255,255,255,0.8)', padding: '64px 48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '48px', marginBottom: '48px' }}>
          <div style={{ maxWidth: '300px' }}>
            <div style={{ fontFamily: fontSerif, fontWeight: '700', fontSize: '1rem', color: 'white', marginBottom: '12px' }}>
              FedBenefitsAid
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: '1.6' }}>
              Educational tools for federal employees navigating retirement benefits. Not affiliated with OPM or the U.S. government.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '56px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>
                Tools
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link to="/calculator" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Retirement Calculator
                </Link>
                <Link to="/assessment" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Readiness Assessment
                </Link>
                <Link to="/chat" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  AI Benefits Chat
                </Link>
                <Link to="/reference" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Reference Guide
                </Link>
                <Link to="/resources" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Resources and Forms
                </Link>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>
                Company
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Book a Consultation
                </a>
                <a href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Federal Market Associates
                </a>
                <a href="/disclaimer" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Disclaimer
                </a>
                <a href="/privacy" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Privacy Policy
                </a>
                <a href="/terms" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
          <span>2026 FedBenefitsAid. All rights reserved.</span>
          <span>Information updated for 2026 figures.</span>
        </div>
      </footer>
    
      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1e293b', color: '#e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 9999, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', maxWidth: 600 }}>We use cookies and Google Analytics to improve your experience. By continuing, you consent to our use of cookies. <a href="/privacy" style={{ color: '#93c5fd', textDecoration: 'underline' }}>Privacy Policy</a></span>
          <button onClick={() => { document.cookie = 'fba_consent=1; max-age=31536000; path=/; SameSite=Lax'; setCookieConsent(true); }} style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Accept</button>
          <button onClick={() => setCookieConsent(true)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Decline</button>
        </div>
      )}
</div>
  );
}
