import { Helmet } from 'react-helmet-async'

/**
 * Per-route SEO tags. Injects unique title, description, canonical, and Open
 * Graph tags for each public route. Matches the defaults in index.html so
 * non-JS scrapers (LinkedIn, X, Slack, Discord) fall back cleanly while JS-
 * capable crawlers (Google, Bing) see the route-specific tags.
 *
 * Props
 * - title:       55–60 char page-specific title (the "| FedBenefitsAid" suffix is appended automatically unless `rawTitle` is true)
 * - description: 150–160 char benefit-oriented description
 * - path:        route path (e.g. "/calculator"); used to build canonical + og:url
 * - ogImage:     absolute or relative image URL (defaults to /og-image.png)
 * - noindex:     pass true on /admin, /auth, /404 etc.
 * - rawTitle:    pass true if `title` already has the full suffix
 */
const SITE_URL = 'https://fedbenefitsaid.com'
const DEFAULT_OG_IMAGE = '/og-image.png'

export default function Seo({
  title,
  description,
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  rawTitle = false,
}) {
  const fullTitle = rawTitle ? title : `${title} | FedBenefitsAid`
  const canonical = `${SITE_URL}${path === '/' ? '' : path}`
  const ogImageAbs = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageAbs} />
      <meta property="og:site_name" content="FedBenefitsAid" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageAbs} />

      {/* Robots — default to index,follow; opt out for admin/auth/404 */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  )
}
