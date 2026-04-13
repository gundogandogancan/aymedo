'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

// ═══════════════════════════════════════════
// AYMEDO — Cinematic Theatre Experience
//
// PHASE 1: Curtain closed (scroll 0–40%)
//   → Spotlights → curtain opens with physics
//
// PHASE 2: Logo reveal (scroll 40–65%)
//   → AYMEDO logo fades in center
//
// PHASE 3: Cinema screens (scroll 65–100%)
//   → 4 video screens with glass frames
// ═══════════════════════════════════════════

const SCREENS = [
  { id: 'matrix',       src: '/videos/matrix.mp4',       word: 'GLAD' },
  { id: 'prison-break', src: '/videos/prison-break.mp4', word: 'YOU' },
  { id: 'fareler',      src: '/videos/fareler.mp4',      word: 'MADE IT' },
  { id: 'escobar',      src: '/videos/escobar.mp4',      word: 'THIS FAR' },
]

export default function Theatre() {
  const [p, setP] = useState(0)
  const [activeAudio, setActiveAudio] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState<string | null>(null)
  const [breath, setBreath] = useState(0)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({})
  const cinematicRef = useRef<HTMLVideoElement>(null)

  // Scroll
  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setP(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Breathing
  useEffect(() => {
    let t = 0; let id: number
    const loop = () => { t += 0.004; setBreath(Math.sin(t) * 0.5 + 0.5); id = requestAnimationFrame(loop) }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  // Mouse
  useEffect(() => {
    const fn = (e: MouseEvent) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  // Start cinema videos
  useEffect(() => {
    if (p > 0.6) Object.values(videoRefs.current).forEach(v => { if (v.paused) v.play().catch(() => {}) })
  }, [p])

  // Scroll-driven video scrub (moved after phase calculations)

  // Audio
  const toggleAudio = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const on = activeAudio !== id
    Object.values(videoRefs.current).forEach(v => { v.muted = true })
    if (on && videoRefs.current[id]) { videoRefs.current[id].muted = false; videoRefs.current[id].volume = 1.0; if (videoRefs.current[id].paused) videoRefs.current[id].play().catch(() => {}) }
    setActiveAudio(on ? id : null)
  }, [activeAudio])

  const goFS = (id: string) => { if (p < 0.75) return; setFullscreen(prev => prev === id ? null : id) }

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setFullscreen(null); return }
      if (e.key === 'Enter' && p > 0.6) {
        window.location.href = 'mailto:ola@aymedo.io'
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [p])

  // ── PHASE CALCULATIONS ──
  // Phase 1: Curtain (0–0.25)
  const curtainProgress = Math.min(1, Math.max(0, p / 0.25))
  const curtainEased = curtainProgress * curtainProgress * (3 - 2 * curtainProgress)
  const spotIntensity = Math.min(1, p / 0.06)

  // Phase 2: Logo reveal (0.20–0.40)
  const lightLeak = Math.min(1, Math.max(0, (p - 0.15) / 0.10))
  const logoGlow = Math.min(1, Math.max(0, (p - 0.18) / 0.08))
  const logoReveal = Math.min(1, Math.max(0, (p - 0.22) / 0.12))
  const logoScale = 0.85 + logoReveal * 0.15
  const logoFade = p > 0.38 ? Math.max(0, 1 - (p - 0.38) / 0.07) : 1
  const logoRotation = p * 8

  // Phase 3: Scroll-driven video (0.35–0.65)
  const videoReveal = Math.min(1, Math.max(0, (p - 0.35) / 0.05))
  const videoProgress = Math.min(1, Math.max(0, (p - 0.35) / 0.30)) // 0→1 maps to video timeline
  const videoFade = p > 0.62 ? Math.max(0, 1 - (p - 0.62) / 0.06) : 1

  // Phase 4: Cinema (0.65–1.00)
  const cinemaReveal = Math.min(1, Math.max(0, (p - 0.65) / 0.12))
  const cinemaReady = p > 0.75

  const scrollHint = Math.max(0, 1 - p * 6)
  const isFS = fullscreen !== null

  // Scroll-driven video scrub
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const vid = cinematicRef.current
    if (!vid || !vid.duration || vid.duration === Infinity) return
    const target = videoProgress * vid.duration
    if (Math.abs(vid.currentTime - target) > 0.03) {
      vid.currentTime = target
    }
  }, [videoProgress])

  return (
    <div style={{ background: '#020101' }}>
      <div style={{ height: '1200vh' }} />

      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#020101',
      }}>

        {/* ═══════════════════════════════════════
             LAYER 0: COSMOS BACKGROUND
            ═══════════════════════════════════════ */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 40% 50% at 25% 35%, rgba(180,120,60,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 35% 45% at 75% 55%, rgba(100,80,160,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 50% 80%, rgba(200,140,50,0.05) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(10,8,5,1) 0%, rgba(5,3,2,1) 100%)
          `, pointerEvents: 'none',
        }} />
        {/* Stars */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.6 + breath * 0.1,
          backgroundImage: `
            radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.7) 0%,transparent 100%),
            radial-gradient(1px 1px at 35% 8%,rgba(255,255,255,0.6) 0%,transparent 100%),
            radial-gradient(1px 1px at 55% 25%,rgba(255,255,255,0.5) 0%,transparent 100%),
            radial-gradient(1px 1px at 75% 85%,rgba(255,255,255,0.4) 0%,transparent 100%),
            radial-gradient(1px 1px at 92% 65%,rgba(255,255,255,0.5) 0%,transparent 100%),
            radial-gradient(2px 2px at 22% 28%,rgba(255,200,120,0.8) 0%,transparent 100%),
            radial-gradient(2px 2px at 62% 18%,rgba(180,200,255,0.7) 0%,transparent 100%),
            radial-gradient(2px 2px at 48% 52%,rgba(255,240,200,0.6) 0%,transparent 100%),
            radial-gradient(1px 1px at 5% 80%,rgba(255,255,255,0.4) 0%,transparent 100%),
            radial-gradient(1px 1px at 85% 35%,rgba(255,255,255,0.5) 0%,transparent 100%),
            radial-gradient(1px 1px at 40% 70%,rgba(255,255,255,0.4) 0%,transparent 100%),
            radial-gradient(1px 1px at 68% 42%,rgba(255,255,255,0.5) 0%,transparent 100%)
          `,
        }} />

        {/* ═══════════════════════════════════════
             LAYER 1: CURTAINS (real photo texture)
            ═══════════════════════════════════════ */}
        {['left', 'right'].map(side => {
          // Physics: right curtain slightly delayed
          const delay = side === 'right' ? 0.03 : 0
          const thisProgress = Math.min(1, Math.max(0, curtainEased - delay))
          // Fabric compression: as curtain opens, it bunches at the edge
          const scaleX = 1 - thisProgress * 0.15

          return (
            <div key={side} style={{
              position: 'absolute', top: 0, [side]: 0,
              width: '52%', height: '100%', zIndex: 20,
              transform: `translateX(${side === 'left' ? -thisProgress * 105 : thisProgress * 105}%) scaleX(${scaleX})`,
              transformOrigin: side === 'left' ? 'left center' : 'right center',
              pointerEvents: thisProgress > 0.95 ? 'none' : 'auto',
            }}>
              {/* Real curtain photo */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url(/images/curtain-closed.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: side === 'left' ? 'right center' : 'left center',
                filter: `brightness(${0.6 + spotIntensity * 0.3})`,
              }} />

              {/* Dynamic shadow at opening edge */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                [side === 'left' ? 'right' : 'left']: 0,
                width: `${40 + thisProgress * 60}px`,
                background: `linear-gradient(${side === 'left' ? '270deg' : '90deg'}, transparent, rgba(0,0,0,${0.7 + thisProgress * 0.3}))`,
                pointerEvents: 'none',
              }} />
            </div>
          )
        })}

        {/* Valance removed */}

        {/* Light leak through curtain gap */}
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
          width: `${curtainEased * 60}%`, height: '90%',
          background: `radial-gradient(ellipse at 50% 30%, rgba(255,220,150,${0.03 * curtainEased}) 0%, transparent 60%)`,
          pointerEvents: 'none', zIndex: 19,
        }} />

        {/* Golden sparkle rain (from reference image) */}
        {curtainEased > 0.3 && (
          <div style={{
            position: 'absolute', top: '5%', left: '45%', width: '10%', height: '80%',
            opacity: Math.min(0.4, (curtainEased - 0.3) * 0.8) * (0.7 + breath * 0.3),
            background: `
              radial-gradient(1px 1px at 20% 10%, rgba(244,199,107,0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 50% 20%, rgba(244,199,107,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 80% 15%, rgba(244,199,107,0.7) 0%, transparent 100%),
              radial-gradient(1px 1px at 30% 30%, rgba(244,199,107,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 60% 35%, rgba(244,199,107,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 40% 45%, rgba(244,199,107,0.7) 0%, transparent 100%),
              radial-gradient(1px 1px at 70% 50%, rgba(244,199,107,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 25% 60%, rgba(244,199,107,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 55% 65%, rgba(244,199,107,0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 45% 75%, rgba(244,199,107,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 65% 80%, rgba(244,199,107,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 35% 90%, rgba(244,199,107,0.7) 0%, transparent 100%)
            `,
            animation: 'sparkleFloat 8s linear infinite',
            pointerEvents: 'none', zIndex: 18,
          }} />
        )}

        {/* ═══════════════════════════════════════
             LAYER 2: CINEMATIC LOGO REVEAL
            ═══════════════════════════════════════ */}

        {/* Pre-reveal: Light bloom behind curtain gap — appears BEFORE logo */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: `${120 + lightLeak * 300}px`, height: `${120 + lightLeak * 300}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle,
            rgba(244,199,107,${0.08 * lightLeak * (0.8 + breath * 0.2)}) 0%,
            rgba(244,199,107,${0.03 * lightLeak}) 40%,
            transparent 70%
          )`,
          filter: 'blur(40px)',
          pointerEvents: 'none', zIndex: 8,
          opacity: logoFade,
        }} />

        {/* Pre-reveal: Vertical light beam — golden rain from reference */}
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
          width: `${4 + logoGlow * 80}px`, height: '60%',
          background: `linear-gradient(to bottom,
            rgba(255,230,170,${0.06 * logoGlow * (0.7 + breath * 0.3)}) 0%,
            rgba(244,199,107,${0.04 * logoGlow}) 40%,
            rgba(244,199,107,${0.02 * logoGlow}) 70%,
            transparent 100%
          )`,
          filter: 'blur(8px)',
          pointerEvents: 'none', zIndex: 8,
          opacity: logoFade,
        }} />

        {/* Logo container — the reveal */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: logoReveal * logoFade,
          transform: `scale(${logoScale})`,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
        }}>

          {/* Reactive particle field — responds to logo presence */}
          <div style={{
            position: 'absolute', width: '400px', height: '400px',
            pointerEvents: 'none',
            opacity: logoReveal * 0.5 * (0.6 + breath * 0.4),
          }}>
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i / 20) * Math.PI * 2
              const dist = 120 + (i % 3) * 40
              const size = 1 + (i % 2)
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${50 + Math.cos(angle) * (dist / 4)}%`,
                  top: `${50 + Math.sin(angle) * (dist / 4)}%`,
                  width: `${size}px`, height: `${size}px`,
                  borderRadius: '50%',
                  background: `rgba(244,199,107,${0.3 + (i % 3) * 0.2})`,
                  boxShadow: `0 0 ${size * 3}px rgba(244,199,107,0.15)`,
                  animation: `particleOrbit ${12 + i * 0.7}s linear infinite`,
                  animationDelay: `${-i * 0.6}s`,
                }} />
              )
            })}
          </div>

          {/* Outer glow halo — breathes */}
          <div style={{
            position: 'absolute',
            width: `${220 + breath * 20}px`, height: `${220 + breath * 20}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle,
              rgba(244,199,107,${0.06 + breath * 0.03}) 0%,
              rgba(244,199,107,${0.02 + breath * 0.01}) 50%,
              transparent 70%
            )`,
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }} />

          {/* Logo — fully transparent PNG, no circle clip needed */}
          <div style={{
            width: '200px', height: '200px',
            transform: `rotate(${logoRotation}deg)`,
            filter: `drop-shadow(0 0 30px rgba(244,199,107,${0.15 + breath * 0.1})) drop-shadow(0 0 60px rgba(244,199,107,${0.05 + breath * 0.03}))`,
          }}>
            <img src="/logo.png" alt="AYMEDO" style={{
              width: '100%', height: '100%', objectFit: 'contain',
              opacity: 0.95,
            }} />
          </div>

        </div>

        {/* ═══ AYMEDO TEXT + CONTACT — bottom left ═══ */}
        <div style={{
          position: 'absolute', bottom: '28px', left: '28px', zIndex: 10,
          opacity: logoReveal * logoFade,
          transform: `translateY(${(1 - logoReveal) * 20}px)`,
          pointerEvents: logoReveal > 0.5 && logoFade > 0.5 ? 'auto' : 'none',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <div style={{
            fontSize: '22px', fontWeight: 200, letterSpacing: '0.8em',
            color: '#F4C76B',
            textShadow: `0 0 20px rgba(244,199,107,${0.12 + breath * 0.08})`,
            animation: 'textGlow 4s ease-in-out infinite',
          }}>AYMEDO</div>

          <div style={{ width: '35px', height: '1px', background: `rgba(244,199,107,${0.18 + breath * 0.08})` }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mail icon */}
            <svg width="14" height="11" viewBox="0 0 24 18" fill="none" style={{ opacity: 0.5 + breath * 0.15, flexShrink: 0 }}>
              <rect x="1" y="1" width="22" height="16" rx="2" stroke="#F4C76B" strokeWidth="1.2" fill="none" />
              <path d="M1 1 L12 10 L23 1" stroke="#F4C76B" strokeWidth="1.2" fill="none" />
            </svg>
            <a href="mailto:ola@aymedo.io" style={{
              fontSize: '11px', fontWeight: 300, letterSpacing: '0.2em',
              color: `rgba(244,199,107,${0.65 + breath * 0.15})`,
              textDecoration: 'none',
              textShadow: `0 0 12px rgba(244,199,107,${0.08 + breath * 0.05})`,
              animation: 'emailPulse 3s ease-in-out infinite',
            }}>ola@aymedo.io</a>
          </div>

          <div style={{ fontSize: '7px', fontWeight: 300, letterSpacing: '0.3em', color: 'rgba(247,241,232,0.3)' }}>
            FOR COLLABORATIONS
          </div>
        </div>

        {/* ═══ SCROLL-DRIVEN VIDEO — Phase 3 ═══ */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 9,
          opacity: videoReveal * videoFade,
          pointerEvents: 'none',
        }}>
          <video
            ref={cinematicRef}
            muted
            playsInline
            preload="auto"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: `brightness(${0.8 + videoProgress * 0.2}) contrast(1.05)`,
            }}
          >
            <source src="/videos/cinematic.mp4" type="video/mp4" />
          </video>

          {/* Cinematic letterbox */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8%', background: 'linear-gradient(to bottom, rgba(5,5,5,0.7), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8%', background: 'linear-gradient(to top, rgba(5,5,5,0.7), transparent)', pointerEvents: 'none' }} />

          {/* Progress indicator — thin gold line at bottom */}
          <div style={{
            position: 'absolute', bottom: '4%', left: '20%', width: '60%', height: '1px',
            background: 'rgba(244,199,107,0.1)',
          }}>
            <div style={{
              width: `${videoProgress * 100}%`, height: '100%',
              background: `rgba(244,199,107,${0.4 + breath * 0.15})`,
              boxShadow: `0 0 8px rgba(244,199,107,${0.15 + breath * 0.08})`,
              transition: 'width 0.1s linear',
            }} />
          </div>
        </div>

        {/* ═══ INFINITY SYMBOL — top center of cinema ═══ */}
        {cinemaReveal > 0.2 && (
          <div style={{
            position: 'absolute', top: '2%', left: '50%', transform: 'translateX(-50%)',
            zIndex: 8, opacity: cinemaReveal * 0.5 * (0.7 + breath * 0.3),
            pointerEvents: 'none',
          }}>
            <svg width="36" height="18" viewBox="0 0 60 30" fill="none" style={{
              filter: `drop-shadow(0 0 8px rgba(244,199,107,${0.15 + breath * 0.08}))`,
            }}>
              <path d="M15 15 C15 8 5 3 5 15 C5 27 15 22 15 15 Z" stroke="#F4C76B" strokeWidth="1" fill="none" opacity={0.5 + breath * 0.2} />
              <path d="M15 15 C15 22 25 27 25 15 C25 3 15 8 15 15 Z" stroke="#F4C76B" strokeWidth="1" fill="none" opacity={0.5 + breath * 0.2} transform="translate(20, 0)" />
              <path d="M15 15 Q20 5 45 15 Q20 25 15 15" stroke="#F4C76B" strokeWidth="0.8" fill="none" opacity={0.35 + breath * 0.15} />
            </svg>
          </div>
        )}

        {/* ═══════════════════════════════════════
             LAYER 3: 4 CINEMA SCREENS
            ═══════════════════════════════════════ */}
        <div style={{
          position: 'absolute',
          top: isFS ? 0 : '6%', left: isFS ? 0 : '6%', right: isFS ? 0 : '6%', bottom: isFS ? 0 : '14%',
          display: 'grid',
          gridTemplateColumns: isFS ? '1fr' : '1fr 1fr',
          gridTemplateRows: isFS ? '1fr' : '1fr 1fr',
          gap: isFS ? 0 : '16px',
          opacity: cinemaReveal,
          transform: `scale(${isFS ? 1 : 0.92 + cinemaReveal * 0.08})`,
          transition: isFS ? 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          zIndex: 5,
          pointerEvents: cinemaReady ? 'auto' : 'none',
        }}>
          {SCREENS.map((screen, idx) => {
            const isHov = hovered === screen.id
            const isAct = activeAudio === screen.id
            const isThisFS = fullscreen === screen.id
            const isHidden = isFS && !isThisFS
            const isDimmed = !isFS && hovered !== null && !isHov

            return (
              <div key={screen.id}
                onMouseEnter={() => setHovered(screen.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => goFS(screen.id)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  cursor: cinemaReady ? 'pointer' : 'default',
                  borderRadius: isThisFS ? 0 : '10px',
                  opacity: isHidden ? 0 : 1,
                  display: isHidden ? 'none' : 'block',
                  gridColumn: isThisFS ? '1 / -1' : undefined,
                  gridRow: isThisFS ? '1 / -1' : undefined,
                  transition: isFS ? 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)' : 'all 0.5s ease',
                  transform: isHov && !isFS ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                {/* Glass frame — thick, water-animated */}
                {!isThisFS && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                    borderRadius: '10px',
                    border: `3px solid rgba(255,255,255,${isHov ? 0.15 : 0.06})`,
                    boxShadow: `
                      inset 0 0 25px rgba(160,190,240,0.03),
                      inset 0 1px 0 rgba(255,255,255,${isHov ? 0.1 : 0.04}),
                      0 0 ${isHov ? 40 : 15}px rgba(80,120,180,0.05)
                    `,
                    animation: `waterWave ${6 + idx}s ease-in-out infinite`,
                  }} />
                )}

                {/* Top caustic light — slides across like water */}
                {!isThisFS && (
                  <div style={{
                    position: 'absolute', top: 0, left: '5%', right: '5%', height: '4px',
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.08 + breath * 0.04}), transparent)`,
                    borderRadius: '10px 10px 0 0', zIndex: 4, pointerEvents: 'none',
                    animation: `causticSlide ${8 + idx}s ease-in-out infinite`,
                  }} />
                )}

                {/* Frosted glass edges */}
                {!isThisFS && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', borderRadius: '10px',
                    background: `
                      linear-gradient(to right, rgba(180,200,240,0.06) 0%, transparent 12%),
                      linear-gradient(to left, rgba(180,200,240,0.06) 0%, transparent 12%),
                      linear-gradient(to bottom, rgba(200,210,250,0.07) 0%, transparent 10%),
                      linear-gradient(to top, rgba(180,190,230,0.08) 0%, transparent 15%)
                    `,
                    animation: `glassShimmer ${7 + idx * 0.5}s ease-in-out infinite`,
                  }} />
                )}

                {/* Video */}
                <video ref={el => { if (el) videoRefs.current[screen.id] = el }}
                  muted loop playsInline preload="auto"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%', objectFit: 'cover',
                    borderRadius: isThisFS ? 0 : '10px',
                    imageRendering: 'auto',
                    transform: `scale(${isHov && !isFS ? 1.04 : 1.0})`,
                    filter: `brightness(${isThisFS ? 1.05 : isHov ? 1.0 : isDimmed ? 0.15 : 0.7}) saturate(${isThisFS ? 1.1 : isHov ? 1.15 : 1.0}) contrast(${isHov ? 1.05 : 1.0})`,
                    transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <source src={screen.src} type="video/mp4" />
                </video>

                {/* Hover vignette */}
                {isHov && !isFS && <div style={{ position: 'absolute', inset: 0, borderRadius: '10px', background: 'radial-gradient(ellipse, transparent 55%, rgba(0,0,0,0.25) 100%)', pointerEvents: 'none', zIndex: 1 }} />}

                {/* FS letterbox */}
                {isThisFS && <>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6%', background: 'linear-gradient(to bottom, rgba(2,1,1,0.6), transparent)', pointerEvents: 'none', zIndex: 3 }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6%', background: 'linear-gradient(to top, rgba(2,1,1,0.6), transparent)', pointerEvents: 'none', zIndex: 3 }} />
                </>}

                {/* Word — bottom right corner of each screen */}
                <div style={{
                  position: 'absolute', bottom: isThisFS ? '16px' : '8px', right: isThisFS ? '60px' : '44px',
                  zIndex: 4, pointerEvents: 'none',
                }}>
                  <span style={{
                    fontSize: isThisFS ? '16px' : '10px',
                    fontWeight: 300,
                    letterSpacing: '0.35em',
                    color: `rgba(247,241,232,${isHov || isThisFS ? 0.6 : 0.2})`,
                    textShadow: '0 1px 12px rgba(0,0,0,0.9)',
                    transition: 'all 0.6s ease',
                  }}>
                    {screen.word}
                  </span>
                </div>

                {/* Audio button */}
                <button onClick={e => toggleAudio(screen.id, e)} style={{
                  position: 'absolute', bottom: isThisFS ? '20px' : '8px', right: isThisFS ? '24px' : '10px',
                  zIndex: 5, width: isThisFS ? '38px' : '30px', height: isThisFS ? '38px' : '30px',
                  border: `2px solid rgba(255,255,255,${isHov || isThisFS ? 0.2 : 0.08})`,
                  borderRadius: '50%',
                  background: isAct ? 'rgba(244,199,107,0.15)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)', transition: 'all 0.4s ease',
                  boxShadow: isAct ? '0 0 15px rgba(244,199,107,0.15)' : 'none',
                }}>
                  <svg width={isThisFS ? '14' : '11'} height={isThisFS ? '14' : '11'} viewBox="0 0 24 24" fill="none" stroke={isAct ? '#F4C76B' : '#F7F1E8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    {isAct ? <><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>
                     : <><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>}
                  </svg>
                </button>

                {isThisFS && <div style={{ position: 'absolute', top: '16px', right: '20px', zIndex: 5, opacity: 0.3 }}><span style={{ fontSize: '9px', fontWeight: 200, letterSpacing: '0.3em', color: '#F7F1E8' }}>ESC</span></div>}
                {isAct && !isFS && <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(244,199,107,0.1)', borderRadius: '10px', pointerEvents: 'none', zIndex: 3 }} />}
              </div>
            )
          })}
        </div>

        {/* ═══ BOTTOM: Logo + Mail (cinema phase) ═══ */}
        {!isFS && cinemaReveal > 0 && (
          <div style={{
            position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            opacity: cinemaReveal,
          }}>
            <img src="/logo.png" alt="" style={{
              width: '34px', height: '34px', objectFit: 'contain', opacity: 0.8,
              filter: `drop-shadow(0 0 10px rgba(244,199,107,${0.08 + breath * 0.05}))`,
            }} />
            <span style={{ fontSize: '9px', fontWeight: 200, letterSpacing: '0.6em', color: '#F4C76B', opacity: 0.5 + breath * 0.15, animation: 'textGlow 4s ease-in-out infinite' }}>AYMEDO</span>
            {/* Mail — big, prominent, with icon */}
            <a href="mailto:ola@aymedo.io" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              textDecoration: 'none', cursor: 'pointer',
              marginTop: '4px',
            }}>
              <svg width="18" height="14" viewBox="0 0 24 18" fill="none" style={{ opacity: 0.6 + breath * 0.2, flexShrink: 0 }}>
                <rect x="1" y="1" width="22" height="16" rx="2" stroke="#F4C76B" strokeWidth="1.2" fill="none" />
                <path d="M1 1 L12 10 L23 1" stroke="#F4C76B" strokeWidth="1.2" fill="none" />
              </svg>
              <span style={{
                fontSize: '13px', fontWeight: 300, letterSpacing: '0.25em',
                color: `rgba(244,199,107,${0.7 + breath * 0.15})`,
                textShadow: `0 0 15px rgba(244,199,107,${0.1 + breath * 0.06})`,
                animation: 'emailPulse 3s ease-in-out infinite',
              }}>ola@aymedo.io</span>
            </a>
          </div>
        )}

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 25, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          opacity: scrollHint, pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.6em', color: 'rgba(247,241,232,0.5)' }}>SCROLL</span>
          <div style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <path d="M8 4 L8 18" stroke="rgba(244,199,107,0.5)" strokeWidth="1" strokeLinecap="round" />
              <path d="M3 14 L8 20 L13 14" stroke="rgba(244,199,107,0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Film grain */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none', opacity: 0.015, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, mixBlendMode: 'overlay' }} />
      </div>

      <style>{`
        @keyframes scrollBounce{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(8px);opacity:1}}
        @keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes textGlow{0%,100%{opacity:0.65;text-shadow:0 0 10px rgba(244,199,107,0.1)}50%{opacity:1;text-shadow:0 0 25px rgba(244,199,107,0.3)}}
        @keyframes audioPulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes waterWave{
          0%,100%{border-color:rgba(255,255,255,0.05);box-shadow:inset 0 0 20px rgba(160,190,240,0.02),0 0 15px rgba(80,120,180,0.03)}
          50%{border-color:rgba(200,220,255,0.1);box-shadow:inset 0 0 30px rgba(160,190,240,0.04),0 0 30px rgba(80,120,180,0.05)}
        }
        @keyframes glassShimmer{0%,100%{opacity:0.7}50%{opacity:1}}
        @keyframes causticSlide{0%{transform:translateX(-30%);opacity:0.3}50%{transform:translateX(30%);opacity:0.8}100%{transform:translateX(-30%);opacity:0.3}}
        @keyframes sparkleFloat{0%{transform:translateY(0)}100%{transform:translateY(30px)}}
        @keyframes particleOrbit{0%{transform:rotate(0deg) translateX(8px) rotate(0deg)}100%{transform:rotate(360deg) translateX(8px) rotate(-360deg)}}
        @keyframes emailPulse{0%,100%{opacity:0.75;transform:scale(1);text-shadow:0 0 10px rgba(244,199,107,0.08)}50%{opacity:1;transform:scale(1.02);text-shadow:0 0 25px rgba(244,199,107,0.2)}}
        ::-webkit-scrollbar{display:none}
        html{scrollbar-width:none}
        ::selection{background:#F4C76B;color:#050505}
      `}</style>
    </div>
  )
}
