import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Timed to match the headline's clip-path wipe in CartRevealHero.jsx —
// keep these two files' constants in sync if you change the timing.
const TRAVEL_DELAY = 0.15
const TRAVEL_DURATION = 1.3
const ARRIVAL = TRAVEL_DELAY + TRAVEL_DURATION
const START_X = -4.4
const END_X = 2.4

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}
function easeOutBack(t) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

// The four "things we sell" that spill out once the cart lands — colors
// pulled straight from the brand palette.
const ITEMS = [
  { shape: 'box', color: '#E5484D', to: [0.5, 1.05, 0.25], delay: 0 },
  { shape: 'sphere', color: '#E0A030', to: [-0.05, 1.3, -0.2], delay: 0.08 },
  { shape: 'cylinder', color: '#2E7D5B', to: [1.0, 1.15, -0.05], delay: 0.16 },
  { shape: 'torus', color: '#3FBF6B', to: [-0.55, 0.95, 0.15], delay: 0.24 },
]

function Item({ def, index }) {
  const ref = useRef(null)
  const matRef = useRef(null)
  const geometry = useMemo(() => {
    switch (def.shape) {
      case 'sphere':
        return <sphereGeometry args={[0.19, 20, 20]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.16, 0.16, 0.28, 20]} />
      case 'torus':
        return <torusGeometry args={[0.16, 0.07, 12, 24]} />
      default:
        return <boxGeometry args={[0.28, 0.28, 0.28]} />
    }
  }, [def.shape])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const start = ARRIVAL + def.delay
    const p = THREE.MathUtils.clamp((t - start) / 0.5, 0, 1)
    const eased = easeOutBack(p)

    if (ref.current) {
      ref.current.position.set(def.to[0] * eased, -0.3 + (def.to[1] + 0.3) * eased, def.to[2] * eased)
      ref.current.scale.setScalar(Math.max(eased, 0))
      ref.current.rotation.y = t * 0.5
      ref.current.rotation.x = t * 0.25

      // Gentle continuous hover once the item has fully popped out
      if (p >= 1) {
        ref.current.position.y = def.to[1] + Math.sin(t * 1.4 + index) * 0.08
      }
    }
    if (matRef.current) matRef.current.opacity = eased
  })

  return (
    <mesh ref={ref} scale={0}>
      {geometry}
      <meshStandardMaterial ref={matRef} color={def.color} roughness={0.35} metalness={0.15} transparent opacity={0} />
    </mesh>
  )
}

function Basket() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.62, 0]}>
        <boxGeometry args={[1.3, 0.08, 0.85]} />
        <meshStandardMaterial color="#123D0A" roughness={0.5} />
      </mesh>
      {/* Front / back walls */}
      <mesh position={[0, -0.32, 0.42]}>
        <boxGeometry args={[1.3, 0.55, 0.06]} />
        <meshStandardMaterial color="#3FBF6B" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.32, -0.42]}>
        <boxGeometry args={[1.3, 0.55, 0.06]} />
        <meshStandardMaterial color="#3FBF6B" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-0.63, -0.32, 0]}>
        <boxGeometry args={[0.06, 0.55, 0.85]} />
        <meshStandardMaterial color="#2E9C55" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0.63, -0.32, 0]}>
        <boxGeometry args={[0.06, 0.55, 0.85]} />
        <meshStandardMaterial color="#2E9C55" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Handle arch */}
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.045, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#123D0A" roughness={0.4} />
      </mesh>
      {/* Wheels */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, -0.92, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 14]} />
          <meshStandardMaterial color="#131A15" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function CartRig() {
  const group = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const p = THREE.MathUtils.clamp((t - TRAVEL_DELAY) / TRAVEL_DURATION, 0, 1)
    const eased = easeInOutCubic(p)
    if (group.current) {
      group.current.position.x = THREE.MathUtils.lerp(START_X, END_X, eased)
      // Small bounce/rock while moving, settles once arrived
      group.current.rotation.z = p < 1 ? Math.sin(t * 10) * 0.015 : 0
      group.current.position.y = p < 1 ? Math.sin(t * 12) * 0.02 : 0
    }
  })

  return (
    <group ref={group} position={[START_X, 0, 0]}>
      <Basket />
      {ITEMS.map((def, i) => (
        <Item key={i} def={def} index={i} />
      ))}
    </group>
  )
}

// No environment maps, no loaded textures, no external models — every
// material is a flat color. This is what keeps it cheap: a dozen basic
// meshes and simple per-frame math, nothing that touches the network.
export default function Hero3DCart() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#ffffff" />
        <directionalLight position={[-3, -1, -2]} intensity={0.35} color="#3FBF6B" />
        <CartRig />
      </Canvas>
    </div>
  )
}
