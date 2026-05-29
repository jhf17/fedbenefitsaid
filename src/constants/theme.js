// src/constants/theme.js
// Shared design tokens. Brand-aware color tokens (primary/accent/...) read
// from src/constants/brand.js, which resolves the active brand from
// VITE_BRAND at build time. The legacy pine/brass tokens stay for components
// that are intentionally FBA-styled (e.g. the FBA-only Landing page).
//
// Import pieces as needed:
//   import { colors, gradients, spacing, radii, shadows, fonts } from '../constants/theme'

import { brand } from './brand'

const PRIMARY = brand.colors.primary
const PRIMARY_DARK = brand.colors.primaryDark
const PRIMARY_LIGHT = brand.colors.primaryLight
const ACCENT = brand.colors.accent
const ACCENT_DARK = brand.colors.accentDark
const ACCENT_LIGHT = brand.colors.accentLight

// Tint a hex color into a soft pale background suitable for callouts.
function pale(hex, alpha = 0.08) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export const colors = {
  // === Brand-aware tokens — switch with VITE_BRAND ===
  primary: PRIMARY,
  primaryDark: PRIMARY_DARK,
  primaryLight: PRIMARY_LIGHT,
  primaryTint: pale(PRIMARY, 0.06),
  primaryBorder: pale(PRIMARY, 0.1),
  accent: ACCENT,
  accentDark: ACCENT_DARK,
  accentLight: ACCENT_LIGHT,
  accentTint: pale(ACCENT, 0.12),
  accentPale: pale(ACCENT, 0.06),
  accentBorder: pale(ACCENT, 0.4),

  // === Legacy FBA-specific tokens (Heritage Pine + Brass) ===
  // Kept verbatim so the FBA-only Landing page renders unchanged when
  // someone sets VITE_BRAND=fba. New code should prefer the brand-aware
  // tokens above.
  pine: '#1f3d2c',
  pineDeep: '#142a1d',
  pineLight: '#2c5544',
  sage: '#4a6b5a',
  sageLight: '#7d9b8d',
  sagePale: '#e6ede8',
  brass: '#b08d5a',
  brassDeep: '#8d6f44',
  brassLight: '#d4b88a',
  brassPale: '#f4eee0',

  // === Neutrals (brand-independent) ===
  cream: '#faf6ef',
  ivory: '#fefcf7',
  bone: '#f1ead9',
  charcoal: '#1f2937',

  // Legacy aliases — existing code uses these names
  navy: '#1f3d2c',
  navyDark: '#142a1d',
  secondaryNavy: '#2c5544',
  maroon: '#b08d5a',
  maroonDark: '#8d6f44',
  gold: '#b08d5a',

  // Page basics
  white: '#ffffff',
  lightGray: '#faf6ef',

  // Slate / neutrals
  slate700: '#475569',
  slate500: '#64748b',
  slate300: '#cbd5e1',
  slate100: '#f1f5f9',
  textMuted: 'rgba(255,255,255,0.78)',
}

export const gradients = {
  heroNavy: 'linear-gradient(160deg, #142a1d 0%, #1f3d2c 60%)',
  heroPine: 'linear-gradient(160deg, #142a1d 0%, #1f3d2c 60%)',
  cream: 'linear-gradient(135deg, #faf6ef, #fefcf7)',
  brass: 'linear-gradient(135deg, #b08d5a, #d4b88a)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
}

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  pill: 9999,
}

export const shadows = {
  sm: '0 1px 3px rgba(20,42,29,0.06)',
  md: '0 4px 12px rgba(20,42,29,0.08)',
  lg: '0 10px 25px rgba(20,42,29,0.10)',
  panel: '-2px 0 8px rgba(20,42,29,0.15)',
  glow: '0 0 0 1px rgba(176,141,90,0.12), 0 8px 24px rgba(31,61,44,0.08)',
}

export const fonts = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  serif: "'Fraunces', 'Source Serif 4', Georgia, 'Times New Roman', serif",
}

const theme = { colors, gradients, spacing, radii, shadows, fonts }
export default theme
