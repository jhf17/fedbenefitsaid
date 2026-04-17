import React from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

const Calculators = () => {
  const calculators = [
    {
      id: 'calculator',
      title: 'Retirement Income Calculator',
      description: 'Estimate your FERS or CSRS pension, FERS supplement, TSP income, and total retirement income. Includes COLA projections, FEHB deductions, and Medicare costs.',
      link: '/calculator',
      icon: 'calculator'
    },
    {
      id: 'fegli',
      title: 'FEGLI Life Insurance Calculator',
      description: 'Understand your federal life insurance coverage, current costs, and how premiums change in retirement. Compare FEGLI options and reduction elections.',
      link: '/calculators/fegli',
      icon: 'fegli'
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
      case 'fegli':
        return (
          <svg {...iconProps} aria-hidden="true">
            {defs}
            <path d="M24 8 C18 8, 10 14, 10 22 C10 32, 24 40, 24 40 C24 40, 38 32, 38 22 C38 14, 30 8, 24 8Z" />
            <line x1="24" y1="18" x2="24" y2="30" />
            <line x1="18" y1="24" x2="30" y2="24" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ backgroundColor: '#faf9f6', minHeight: '100vh' }}>
      <Seo
        title="Federal Retirement Calculators"
        description="Retirement income calculator and FEGLI life-insurance projection tool for federal employees. Model your pension, TSP, benefits, and coverage in minutes."
        path="/calculators"
      />
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
          {/* Estimates disclaimer */}
          <div style={{ gridColumn: '1 / -1', background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 16px', fontSize: '0.82rem', color: '#92400e', fontFamily: "'Source Sans 3', -apple-system, sans-serif" }}>
            All calculators provide estimates only based on current federal rules and publicly available data. Results are for educational purposes and should not be used as the sole basis for retirement decisions. Consult a qualified advisor for personalized guidance.
          </div>

          {calculators.map((calc) => (
            <div
              key={calc.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                padding: '32px 28px',
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
