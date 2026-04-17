/**
 * T2.16 — Generate placeholder og-image.png (1200×630)
 *
 * One-off generator. Rasterizes an inline SVG with `sharp` and writes the PNG
 * to public/og-image.png. Run locally with:
 *
 *   node scripts/generate-og-image.mjs
 *
 * The PNG output is committed to the repo so production builds don't need
 * `sharp` at runtime (it's a devDependency only).
 *
 * Design matches the site hero: navy radial gradient, serif wordmark in white,
 * gold-accent italic tagline, small URL in the bottom-right corner, and a
 * subtle Capitol-dome silhouette on the right-hand side.
 */
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, '..', 'public', 'og-image.png')
const svgPath = resolve(__dirname, '..', 'public', 'og-image.svg')

const W = 1200
const H = 630
const NAVY_TOP = '#0f172a'
const NAVY_BOT = '#1e3a5f'
const GOLD = '#d4af37'
const WHITE = '#ffffff'

// Capitol dome silhouette (hand-drawn, simplified) anchored bottom-right.
// Uses the site's existing gold tones at low opacity so it reads as "accent",
// not "main subject".
const DOME_SVG = `
  <g transform="translate(880, 200) scale(1.1)" opacity="0.18" fill="${GOLD}" stroke="none">
    <!-- Base platform -->
    <rect x="-140" y="250" width="280" height="40" rx="2" />
    <!-- Lower drum -->
    <rect x="-100" y="200" width="200" height="50" rx="2" />
    <!-- Columns ring (stylized) -->
    <rect x="-95" y="160" width="8" height="40" />
    <rect x="-65" y="160" width="8" height="40" />
    <rect x="-35" y="160" width="8" height="40" />
    <rect x="-5" y="160" width="8" height="40" />
    <rect x="25" y="160" width="8" height="40" />
    <rect x="55" y="160" width="8" height="40" />
    <rect x="85" y="160" width="8" height="40" />
    <!-- Dome body -->
    <path d="M -90 160 A 90 90 0 0 1 90 160 Z" />
    <!-- Finial -->
    <rect x="-3" y="40" width="6" height="30" />
    <circle cx="0" cy="35" r="8" />
    <!-- Flagpole -->
    <rect x="-1" y="15" width="2" height="20" />
  </g>
`

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${NAVY_TOP}" />
      <stop offset="100%" stop-color="${NAVY_BOT}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <rect width="${W}" height="${H}" fill="url(#glow)" />

  <!-- Capitol-dome accent, right side -->
  ${DOME_SVG}

  <!-- Thin gold rule above wordmark -->
  <rect x="80" y="240" width="60" height="3" fill="${GOLD}" />

  <!-- Wordmark -->
  <text x="80" y="330" fill="${WHITE}"
        font-family="Merriweather, Georgia, 'Times New Roman', serif"
        font-weight="900" font-size="96" letter-spacing="-2">FedBenefitsAid</text>

  <!-- Italic gold tagline -->
  <text x="80" y="410" fill="${GOLD}"
        font-family="Merriweather, Georgia, 'Times New Roman', serif"
        font-style="italic" font-weight="700" font-size="48" letter-spacing="-0.5">Retirement benefits, finally clear.</text>

  <!-- Kicker line — small, muted -->
  <text x="80" y="470" fill="rgba(255,255,255,0.65)"
        font-family="'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"
        font-weight="500" font-size="26" letter-spacing="0.5">FERS · TSP · FEHB · FEGLI · Medicare · Social Security</text>

  <!-- URL in bottom-right -->
  <text x="${W - 40}" y="${H - 40}" fill="${WHITE}"
        text-anchor="end"
        font-family="'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif"
        font-weight="700" font-size="24" letter-spacing="0.5">fedbenefitsaid.com</text>
</svg>
`

// Write the SVG source too — useful if someone wants to tweak without re-running.
writeFileSync(svgPath, svg)

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outPath)

console.log(`✓ wrote ${outPath}`)
console.log(`✓ wrote ${svgPath}`)
