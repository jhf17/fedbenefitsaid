// src/constants/theme.js
// Shared design tokens for FedBenefitsAid (Heritage Pine + Brass).
// Mirrors CSS :root variables in src/App.css — keep in sync.
// Import pieces as needed:
//   import { colors, gradients, spacing, radii, shadows, fonts } from '../constants/theme'

export const colors = {
  // Brand
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
