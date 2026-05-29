// Single source of truth for site-wide configuration.
// Brand-specific values (name, domain, calendar URL) come from brand.js,
// which reads VITE_BRAND at build time. Edit brand.data.js to change them.

import { brand } from '../constants/brand'

export const siteConfig = {
  brand: {
    siteName: brand.name,
    operator: brand.legalName,
    operatorLegal: brand.legalName,
    domain: brand.domain,
  },

  scheduling: {
    calendlyUrl: brand.calendly.url,
    calendlyEmbedUrl: brand.calendly.embedUrl,
    callDurationMinutes: brand.calendly.durationMinutes,
  },

  // States where insurance/annuity products cannot be placed.
  // The /consultation flow routes visitors from these states to a free-resources path.
  unavailableStates: ['CA', 'NY', 'AR'],
  unavailableStateNames: {
    CA: 'California',
    NY: 'New York',
    AR: 'Arkansas',
  },

  // CAN-SPAM postal address — required at the bottom of all marketing emails.
  // {{REPLACE_WHEN_AVAILABLE: physical mailing address — e.g., a UPS Store mailbox}}
  postalAddress: '',

  // Source citations shown on benefit-rate pages. When figures change at year-end,
  // update the date here and on refData.js so the UI signals freshness.
  dataLastUpdated: '2026-04',
  dataSources: [
    { name: 'Office of Personnel Management', url: 'https://www.opm.gov/retirement-center/' },
    { name: 'Internal Revenue Service', url: 'https://www.irs.gov/' },
    { name: 'Social Security Administration', url: 'https://www.ssa.gov/' },
    { name: 'CMS — Medicare', url: 'https://www.medicare.gov/' },
    { name: 'Federal Retirement Thrift Investment Board (TSP)', url: 'https://www.tsp.gov/' },
  ],
}

// Convenience exports
export const CALENDLY_URL = siteConfig.scheduling.calendlyUrl
export const CALENDLY_EMBED_URL = siteConfig.scheduling.calendlyEmbedUrl
export const UNAVAILABLE_STATES = siteConfig.unavailableStates
export const UNAVAILABLE_STATE_NAMES = siteConfig.unavailableStateNames
export const DATA_LAST_UPDATED = siteConfig.dataLastUpdated
export const DATA_SOURCES = siteConfig.dataSources
