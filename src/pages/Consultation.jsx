import { useEffect, useState } from 'react';

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
  useEffect(() => {
    document.title = 'Meet With a Consultant | FedBenefitsAid';
  }, []);

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
      description: 'Choose a time that works for you. Sessions are conducted via video call.',
    },
    {
      title: 'Prepare',
      description: `Gather your latest Leave and Earnings Statement, TSP balance, and any retirement estimates you've received.`,
    },
    {
      title: 'Review',
      description: 'Your consultant will walk through your benefits, answer your questions, and outline recommended next steps.',
    },
  ];

  // FAQ items
  const faqs = [
    {
      question: 'Is this really free?',
      answer:
        'Yes. The initial 30-minute consultation is completely free with no obligation. It's an opportunity for us to understand your situation and for you to see if working with a specialist would be helpful.',
    },
    {
      question: 'Do I need to prepare anything?',
      answer:
        'It's helpful to have your latest Leave and Earnings Statement and your TSP balance, but not required. We can work with whatever information you have.',
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
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.secondaryNavy} 100%)`,
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
          }}
        >
          Speak With a Federal Retirement Specialist
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
          Get personalized guidance on your pension, TSP, healthcare, and survivor benefit decisions from a certified
          consultant who works exclusively with federal employees.
        </p>
      </section>

      {/* What We'll Cover Section */}
      <section
        style={{
          backgroundColor: colors.lightGray,
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
              color: colors.textDark,
            }}
          >
            What We'll Cover in 30 Minutes
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
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: `1px solid ${colors.border}`,
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
                      color: colors.textDark,
                      margin: 0,
                    }}
                  >
                    {topic.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: colors.darkGray,
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
          backgroundColor: 'white',
          padding: '80px 20px',
          borderTop: `1px solid ${colors.border}`,
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
              color: colors.textDark,
            }}
          >
            Your Consultant
          </h2>

          <div
            style={{
              backgroundColor: colors.lightGray,
              padding: '40px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: colors.navy,
                marginBottom: '16px',
                margin: '0 0 16px 0',
              }}
            >
              Federal Market Associates
            </h3>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: colors.textDark,
                marginBottom: '16px',
                margin: '0 0 16px 0',
              }}
            >
              Federal Market Associates specializes in federal employee retirement planning. Our consultants work with
              hundreds of federal employees each year and understand the nuances of FERS, CSRS, TSP, FEHB, and FEGLI.
            </p>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: colors.textDark,
                margin: 0,
              }}
            >
              Your consultant is a certified federal retirement specialist who will provide objective, personalized
              guidance based on your unique situation and goals.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        style={{
          backgroundColor: colors.lightGray,
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
              color: colors.textDark,
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
                    color: colors.navy,
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: colors.darkGray,
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
          backgroundColor: 'white',
          padding: '80px 20px',
          borderTop: `1px solid ${colors.border}`,
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
              color: colors.textDark,
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
                backgroundColor: colors.maroon,
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5f1423';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.maroon;
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
          backgroundColor: colors.lightGray,
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
              color: colors.textDark,
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
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.textDark,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.lightGray;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
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
                      backgroundColor: colors.lightGray,
                      borderTop: `1px solid ${colors.border}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: '15px',
                        lineHeight: 1.7,
                        color: colors.darkGray,
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
          backgroundColor: 'white',
          padding: '80px 20px',
          textAlign: 'center',
          borderTop: `1px solid ${colors.border}`,
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
              color: colors.textDark,
            }}
          >
            Ready to get clarity on your retirement plan?
          </h2>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '16px 48px',
              backgroundColor: colors.maroon,
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '32px',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5f1423';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.maroon;
            }}
          >
            Schedule a Conversation
          </a>

          <p
            style={{
              fontSize: '15px',
              color: colors.darkGray,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Not ready yet?{' '}
            <a
              href="/calculator"
              style={{
                color: colors.maroon,
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
                color: colors.maroon,
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
