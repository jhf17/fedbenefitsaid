import { useEffect, useRef, useState } from 'react'

// Aspect ratio of the tightly-cropped flag.webm (720x402).
const FLAG_RATIO = 402 / 720

export default function AmericanFlag({ width = 360, ariaHidden = true }) {
  const videoRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e) => setReducedMotion(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (reducedMotion) {
      v.pause()
    } else {
      v.play().catch(() => { /* autoplay blocked is fine — poster shows */ })
    }
  }, [reducedMotion])

  // Geometry
  const flagW = width
  const flagH = flagW * FLAG_RATIO
  const poleW = Math.max(7, Math.round(flagW * 0.022)) // pole shaft thickness
  const finialR = Math.max(11, Math.round(flagW * 0.035)) // gold ball radius (visibly larger than pole)
  // Flag attaches just under the bottom of the finial.
  const flagTop = finialR * 2 + 2
  // Pole extends below the flag for a natural flagpole silhouette.
  const bottomExtension = flagH * 0.55
  const totalH = flagTop + flagH + bottomExtension
  // Container width = pole shaft + flag. The finial is centered on the pole, so its
  // overhang (finialR - poleW/2) just bleeds left — we add that padding to the viewBox.
  const finialOverhang = Math.max(0, finialR - poleW / 2)
  const totalW = finialOverhang + poleW + flagW

  // X-coords inside the SVG / container
  const poleX = finialOverhang
  const finialCx = poleX + poleW / 2
  const finialCy = finialR
  const flagX = poleX + poleW

  return (
    <div
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
      style={{
        position: 'relative',
        width: totalW,
        height: totalH,
        display: 'block',
      }}
    >
      {/* Pole + finial */}
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', overflow: 'visible' }}
        aria-hidden
      >
        <defs>
          <linearGradient id="fba-pole-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6b5232" />
            <stop offset="45%" stopColor="#a8855a" />
            <stop offset="55%" stopColor="#c4a274" />
            <stop offset="100%" stopColor="#7a5e3c" />
          </linearGradient>
          <radialGradient id="fba-finial-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f6e09b" />
            <stop offset="55%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8a6a1f" />
          </radialGradient>
        </defs>

        {/* Pole shaft — starts just under the finial, runs to the bottom of the container */}
        <rect
          x={poleX}
          y={finialCy + finialR * 0.85}
          width={poleW}
          height={totalH - (finialCy + finialR * 0.85)}
          fill="url(#fba-pole-grad)"
          rx={poleW / 2}
        />

        {/* Gold finial (the ball on top) */}
        <circle cx={finialCx} cy={finialCy} r={finialR} fill="url(#fba-finial-grad)" stroke="#7a5722" strokeWidth="0.5" />
        {/* Highlight */}
        <circle
          cx={finialCx - finialR * 0.32}
          cy={finialCy - finialR * 0.34}
          r={finialR * 0.26}
          fill="rgba(255,255,255,0.65)"
        />
      </svg>

      {/* Flag video — chroma-keyed WebM with alpha. Positioned flush with pole, just below finial. */}
      <video
        ref={videoRef}
        src="/flag.webm"
        poster="/flag-poster.png"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          left: flagX,
          top: flagTop,
          width: flagW,
          height: flagH,
          objectFit: 'fill',
          display: 'block',
          background: 'transparent',
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.18))',
        }}
      />
    </div>
  )
}
