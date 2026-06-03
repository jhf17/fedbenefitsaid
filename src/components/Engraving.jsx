// Guilloché engraving — the interlaced rosette line-work found on banknotes,
// Treasury bonds, passports, and stock certificates. Each layer is a hypotrochoid
// (spirograph curve) traced as ONE continuous fine line, so it can "inscribe"
// itself in a single pen stroke (draw-on). Two layers at different ratios
// counter-rotate very slowly — a living security-paper shimmer that stays subtle
// behind content and never distracts from reading.
//
// aria-hidden + pointer-events:none — purely decorative.
// `draw` = inscribe on mount (stroke-dashoffset). `spin` = slow ambient drift.
// Both respect prefers-reduced-motion (see fma-ui.css).

function gcd(a, b) { return b ? gcd(b, a % b) : a }

// Hypotrochoid: a point at distance d from the center of a circle (radius r)
// rolling inside a fixed circle (radius R). Traced over enough revolutions to
// close the figure, as a single SVG path string.
function hypotrochoid(R, r, d, cx, cy, scale) {
  const revs = r / gcd(R, r)
  const steps = Math.ceil(revs * 260)
  const k = (R - r) / r
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * revs * 2 * Math.PI
    const x = cx + scale * ((R - r) * Math.cos(t) + d * Math.cos(k * t))
    const y = cy + scale * ((R - r) * Math.sin(t) - d * Math.sin(k * t))
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2)
  }
  return path + 'Z'
}

const LAYERS = [
  { R: 12, r: 5, d: 7 },  // 12-lobe interlaced rosette
  { R: 9, r: 4, d: 6 },   // 9-lobe — different ratio → gentle moiré when counter-rotating
]
const MAX_EXTENT = Math.max(...LAYERS.map((l) => l.R - l.r + l.d))

export default function Engraving({
  color = '#cdd7e3',
  opacity = 0.16,
  size = 560,
  strokeWidth = 0.7,
  draw = false,
  spin = false, // ambient rotation removed — a slowly spinning radial reads as cheap ("SpongeBob sky"). Static by default; premium motion handled elsewhere.
  style,
}) {
  const c = size / 2
  const scale = (c * 0.94) / MAX_EXTENT
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      focusable="false"
      className={draw ? 'fma-eng-draw' : undefined}
      style={{ pointerEvents: 'none', ...style }}
    >
      {LAYERS.map((l, idx) => (
        <g key={idx} className={spin ? (idx === 0 ? 'fma-eng-spin' : 'fma-eng-spin-rev') : undefined}>
          <path
            d={hypotrochoid(l.R, l.r, l.d, c, c, scale)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
            pathLength={draw ? 1 : undefined}
            style={
              draw
                ? { strokeDasharray: 1, strokeDashoffset: 1, animation: `fmaDraw 2.6s cubic-bezier(0.23, 1, 0.32, 1) ${(0.15 + idx * 0.5).toFixed(2)}s forwards` }
                : undefined
            }
          />
        </g>
      ))}
    </svg>
  )
}
