import { useState } from 'react';
import Seo from '../components/Seo';

const CALENDLY_URL = 'https://calendly.com/jhf17/30min';

// Color scheme
const colors = {
  navy: '#0f172a',
  secondaryNavy: '#1e3a5f',
  maroon: '#7b1c2e',
  lightGray: '#f8fafc',
  darkGray: '#64748b',
  textDark: '#1e293b',
  border: '#e2e8f0',
};

export default function Consultation() {
  // Topic cards for "What We'll Cover"
  const topics = [
    {
      number: '1',
      title: 'Pension Analysis',
      description: 'Review your FERS or CSRS annuity calculation, including service credit, high-3 salary, and the impact of unused sick leave.',
    },
    {
      number: '2',
      title: 'TSP Withdrawal Planning',
      description: 'Evaluate your withdrawal options — installments, annuity, or lump sum — and understand the tax implications of each approach.',
    },
    {
      number: '3',
      title: 'Social Security Strategy',
      description: 'Determine your optimal claiming age based on your FERS Supplement, pension income, and personal financial situation.',
    },
    {
      number: '4',
      title: 'Healthcare Coordination',
      description: 'Understand how FEHB and Medicare work together in retirement, including enrollment timing, costs, and coverage gaps.',
    },
    {
      number: '5',
      title: 'Survivor Benefit Elections',
      description: 'Analyze whether to elect full, partial, or no survivor benefits — and how life insurance alternatives compare.',
    },
    {
      number: '6',
      title: 'Life Insurance Review',
      description: 'Evaluate your FEGLI coverage and determine whether private insurance offers better value for your retirement years.',
    },
  ];

  // Steps in "How It Works"
  const steps = [
    {
      title: 'Schedule',
      description: 'Pick a time that works for you. We meet by phone — easy and casual.',
    },
    {
      title: 'Show Up',
      description: `No prep required. If you have your LES or TSP balance handy, great — but come as you are.`,
    },
    {
      title: 'Ask Anything',
      description: `We'll answer whatever questions you have and help you understand your options. No agenda — you lead the conversation.`,
    },
  ];

  // FAQ items
  const faqs = [
    {
      question: 'Is this really free?',
      answer:
        `Yes. The initial 30-minute consultation is completely free with no obligation. It's an opportunity for us to understand your situation and for you to see if working with a specialist would be helpful.`,
    },
    {
      question: 'Do I need to prepare anything?',
      answer:
        `Not at all. Just bring your questions. If you happen to have your LES or TSP balance nearby, great — but it's absolutely not required.`,
    },
    {
      question: 'What happens after the session?',
      answer:
        `You'll receive a summary of what we discussed and any recommended next steps. If you'd like continued support, we can discuss options — but there's no pressure.`,
    },
    {
      question: 'Is my information kept confidential?',
      answer:
        'Absolutely. Your personal and financial information is kept strictly confidential and is never shared with third parties.',
    },
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div style={{ fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Seo
        title="Book a Free Federal Retirement Consultation"
        description="Book a free 30-minute call with a federal retirement specialist. No sales pitch — get straight answers about your FERS, TSP, and benefits decisions."
        path="/consultation"
      />
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(160deg, ${colors.navy} 0%, ${colors.secondaryNavy} 60%)`,
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '20px',
            lineHeight: 1.2,
            maxWidth: '800px',
            fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
          }}
        >
          Have Questions About Your Federal Retirement?
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: '700px',
            opacity: 0.95,
            margin: '0 auto',
          }}
        >
          Book a free, no-pressure conversation about anything on your mind — whether it's your pension, TSP, healthcare, or just a question you've been meaning to ask.
        </p>
      </section>

      {/* What We'll Cover Section */}
      <section
        style={{
          backgroundColor: '#faf9f6',
          padding: '80px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '60px',
              color: '#0f172a',
              fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
            }}
          >
            Topics We Can Help With
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              gridAutoRows: 'auto',
            }}
          >
            {topics.map((topic) => (
              <div
                key={topic.number}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '30px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
                  border: `1px solid #cbd5e1`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: colors.maroon,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '18px',
                      marginRight: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {topic.number}
                  </div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#0f172a',
                      margin: 0,
                      fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
                    }}
                  >
                    {topic.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: '#475569',
                    margin: 0,
                  }}
                >
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who You'll Meet With Section */}
      <section
        style={{
          backgroundColor: '#faf9f6',
          padding: '80px 20px',
          borderTop: `1px solid #cbd5e1`,
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              marginBottom: '40px',
              color: '#0f172a',
              fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
            }}
          >
            Your Consultant
          </h2>

          <div
            style={{
              backgroundColor: '#faf9f6',
              padding: '40px',
              borderRadius: '12px',
              border: `1px solid #cbd5e1`,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  padding: '16px',
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                }}
              >
                <img
                  src="/fma-logo.png"
                  alt="Federal Market Associates logo"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '16px',
                    margin: '0 0 16px 0',
                    fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
                  }}
                >
                  Federal Market Associates
                </h3>
                <p
                  style={{
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: '#475569',
                    marginBottom: '16px',
                    margin: '0 0 16px 0',
                  }}
                >
                  Federal Market Associates specializes in federal employee retirement benefits education. Our educators work with hundreds of federal employees each year and understand the nuances of FERS, CSRS, TSP, FEHB, and FEGLI.
                </p>
                <p
                  style={{
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: '#475569',
                    margin: 0,
                  }}
                >
                  Your consultant is a certified federal retirement specialist who will provide objective, personalized guidance based on your unique situation and goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        style={{
          backgroundColor: '#faf9f6',
          padding: '80px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '60px',
              color: '#0f172a',
              fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
            }}
          >
            {steps.map((step, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: colors.navy,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '24px',
                    marginBottom: '24px',
                  }}
                >
                  {index + 1}
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                    fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: '#475569',
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendly Section */}
      <section
        style={{
          backgroundColor: '#faf9f6',
          padding: '80px 20px',
          borderTop: `1px solid #cbd5e1`,
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '50px',
              color: '#0f172a',
              fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
            }}
          >
            Choose a Time
          </h2>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '16px 48px',
                backgroundColor: '#7b1c2e',
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5f1423';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#7b1c2e';
              }}
            >
              View Available Times
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        style={{
          backgroundColor: '#faf9f6',
          padding: '80px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '60px',
              color: '#0f172a',
              fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
            }}
          >
            Frequently Asked Questions
          </h2>

          <div>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '16px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: `1px solid #cbd5e1`,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#0f172a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#faf9f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span>{faq.question}</span>
                  <span
                    style={{
                      marginLeft: '12px',
                      transition: 'transform 0.3s ease',
                      transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▼
                  </span>
                </button>
                {expandedFaq === index && (
                  <div
                    style={{
                      padding: '0 20px 20px 20px',
                      backgroundColor: '#faf9f6',
                      borderTop: `1px solid #cbd5e1`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: '15px',
                        lineHeight: 1.7,
                        color: '#475569',
                        margin: 0,
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        style={{
          backgroundColor: '#faf9f6',
          padding: '80px 20px',
          textAlign: 'center',
          borderTop: `1px solid #cbd5e1`,
        }}
      >
        <div
          style={{
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 700,
              marginBottom: '32px',
              color: '#0f172a',
              fontFamily: "'Merriweather', Georgia, 'Times New Roman', serif",
            }}
          >
            Curious about something? Just ask.
          </h2>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '16px 48px',
              backgroundColor: '#7b1c2e',
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '32px',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5f1423';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#7b1c2e';
            }}
          >
            Book a Free Call
          </a>

          <p
            style={{
              fontSize: '15px',
              color: '#475569',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Not ready yet?{' '}
            <a
              href="/calculator"
              style={{
                color: '#7b1c2e',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Try our free Calculator
            </a>{' '}
            or explore your{' '}
            <a
              href="/assessment"
              style={{
                color: '#7b1c2e',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Retirement Readiness Assessment
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
