'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const Logo3D = dynamic(() => import('@/components/three/Logo3D'), { ssr: false })

// ═══════════════════════════════════════════
// HOME — 3D Logo + Scroll transition to World
// ═══════════════════════════════════════════

const LETTERS = ['A', 'Y', 'M', 'E', 'D', 'O']

export default function HomePage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [navigating, setNavigating] = useState(false)
  const [entered, setEntered] = useState(false)

  // Entrance fade
  useEffect(() => {
    setTimeout(() => setEntered(true), 100)
  }, [])

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? el.scrollTop / max : 0
      setProgress(p)
      if (p > 0.92 && !navigating) {
        setNavigating(true)
        setTimeout(() => router.push('/world'), 600)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [router, navigating])

  const logoScale = 1 + progress * 1.2
  const logoOpacity = progress < 0.5 ? 1 : Math.max(0, 1 - (progress - 0.5) / 0.35)
  const letterPhase = Math.max(0, (progress - 0.35) / 0.45)
  const letterSpread = Math.max(0, (progress - 0.7) / 0.3)
  const fadeOut = progress > 0.85 ? Math.max(0, 1 - (progress - 0.85) / 0.15) : 1

  return (
    <div style={{
      background: '#050505',
      opacity: entered ? 1 : 0,
      transition: 'opacity 0.8s ease',
    }}>
      <div style={{ height: '350vh' }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: navigating ? 0 : fadeOut,
        transition: navigating ? 'opacity 0.6s ease' : 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          willChange: 'transform, opacity',
        }}>
          <Logo3D />
        </div>

        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          gap: `${16 + letterSpread * 40}px`,
          pointerEvents: 'none',
        }}>
          {LETTERS.map((letter, i) => {
            const stagger = i / LETTERS.length
            const lp = Math.max(0, Math.min(1, (letterPhase - stagger * 0.6) / 0.4))
            const eased = lp * lp * (3 - 2 * lp)
            return (
              <span key={i} style={{
                fontSize: '42px',
                fontWeight: 100,
                letterSpacing: '0.15em',
                color: '#F7F1E8',
                fontFamily: 'Inter, system-ui, sans-serif',
                opacity: eased,
                transform: `translateY(${(1 - eased) * 60}px) scale(${1 + letterSpread * 0.15})`,
                willChange: 'transform, opacity',
                textShadow: `0 0 ${30 * eased}px rgba(244, 199, 107, ${0.3 * eased})`,
              }}>
                {letter}
              </span>
            )
          })}
        </div>

        <p style={{
          position: 'relative',
          zIndex: 2,
          marginTop: '28px',
          fontSize: '9px',
          fontWeight: 200,
          letterSpacing: '0.6em',
          color: '#F7F1E8',
          fontFamily: 'Inter, system-ui, sans-serif',
          textTransform: 'uppercase',
          opacity: Math.max(0, Math.min(1, (letterPhase - 0.7) / 0.3)),
        }}>
          Origin &middot; Energy &middot; Creation
        </p>

        <div style={{
          position: 'absolute',
          bottom: '40px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: Math.max(0, 1 - progress * 6),
        }}>
          <div style={{
            width: '1px',
            height: '32px',
            background: 'linear-gradient(to bottom, transparent, rgba(244, 199, 107, 0.2))',
            animation: 'breathe 3s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '8px',
            fontWeight: 200,
            letterSpacing: '0.45em',
            color: 'rgba(247, 241, 232, 0.2)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            SCROLL
          </span>
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.2; transform: scaleY(1); }
          50% { opacity: 0.5; transform: scaleY(1.15); }
        }
        ::-webkit-scrollbar { display: none; }
        html { scrollbar-width: none; }
      `}</style>
    </div>
  )
}
