// Shared color constants for FedBenefitsAid
// Import these instead of hardcoding hex values throughout the codebase

export const colors = {
  // Primary palette
  navy: '#0f172a',
  navyMid: '#1e3a5f',
  navyLight: '#2d5f8a',
  maroon: '#7b1c2e',
  cream: '#faf9f6',
  gold: '#c9a84c',
  white: '#ffffff',

  // Hero gradient (standard across all pages)
  heroGradient: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%)',

  // Text colors
  textDark: '#0f172a',
  textBody: '#334155',
  textMuted: '#64748b',
  textLight: '#94a3b8',

  // Borders and backgrounds
  borderLight: '#cbd5e1',
  borderSubtle: 'rgba(0,0,0,0.06)',
  bgCard: '#ffffff',
  bgPage: '#faf9f6',

  // Status colors
  success: '#16a34a',
  successBg: '#f0fdf4',
  warning: '#d97706',
  warningBg: '#fffbeb',
  error: '#dc2626',
  errorBg: '#fef2f2',
  errorBorder: '#fecaca',
  errorText: '#991b1b',
  info: '#2563eb',
  infoBg: '#eff6ff',
}

// Typography
export const fonts = {
  sans: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  serif: "'Merriweather', Georgia, 'Times New Roman', serif",
}

// Design tokens
export const tokens = {
  // Border radius scale
  radiusCard: 12,
  radiusButton: 10,
  radiusInput: 8,
  radiusTag: 6,

  // Box shadow scale
  shadowCard: '0 4px 24px rgba(0,0,0,0.04)',
  shadowSmall: '0 2px 8px rgba(0,0,0,0.04)',
  shadowSubtle: '0 1px 3px rgba(0,0,0,0.05)',

  // Container
  maxWidth: 1200,

  // Spacing
  pagePadding: 48,
  pagePaddingMobile: 20,
  cardPadding: 24,
  cardPaddingMobile: 16,
}
