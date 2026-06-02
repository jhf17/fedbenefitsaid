// Custom line-style glyphs for the FMA "ink & parchment" design language.
// Hand-drawn SVG (stroke = currentColor) so they read as crafted, scale
// crisply, and never look like a stock icon pack. 24x24 grid, round joins.
//
// Used on the homepage (services, civic flourishes) and during the rollout.

const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  focusable: false,
})

const stroke = (w) => ({
  stroke: 'currentColor',
  strokeWidth: w,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

// Five-point seal star — section delimiter and list marker (filled).
export function SealStar({ size = 16, style }) {
  return (
    <svg {...base(size)} style={style}>
      <path
        fill="currentColor"
        d="M12 2.4 14.23 8.9 21.04 9.05 15.61 13.17 17.58 19.7 12 15.8 6.42 19.7 8.39 13.17 2.96 9.05 9.77 8.9Z"
      />
    </svg>
  )
}

// Same star, outlined inside a fine ring — a small "seal" used as an accent.
export function SealRing({ size = 22, w = 1.4, style }) {
  return (
    <svg {...base(size)} style={style}>
      <circle cx="12" cy="12" r="10.4" {...stroke(w)} />
      <path
        {...stroke(w)}
        d="M12 5.6 13.4 9.7 17.7 9.8 14.25 12.4 15.5 16.5 12 14 8.5 16.5 9.75 12.4 6.3 9.8 10.6 9.7Z"
      />
    </svg>
  )
}

// Small diamond / lozenge — refined list bullet (replaces the generic "·").
export function Diamond({ size = 10, style }) {
  return (
    <svg {...base(size)} style={style}>
      <path fill="currentColor" d="M12 2 22 12 12 22 2 12Z" />
    </svg>
  )
}

// 1-on-1 / an individual — a clean person glyph.
export function IconIndividual({ size = 26, w = 1.6, style }) {
  return (
    <svg {...base(size)} style={style}>
      <circle cx="12" cy="8" r="3.4" {...stroke(w)} />
      <path {...stroke(w)} d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  )
}

// Free calculators & library — a calculator.
export function IconCalculator({ size = 26, w = 1.6, style }) {
  return (
    <svg {...base(size)} style={style}>
      <rect x="5" y="2.5" width="14" height="19" rx="2.4" {...stroke(w)} />
      <rect x="8" y="6" width="8" height="3.2" rx="1" {...stroke(w)} />
      <path {...stroke(w)} d="M9 13.5h0M12 13.5h0M15 13.5h0M9 17h0M12 17h0M15 17h0" />
    </svg>
  )
}

// For agencies — a classical institution with columns.
export function IconInstitution({ size = 26, w = 1.6, style }) {
  return (
    <svg {...base(size)} style={style}>
      <path {...stroke(w)} d="M3.5 8.5 12 3.5l8.5 5" />
      <path {...stroke(w)} d="M5 8.5h14" />
      <path {...stroke(w)} d="M6.5 9v9M10 9v9M14 9v9M17.5 9v9" />
      <path {...stroke(w)} d="M4 20.5h16" />
    </svg>
  )
}

// Starless "seal / stamp" — concentric rings with a center dot. Used as the
// small official-document seal on artifact cards (replaces the star-in-ring,
// since the FMA logo already carries the brand's stars).
export function SealMark({ size = 28, w = 1.3, style }) {
  return (
    <svg {...base(size)} style={style}>
      <circle cx="12" cy="12" r="10.3" {...stroke(w)} />
      <circle cx="12" cy="12" r="6.4" {...stroke(w)} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

// Generic civic flourish — used as a small mark in eyebrows/dividers.
export function ColumnsMark({ size = 18, w = 1.5, style }) {
  return (
    <svg {...base(size)} style={style}>
      <path {...stroke(w)} d="M4 9 12 4l8 5" />
      <path {...stroke(w)} d="M6 9.5v8M12 9.5v8M18 9.5v8" />
      <path {...stroke(w)} d="M4.5 19h15" />
    </svg>
  )
}

export default { SealStar, SealRing, SealMark, Diamond, IconIndividual, IconCalculator, IconInstitution, ColumnsMark }
