import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const CALENDLY_URL = 'https://calendly.com/jhf17/30min'

export default function Landing() {
  useEffect(() => { document.title = 'FedBenefitsAid — Federal Retirement Benefits, Simplified' }, [])

  return (
    <main id="main-content">
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </main>
  )
}
