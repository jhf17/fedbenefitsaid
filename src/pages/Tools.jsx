import React from 'react'
import { Link } from 'react-router-dom'

const Calculators = () => {
  const calculators = [
    {
      id: 'calculator',
      title: 'FERS Retirement Calculator',
      description: 'Estimate your pension, FERS supplement, TSP income, FEGLI costs, and total retirement income. Includes COLA projections and year-by-year FEGLI analysis.',
      link: '/calculator',
      icon: 'calculator'
    },
    {
      id: 'countdown',
      title: 'Retirement Countdown',
      description: 'Find out exactly when you\'re eligible to retire based on your birth year, hire date, and years of service. Covers all FERS, CSRS, and special provision paths.',
      link: '/calculators/countdown',
      icon: 'countdown'
    }
  ]

  const renderIcon = (iconType) => {
    const iconProps = {
      width: '48',
      height: '48',
      viewBox: '0 0 48 48',
      fill: 'none',
      stroke: 'url(#goldGradient)',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }

    const defs = (
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b8860b" />
          <stop offset="25%" stopColor="#daa520" />
          <stop offset="50%" stopColor="#f5d77a" />
          <stop offset="75%" stopColor="#daa520" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
    )

    switch (iconType) {
      case 'calculator':
        return (
          <svg {...iconProps} aria-hidden="true">
            {defs}
            <rect x="8" y="6" width="32" height="36" rx="2" />
            <line x1="8" y1="18" x2="40" y2="18" />
            <circle cx="14" cy="28" r="2" />
            <circle cx="24" cy="28" r="2" />
            <circle cx="34" cy="28" r="2" />
            <circle cx="14" cy="38" r="2" />
            <circle cx="24" cy="38" r="2" />
            <circle cx="34" cy="38" r="2" />
          </svg>
        )
      case 'countdown':
        return (
          <svg {...iconProps} aria-hidden="true">
            {defs}
            <circle cx="24" cy="24" r="18" />
            <line x1="24" y1="10" x2="24" y2="16" />
            <line x1="24" y1="32" x2="24" y2="38" />
            <line x1="10" y1="24" x2="16" y2="24" />
            <line x1="32" y1="24" x2="38" y2="24" />
            <line x1="24" y1="24" x2="28" y2="20" />
            <line x1="24" y1="24" x2="20" y2="28" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ backgroundColor: '#faf9f6', minHeight: '100vh' }}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .calc-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-content h1 {
            font-size: 32px !important;
            line-height: 1.2 !important;
          }

          .hero-content p {
            font-size: 16px !important;
            line-height: 1.6 !important;
          }

          .calc-container {
            padding: 48px 16px !important;
          }

          .cta-section {
            padding: 48px 16px !important;
          }

          .cta-section h2 {
            font-size: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 48px 16px !important;
          }

          .hero-content h1 {
            font-size: 28px !important;
          }

          .hero-content p {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div
        className="hero-section"
        role="banner"
        style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)',
          padding: '80px 48px',
          textAlign: 'center',
          color: '#fff'
        }}
      >
        <div
          className="hero-content"
          style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >
          <h1
            style={{
              fontFamily: "'Merriweather', Georgia, serif",
              fontSize: '48px',
              fontWeight: '400',
              lineHeight: '1.2',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}
          >
            Retirement Calculators
          </h1>
          <p
            style={{
              fontFamily: "'Source Sans 3', -apple-system, sans-serif",
              fontSize: '18px',
              lineHeight: '1.6',
              opacity: '0.8',
              marginBottom: '0'
            }}
          >
            Free, accurate calculators built on official OPM, SSA, and IRS data — designed to help you make confident retirement decisions.
          </p>
        </div>
      </div>

      {/* Calculators Grid */}
      <div
        className="calc-container"
        style={{
          padding: '80px 48px',
          maxWidth: '900px',
          margin: '0 auto'
        }}
      >
        <div
          className="calc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px',
            marginBottom: '80px'
          }}
        >
          {calculators.map((calc) => (
            <div
              key={calc.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '14px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                padding: '48px 36px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'
              }}
            >
              {/* Icon */}
              <div
                style={{
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {renderIcon(calc.icon)}
              </div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: "'Merriweather', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: '400',
                  color: '#1e293b',
                  marginBottom: '14px',
                  margin: '0 0 14px 0'
                }}
              >
                {calc.title}
              </h2>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Source Sans 3', -apple-system, sans-serif",
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '28px',
                  margin: '0 0 28px 0',
                  flex: '1'
                }}
              >
                {calc.description}
              </p>

              {/* Link */}
              <Link
                to={calc.link}
                style={{
                  fontFamily: "'Source Sans 3', -apple-system, sans-serif",
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#7b1c2e',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'gap 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.gap = '10px'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.gap = '6px'
                }}
              >
                Open Calculator <span aria-hidden="true" style={{ fontSize: '16px' }}>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="cta-section"
        style={{
          padding: '64px 48px',
          backgroundColor: '#f1f5f9',
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            fontFamily: "'Merriweather', Georgia, serif",
            fontSize: '32px',
            fontWeight: '400',
            color: '#1e293b',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}
        >
          Need personalized guidance?
        </h2>
        <p
          style={{
            fontFamily: "'Source Sans 3', -apple-system, sans-serif",
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#475569',
            marginBottom: '32px',
            margin: '0 0 32px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          Our retirement specialists can walk you through your specific situation.
        </p>
        <a
          href="https://calendly.com/jhf17/30min"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#7b1c2e',
            color: '#fff',
            padding: '14px 28px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontFamily: "'Source Sans 3', -apple-system, sans-serif",
            fontSize: '15px',
            fontWeight: '500',
            transition: 'background-color 0.2s, transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5f1624'
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#7b1c2e'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          Book a Free Consultation
        </a>
      </div>
    </div>
  )
}

export default Calculators
