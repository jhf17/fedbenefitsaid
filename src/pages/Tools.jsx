import React from 'react'
import { Link } from 'react-router-dom'

const Tools = () => {
  const tools = [
    {
      id: 'calculator',
      title: 'FERS Retirement Calculator',
      description: 'Estimate your pension, FERS supplement, TSP income, FEGLI costs, and total retirement income.',
      link: '/calculator',
      icon: 'calculator'
    },
    {
      id: 'countdown',
      title: 'Retirement Countdown',
      description: 'Find out exactly when you\'re eligible to retire based on your birth year, hire date, and years of service.',
      link: '/tools/countdown',
      icon: 'countdown'
    },
    {
      id: 'assessment',
      title: 'Retirement Readiness Assessment',
      description: 'Answer 6 quick questions and get a personalized retirement readiness checklist.',
      link: '/assessment',
      icon: 'checklist'
    },
    {
      id: 'chat',
      title: 'AI Benefits Advisor',
      description: 'Get instant answers about FERS, TSP, FEHB, FEGLI, Social Security, and more from our AI assistant.',
      link: '/chat',
      icon: 'chat'
    },
    {
      id: 'reference',
      title: 'Reference Guide',
      description: 'Comprehensive reference data for federal retirement benefits — pension formulas, TSP funds, FEHB plans, and more.',
      link: '/reference',
      icon: 'book'
    },
    {
      id: 'timeline',
      title: 'Key Dates & Deadlines',
      description: 'Every important date a federal employee needs to know — enrollment windows, filing deadlines, and optimal retirement timing.',
      link: '/timeline',
      icon: 'calendar'
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
          <svg {...iconProps}>
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
          <svg {...iconProps}>
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
      case 'checklist':
        return (
          <svg {...iconProps}>
            {defs}
            <rect x="8" y="8" width="32" height="32" rx="2" />
            <line x1="14" y1="18" x2="20" y2="24" />
            <line x1="20" y1="24" x2="34" y2="10" />
            <line x1="14" y1="30" x2="20" y2="36" />
            <line x1="20" y1="36" x2="34" y2="22" />
          </svg>
        )
      case 'chat':
        return (
          <svg {...iconProps}>
            {defs}
            <path d="M8 12c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4h-6l-6 6v-6h-12c-2.2 0-4-1.8-4-4V12z" />
            <circle cx="16" cy="22" r="2" />
            <circle cx="24" cy="22" r="2" />
            <circle cx="32" cy="22" r="2" />
          </svg>
        )
      case 'book':
        return (
          <svg {...iconProps}>
            {defs}
            <path d="M10 8c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v28c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2V8z" />
            <line x1="24" y1="6" x2="24" y2="40" />
            <line x1="14" y1="14" x2="18" y2="14" />
            <line x1="14" y1="20" x2="18" y2="20" />
            <line x1="14" y1="26" x2="18" y2="26" />
            <line x1="14" y1="32" x2="18" y2="32" />
          </svg>
        )
      case 'calendar':
        return (
          <svg {...iconProps}>
            {defs}
            <rect x="8" y="10" width="32" height="28" rx="2" />
            <line x1="8" y1="18" x2="40" y2="18" />
            <rect x="12" y="4" width="4" height="6" />
            <rect x="32" y="4" width="4" height="6" />
            <circle cx="16" cy="26" r="2" />
            <circle cx="24" cy="26" r="2" />
            <circle cx="32" cy="26" r="2" />
            <circle cx="16" cy="34" r="2" />
            <circle cx="24" cy="34" r="2" />
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
          .tools-grid {
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

          .tools-container {
            padding: 32px 16px !important;
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
            Federal Retirement Tools
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
            Free, accurate tools built on official OPM, SSA, and IRS data — designed to help you make confident retirement decisions.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div
        className="tools-container"
        style={{
          padding: '80px 48px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div
          className="tools-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            marginBottom: '80px'
          }}
        >
          {tools.map((tool) => (
            <div
              key={tool.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '14px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                padding: '40px 32px',
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
                {renderIcon(tool.icon)}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Merriweather', Georgia, serif",
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#1e293b',
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}
              >
                {tool.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Source Sans 3', -apple-system, sans-serif",
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#475569',
                  marginBottom: '24px',
                  margin: '0 0 24px 0',
                  flex: '1'
                }}
              >
                {tool.description}
              </p>

              {/* Link */}
              <Link
                to={tool.link}
                style={{
                  fontFamily: "'Source Sans 3', -apple-system, sans-serif",
                  fontSize: '15px',
                  fontWeight: '500',
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
                Explore <span style={{ fontSize: '16px' }}>→</span>
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

export default Tools
