// Shared design tokens for FedBenefitsAid (Heritage Pine + Brass)
// Mirrors :root CSS variables in src/App.css.

export const colors = {
  // Brand palette (Heritage Pine + Brass)
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

  // Legacy aliases (existing code uses these names — leave intact)
  navy: '#1f3d2c',
  navyMid: '#2c5544',
  navyLight: '#4a6b5a',
  maroon: '#b08d5a',
  gold: '#b08d5a',
  white: '#ffffff',

  // Hero gradient (Pine → Pine-light)
  heroGradient: 'linear-gradient(160deg, #142a1d 0%, #1f3d2c 60%)',

  // Text colors
  textDark: '#1f2937',
  textBody: '#334155',
  textMuted: '#64748b',
  textLight: '#94a3b8',

  // Borders and backgrounds
  borderLight: '#cbd5e1',
  borderSubtle: 'rgba(31,61,44,0.10)',
  bgCard: '#ffffff',
  bgPage: '#faf6ef',

  // Status
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

export const fonts = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  serif: "'Fraunces', 'Source Serif 4', Georgia, 'Times New Roman', serif",
}

export const tokens = {
  radiusCard: 12,
  radiusButton: 10,
  radiusInput: 8,
  radiusTag: 6,

  shadowCard: '0 4px 24px rgba(20,42,29,0.06)',
  shadowSmall: '0 2px 8px rgba(20,42,29,0.05)',
  shadowSubtle: '0 1px 3px rgba(20,42,29,0.06)',

  maxWidth: 1200,

  pagePadding: 48,
  pagePaddingMobile: 20,
  cardPadding: 24,
  cardPaddingMobile: 16,
}
