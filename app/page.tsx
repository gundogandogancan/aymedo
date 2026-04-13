'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

// ═══════════════════════════════════════════
// AYMEDO — Cinematic Theatre Experience
// PERFORMANCE: rAF-driven, minimal re-renders
// ═══════════════════════════════════════════

const SCREENS = [
  { id: 'matrix',       src: '/videos/matrix.mp4',       word: 'GLAD' },
  { id: 'prison-break', src: '/videos/prison-break.mp4', word: 'YOU' },
  { id: 'fareler',      src: '/videos/fareler.mp4',      word: 'MADE IT' },
  { id: 'escobar',      src: '/videos/escobar.mp4',      word: 'THIS FAR' },
]

export default function Theatre() {
  const [activeAudio, setActiveAudio] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState<string | null>(null)
  const [isPortrait, setIsPortrait] = useState(false)

  // Performance: use refs instead of state for animation values
  const pRef = useRef(0)
  const breathRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const sceneRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({})
  const cinematicRef = useRef<HTMLVideoElement>(null)
  const videosStarted = useRef(false)
  const rotateRef = useRef(0)

  // Detect portrait
  useEffect(() => {
    const check = () => {
      setIsPortrait(window.innerWidth < 768 && window.innerHeight > window.innerWidth)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // MASTER ANIMATION LOOP — one rAF drives everything
  useEffect(() => {
    let breathT = 0
    let rotT = 0

    const tick = () => {
      // Scroll
      const max = document.documentElement.scrollHeight - window.innerHeight
      pRef.current = max > 0 ? window.scrollY / max : 0
      const p = pRef.current

      // Breathing
      breathT += 0.004
      breathRef.current = Math.sin(breathT) * 0.5 + 0.5
      const b = breathRef.current

      // Rotate phone
      if (isPortrait) {
        rotT += 0.03
        rotateRef.current = Math.sin(rotT) * 0.5 + 0.5
      }

      // ── PHASE CALCULATIONS ──
      const curtainProgress = Math.min(1, Math.max(0, p / 0.12))
      const curtainEased = curtainProgress * curtainProgress * (3 - 2 * curtainProgress)
      const spotI = Math.min(1, p / 0.03)

      const lightLeak = Math.min(1, Math.max(0, (p - 0.06) / 0.05))
      const logoGlow = Math.min(1, Math.max(0, (p - 0.08) / 0.04))
      const logoReveal = Math.min(1, Math.max(0, (p - 0.10) / 0.05))
      const logoZP = Math.min(1, Math.max(0, (p - 0.10) / 0.12))
      const logoScale = 0.85 + (logoZP * logoZP) * 2.65
      const logoFade = logoZP > 0.6 ? Math.max(0, 1 - (logoZP - 0.6) / 0.4) : 1

      const videoFadeIn = Math.min(1, Math.max(0, (p - 0.22) / 0.06))
      const videoProgress = Math.min(1, Math.max(0, (p - 0.23) / 0.49))
      const videoFade = p > 0.70 ? Math.max(0, 1 - (p - 0.70) / 0.04) : 1

      const cinemaReveal = Math.min(1, Math.max(0, (p - 0.72) / 0.10))
      const scrollHint = Math.max(0, 1 - p * 6)

      // ── APPLY TO DOM DIRECTLY (no setState) ──
      const s = sceneRef.current
      if (!s) { requestAnimationFrame(tick); return }

      // Curtain left
      const cL = s.querySelector('[data-c="l"]') as HTMLElement
      const cR = s.querySelector('[data-c="r"]') as HTMLElement
      if (cL) {
        const lP = Math.min(1, Math.max(0, curtainEased))
        cL.style.transform = `translateX(${-lP * 105}%) scaleX(${1 - lP * 0.15})`
        cL.style.pointerEvents = lP > 0.95 ? 'none' : 'auto'
        const cImg = cL.querySelector('div') as HTMLElement
        if (cImg) cImg.style.filter = `brightness(${0.6 + spotI * 0.3})`
      }
      if (cR) {
        const rP = Math.min(1, Math.max(0, curtainEased - 0.03))
        cR.style.transform = `translateX(${rP * 105}%) scaleX(${1 - rP * 0.15})`
        cR.style.pointerEvents = rP > 0.95 ? 'none' : 'auto'
        const cImg = cR.querySelector('div') as HTMLElement
        if (cImg) cImg.style.filter = `brightness(${0.6 + spotI * 0.3})`
      }

      // Light leak
      const ll = s.querySelector('[data-ll]') as HTMLElement
      if (ll) {
        const sz = 120 + lightLeak * 300
        ll.style.width = `${sz}px`; ll.style.height = `${sz}px`
        ll.style.opacity = `${logoFade}`
        ll.style.background = `radial-gradient(circle, rgba(244,199,107,${0.08 * lightLeak * (0.8 + b * 0.2)}) 0%, transparent 70%)`
      }

      // Logo container
      const logo = s.querySelector('[data-logo]') as HTMLElement
      if (logo) {
        logo.style.opacity = `${logoReveal * logoFade}`
        logo.style.transform = `scale(${logoScale})`
      }

      // Logo image rotation
      const logoImg = s.querySelector('[data-logo-img]') as HTMLElement
      if (logoImg) {
        logoImg.style.transform = `rotate(${p * 12}deg)`
        logoImg.style.filter = `drop-shadow(0 0 30px rgba(244,199,107,${0.15 + b * 0.1}))`
      }

      // Logo text area
      const logoText = s.querySelector('[data-logo-text]') as HTMLElement
      if (logoText) {
        logoText.style.opacity = `${logoReveal * logoFade}`
        logoText.style.transform = `translateY(${(1 - logoReveal) * 20}px)`
      }

      // Scroll-driven cinematic video
      const vid = cinematicRef.current
      if (vid && vid.duration && vid.duration !== Infinity && videoProgress > 0) {
        const target = videoProgress * vid.duration
        if (Math.abs(vid.currentTime - target) > 0.05) {
          vid.currentTime = target
        }
      }

      // Video layer
      const vLayer = s.querySelector('[data-vlayer]') as HTMLElement
      if (vLayer) {
        vLayer.style.opacity = `${videoFade}`
        const vEl = vLayer.querySelector('video') as HTMLElement
        if (vEl) vEl.style.opacity = `${videoFadeIn}`
        // Progress bar
        const prog = vLayer.querySelector('[data-vprog]') as HTMLElement
        if (prog) prog.style.width = `${videoProgress * 100}%`
        // Side panels
        const panels = vLayer.querySelectorAll('[data-panel]')
        panels.forEach(panel => { (panel as HTMLElement).style.opacity = `${videoFadeIn}` })
        // Stripe animation
        const stripeOffset = videoProgress * 2000
        const bandSize = 120
        const sL = vLayer.querySelector('[data-stripe-l]') as HTMLElement
        const sR = vLayer.querySelector('[data-stripe-r]') as HTMLElement
        if (sL) sL.style.transform = `translateY(${stripeOffset % (bandSize * 2)}px)`
        if (sR) sR.style.transform = `translateY(-${stripeOffset % (bandSize * 2)}px)`
      }

      // Cinema screens
      const cinema = s.querySelector('[data-cinema]') as HTMLElement
      if (cinema) {
        cinema.style.opacity = `${cinemaReveal}`
        cinema.style.transform = `scale(${0.92 + cinemaReveal * 0.08})`
        cinema.style.pointerEvents = p > 0.80 ? 'auto' : 'none'
      }

      // Start videos early — once
      if (p > 0.5 && !videosStarted.current) {
        videosStarted.current = true
        Object.values(videoRefs.current).forEach(v => {
          if (v && v.paused) v.play().catch(() => {})
        })
        // Retry
        setTimeout(() => {
          Object.values(videoRefs.current).forEach(v => {
            if (v && v.paused) v.play().catch(() => {})
          })
        }, 2000)
      }

      // Cinema bottom info
      const cBot = s.querySelector('[data-cbot]') as HTMLElement
      if (cBot) cBot.style.opacity = `${cinemaReveal}`

      // Infinity
      const inf = s.querySelector('[data-inf]') as HTMLElement
      if (inf) inf.style.opacity = `${cinemaReveal > 0.2 ? cinemaReveal * 0.5 * (0.7 + b * 0.3) : 0}`

      // Scroll hint
      const sh = s.querySelector('[data-scroll]') as HTMLElement
      if (sh) sh.style.opacity = `${scrollHint}`

      // Stars breathing
      const stars = s.querySelector('[data-stars]') as HTMLElement
      if (stars) stars.style.opacity = `${0.6 + b * 0.1}`

      // Sparkle
      const sparkle = s.querySelector('[data-sparkle]') as HTMLElement
      if (sparkle) sparkle.style.opacity = `${curtainEased > 0.3 ? Math.min(0.4, (curtainEased - 0.3) * 0.8) * (0.7 + b * 0.3) : 0}`

      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [isPortrait])

  // Mouse — raw listener, no setState
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
    }
    window.addEventListener('mousemove', fn, { passive: true })
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  // Audio
  const toggleAudio = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const on = activeAudio !== id
    Object.values(videoRefs.current).forEach(v => { v.muted = true })
    if (on && videoRefs.current[id]) {
      videoRefs.current[id].muted = false
      videoRefs.current[id].volume = 1.0
      if (videoRefs.current[id].paused) videoRefs.current[id].play().catch(() => {})
    }
    setActiveAudio(on ? id : null)
  }, [activeAudio])

  const goFS = (id: string) => setFullscreen(prev => prev === id ? null : id)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(null)
      if (e.key === 'Enter') window.location.href = 'mailto:ola@aymedo.io'
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const isFS = fullscreen !== null

  return (
    <div style={{ background: '#020101' }}>

      {/* ═══ ROTATE PHONE ═══ */}
      {isPortrait && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(2,1,1,0.97)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '28px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{ animation: 'phoneRotate 3s ease-in-out infinite' }}>
            <svg width="64" height="100" viewBox="0 0 64 100" fill="none">
              <rect x="4" y="4" width="56" height="92" rx="10" stroke="#F4C76B" strokeWidth="2.5" fill="none" />
              <circle cx="32" cy="86" r="4" stroke="#F4C76B" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div style={{ color: '#F4C76B', fontSize: '14px', fontWeight: 300, letterSpacing: '0.35em', opacity: 0.8 }}>ROTATE YOUR PHONE</div>
          <div style={{ color: 'rgba(247,241,232,0.35)', fontSize: '11px', fontWeight: 200, letterSpacing: '0.2em' }}>FOR THE BEST EXPERIENCE</div>
        </div>
      )}

      {/* Scroll space — reduced for faster response */}
      <div style={{ height: '800vh' }} />

      <div ref={sceneRef} style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#020101',
      }}>

        {/* ═══ COSMOS BG ═══ */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 40% 50% at 25% 35%, rgba(180,120,60,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 35% 45% at 75% 55%, rgba(100,80,160,0.04) 0%, transparent 70%),
            radial-gradient(circle at 50% 50%, rgba(10,8,5,1) 0%, rgba(5,3,2,1) 100%)
          `, pointerEvents: 'none',
        }} />

        {/* Stars */}
        <div data-stars style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.7) 0%,transparent 100%),
            radial-gradient(1px 1px at 35% 8%,rgba(255,255,255,0.6) 0%,transparent 100%),
            radial-gradient(1px 1px at 55% 25%,rgba(255,255,255,0.5) 0%,transparent 100%),
            radial-gradient(1px 1px at 75% 85%,rgba(255,255,255,0.4) 0%,transparent 100%),
            radial-gradient(1px 1px at 92% 65%,rgba(255,255,255,0.5) 0%,transparent 100%),
            radial-gradient(2px 2px at 22% 28%,rgba(255,200,120,0.8) 0%,transparent 100%),
            radial-gradient(2px 2px at 62% 18%,rgba(180,200,255,0.7) 0%,transparent 100%),
            radial-gradient(1px 1px at 40% 70%,rgba(255,255,255,0.4) 0%,transparent 100%),
            radial-gradient(1px 1px at 68% 42%,rgba(255,255,255,0.5) 0%,transparent 100%)
          `,
        }} />

        {/* ═══ CURTAINS ═══ */}
        {['left', 'right'].map(side => (
          <div key={side} data-c={side === 'left' ? 'l' : 'r'} style={{
            position: 'absolute', top: 0, [side]: 0,
            width: '52%', height: '100%', zIndex: 20,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
            willChange: 'transform',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url(/images/curtain-closed.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: side === 'left' ? 'right center' : 'left center',
            }} />
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              [side === 'left' ? 'right' : 'left']: 0,
              width: '80px',
              background: `linear-gradient(${side === 'left' ? '270deg' : '90deg'}, transparent, rgba(0,0,0,0.8))`,
              pointerEvents: 'none',
            }} />
          </div>
        ))}

        {/* Sparkle rain */}
        <div data-sparkle style={{
          position: 'absolute', top: '5%', left: '45%', width: '10%', height: '80%',
          opacity: 0,
          background: `
            radial-gradient(1px 1px at 20% 10%, rgba(244,199,107,0.8) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 20%, rgba(244,199,107,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 15%, rgba(244,199,107,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 30%, rgba(244,199,107,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 35%, rgba(244,199,107,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 75%, rgba(244,199,107,0.5) 0%, transparent 100%)
          `,
          animation: 'sparkleFloat 8s linear infinite',
          pointerEvents: 'none', zIndex: 18,
        }} />

        {/* ═══ LOGO ═══ */}
        <div data-ll style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          borderRadius: '50%', filter: 'blur(40px)',
          pointerEvents: 'none', zIndex: 8,
        }} />

        <div data-logo style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', willChange: 'transform, opacity',
        }}>
          <div data-logo-img style={{ width: '200px', height: '200px', willChange: 'transform' }}>
            <img src="/logo.png" alt="AYMEDO" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.95 }} />
          </div>
        </div>

        {/* Logo text — bottom left */}
        <div data-logo-text style={{
          position: 'absolute', bottom: '28px', left: '28px', zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: '10px',
          pointerEvents: 'auto',
        }}>
          <div style={{ fontSize: '22px', fontWeight: 200, letterSpacing: '0.8em', color: '#F4C76B', animation: 'textGlow 4s ease-in-out infinite' }}>AYMEDO</div>
          <div style={{ width: '35px', height: '1px', background: 'rgba(244,199,107,0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="14" height="11" viewBox="0 0 24 18" fill="none">
              <rect x="1" y="1" width="22" height="16" rx="2" stroke="#F4C76B" strokeWidth="1.2" fill="none" />
              <path d="M1 1 L12 10 L23 1" stroke="#F4C76B" strokeWidth="1.2" fill="none" />
            </svg>
            <a href="mailto:ola@aymedo.io" style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.2em', color: 'rgba(244,199,107,0.7)', textDecoration: 'none', animation: 'emailPulse 3s ease-in-out infinite' }}>ola@aymedo.io</a>
          </div>
          <div style={{ fontSize: '7px', fontWeight: 300, letterSpacing: '0.3em', color: 'rgba(247,241,232,0.3)' }}>FOR COLLABORATIONS</div>
        </div>

        {/* ═══ SCROLL VIDEO ═══ */}
        <div data-vlayer style={{
          position: 'absolute', inset: 0, zIndex: 9, pointerEvents: 'none',
        }}>
          <video ref={cinematicRef} muted playsInline preload="auto"
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', objectFit: 'contain', willChange: 'opacity' }}>
            <source src="/videos/cinematic.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', bottom: '3%', left: '25%', width: '50%', height: '1px', background: 'rgba(255,255,255,0.06)', zIndex: 2 }}>
            <div data-vprog style={{ width: '0%', height: '100%', background: 'rgba(244,199,107,0.3)', boxShadow: '0 0 6px rgba(244,199,107,0.1)' }} />
          </div>

          {/* Side panels */}
          {(() => {
            const bandSize = 120
            return <>
              <div data-panel style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 'calc((100vw - 56.25vh) / 2)', minWidth: '40px', overflow: 'hidden', zIndex: 3, pointerEvents: 'none' }}>
                <div data-stripe-l style={{ position: 'absolute', left: 0, right: 0, top: `-${bandSize}px`, height: `calc(100% + ${bandSize * 4}px)`,
                  background: `repeating-linear-gradient(180deg, rgba(240,235,225,0.08) 0px, rgba(240,235,225,0.08) ${bandSize}px, rgba(5,5,5,0.95) ${bandSize}px, rgba(5,5,5,0.95) ${bandSize * 2}px)`,
                  willChange: 'transform',
                }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(5,3,2,0.95))' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 300, letterSpacing: '0.4em', color: 'rgba(244,199,107,0.7)', textAlign: 'center', animation: 'textGlow 4s ease-in-out infinite' }}>YOU ARE<br/>ALMOST<br/>THERE</div>
                  <div style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}>
                    <svg width="24" height="60" viewBox="0 0 24 60" fill="none">
                      <path d="M12 0 L12 50" stroke="rgba(244,199,107,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M4 42 L12 54 L20 42" stroke="rgba(244,199,107,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
              <div data-panel style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'calc((100vw - 56.25vh) / 2)', minWidth: '40px', overflow: 'hidden', zIndex: 3, pointerEvents: 'none' }}>
                <div data-stripe-r style={{ position: 'absolute', left: 0, right: 0, top: `-${bandSize}px`, height: `calc(100% + ${bandSize * 4}px)`,
                  background: `repeating-linear-gradient(180deg, rgba(5,5,5,0.95) 0px, rgba(5,5,5,0.95) ${bandSize}px, rgba(240,235,225,0.08) ${bandSize}px, rgba(240,235,225,0.08) ${bandSize * 2}px)`,
                  willChange: 'transform',
                }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, transparent 60%, rgba(5,3,2,0.95))' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 300, letterSpacing: '0.4em', color: 'rgba(244,199,107,0.7)', textAlign: 'center', animation: 'textGlow 4s ease-in-out infinite', animationDelay: '2s' }}>KEEP<br/>SCROLLING</div>
                  <div style={{ animation: 'scrollBounce 2s ease-in-out infinite', animationDelay: '0.5s' }}>
                    <svg width="24" height="60" viewBox="0 0 24 60" fill="none">
                      <path d="M12 0 L12 50" stroke="rgba(244,199,107,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M4 42 L12 54 L20 42" stroke="rgba(244,199,107,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          })()}
        </div>

        {/* ═══ INFINITY ═══ */}
        <div data-inf style={{
          position: 'absolute', top: '2%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 8, opacity: 0, pointerEvents: 'none',
        }}>
          <svg width="36" height="18" viewBox="0 0 60 30" fill="none" style={{ filter: 'drop-shadow(0 0 8px rgba(244,199,107,0.15))' }}>
            <path d="M15 15 C15 8 5 3 5 15 C5 27 15 22 15 15 Z" stroke="#F4C76B" strokeWidth="1" fill="none" />
            <path d="M15 15 C15 22 25 27 25 15 C25 3 15 8 15 15 Z" stroke="#F4C76B" strokeWidth="1" fill="none" transform="translate(20, 0)" />
          </svg>
        </div>

        {/* ═══ 4 CINEMA SCREENS ═══ */}
        <div data-cinema style={{
          position: 'absolute',
          top: isFS ? 0 : '6%', left: isFS ? 0 : '6%', right: isFS ? 0 : '6%', bottom: isFS ? 0 : '14%',
          display: 'grid',
          gridTemplateColumns: isFS ? '1fr' : '1fr 1fr',
          gridTemplateRows: isFS ? '1fr' : '1fr 1fr',
          gap: isFS ? 0 : '16px',
          opacity: 0,
          transition: isFS ? 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          zIndex: 5, willChange: 'opacity, transform',
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
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                  borderRadius: isThisFS ? 0 : '10px',
                  opacity: isHidden ? 0 : 1,
                  display: isHidden ? 'none' : 'block',
                  gridColumn: isThisFS ? '1 / -1' : undefined,
                  gridRow: isThisFS ? '1 / -1' : undefined,
                  transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHov && !isFS ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                {/* Glass frame */}
                {!isThisFS && <div style={{
                  position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', borderRadius: '10px',
                  border: `3px solid rgba(255,255,255,${isHov ? 0.15 : 0.06})`,
                  boxShadow: `inset 0 0 25px rgba(160,190,240,0.03), 0 0 ${isHov ? 40 : 15}px rgba(80,120,180,0.05)`,
                  animation: `waterWave ${6 + idx}s ease-in-out infinite`,
                }} />}

                {/* Caustic light */}
                {!isThisFS && <div style={{
                  position: 'absolute', top: 0, left: '5%', right: '5%', height: '4px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                  borderRadius: '10px 10px 0 0', zIndex: 4, pointerEvents: 'none',
                  animation: `causticSlide ${8 + idx}s ease-in-out infinite`,
                }} />}

                {/* Video */}
                <video ref={el => { if (el) videoRefs.current[screen.id] = el }}
                  muted loop playsInline preload="auto" autoPlay
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%', objectFit: 'cover',
                    borderRadius: isThisFS ? 0 : '10px',
                    transform: `scale(${isHov && !isFS ? 1.04 : 1.0})`,
                    filter: `brightness(${isThisFS ? 1.05 : isHov ? 1.0 : isDimmed ? 0.15 : 0.7}) saturate(${isHov ? 1.15 : 1.0})`,
                    transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <source src={screen.src} type="video/mp4" />
                </video>

                {/* Word — bottom right */}
                <div style={{ position: 'absolute', bottom: isThisFS ? '16px' : '8px', right: isThisFS ? '60px' : '44px', zIndex: 4, pointerEvents: 'none' }}>
                  <span style={{
                    fontSize: isThisFS ? '16px' : '10px', fontWeight: 300, letterSpacing: '0.35em',
                    color: `rgba(247,241,232,${isHov || isThisFS ? 0.6 : 0.2})`,
                    textShadow: '0 1px 12px rgba(0,0,0,0.9)', transition: 'all 0.6s ease',
                  }}>{screen.word}</span>
                </div>

                {/* Audio button */}
                <button onClick={e => toggleAudio(screen.id, e)} style={{
                  position: 'absolute', bottom: isThisFS ? '20px' : '8px', right: isThisFS ? '24px' : '10px',
                  zIndex: 5, width: '30px', height: '30px',
                  border: `2px solid rgba(255,255,255,${isHov || isThisFS ? 0.2 : 0.08})`,
                  borderRadius: '50%',
                  background: isAct ? 'rgba(244,199,107,0.15)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)', transition: 'all 0.4s ease',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isAct ? '#F4C76B' : '#F7F1E8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    {isAct ? <><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>
                     : <><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>}
                  </svg>
                </button>

                {isThisFS && <div style={{ position: 'absolute', top: '16px', right: '20px', zIndex: 5, opacity: 0.3 }}><span style={{ fontSize: '9px', fontWeight: 200, letterSpacing: '0.3em', color: '#F7F1E8' }}>ESC</span></div>}
              </div>
            )
          })}
        </div>

        {/* Cinema bottom */}
        {!isFS && (
          <div data-cbot style={{
            position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0,
          }}>
            <img src="/logo.png" alt="" style={{ width: '34px', height: '34px', objectFit: 'contain', opacity: 0.8, filter: 'drop-shadow(0 0 10px rgba(244,199,107,0.08))' }} />
            <span style={{ fontSize: '9px', fontWeight: 200, letterSpacing: '0.6em', color: '#F4C76B', opacity: 0.6, animation: 'textGlow 4s ease-in-out infinite' }}>AYMEDO</span>
            <a href="mailto:ola@aymedo.io" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginTop: '4px' }}>
              <svg width="18" height="14" viewBox="0 0 24 18" fill="none">
                <rect x="1" y="1" width="22" height="16" rx="2" stroke="#F4C76B" strokeWidth="1.2" fill="none" />
                <path d="M1 1 L12 10 L23 1" stroke="#F4C76B" strokeWidth="1.2" fill="none" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 300, letterSpacing: '0.25em', color: 'rgba(244,199,107,0.8)', animation: 'emailPulse 3s ease-in-out infinite' }}>ola@aymedo.io</span>
            </a>
          </div>
        )}

        {/* Scroll indicator */}
        <div data-scroll style={{
          position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 25, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 300, letterSpacing: '0.5em', color: 'rgba(244,199,107,0.7)', animation: 'textGlow 3s ease-in-out infinite' }}>SCROLL DOWN</span>
          <div style={{ animation: 'scrollBounce 1.8s ease-in-out infinite' }}>
            <svg width="28" height="50" viewBox="0 0 28 50" fill="none">
              <path d="M14 2 L14 40" stroke="rgba(244,199,107,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 32 L14 44 L22 32" stroke="rgba(244,199,107,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Film grain */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none', opacity: 0.015, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, mixBlendMode: 'overlay' }} />
      </div>

      <style>{`
        @keyframes scrollBounce{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(8px);opacity:1}}
        @keyframes textGlow{0%,100%{opacity:0.65}50%{opacity:1}}
        @keyframes waterWave{0%,100%{border-color:rgba(255,255,255,0.05)}50%{border-color:rgba(200,220,255,0.1)}}
        @keyframes causticSlide{0%{transform:translateX(-30%);opacity:0.3}50%{transform:translateX(30%);opacity:0.8}100%{transform:translateX(-30%);opacity:0.3}}
        @keyframes sparkleFloat{0%{transform:translateY(0)}100%{transform:translateY(30px)}}
        @keyframes emailPulse{0%,100%{opacity:0.75}50%{opacity:1}}
        @keyframes phoneRotate{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-90deg)}}
        ::-webkit-scrollbar{display:none}
        html{scrollbar-width:none}
        ::selection{background:#F4C76B;color:#050505}
      `}</style>
    </div>
  )
}
