// A line-art ("blueprint") U.S. flag that waves slowly — the hero's signature
// background motif. The 13 stripes are drawn as thin sine-wave lines and the
// union is a fine field of small star-dots; everything is one faint color on the
// dark navy hero, so it reads as a distant technical schematic. The wave is a
// slow, low-amplitude undulation that grows toward the free (right) edge, exactly
// like cloth on a pole — NOT a looping spin.
//
// Performance: the animation mutates SVG attributes directly in a rAF loop (no
// React re-render per frame), so it stays smooth. Respects prefers-reduced-motion
// (renders a single still wave, no animation). aria-hidden + pointer-events:none.

import { useEffect, useRef } from 'react'

const VW = 1000
const VH = 520
const STRIPES = 13
const STRIPE_H = VH / STRIPES
const SEG = 32          // points per stripe line
const FREQ = 2.2        // wave cycles across the width
const AMP = 14          // max vertical amplitude (at the free edge)
const SPEED = 0.9       // phase advance, radians/sec (slow)

// One stripe boundary as a sine-wave line. Amplitude scales with `edge` (0 at the
// pole/left, 1 at the free/right edge) so the pole side stays taut.
function stripePath(baseY, phase) {
  let d = ''
  for (let i = 0; i <= SEG; i++) {
    const x = (i / SEG) * VW
    const edge = x / VW
    const y = baseY + Math.sin(edge * Math.PI * FREQ + phase) * AMP * edge
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)
  }
  return d
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
      for (const p of stripes) p.setAttribute('d', stripePath(parseFloat(p.dataset.y), phase))
      for (const s of stars) {
        const x = parseFloat(s.dataset.cx)
        const edge = x / VW
        const y = parseFloat(s.dataset.cy) + Math.sin(edge * Math.PI * FREQ + phase) * AMP * edge
        s.setAttribute('cy', y.toFixed(1))
      }
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

  const stripeEls = []
  for (let i = 0; i <= STRIPES; i++) {
    const y = i * STRIPE_H
    stripeEls.push(<path key={i} data-stripe="" data-y={y} d={stripePath(y, 0)} />)
  }

  const unionW = VW * 0.4
  const unionH = STRIPE_H * 7
  const rows = 9
  const cols = 11
  const starEls = []
  let k = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 !== 0) continue // staggered star field
      const cx = ((c + 0.5) / cols) * unionW
      const cy = ((r + 0.5) / rows) * unionH
      starEls.push(
        <circle key={k++} data-star="" data-cx={cx.toFixed(1)} data-cy={cy.toFixed(1)} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="2.6" />
      )
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
      <g fill="none" stroke={color} strokeWidth="0.9">
        {starEls}
      </g>
    </svg>
  )
}
