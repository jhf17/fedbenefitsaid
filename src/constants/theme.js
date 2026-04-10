// src/constants/theme.js
// Shared design tokens for FedBenefitsAid.
// Import pieces as needed: import { colors, gradients, spacing, radii, shadows, fonts } from '../constants/theme'

export const colors = {
  maroon: '#7b1c2e',
  maroonDark: '#5d1421',
  navy: '#0f172a',
  secondaryNavy: '#1e3a5f',
  gold: '#c9a84c',
  cream: '#faf9f6',
  lightGray: '#f8f7f4',
  white: '#ffffff',
  slate700: '#475569',
  slate500: '#64748b',
  slate300: '#cbd5e1',
  slate100: '#f1f5f9',
  textMuted: 'rgba(255,255,255,0.75)',
}

export const gradients = {
  heroNavy: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)',
  cream: 'linear-gradient(135deg, #fdf9ef, #fefcf5)',
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
  sm: '0 1px 3px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 10px 25px rgba(0,0,0,0.10)',
  panel: '-2px 0 8px rgba(0,0,0,0.15)',
}

export const fonts = {
  sans: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  serif: "'Merriweather', Georgia, 'Times New Roman', serif",
}

const theme = { colors, gradients, spacing, radii, shadows, fonts }
export default theme
