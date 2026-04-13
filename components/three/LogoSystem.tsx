'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ═══════════════════════════════════════════
// LOGO SYSTEM — The inner golden truth
//
// Concentric torus rings at φ-ratio radii
// Golden ratio spiral as tube
// Axis crosshairs
// Central glowing core
//
// This exists INSIDE the glass shell.
// ═══════════════════════════════════════════

const PHI = 1.618033988749895

const RINGS = [
  { r: 0.35,  tilt: [0.1, 0, 0],          speed: 0.15 },
  { r: 0.35 * PHI,  tilt: [0.3, 0.15, 0.08],  speed: -0.15 / PHI },
  { r: 0.35 * PHI ** 2, tilt: [-0.12, 0.4, -0.1], speed: 0.15 / PHI ** 2 },
  { r: 0.35 * PHI ** 3, tilt: [0.2, -0.2, 0.14], speed: -0.15 / PHI ** 3 },
  { r: 0.35 * PHI ** 4, tilt: [-0.06, 0.06, -0.2], speed: 0.15 / PHI ** 4 },
]

export default function LogoSystem() {
  const groupRef = useRef<THREE.Group>(null!)
  const coreRef = useRef<THREE.Mesh>(null!)
  const ringsRef = useRef<THREE.Mesh[]>([])

  // Golden ratio spiral curve
  const spiralCurve = useMemo(() => {
    const points: THREE.Vector3[] = []
    const a = 0.06
    const b = Math.log(PHI) / (Math.PI / 2)
    for (let theta = 0; theta < Math.PI * 4.5; theta += 0.04) {
      const r = a * Math.exp(b * theta)
      if (r > 2.8) break
      points.push(new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), theta * 0.004))
    }
    return new THREE.CatmullRomCurve3(points)
  }, [])

  const axisLen = RINGS[4].r * 1.15

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Core breathing
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 1.2) * 0.2
      coreRef.current.scale.setScalar(0.035 * pulse)
    }

    // Rotate each ring
    ringsRef.current.forEach((mesh, i) => {
      if (mesh) mesh.rotation.y += RINGS[i].speed * 0.012
    })

    // Subtle group rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      {/* Core glow */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#F4C76B" toneMapped={false} />
      </mesh>
      <pointLight color="#F4C76B" intensity={2} distance={8} decay={2} />

      {/* Orbital rings */}
      {RINGS.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el }}
          rotation={ring.tilt as [number, number, number]}
        >
          <torusGeometry args={[ring.r, 0.003, 12, 128]} />
          <meshStandardMaterial
            color="#F4C76B"
            emissive="#F4C76B"
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.2}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Golden spiral */}
      <mesh>
        <tubeGeometry args={[spiralCurve, 300, 0.002, 8, false]} />
        <meshStandardMaterial
          color="#F4C76B"
          emissive="#F4C76B"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>

      {/* Axis — horizontal */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.001, 0.001, axisLen * 2, 4]} />
        <meshStandardMaterial color="#F4C76B" emissive="#F4C76B" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>

      {/* Axis — vertical */}
      <mesh>
        <cylinderGeometry args={[0.001, 0.001, axisLen * 2, 4]} />
        <meshStandardMaterial color="#F4C76B" emissive="#F4C76B" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
    </group>
  )
}
