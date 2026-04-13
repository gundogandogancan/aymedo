'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment, Float } from '@react-three/drei'

function GlassSphere({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <Float speed={0.4} rotationIntensity={0.05} floatIntensity={0.1}>
      <mesh position={position}>
        <sphereGeometry args={[scale, 64, 64]} />
        <MeshTransmissionMaterial
          transmission={1} thickness={0.15} roughness={0.02}
          ior={1.15} chromaticAberration={0.04}
          backside samples={8} color="#f0eef5"
          attenuationColor="#8A2BE2" attenuationDistance={5}
          toneMapped={false}
        />
      </mesh>
    </Float>
  )
}

export default function GlassOverlay() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true, toneMapping: 0 }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 4, 5]} intensity={1.5} />
        <Environment preset="city" environmentIntensity={0.3} />
        <GlassSphere position={[0, 0, 0]} scale={0.25} />
        <GlassSphere position={[-1.8, 1.2, -1]} scale={0.12} />
        <GlassSphere position={[2.0, -0.8, -0.5]} scale={0.08} />
      </Suspense>
    </Canvas>
  )
}
