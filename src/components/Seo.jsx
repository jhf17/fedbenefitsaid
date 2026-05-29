import { Helmet } from 'react-helmet-async'
import { brand } from '../constants/brand'

/**
 * Per-route SEO tags. Injects unique title, description, canonical, and Open
 * Graph tags for each public route. Matches the defaults in index.html so
 * non-JS scrapers (LinkedIn, X, Slack, Discord) fall back cleanly while JS-
 * capable crawlers (Google, Bing) see the route-specific tags.
 *
 * Brand-aware: pulls site URL, name, and default og image from `brand.js`,
 * which resolves from the VITE_BRAND build-time env var.
 *
 * Props
 * - title:       55–60 char page-specific title (the " | {brand.name}" suffix is appended automatically unless `rawTitle` is true)
 * - description: 150–160 char benefit-oriented description
 * - path:        route path (e.g. "/calculator"); used to build canonical + og:url
 * - ogImage:     absolute or relative image URL (defaults to brand.ogImage)
 * - noindex:     pass true on /admin, /auth, /404 etc.
 * - rawTitle:    pass true if `title` already has the full suffix
 */
export default function Seo({
  title,
  description,
  path = '/',
  ogImage,
  noindex = false,
  rawTitle = false,
}) {
  const SITE_URL = brand.url
  const DEFAULT_OG_IMAGE = brand.ogImage
  const effectiveOgImage = ogImage || DEFAULT_OG_IMAGE

  const fullTitle = rawTitle ? title : `${title} | ${brand.name}`
  const canonical = `${SITE_URL}${path === '/' ? '' : path}`
  const ogImageAbs = effectiveOgImage.startsWith('http') ? effectiveOgImage : `${SITE_URL}${effectiveOgImage}`

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
      <meta property="og:site_name" content={brand.name} />

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
