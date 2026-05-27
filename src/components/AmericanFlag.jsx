import { useEffect, useRef, useState } from 'react'

// Aspect ratio of the chroma-keyed flag.webm (800x440)
const FLAG_RATIO = 440 / 800

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

  // Pole sits flush along the left edge of the flag and extends above + below.
  const flagW = width
  const flagH = flagW * FLAG_RATIO
  const poleW = Math.max(6, Math.round(flagW * 0.02))
  const finialR = poleW * 1.7
  const topExtension = finialR * 2 + 4
  const bottomExtension = flagH * 0.55
  const totalH = topExtension + flagH + bottomExtension
  const totalW = flagW + poleW

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
        style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
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
        {/* Pole shaft */}
        <rect
          x={0}
          y={finialR + 2}
          width={poleW}
          height={totalH - (finialR + 2)}
          fill="url(#fba-pole-grad)"
          rx={poleW / 2}
        />
        {/* Finial */}
        <circle cx={poleW / 2} cy={finialR + 2} r={finialR} fill="url(#fba-finial-grad)" />
        <circle cx={poleW / 2 - finialR * 0.35} cy={finialR + 2 - finialR * 0.35} r={finialR * 0.28} fill="rgba(255,255,255,0.55)" />
      </svg>

      {/* Flag video — chroma-keyed WebM with alpha */}
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
          left: poleW,
          top: topExtension,
          width: flagW,
          height: flagH,
          objectFit: 'contain',
          display: 'block',
          background: 'transparent',
          // tiny shadow under the flag to ground it on the dark hero
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.18))',
        }}
      />
    </div>
  )
}
