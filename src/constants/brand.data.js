// Pure brand data — no Vite env access. Safe to import from both client code
// and Node-side tooling (vite.config.js, build scripts, Netlify functions).
//
// To add a new brand: add an entry to `brands`, then either set VITE_BRAND in
// the Netlify site's env vars (client-side) or pass the brand id to getBrand().

export const FBA = {
  id: 'fba',
  name: 'FedBenefitsAid',
  legalName: 'Federal Market Associates',
  shortName: 'FBA',
  domain: 'fedbenefitsaid.com',
  url: 'https://fedbenefitsaid.com',
  logo: {
    type: 'text', // text | image
    parts: [
      { text: 'Fed', emphasis: 'primary' },
      { text: 'Benefits', emphasis: 'accent' },
      { text: 'Aid', emphasis: 'primary' },
    ],
  },
  tagline: 'Federal Retirement Benefits, Simplified',
  description:
    'Free calculators, reference library, and a free meeting with a Federal Retirement Consultant for U.S. federal employees navigating FERS, CSRS, TSP, FEHB, FEGLI, Medicare, and Social Security.',
  shortDescription:
    'Free, accurate education for federal employees navigating retirement benefits — built and maintained for the current benefit year.',
  attributionLine: 'An education resource by Federal Market Associates',
  copyrightHolder: 'Federal Market Associates',
  ogImage: '/og-image.png',
  favicon: '/favicon.svg',
  colors: {
    primary: '#1f3d2c', // pine
    primaryDark: '#142a1d',
    primaryLight: '#2c5544',
    accent: '#b08d5a', // brass
    accentDark: '#8d6f44',
    accentLight: '#d4b88a',
  },
  calendly: {
    url: 'https://calendly.com/jhf17/30min',
    embedUrl:
      'https://calendly.com/jhf17/30min?hide_gdpr_banner=1&background_color=faf6ef&text_color=1f2937&primary_color=b08d5a',
    durationMinutes: 30,
  },
  contact: {
    phone: '',
    phoneDisplay: '',
    email: 'jhf17@icloud.com',
  },
  // Home page component name — App.jsx routes to this
  homePage: 'Landing',
}

export const FMA = {
  id: 'fma',
  name: 'Federal Market Associates',
  legalName: 'Federal Market Associates',
  shortName: 'FMA',
  domain: 'federalmarketassociates.com',
  url: 'https://federalmarketassociates.com',
  logo: {
    type: 'image',
    src: '/fma-logo.png',
    // Used as the in-header logo height (px). Width auto-scales.
    height: 52,
    alt: 'Federal Market Associates',
    // Fallback text rendered when logo image fails to load.
    fallbackText: 'FMA',
  },
  tagline: 'Independent federal benefits education',
  description:
    'Independent federal benefits education and 1-on-1 advisory for U.S. federal employees and the agencies that serve them. Free calculators, library, and consultations on FERS, CSRS, TSP, FEHB, FEGLI, Medicare, and Social Security.',
  shortDescription:
    'Independent federal benefits education and on-site agency training. Free calculators, library, and 1-on-1 consultations.',
  attributionLine: '', // FMA is the brand itself — no parent attribution
  copyrightHolder: 'Federal Market Associates',
  // TODO: Generate FMA-specific OG image. Falls back to logo for now.
  ogImage: '/fma-logo.png',
  favicon: '/favicon.svg', // TODO: FMA-specific favicon
  colors: {
    primary: '#1a2d5c', // FMA navy (from logo)
    primaryDark: '#0f1d3d',
    primaryLight: '#2c4280',
    accent: '#7b1c2e', // FMA maroon (from logo)
    accentDark: '#5e1422',
    accentLight: '#a3334a',
  },
  calendly: {
    // TODO: Replace with FMA-specific Calendly event type once created.
    url: 'https://calendly.com/jhf17/30min',
    embedUrl:
      'https://calendly.com/jhf17/30min?hide_gdpr_banner=1&background_color=faf6ef&text_color=1f2937&primary_color=7b1c2e',
    durationMinutes: 30,
  },
  contact: {
    phone: '', // TODO: dedicated FMA business line
    phoneDisplay: '',
    email: 'jhf17@icloud.com',
  },
  homePage: 'LandingFMA',
}

export const brands = { fba: FBA, fma: FMA }

/**
 * Resolve a brand config by id. Falls back to FMA for unknown / missing ids —
 * FMA is the current default brand. Set VITE_BRAND=fba on a Netlify site to
 * render the legacy FedBenefitsAid brand instead.
 */
export function getBrand(id) {
  if (!id) return FMA
  const key = String(id).toLowerCase()
  return brands[key] || FMA
}
