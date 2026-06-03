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

  // === Legacy "pine" tokens — REMAPPED to FMA navy (2026-06) ===
  // FMA is the only active brand (FedBenefitsAid is dormant), so these legacy
  // names now resolve to FMA navy. This instantly brings every not-yet-migrated
  // page (calculators, About, Consultation, Privacy, Terms, Disclaimer,
  // ConsultantCTA, ErrorBoundary) into the navy/parchment system without editing
  // ~16 files. Migrate consumers to the brand/ink tokens over time.
  pine: '#1a2d5c',       // → FMA navy (was #1f3d2c)
  pineDeep: '#0f1d3d',   // → FMA navy-dark
  pineLight: '#2c4280',  // → FMA navy-light
  sage: '#4a6b5a',
  sageLight: '#7d9b8d',
  sagePale: '#e6ede8',
  brass: '#7b1c2e',        // gold KILLED → FMA oxblood (accent on light surfaces) 2026-06-03
  brassDeep: '#5e1422',
  brassLight: '#cdd7e3',   // gold KILLED → light steel (the accent on navy surfaces)
  brassPale: '#eef1f6',

  // === Neutrals — warmed to FMA parchment (2026-06) ===
  cream: '#f6f3ee',      // de-parchmented → warm-white whisper 2026-06-03
  ivory: '#fdfcf9',
  bone: '#edeae3',
  charcoal: '#1f2937',

  // === "Ink & Parchment" tokens (FMA redesign, June 2026) ===
  // Warm parchment surfaces instead of stark white, and an ink text ramp
  // with a navy undertone. Used by the redesigned LandingFMA + rollout pages.
  // See memory: fma-redesign-direction.
  paper: '#f6f3ee',        // main page bg — warm-white whisper (was parchment #f4ece0)
  paperDeep: '#edeae3',    // slightly deeper alternating band
  surface: '#fdfcf9',      // off-white card surface
  surfaceRaised: '#ffffff', // pure white — used sparingly (framed artifacts)
  ink: '#1b2436',          // primary text (near-black, navy undertone)
  inkSoft: '#454f63',      // secondary / body text
  inkFaint: '#646d80',     // captions, meta — darkened for WCAG AA on small text
  brassDeepInk: '#7b1c2e', // gold KILLED → oxblood (label / badge ink)

  // Legacy aliases — existing code uses these names
  navy: '#1a2d5c',         // FIXED: was FBA pine-green #1f3d2c
  navyDark: '#0f1d3d',     // FIXED
  secondaryNavy: '#2c4280',// FIXED
  maroon: '#7b1c2e',       // FIXED: was brass #b08d5a
  maroonDark: '#5e1422',   // FIXED
  gold: '#7b1c2e',         // gold retired → oxblood

  // Page basics
  white: '#ffffff',
  lightGray: '#f6f3ee',

  // Slate / neutrals
  slate700: '#475569',
  slate500: '#64748b',
  slate300: '#cbd5e1',
  slate100: '#f1f5f9',
  textMuted: 'rgba(255,255,255,0.78)',
}

export const gradients = {
  heroNavy: 'linear-gradient(160deg, #0f1d3d 0%, #1a2d5c 60%)',  // FIXED: was FBA green
  heroPine: 'linear-gradient(160deg, #0f1d3d 0%, #1a2d5c 60%)',
  cream: 'linear-gradient(135deg, #f6f3ee, #fdfcf9)',
  brass: 'linear-gradient(135deg, #7b1c2e, #a3334a)',            // gold retired → oxblood
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
  // Ledger/data mono — system stack, no extra network font. Pair with
  // fontVariantNumeric:'tabular-nums' for aligned figures.
  mono: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace",
}

// Hairline "ledger rule" colors — the primary separation device in the
// redesign (used instead of soft drop-shadows on most surfaces).
export const rules = {
  ink: 'rgba(27,36,53,0.12)',
  inkStrong: 'rgba(27,36,53,0.22)',
  brass: 'rgba(123,28,46,0.4)',          // gold KILLED → oxblood hairline
  onDark: 'rgba(255,255,255,0.14)',
  brassOnDark: 'rgba(205,213,227,0.32)', // gold KILLED → light-steel hairline on navy
}

// Restrained elevation — reserved for genuinely-floating elements
// (the hero "estimate" artifact, the sticky nav). Flat hairlines elsewhere.
export const elevation = {
  card: '0 1px 2px rgba(20,30,55,0.05)',
  raised: '0 22px 50px -20px rgba(15,29,61,0.45)',
  artifact: '0 28px 60px -24px rgba(15,29,61,0.55), 0 2px 0 rgba(27,36,53,0.04)',
}

const theme = { colors, gradients, spacing, radii, shadows, fonts, rules, elevation }
export default theme
