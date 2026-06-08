// A line-art ("blueprint") U.S. flag that waves slowly — the hero's signature
// background motif. The 13 stripes are thin sine-wave lines that STOP at the
// canton (union); the canton itself carries a field of small OUTLINED stars —
// the same star motif as the FMA logo. Everything is one faint color on the dark
// navy hero, so it reads as a distant technical schematic. The wave is a slow,
// low-amplitude undulation that grows toward the free (right) edge, like cloth on
// a pole — NOT a looping spin.
//
// Performance: the animation mutates SVG attributes directly in a rAF loop (no
// React re-render per frame), so it stays smooth. Respects prefers-reduced-motion
// (renders a single still wave). aria-hidden + pointer-events:none.

import { useEffect, useRef } from 'react'

const VW = 1000
const VH = 520
const STRIPES = 13
const STRIPE_H = VH / STRIPES
const SEG = 32          // points per stripe line
const FREQ = 2.2        // wave cycles across the width
const AMP = 14          // max vertical amplitude (at the free edge)
const SPEED = 0.9       // phase advance, radians/sec (slow)

// Canton (union): top-left block — 40% of the width × the top 7 stripes, like a
// real flag. No stripe lines are drawn inside it; it holds the stars instead.
const UNION_W = VW * 0.4
const UNION_H = STRIPE_H * 7

// Vertical wave offset at a given x for a phase — 0 at the pole (left), growing
// to the free edge (right), so the pole side stays taut like real cloth.
function waveAt(x, phase) {
  const edge = x / VW
  return Math.sin(edge * Math.PI * FREQ + phase) * AMP * edge
}

// One stripe boundary as a sine-wave line, traced from startX to the free edge.
function stripePath(baseY, phase, startX) {
  let d = ''
  for (let i = 0; i <= SEG; i++) {
    const x = startX + (i / SEG) * (VW - startX)
    const y = baseY + waveAt(x, phase)
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)
  }
  return d
}

// A 5-pointed star OUTLINE centered at (cx, cy), point-up.
function starPath(cx, cy, outer, inner) {
  let d = ''
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)
  }
  return d + 'Z'
}

export default function WavingFlag({ color = '#cdd7e3', opacity = 0.15, width = 900, style }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const reduce = typeof window !== 'undefined' && window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stripes = [...svg.querySelectorAll('[data-stripe]')]
    const stars = [...svg.querySelectorAll('[data-star]')]
    const apply = (phase) => {
      for (const p of stripes) p.setAttribute('d', stripePath(parseFloat(p.dataset.y), phase, parseFloat(p.dataset.x0)))
      // Stars are small — translate each by the wave offset at its center.
      for (const s of stars) s.setAttribute('transform', `translate(0,${waveAt(parseFloat(s.dataset.cx), phase).toFixed(1)})`)
    }
    if (reduce) { apply(0.7); return } // a pleasant static wave, no motion
    let raf
    let start = null
    const loop = (t) => {
      if (start === null) start = t
      apply(((t - start) / 1000) * SPEED)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Stripe boundary lines. Those crossing the canton's vertical band begin at the
  // canton's right edge (so no lines run behind the stars); the rest span full width.
  const stripeEls = []
  for (let i = 0; i <= STRIPES; i++) {
    const y = i * STRIPE_H
    const x0 = y < UNION_H ? UNION_W : 0
    stripeEls.push(<path key={i} data-stripe="" data-y={y} data-x0={x0} d={stripePath(y, 0, x0)} />)
  }

  // Outlined star field in the canton — staggered 9×11 grid (~50 stars, like the flag).
  const rows = 9
  const cols = 11
  const starEls = []
  let k = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 !== 0) continue // staggered
      const cx = ((c + 0.5) / cols) * UNION_W
      const cy = ((r + 0.5) / rows) * UNION_H
      starEls.push(<path key={k++} data-star="" data-cx={cx.toFixed(1)} d={starPath(cx, cy, 7.5, 3)} />)
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      width={width}
      height={(width * VH) / VW}
      aria-hidden="true"
      focusable="false"
      style={{ pointerEvents: 'none', opacity, overflow: 'visible', ...style }}
    >
      <g fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round">
        {stripeEls}
      </g>
      <g fill="none" stroke={color} strokeWidth="1" strokeLinejoin="round">
        {starEls}
      </g>
    </svg>
  )
}
