import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Seo from './components/Seo'
import { brand } from './constants/brand'
import LandingFBA from './pages/Landing'
import LandingFMA from './pages/LandingFMA'

// Home component switches by brand. Drop in another LandingX for a future brand.
const Landing = brand.homePage === 'LandingFMA' ? LandingFMA : LandingFBA
const Reference = lazy(() => import('./pages/Reference'))
const Resources = lazy(() => import('./pages/Resources'))
const Calculators = lazy(() => import('./pages/Tools'))
const FEGLICalculator = lazy(() => import('./pages/FEGLICalculator'))
const FersPension = lazy(() => import('./pages/calculators/FersPension'))
const CsrsPension = lazy(() => import('./pages/calculators/CsrsPension'))
const SpecialProvisionsPension = lazy(() => import('./pages/calculators/SpecialProvisionsPension'))
const IncomePicture = lazy(() => import('./pages/calculators/IncomePicture'))
const High3 = lazy(() => import('./pages/calculators/High3'))
const WhatIf = lazy(() => import('./pages/calculators/WhatIf'))
const TspDrawdown = lazy(() => import('./pages/calculators/TspDrawdown'))
const AdvisorSummary = lazy(() => import('./pages/AdvisorSummary'))
const About = lazy(() => import('./pages/About'))
import Disclaimer from './pages/Disclaimer'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Consultation from './pages/Consultation'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'

function NotFound() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4ece0', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Seo title="Page Not Found" description={`The page you're looking for doesn't exist on ${brand.name}.`} path="/404" noindex />
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontFamily: "'Fraunces', 'Source Serif 4', Georgia, serif", fontSize: '4.5rem', fontWeight: 600, color: '#d4b88a', letterSpacing: '-0.04em', marginBottom: 12, fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>404</div>
        <h1 style={{ fontFamily: "'Fraunces', 'Source Serif 4', Georgia, serif", fontSize: '1.6rem', fontWeight: 600, color: '#1a2d5c', marginBottom: 12, letterSpacing: '-0.01em' }}>Page not found</h1>
        <p style={{ color: '#475569', marginBottom: 28, lineHeight: 1.65 }}>
          The page you're looking for doesn't exist. Head back to the home page or jump into a calculator.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className="btn btn-navy">Back to Home</a>
          <a href="/calculators" className="btn btn-outline">Open Calculators</a>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><div style={{width:40,height:40,border:'4px solid #e5e7eb',borderTop:'4px solid #b08d5a',borderRadius:'50%',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/reference" element={<Reference />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/calculators/fers" element={<FersPension />} />
          <Route path="/calculators/csrs" element={<CsrsPension />} />
          <Route path="/calculators/special" element={<SpecialProvisionsPension />} />
          <Route path="/calculators/income-picture" element={<IncomePicture />} />
          <Route path="/calculators/income-gap" element={<Navigate to="/calculators/income-picture" replace />} />
          <Route path="/calculators/high-3" element={<High3 />} />
          <Route path="/calculators/what-if" element={<WhatIf />} />
          <Route path="/calculators/tsp-drawdown" element={<TspDrawdown />} />
          <Route path="/advisor" element={<AdvisorSummary />} />
          <Route path="/calculators/fegli" element={<FEGLICalculator />} />
          <Route path="/calculator" element={<Navigate to="/calculators/fers" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <CookieConsent />
    </ErrorBoundary>
  )
}
