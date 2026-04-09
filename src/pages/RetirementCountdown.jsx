import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const RetirementCountdown = () => {
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [serviceStartDate, setServiceStartDate] = useState('')
  const [retirementSystem, setRetirementSystem] = useState('FERS')
  const [results, setResults] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // OPM.gov FERS MRA Table with full month precision
  const getFERSMRA = (birthYear) => {
    if (birthYear < 1948) return { years: 55, months: 0 }
    if (birthYear === 1948) return { years: 55, months: 2 }
    if (birthYear === 1949) return { years: 55, months: 4 }
    if (birthYear === 1950) return { years: 55, months: 6 }
    if (birthYear === 1951) return { years: 55, months: 8 }
    if (birthYear === 1952) return { years: 55, months: 10 }
    if (birthYear >= 1953 && birthYear <= 1964) return { years: 56, months: 0 }
    if (birthYear === 1965) return { years: 56, months: 2 }
    if (birthYear === 1966) return { years: 56, months: 4 }
    if (birthYear === 1967) return { years: 56, months: 6 }
    if (birthYear === 1968) return { years: 56, months: 8 }
    if (birthYear === 1969) return { years: 56, months: 10 }
    if (birthYear >= 1970) return { years: 57, months: 0 }
    return { years: 55, months: 0 }
  }

  // Calculate age at a given date
  const calculateAge = (birthDate, targetDate) => {
    let years = targetDate.getFullYear() - birthDate.getFullYear()
    let months = targetDate.getMonth() - birthDate.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    return { years, months }
  }

  // Add months to a date
  const addMonthsToDate = (date, monthsToAdd) => {
    const newDate = new Date(date)
    newDate.setMonth(newDate.getMonth() + monthsToAdd)
    return newDate
  }

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate countdown text
  const calculateCountdown = (targetDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)

    if (target <= today) {
      return 'You are eligible now!'
    }

    let years = target.getFullYear() - today.getFullYear()
    let months = target.getMonth() - today.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    if (years === 0 && months === 0) return 'You are eligible now!'
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''} from today`
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''} from today`

    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} from today`
  }

  // Calculate years of service
  const calculateYearsOfService = (serviceStart) => {
    const today = new Date()
    const start = new Date(serviceStart)

    let years = today.getFullYear() - start.getFullYear()
    let months = today.getMonth() - start.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    return { years, months, totalMonths: years * 12 + months }
  }

  // Main calculation function
  const calculateEligibility = (e) => {
    e.preventDefault()
    setHasSubmitted(true)

    if (!dateOfBirth || !serviceStartDate) {
      alert('Please fill in all required fields')
      return
    }

    const birth = new Date(dateOfBirth)
    const serviceStart = new Date(serviceStartDate)
    const today = new Date()

    const birthYear = birth.getFullYear()
    const serviceYears = calculateYearsOfService(serviceStart)

    let eligibilityPaths = []

    if (retirementSystem === 'FERS') {
      const mra = getFERSMRA(birthYear)
      const mraDate = addMonthsToDate(birth, mra.years * 12 + mra.months)

      // Path 1: MRA + 30 years
      const mra30Date = new Date(serviceStart)
      mra30Date.setFullYear(mra30Date.getFullYear() + 30)
      const eligDate1 = mra30Date > mraDate ? mra30Date : mraDate
      eligibilityPaths.push({
        name: 'Immediate Retirement',
        subtitle: `MRA + 30 years (MRA: ${mra.years} years, ${mra.months} months)`,
        date: eligDate1,
        penalty: false,
        supplement: true,
        description: 'You can retire immediately with full benefits. You receive a FERS annuity and the FERS supplement until age 62.',
        order: 1
      })

      // Path 2: Age 60 + 20 years
      const age60Date = new Date(birth)
      age60Date.setFullYear(age60Date.getFullYear() + 60)
      const service20Date = new Date(serviceStart)
      service20Date.setFullYear(service20Date.getFullYear() + 20)
      const eligDate2 = age60Date > service20Date ? age60Date : service20Date
      eligibilityPaths.push({
        name: 'Immediate Retirement',
        subtitle: 'Age 60 + 20 years of service',
        date: eligDate2,
        penalty: false,
        supplement: true,
        description: 'You can retire immediately with full benefits. You receive a FERS annuity and the FERS supplement until age 62.',
        order: 2
      })

      // Path 3: Age 62 + 5 years
      const age62Date = new Date(birth)
      age62Date.setFullYear(age62Date.getFullYear() + 62)
      const service5Date = new Date(serviceStart)
      service5Date.setFullYear(service5Date.getFullYear() + 5)
      const eligDate3 = age62Date > service5Date ? age62Date : service5Date
      eligibilityPaths.push({
        name: 'Immediate Retirement',
        subtitle: 'Age 62 + 5 years of service',
        date: eligDate3,
        penalty: false,
        supplement: true,
        description: 'You can retire with an unreduced FERS annuity. No penalty applies.',
        order: 3
      })

      // Path 4: MRA + 10 years (Reduced)
      const mra10Date = new Date(serviceStart)
      mra10Date.setFullYear(mra10Date.getFullYear() + 10)
      const eligDate4 = mra10Date > mraDate ? mra10Date : mraDate
      const monthsUntil62 = Math.max(0, (62 - mra.years - Math.floor(mra.months / 12)) * 12 - mra.months)
      const penaltyPercent = Math.min(monthsUntil62 * (5 / 12), 30) // Max 30% if under MRA
      eligibilityPaths.push({
        name: 'Reduced Retirement',
        subtitle: `MRA + 10 years (with penalty)`,
        date: eligDate4,
        penalty: true,
        penaltyPercent: Math.round(penaltyPercent * 10) / 10,
        supplement: false,
        description: `You can retire with a reduced FERS annuity. Your benefit is reduced 5% for each year you are under age 62. You receive a FERS supplement until age 62.`,
        order: 4
      })

      // Path 5: Deferred - MRA + 5 years (if they leave before retirement)
      const deferred5Date = new Date(serviceStart)
      deferred5Date.setFullYear(deferred5Date.getFullYear() + 5)
      const eligDate5 = deferred5Date > mraDate ? deferred5Date : mraDate
      if (serviceYears.years < 10) {
        eligibilityPaths.push({
          name: 'Deferred Retirement',
          subtitle: 'MRA + 5 years (at minimum)',
          date: eligDate5,
          penalty: false,
          supplement: false,
          description: 'If you leave federal service before vesting, you can receive a deferred FERS annuity starting at your MRA (minimum 5 years of service). No FERS supplement applies.',
          order: 5
        })
      }
    } else if (retirementSystem === 'CSRS') {
      // Path 1: Age 55 + 30 years
      const age55Date = new Date(birth)
      age55Date.setFullYear(age55Date.getFullYear() + 55)
      const service30Date = new Date(serviceStart)
      service30Date.setFullYear(service30Date.getFullYear() + 30)
      const eligDate1 = age55Date > service30Date ? age55Date : service30Date
      eligibilityPaths.push({
        name: 'Immediate Retirement',
        subtitle: 'Age 55 + 30 years of service',
        date: eligDate1,
        penalty: false,
        supplement: false,
        description: 'You can retire immediately with a full CSRS annuity based on your high-3 average salary and years of service.',
        order: 1
      })

      // Path 2: Age 60 + 20 years
      const age60Date = new Date(birth)
      age60Date.setFullYear(age60Date.getFullYear() + 60)
      const service20Date = new Date(serviceStart)
      service20Date.setFullYear(service20Date.getFullYear() + 20)
      const eligDate2 = age60Date > service20Date ? age60Date : service20Date
      eligibilityPaths.push({
        name: 'Immediate Retirement',
        subtitle: 'Age 60 + 20 years of service',
        date: eligDate2,
        penalty: false,
        supplement: false,
        description: 'You can retire immediately with a full CSRS annuity.',
        order: 2
      })

      // Path 3: Age 62 + 5 years
      const age62Date = new Date(birth)
      age62Date.setFullYear(age62Date.getFullYear() + 62)
      const service5Date = new Date(serviceStart)
      service5Date.setFullYear(service5Date.getFullYear() + 5)
      const eligDate3 = age62Date > service5Date ? age62Date : service5Date
      eligibilityPaths.push({
        name: 'Immediate Retirement',
        subtitle: 'Age 62 + 5 years of service',
        date: eligDate3,
        penalty: false,
        supplement: false,
        description: 'You can retire with a full CSRS annuity.',
        order: 3
      })
    } else if (retirementSystem === 'FERS-SP') {
      // Path 1: Mandatory - Age 57 + 20 years
      const age57Date = new Date(birth)
      age57Date.setFullYear(age57Date.getFullYear() + 57)
      const service20Date = new Date(serviceStart)
      service20Date.setFullYear(service20Date.getFullYear() + 20)
      const eligDate1 = age57Date > service20Date ? age57Date : service20Date
      eligibilityPaths.push({
        name: 'Mandatory Retirement',
        subtitle: 'Age 57 + 20 years of service',
        date: eligDate1,
        penalty: false,
        supplement: true,
        description: 'You must retire at this age with 20+ years of service. You receive a FERS Special Provision annuity and supplement until age 62.',
        isMandatory: true,
        order: 1
      })

      // Path 2: Age 50 + 20 years
      const age50Date = new Date(birth)
      age50Date.setFullYear(age50Date.getFullYear() + 50)
      const service20Date2 = new Date(serviceStart)
      service20Date2.setFullYear(service20Date2.getFullYear() + 20)
      const eligDate2 = age50Date > service20Date2 ? age50Date : service20Date2
      eligibilityPaths.push({
        name: 'Immediate Retirement',
        subtitle: 'Age 50 + 20 years of service',
        date: eligDate2,
        penalty: false,
        supplement: true,
        description: 'You can retire early with a FERS Special Provision annuity and supplement until age 62.',
        order: 2
      })

      // Path 3: Any age + 25 years
      const service25Date = new Date(serviceStart)
      service25Date.setFullYear(service25Date.getFullYear() + 25)
      eligibilityPaths.push({
        name: 'Immediate Retirement',
        subtitle: 'Any age + 25 years of service',
        date: service25Date,
        penalty: false,
        supplement: true,
        description: 'You can retire at any age after 25 years of service with a FERS Special Provision annuity and supplement until age 62.',
        order: 3
      })
    }

    // Sort by earliest date and mark the earliest as primary
    eligibilityPaths.sort((a, b) => a.date - b.date)
    if (eligibilityPaths.length > 0) {
      eligibilityPaths[0].isEarliest = true
    }

    setResults({
      dateOfBirth: birth,
      serviceStartDate: serviceStart,
      retirementSystem,
      yearsOfService: serviceYears,
      paths: eligibilityPaths
    })
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#faf9f6',
      padding: '40px 20px',
      fontFamily: "'Source Sans 3', -apple-system, sans-serif"
    },
    contentWrapper: {
      maxWidth: '1000px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '40px',
      textAlign: 'center'
    },
    title: {
      fontSize: '48px',
      fontWeight: '700',
      fontFamily: "'Merriweather', Georgia, serif",
      color: '#0f172a',
      marginBottom: '12px',
      lineHeight: '1.2'
    },
    subtitle: {
      fontSize: '18px',
      color: '#64748b',
      marginBottom: '8px'
    },
    description: {
      fontSize: '16px',
      color: '#475569',
      lineHeight: '1.6'
    },
    formContainer: {
      backgroundColor: '#fff',
      borderRadius: '14px',
      padding: '32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      marginBottom: '40px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '12px 14px',
      fontSize: '14px',
      fontFamily: "'Source Sans 3', -apple-system, sans-serif",
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    select: {
      width: '100%',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '12px 14px',
      fontSize: '14px',
      fontFamily: "'Source Sans 3', -apple-system, sans-serif",
      boxSizing: 'border-box',
      backgroundColor: '#fff',
      cursor: 'pointer'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '24px',
      marginBottom: '24px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '32px'
    },
    submitButton: {
      flex: 1,
      backgroundColor: '#7b1c2e',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '14px 24px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontFamily: "'Source Sans 3', -apple-system, sans-serif"
    },
    resetButton: {
      flex: 1,
      backgroundColor: '#e2e8f0',
      color: '#0f172a',
      border: 'none',
      borderRadius: '10px',
      padding: '14px 24px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontFamily: "'Source Sans 3', -apple-system, sans-serif"
    },
    resultsContainer: {
      marginBottom: '40px'
    },
    resultsSummary: {
      backgroundColor: '#fff',
      borderRadius: '14px',
      padding: '24px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      marginBottom: '24px',
      borderLeft: '4px solid #7b1c2e'
    },
    summaryText: {
      fontSize: '16px',
      color: '#0f172a',
      lineHeight: '1.6',
      margin: '8px 0'
    },
    resultCard: {
      backgroundColor: '#fff',
      borderRadius: '14px',
      padding: '24px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      marginBottom: '16px',
      transition: 'all 0.2s'
    },
    resultCardEarliest: {
      borderLeft: '4px solid #d4a574'
    },
    resultCardTitle: {
      fontSize: '18px',
      fontWeight: '700',
      fontFamily: "'Merriweather', Georgia, serif",
      color: '#0f172a',
      marginBottom: '4px'
    },
    resultCardSubtitle: {
      fontSize: '14px',
      color: '#7b1c2e',
      fontWeight: '600',
      marginBottom: '12px'
    },
    resultDate: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '8px'
    },
    resultCountdown: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#16a34a',
      marginBottom: '12px'
    },
    resultCountdownIneligible: {
      color: '#ea580c'
    },
    resultDescription: {
      fontSize: '14px',
      color: '#475569',
      lineHeight: '1.6',
      marginBottom: '12px'
    },
    penaltyBadge: {
      display: 'inline-block',
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      marginRight: '8px',
      marginBottom: '8px'
    },
    supplementBadge: {
      display: 'inline-block',
      backgroundColor: '#dcfce7',
      color: '#166534',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      marginRight: '8px',
      marginBottom: '8px'
    },
    mandatoryBadge: {
      display: 'inline-block',
      backgroundColor: '#fef3c7',
      color: '#92400e',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      marginRight: '8px',
      marginBottom: '8px'
    },
    ctaSection: {
      backgroundColor: '#fff',
      borderRadius: '14px',
      padding: '40px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      marginBottom: '40px',
      textAlign: 'center'
    },
    ctaTitle: {
      fontSize: '24px',
      fontWeight: '700',
      fontFamily: "'Merriweather', Georgia, serif",
      color: '#0f172a',
      marginBottom: '16px'
    },
    ctaText: {
      fontSize: '16px',
      color: '#475569',
      marginBottom: '24px',
      lineHeight: '1.6'
    },
    ctaButtons: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    ctaButton: {
      padding: '14px 32px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '10px',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'all 0.2s',
      fontFamily: "'Source Sans 3', -apple-system, sans-serif",
      border: 'none',
      cursor: 'pointer'
    },
    ctaPrimary: {
      backgroundColor: '#7b1c2e',
      color: '#fff'
    },
    ctaSecondary: {
      backgroundColor: '#e2e8f0',
      color: '#0f172a'
    },
    disclaimer: {
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '40px',
      fontSize: '13px',
      color: '#64748b',
      lineHeight: '1.6',
      borderLeft: '3px solid #cbd5e1'
    },
    disclaimerTitle: {
      fontWeight: '700',
      color: '#475569',
      marginBottom: '8px'
    }
  }

  return (
    <div style={styles.container}>
      <style>{`
        @media (max-width: 768px) {
          [data-form-row] {
            grid-template-columns: 1fr !important;
          }
          [data-cta-buttons] {
            flex-direction: column !important;
          }
          [data-cta-button] {
            width: 100% !important;
          }
        }
        input:focus, select:focus {
          outline: none;
          border-color: #7b1c2e;
          box-shadow: 0 0 0 3px rgba(123, 28, 46, 0.1);
        }
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={styles.contentWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Federal Retirement Countdown</h1>
          <p style={styles.subtitle}>When Can You Retire?</p>
          <p style={styles.description}>
            Calculate your earliest retirement eligibility date based on OPM.gov rules for FERS, CSRS, and Special Provision systems.
          </p>
        </div>

        {/* Form */}
        <div style={styles.formContainer}>
          <form onSubmit={calculateEligibility}>
            <div data-form-row style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth *</label>
                <input
                  style={styles.input}
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Federal Service Start Date *</label>
                <input
                  style={styles.input}
                  type="date"
                  value={serviceStartDate}
                  onChange={(e) => setServiceStartDate(e.target.value)}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Retirement System *</label>
                <select
                  style={styles.select}
                  value={retirementSystem}
                  onChange={(e) => setRetirementSystem(e.target.value)}
                >
                  <option value="FERS">FERS (Federal Employees Retirement System)</option>
                  <option value="CSRS">CSRS (Civil Service Retirement System)</option>
                  <option value="FERS-SP">FERS Special Provision (LEO/FF/ATC)</option>
                </select>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={{ ...styles.submitButton, ...styles.ctaPrimary }}>
                Calculate Eligibility
              </button>
              <button
                type="button"
                style={styles.resetButton}
                onClick={() => {
                  setDateOfBirth('')
                  setServiceStartDate('')
                  setRetirementSystem('FERS')
                  setResults(null)
                  setHasSubmitted(false)
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div style={styles.resultsContainer}>
            {/* Summary Card */}
            <div style={styles.resultsSummary}>
              <div style={styles.summaryText}>
                <strong>Birthdate:</strong> {formatDate(results.dateOfBirth)}
              </div>
              <div style={styles.summaryText}>
                <strong>Service Start:</strong> {formatDate(results.serviceStartDate)}
              </div>
              <div style={styles.summaryText}>
                <strong>Years of Service (as of today):</strong> {results.yearsOfService.years} years, {results.yearsOfService.months} months
              </div>
              <div style={styles.summaryText}>
                <strong>Retirement System:</strong> {results.retirementSystem === 'FERS' ? 'FERS' : results.retirementSystem === 'CSRS' ? 'CSRS' : 'FERS Special Provision'}
              </div>
            </div>

            {/* Eligibility Paths */}
            <div>
              <h2 style={{ ...styles.title, fontSize: '28px', marginBottom: '24px', textAlign: 'left' }}>
                Your Retirement Eligibility Paths
              </h2>

              {results.paths.map((path, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.resultCard,
                    ...(path.isEarliest ? styles.resultCardEarliest : {})
                  }}
                >
                  {path.isEarliest && (
                    <div
                      style={{
                        color: '#d4a574',
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Earliest Eligible Date
                    </div>
                  )}

                  <div style={styles.resultCardTitle}>{path.name}</div>
                  <div style={styles.resultCardSubtitle}>{path.subtitle}</div>

                  <div style={styles.resultDate}>{formatDate(path.date)}</div>

                  <div
                    style={{
                      ...styles.resultCountdown,
                      ...(calculateCountdown(path.date) === 'You are eligible now!' ? {} : styles.resultCountdownIneligible)
                    }}
                  >
                    {calculateCountdown(path.date)}
                  </div>

                  <div>
                    {path.isMandatory && <div style={styles.mandatoryBadge}>Mandatory at this age</div>}
                    {path.penalty && (
                      <div style={styles.penaltyBadge}>
                        5% annual penalty {path.penaltyPercent && `(~${path.penaltyPercent}% if you retire now)`}
                      </div>
                    )}
                    {path.supplement && (
                      <div style={styles.supplementBadge}>FERS Supplement until age 62</div>
                    )}
                  </div>

                  <div style={styles.resultDescription}>{path.description}</div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div style={styles.ctaSection}>
              <h3 style={styles.ctaTitle}>Ready to Plan Your Retirement?</h3>
              <p style={styles.ctaText}>
                Save these results and get personalized guidance on maximizing your federal retirement benefits.
              </p>
              <div data-cta-buttons style={styles.ctaButtons}>
                <Link
                  data-cta-button
                  to="/signup"
                  style={{
                    ...styles.ctaButton,
                    ...styles.ctaPrimary
                  }}
                >
                  Save Results & Get Started
                </Link>
                <a
                  data-cta-button
                  href="https://calendly.com/jhf17/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...styles.ctaButton,
                    ...styles.ctaSecondary
                  }}
                >
                  Schedule Free Consultation
                </a>
              </div>
            </div>

            {/* Disclaimer */}
            <div style={styles.disclaimer}>
              <div style={styles.disclaimerTitle}>Important Disclaimer</div>
              <p>
                Calculations are based on OPM.gov retirement eligibility rules and are provided for educational purposes only. These results are not an official determination of your retirement eligibility. For authoritative retirement information, consult your agency HR office, OPM, or a qualified financial advisor.
              </p>
              <p style={{ marginTop: '8px' }}>
                Source: OPM.gov Retirement Eligibility Guides
              </p>
            </div>
          </div>
        )}

        {/* Empty State Info */}
        {!results && (
          <div style={styles.disclaimer}>
            <div style={styles.disclaimerTitle}>How This Tool Works</div>
            <p>
              Enter your date of birth, federal service start date, and retirement system to calculate all your eligible retirement dates under OPM rules. The tool accounts for:
            </p>
            <ul style={{ marginTop: '12px', marginLeft: '20px' }}>
              <li>FERS Minimum Retirement Age (MRA) by birth year</li>
              <li>Years and months of creditable service</li>
              <li>All major retirement paths: immediate, reduced, and deferred</li>
              <li>FERS Supplement eligibility</li>
              <li>Special provisions for law enforcement, firefighters, and air traffic controllers</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default RetirementCountdown
