import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext, Suspense, lazy } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Seo from './components/Seo'
import Landing from './pages/Landing'
const Reference = lazy(() => import('./pages/Reference'))
import Auth from './pages/Auth'
const Resources = lazy(() => import('./pages/Resources'))
const Admin = lazy(() => import('./pages/Admin'))
const Assessment = lazy(() => import('./pages/Assessment'))
const Calculators = lazy(() => import('./pages/Tools'))
const FEGLICalculator = lazy(() => import('./pages/FEGLICalculator'))
const FersPension = lazy(() => import('./pages/calculators/FersPension'))
const CsrsPension = lazy(() => import('./pages/calculators/CsrsPension'))
const SpecialProvisionsPension = lazy(() => import('./pages/calculators/SpecialProvisionsPension'))
const About = lazy(() => import('./pages/About'))
import Disclaimer from './pages/Disclaimer'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Consultation from './pages/Consultation'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'

// Auth context — available throughout the app
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function NotFound() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ef', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Seo title="Page Not Found" description="The page you're looking for doesn't exist on FedBenefitsAid." path="/404" noindex />
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontFamily: "'Fraunces', 'Source Serif 4', Georgia, serif", fontSize: '4.5rem', fontWeight: 600, color: '#d4b88a', letterSpacing: '-0.04em', marginBottom: 12, fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>404</div>
        <h1 style={{ fontFamily: "'Fraunces', 'Source Serif 4', Georgia, serif", fontSize: '1.6rem', fontWeight: 600, color: '#1f3d2c', marginBottom: 12, letterSpacing: '-0.01em' }}>Page not found</h1>
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
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-dark" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null }}>
      <ErrorBoundary>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><div style={{width:40,height:40,border:'4px solid #e5e7eb',borderTop:'4px solid #b08d5a',borderRadius:'50%',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reference" element={<Reference />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/calculators/fers" element={<FersPension />} />
        <Route path="/calculators/csrs" element={<CsrsPension />} />
        <Route path="/calculators/special" element={<SpecialProvisionsPension />} />
        <Route path="/calculators/fegli" element={<FEGLICalculator />} />
        <Route path="/calculator" element={<Navigate to="/calculators/fers" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <Footer />
      <CookieConsent />
      </ErrorBoundary>
    </AuthContext.Provider>
  )
}
