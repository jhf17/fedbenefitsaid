// Engraved "guilloché" motif — the fine rosette line-work found on banknotes,
// Treasury bonds, and stock certificates. Rendered as concentric rotated
// ellipses so it's crisp at any size and weighs nothing. Used as a subtle
// watermark in dark hero / CTA sections to evoke official federal documents.
//
// aria-hidden + pointer-events:none — purely decorative.

function rosette(count, rx, ry, cx, cy) {
  const ellipses = []
  for (let i = 0; i < count; i++) {
    const angle = (180 / count) * i
    ellipses.push(
      <ellipse
        key={i}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
    )
  }
  return ellipses
}

export default function Engraving({
  color = '#cdb085',
  opacity = 0.14,
  size = 560,
  strokeWidth = 0.8,
  style,
}) {
  const c = size / 2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      focusable="false"
      style={{ pointerEvents: 'none', ...style }}
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
      >
        {rosette(36, c * 0.9, c * 0.34, c, c)}
        <circle cx={c} cy={c} r={c * 0.58} />
        <circle cx={c} cy={c} r={c * 0.46} />
        <circle cx={c} cy={c} r={c * 0.2} />
      </g>
    </svg>
  )
}
