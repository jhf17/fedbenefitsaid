import { useId } from 'react'

const STRIPES = 13
const STAR_ROWS = [6, 5, 6, 5, 6, 5, 6, 5, 6]

export default function AmericanFlag({ width = 320, ariaHidden = true }) {
  const reactId = useId().replace(/[:]/g, '')
  const waveId = `fba-flag-wave-${reactId}`
  const shadowId = `fba-flag-shadow-${reactId}`
  const cantonShadowId = `fba-flag-canton-shadow-${reactId}`

  const flagW = 380
  const flagH = 200
  const poleX = 10
  const poleW = 6
  const flagX = poleX + poleW
  const stripeH = flagH / STRIPES
  const cantonW = flagW * 0.4
  const cantonH = stripeH * 7
  const padTop = 10
  const padBottom = 70

  const svgW = flagX + flagW + 24
  const svgH = padTop + flagH + padBottom

  const stripes = Array.from({ length: STRIPES }, (_, i) => ({
    y: padTop + i * stripeH,
    fill: i % 2 === 0 ? '#B22234' : '#FFFFFF',
  }))

  const stars = []
  STAR_ROWS.forEach((cols, rowIdx) => {
    const rowSpacing = cantonH / 10
    const cy = padTop + rowSpacing * (rowIdx + 1)
    const totalCols = rowIdx % 2 === 0 ? 6 : 5
    const colSpacing = cantonW / 12
    for (let c = 0; c < totalCols; c++) {
      const offset = rowIdx % 2 === 0 ? colSpacing * (c * 2 + 1) : colSpacing * (c * 2 + 2)
      stars.push({ cx: flagX + offset, cy, key: `${rowIdx}-${c}` })
    }
  })

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={width}
      height={width * (svgH / svgW)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <filter id={waveId} x="-10%" y="-10%" width="120%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="3" result="noise">
            <animate
              attributeName="baseFrequency"
              dur="9s"
              values="0.012 0.028; 0.018 0.034; 0.012 0.028"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <linearGradient id={shadowId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.04)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
        </linearGradient>

        <linearGradient id={cantonShadowId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>

      {/* Pole */}
      <rect
        x={poleX}
        y={4}
        width={poleW}
        height={padTop + flagH + padBottom - 10}
        fill="#8a6f47"
        rx={poleW / 2}
      />
      <rect
        x={poleX + 0.5}
        y={4}
        width={2}
        height={padTop + flagH + padBottom - 10}
        fill="rgba(255,255,255,0.25)"
        rx={1}
      />
      {/* Gold finial */}
      <circle cx={poleX + poleW / 2} cy={4} r={7} fill="#e6c468" stroke="#8d6f44" strokeWidth="0.5" />
      <circle cx={poleX + poleW / 2 - 2} cy={2} r={2.2} fill="rgba(255,255,255,0.55)" />

      {/* Flag (animated) */}
      <g style={{ filter: `url(#${waveId})` }}>
        {/* Stripes */}
        {stripes.map((s, i) => (
          <rect key={i} x={flagX} y={s.y} width={flagW} height={stripeH + 0.5} fill={s.fill} />
        ))}

        {/* Canton */}
        <rect x={flagX} y={padTop} width={cantonW} height={cantonH} fill="#3C3B6E" />

        {/* Stars */}
        {stars.map((star) => (
          <Star key={star.key} cx={star.cx} cy={star.cy} size={3.6} />
        ))}

        {/* Soft fabric shading overlays */}
        <rect x={flagX} y={padTop} width={flagW} height={flagH} fill={`url(#${shadowId})`} />
        <rect x={flagX} y={padTop} width={cantonW} height={cantonH} fill={`url(#${cantonShadowId})`} opacity="0.5" />
      </g>

      {/* Soft drop shadow under the flag (static, not waving) */}
      <ellipse
        cx={flagX + flagW / 2}
        cy={padTop + flagH + 8}
        rx={flagW * 0.42}
        ry={4}
        fill="rgba(0,0,0,0.10)"
        opacity="0.5"
      />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          #${waveId} animate { display: none; }
        }
      `}</style>
    </svg>
  )
}

function Star({ cx, cy, size }) {
  const points = []
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const r = i % 2 === 0 ? size : size * 0.42
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return <polygon points={points.join(' ')} fill="#FFFFFF" />
}
