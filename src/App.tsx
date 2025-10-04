import { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import type { TimeControl } from './types'
import SpaceBackground from './components/SpaceBackground'
import SolarSystem from './components/SolarSystem'
import TimeControlPanel from './components/TimeControlPanel'
import Sidebar from './components/Sidebar'

export default function App() {
  const controlsRef = useRef<CameraControlsImpl>(null)
  
  // Zaman kontrolleri
  const [timeControl, setTimeControl] = useState<TimeControl>({
    speed: 1,
    isPaused: false,
    currentTime: 0
  })

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', position: 'relative' }}>
      <Sidebar controlsRef={controlsRef} />

      <main style={{ flex: 1, position: 'relative' }}>
        <Canvas
          camera={{ fov: 50, position: [0, 15, 30] }}
          gl={{ antialias: true }}
        >
          {/* Kamera kontrolleri */}
          <CameraControls
            ref={controlsRef}
            makeDefault
            smoothTime={0.5}
            dollyToCursor
            infinityDolly={false}
            minDistance={2}
            maxDistance={400}
          />

          {/* Işıklar - Güneş'ten gelen ışık */}
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 0, 0]} intensity={3} distance={150} decay={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          {/* Uzay arka planı ve güneş sistemi */}
          <Suspense fallback={null}>
            <SpaceBackground />
            <SolarSystem timeControl={timeControl} setTimeControl={setTimeControl} />
          </Suspense>
        </Canvas>

        {/* Sağ alt köşede zaman kontrol paneli */}
        <TimeControlPanel 
          timeControl={timeControl}
          setTimeControl={setTimeControl}
        />
      </main>
    </div>
  )
}
