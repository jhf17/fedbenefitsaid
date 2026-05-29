// Vite-aware brand resolver. Reads VITE_BRAND env var at build time
// (Vite inlines import.meta.env.VITE_BRAND into the client bundle) and
// returns the matching brand config from brand.data.js.
//
// Set VITE_BRAND=fma on the Federal Market Associates Netlify site.
// Leave unset (or set to 'fba') for the existing fedbenefitsaid.com site.

import { FBA, FMA, brands, getBrand } from './brand.data'

const brandId = import.meta.env?.VITE_BRAND
export const brand = getBrand(brandId)

export { FBA, FMA, brands, getBrand }
export default brand
