import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, Stars } from '@react-three/drei'
import type { CameraControls as CameraControlsImpl } from 'camera-controls'

export default function App() {
  const controlsRef = useRef<CameraControlsImpl>(null)

  // Basit "flyTo" yardımcıları:
  const flyToDirection = (dir: [number, number, number], dist = 10) => {
    if (!controlsRef.current) return
    // dir bir yön vektörü (x,y,z). normalize edip kamerayı o yöne "dist" kadar taşı.
    const [dx, dy, dz] = dir
    const len = Math.hypot(dx, dy, dz) || 1
    const nx = dx / len, ny = dy / len, nz = dz / len
    const cx = nx * dist, cy = ny * dist, cz = nz * dist
    // setLookAt(camX,camY,camZ, lookAtX,lookAtY,lookAtZ, smooth=true)
    controlsRef.current.setLookAt(cx, cy, cz, 0, 0, 0, true)
  }

  // Örnek: RA(saat), Dec(derece) -> yön vektörü
  const raDecToDir = (raHours: number, decDeg: number): [number, number, number] => {
    const ra = (raHours * Math.PI) / 12 // 24h -> 2π
    const dec = (decDeg * Math.PI) / 180
    const x = Math.cos(dec) * Math.cos(ra)
    const y = Math.sin(dec)
    const z = Math.cos(dec) * Math.sin(ra)
    return [x, y, z]
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <aside style={{ width: 320, padding: 12, background: '#0b0b0e', color: 'white' }}>
        <h3>Kontroller</h3>
        <button
          onClick={() => flyToDirection([0, 0, 1], 8)}
          style={{ display: 'block', marginBottom: 8 }}
        >
          +Z yönüne uç
        </button>
        <button
          onClick={() => flyToDirection(raDecToDir(19.5, 40), 12)} // örnek bir RA/Dec
          style={{ display: 'block', marginBottom: 8 }}
        >
          RA=19.5h, Dec=40° yönüne uç
        </button>
        <p style={{ opacity: 0.8 }}>
          Scroll ile zoom; fare sağ tık/orta tuş ile pan; solda orbit.
        </p>
      </aside>

      <main style={{ flex: 1 }}>
        <Canvas
          camera={{ fov: 50, position: [0, 3, 8] }}
          gl={{ antialias: true }}
        >
          {/* Kamera kontrolleri: en kritik parça */}
          <CameraControls
            ref={controlsRef}
            makeDefault
            smoothTime={0.5}     // hareketlerin yumuşaklığı
            dollyToCursor        // zoom, imlece doğru yaklaşır
            infinityDolly={false}
            minDistance={2}
            maxDistance={200}
          />

          {/* Işıklar */}
          <ambientLight intensity={0.25} />
          <directionalLight position={[10, 10, 10]} intensity={1} />

          {/* Yıldız arka planı ve test küresi */}
          <Suspense fallback={null}>
            <Stars radius={200} depth={50} count={5000} fade />
            <TestSphere />
          </Suspense>
        </Canvas>
      </main>
    </div>
  )
}

function TestSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#9ec9ff" />
    </mesh>
  )
}
