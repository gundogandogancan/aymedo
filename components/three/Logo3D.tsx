'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import LogoSystem from './LogoSystem'
import GlassShell from './GlassShell'

export default function Logo3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 35 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true, toneMapping: 0 }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.15} />
        <directionalLight position={[4, 5, 6]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-3, -2, 4]} intensity={0.4} color="#8A2BE2" />
        <Environment preset="city" environmentIntensity={0.35} />
        <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.15}>
          <group>
            <LogoSystem />
            <GlassShell />
          </group>
        </Float>
      </Suspense>
    </Canvas>
  )
}
