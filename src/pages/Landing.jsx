import React, { useEffect, useRef } from 'react';
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
      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave {
          0%, 100% { d: path("M280 102 Q288 100 296 103 Q304 106 310 104 Q316 102 320 104"); }
          25% { d: path("M280 102 Q286 105 294 102 Q302 99 308 102 Q314 105 320 103"); }
          50% { d: path("M280 102 Q287 98 295 101 Q303 104 309 101 Q315 98 320 101"); }
          75% { d: path("M280 102 Q289 104 296 100 Q303 97 310 100 Q316 103 320 100"); }
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
        .flag-group {
          animation: wave 3s infinite;
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
              <line x1="280" y1="68" x2="280" y2="155" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" />
              {/* Flagpole finial */}
              <circle cx="280" cy="66" r="4" fill="url(#goldGrad)" />
              {/* American Flag */}
              <g className="flag-group">
                <rect x="282" y="70" width="38" height="24" rx="1" fill="#bf0a30" opacity="0.9" />
                <rect x="282" y="73.4" width="38" height="1.7" fill="white" opacity="0.9" />
                <rect x="282" y="76.8" width="38" height="1.7" fill="#bf0a30" opacity="0" />
                <rect x="282" y="80.2" width="38" height="1.7" fill="white" opacity="0.9" />
                <rect x="282" y="83.6" width="38" height="1.7" fill="white" opacity="0" />
                <rect x="282" y="87" width="38" height="1.7" fill="white" opacity="0.9" />
                <rect x="282" y="70" width="16" height="13" rx="0.5" fill="#002868" opacity="0.95" />
                <circle cx="285" cy="73" r="0.7" fill="white" />
                <circle cx="289" cy="73" r="0.7" fill="white" />
                <circle cx="293" cy="73" r="0.7" fill="white" />
                <circle cx="287" cy="76" r="0.7" fill="white" />
                <circle cx="291" cy="76" r="0.7" fill="white" />
                <circle cx="285" cy="79" r="0.7" fill="white" />
                <circle cx="289" cy="79" r="0.7" fill="white" />
                <circle cx="293" cy="79" r="0.7" fill="white" />
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
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.55)', maxWidth: '560px', margin: '0 auto' }}>
              The federal benefits system is one of the most generous in America — but also one of the most confusing. FedBenefitsAid makes it simple.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: '☀', title: 'Personalized to You', desc: 'Every tool adapts to your specific situation — years of service, salary, retirement system, and timeline. No generic advice.' },
              { icon: '✓', title: 'Current and Accurate', desc: 'All figures updated for 2026. We cite actual OPM regulations so you can verify everything yourself.' },
              { icon: '👥', title: 'Free Tools, Expert Access', desc: 'Every tool is free, forever. When you need human guidance, book a free 30-minute consultation with a federal retirement specialist.' },
            ].map((card, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px 32px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', background: 'rgba(123, 28, 46, 0.1)', fontSize: '1.5rem', color: '#7b1c2e' }}>
                  {card.icon}
                </div>
                <h3 style={{ fontFamily: fontSerif, fontSize: '1.05rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.5)' }}>
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
          <div style={{ borderRadius: '24px', padding: '40px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #fdf2f4, #fef7f8)', border: '1px solid rgba(123,28,46,0.06)' }}>
            <div>
              {[
                { label: 'FERS Basic Pension', value: '$42,840 /yr' },
                { label: 'FERS Supplement', value: '$18,200 /yr' },
                { label: 'TSP (4% withdrawal)', value: '$28,400 /yr' },
                { label: 'Social Security (est.)', value: '$24,600 /yr' },
                { label: 'FEHB Premium', value: '-$7,200 /yr' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.9rem' }}>
                  <span style={{ color: colors.gray600 }}>{row.label}</span>
                  <span style={{ fontFamily: fontSerif, fontWeight: '700', color: colors.navy, fontVariantNumeric: 'tabular-nums' }}>
                    {row.value}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: '16px', padding: '20px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', opacity: 0.8 }}>Estimated Annual Income</span>
                <span style={{ fontFamily: fontSerif, fontSize: '1.6rem', fontWeight: '800' }}>$106,840</span>
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
          <div style={{ order: 1, borderRadius: '24px', padding: '40px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: colors.gray50, border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '6px solid ' + colors.gray100, borderTopColor: colors.maroon, borderRightColor: colors.maroon, borderBottomColor: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontFamily: fontSerif }}>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: colors.navy }}>
                  72<span style={{ fontSize: '1rem', color: colors.gray400 }}>/100</span>
                </div>
              </div>
              <div style={{ fontWeight: '700', color: colors.navy, marginBottom: '4px' }}>Good Progress</div>
              <div style={{ fontSize: '0.82rem', color: colors.gray400, marginBottom: '20px' }}>3 actions remaining</div>
              <div style={{ textAlign: 'left', marginTop: '20px' }}>
                {[
                  { done: true, text: 'TSP contributions maximized' },
                  { done: true, text: 'FEHB plan reviewed for retirement' },
                  { done: false, text: 'Survivor benefit election decided' },
                  { done: false, text: 'Social Security timing strategy set' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: '0.88rem', color: colors.gray600 }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700', color: 'white', flexShrink: 0, background: item.done ? '#16a34a' : colors.gray300 }}>
                      {item.done ? '✓' : '—'}
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
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
          <div style={{ order: 1, borderRadius: '24px', padding: '40px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: colors.gray50, border: '1px solid rgba(0,0,0,0.04)' }}>
            <div>
              {[
                { color: colors.maroon, title: 'FERS Pension', desc: 'Key figures, rules, pitfalls' },
                { color: colors.navyMid, title: 'TSP and Investments', desc: 'Traditional, Roth, funds, loans' },
                { color: '#8a6d1b', title: 'FEHB Health Insurance', desc: 'Plans, 5-year rule, premiums' },
                { color: colors.maroon, title: 'FEGLI Life Insurance', desc: 'Options, costs, retirement' },
                { color: colors.navyMid, title: 'Social Security and Medicare', desc: 'Timing, coordination, eligibility' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(0,0,0,0.04)' }}>
                    📋
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: colors.navy }}>
                      {item.title}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: colors.gray400, fontWeight: '500' }}>
                    {item.desc}
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
      <footer style={{ background: colors.navy, color: 'rgba(255,255,255,0.5)', padding: '64px 48px 32px' }}>
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
              <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '14px' }}>
                Tools
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link to="/calculator" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  Retirement Calculator
                </Link>
                <Link to="/assessment" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  Readiness Assessment
                </Link>
                <Link to="/chat" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  AI Benefits Chat
                </Link>
                <Link to="/reference" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  Reference Guide
                </Link>
                <Link to="/resources" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  Resources and Forms
                </Link>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '14px' }}>
                Company
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  Book a Consultation
                </a>
                <a href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  Federal Market Associates
                </a>
                <a href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  Disclaimer
                </a>
                <a href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  Privacy Policy
                </a>
                <a href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
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
    </div>
  );
}
