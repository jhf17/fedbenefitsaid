import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getBrand } from './src/constants/brand.data.js'

/**
 * Brand-aware index.html transformer.
 *
 * Non-JS scrapers (LinkedIn, X, Slack, Discord, Facebook) read the static
 * index.html that comes off Netlify — they don't execute React. So per-route
 * <Seo> overrides don't help them. This plugin rewrites the brand-specific
 * strings in index.html at build time, so each Netlify deploy ships an
 * index.html with the correct brand metadata.
 *
 * No-op when VITE_BRAND=fba (or unset) — the on-disk index.html already has
 * FBA defaults, so the FBA build is byte-identical to before.
 */
function brandIndexHtml() {
  return {
    name: 'brand-index-html',
    transformIndexHtml(html) {
      const brand = getBrand(process.env.VITE_BRAND)
      if (brand.id === 'fba') return html

      let out = html
      // FBA-specific tagline → brand tagline
      out = out.replace(/Federal Retirement Benefits, Simplified/g, brand.tagline)
      // FBA-specific long description → brand description
      out = out.replace(
        /Free calculators, reference library, and a free meeting with a Federal Retirement Consultant for U\.S\. federal employees navigating FERS, CSRS, TSP, FEHB, FEGLI, Medicare, and Social Security\./g,
        brand.description
      )
      // FBA Organization description → brand short description
      out = out.replace(
        /Federal employee retirement benefits education and consultation/g,
        brand.shortDescription
      )
      // Site name (used in title, OG, JSON-LD)
      out = out.replace(/FedBenefitsAid/g, brand.name)
      // Canonical / JSON-LD URL
      out = out.replace(/https:\/\/fedbenefitsaid\.com/g, brand.url)
      // OG image path
      out = out.replace(/\/og-image\.png/g, brand.ogImage)
      return out
    },
  }
}

export default defineConfig({
  plugins: [react(), brandIndexHtml()],
})
