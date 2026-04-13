'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ═══════════════════════════════════════════
// GLASS SHELL — Liquid glass enclosure
//
// Organic, slightly deformed sphere.
// MeshTransmissionMaterial: refraction, chromatic aberration.
// The logo system is visible THROUGH this shell.
//
// Inspired by Spline liquid glass effect.
// ═══════════════════════════════════════════

export default function GlassShell() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const geoRef = useRef<THREE.SphereGeometry>(null!)

  // Organic deformation — bake once, animate subtly
  const originalPositions = useMemo(() => {
    const geo = new THREE.SphereGeometry(2.2, 96, 96)
    const pos = geo.attributes.position
    const original = new Float32Array(pos.array.length)
    original.set(pos.array)
    return { geo, original }
  }, [])

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime

    // Slow organic rotation
    meshRef.current.rotation.y = t * 0.05
    meshRef.current.rotation.x = Math.sin(t * 0.03) * 0.08

    // Mouse tilt — heavy, slow
    meshRef.current.rotation.x += (pointer.y * 0.12 - meshRef.current.rotation.x) * 0.008
    meshRef.current.rotation.z += (-pointer.x * 0.08 - meshRef.current.rotation.z) * 0.008

    // Vertex displacement — breathing organic shape
    const geo = meshRef.current.geometry
    const pos = geo.attributes.position
    const { original } = originalPositions

    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3
      const ox = original[ix]
      const oy = original[ix + 1]
      const oz = original[ix + 2]

      const noise =
        Math.sin(ox * 2.5 + t * 0.4) * 0.04 +
        Math.sin(oy * 3.1 + t * 0.3) * 0.03 +
        Math.sin(oz * 2.8 + t * 0.35) * 0.035

      const r = Math.sqrt(ox * ox + oy * oy + oz * oz)
      const scale = 1 + noise / r

      pos.array[ix] = ox * scale
      pos.array[ix + 1] = oy * scale
      pos.array[ix + 2] = oz * scale
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef} geometry={originalPositions.geo}>
      <MeshTransmissionMaterial
        transmission={1}
        thickness={0.35}
        roughness={0.03}
        ior={1.25}
        chromaticAberration={0.06}
        distortion={0.15}
        distortionScale={0.3}
        temporalDistortion={0.1}
        backside
        samples={12}
        color="#e8e0f0"
        attenuationColor="#8A2BE2"
        attenuationDistance={3.5}
        toneMapped={false}
      />
    </mesh>
  )
}
