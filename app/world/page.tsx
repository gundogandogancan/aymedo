'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const GlassOverlay = dynamic(() => import('@/components/three/GlassOverlay'), { ssr: false })

// ═══════════════════════════════════════════
// AYMEDO — WORLD
//
// Left: Identity panel (33%)
// Right: 4 element videos in 2×2 (67%)
//
// Not a gallery. Not a portfolio.
// A personal control panel of a universe.
// ═══════════════════════════════════════════

const ELEMENTS = [
  { id: 'fire',  label: 'FIRE',  color: 'rgba(255, 107, 74, 0.08)',  glow: 'rgba(255, 107, 74, 0.25)',  video: '/videos/fire.mp4' },
  { id: 'water', label: 'WATER', color: 'rgba(74, 144, 255, 0.08)',  glow: 'rgba(74, 144, 255, 0.25)',  video: '/videos/water.mp4' },
  { id: 'earth', label: 'EARTH', color: 'rgba(168, 132, 88, 0.08)',  glow: 'rgba(168, 132, 88, 0.25)',  video: '/videos/earth.mp4' },
  { id: 'air',   label: 'AIR',   color: 'rgba(158, 118, 255, 0.08)', glow: 'rgba(158, 118, 255, 0.25)', video: '/videos/air.mp4' },
] as const

export default function WorldPage() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [breath, setBreath] = useState(0)
  const raf = useRef(0)

  // Breathing cycle
  useEffect(() => {
    let t = 0
    function loop() {
      t += 0.008
      setBreath(Math.sin(t) * 0.5 + 0.5)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  // Mouse parallax
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const px = mouse.x * 3
  const py = mouse.y * 3
  const ambientOpacity = 0.015 + breath * 0.012

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#050505',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
      cursor: 'default',
      position: 'relative',
    }}>
      {/* Liquid glass floating overlay */}
      <GlassOverlay />

      {/* ══════ LEFT: IDENTITY PANEL ══════ */}
      <div style={{
        width: '33%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        transform: `translate(${px * 0.3}px, ${py * 0.3}px)`,
        transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Ambient light pulse */}
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(244, 199, 107, ${ambientOpacity}) 0%, transparent 70%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <img
          src="/logo.png"
          alt="AYMEDO"
          style={{
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            marginBottom: '48px',
            opacity: 0.75 + breath * 0.1,
            transition: 'opacity 2s ease',
          }}
        />

        {/* Title */}
        <h1 style={{
          fontSize: '11px',
          fontWeight: 200,
          letterSpacing: '0.55em',
          color: '#F7F1E8',
          textTransform: 'uppercase',
          marginBottom: '12px',
          opacity: 0.6,
        }}>
          AYMEDO
        </h1>

        <div style={{
          width: '24px',
          height: '1px',
          background: `rgba(244, 199, 107, ${0.15 + breath * 0.1})`,
          marginBottom: '16px',
          transition: 'background 2s ease',
        }} />

        <p style={{
          fontSize: '10px',
          fontWeight: 300,
          letterSpacing: '0.4em',
          color: 'rgba(247, 241, 232, 0.3)',
          textTransform: 'uppercase',
        }}>
          My World
        </p>

        {/* Bottom mark */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '1px',
            height: '32px',
            background: 'linear-gradient(to bottom, transparent, rgba(244, 199, 107, 0.15))',
          }} />
          <span style={{
            fontSize: '8px',
            letterSpacing: '0.3em',
            color: 'rgba(247, 241, 232, 0.15)',
            fontWeight: 300,
          }}>
            DG
          </span>
        </div>
      </div>

      {/* ══════ RIGHT: VIDEO GRID ══════ */}
      <div style={{
        width: '67%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '1px',
        background: 'rgba(244, 199, 107, 0.03)',
        transform: `translate(${px * 0.15}px, ${py * 0.15}px)`,
        transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {ELEMENTS.map((el) => {
          const isHovered = hovered === el.id
          const isDimmed = hovered !== null && !isHovered

          return (
            <div
              key={el.id}
              onMouseEnter={() => setHovered(el.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#050505',
                cursor: 'pointer',
                transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Video */}
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${isHovered ? 1.06 : 1.0})`,
                  filter: `brightness(${isHovered ? 1.2 : isDimmed ? 0.4 : 0.7})`,
                  transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <source src={el.video} type="video/mp4" />
              </video>

              {/* Color overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: isHovered
                  ? `radial-gradient(ellipse at center, ${el.glow}, transparent 70%)`
                  : el.color,
                opacity: isHovered ? 1 : 0.5 + breath * 0.15,
                transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none',
              }} />

              {/* Label */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 200,
                  letterSpacing: '0.5em',
                  color: '#F7F1E8',
                  opacity: isHovered ? 0.85 : 0.25,
                  transform: `translateY(${isHovered ? 0 : 4}px)`,
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                  {el.label}
                </span>
              </div>

              {/* Corner mark */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                width: '6px',
                height: '6px',
                borderTop: `1px solid rgba(247, 241, 232, ${isHovered ? 0.4 : 0.08})`,
                borderLeft: `1px solid rgba(247, 241, 232, ${isHovered ? 0.4 : 0.08})`,
                transition: 'all 0.8s ease',
              }} />

              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '6px',
                height: '6px',
                borderBottom: `1px solid rgba(247, 241, 232, ${isHovered ? 0.4 : 0.08})`,
                borderRight: `1px solid rgba(247, 241, 232, ${isHovered ? 0.4 : 0.08})`,
                transition: 'all 0.8s ease',
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
