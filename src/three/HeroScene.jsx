import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'

function LeafKnot() {
  const ref = useRef(null)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.08
      ref.current.rotation.y += delta * 0.12
    }
  })
  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.7}>
      <mesh ref={ref}>
        {/* Lower segment counts than a default torus knot — visually identical, much lighter */}
        <torusKnotGeometry args={[1.1, 0.34, 120, 16]} />
        <MeshDistortMaterial
          color="#3FBF6B"
          roughness={0.35}
          metalness={0.25}
          distort={0.2}
          speed={1.3}
        />
      </mesh>
    </Float>
  )
}

// No drei <Environment> here on purpose: it fetches a remote HDR on every load,
// which was the biggest single cause of hero jank/pop-in. Three manual lights
// give a comparable look with zero network dependency and far less GPU cost.
export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} color="#F4F7F4" />
          <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#3FBF6B" />
          <LeafKnot />
        </Suspense>
      </Canvas>
    </div>
  )
}
