import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import type { TimeControl } from './types'
import type { ExoplanetTarget } from './types/exoplanet'
import SpaceBackground from './components/SpaceBackground'
import SolarSystem from './components/SolarSystem'
import SearchBar from './components/SearchBar'
import AnalysisPanel from './components/AnalysisPanel'
import SharePanel from './components/SharePanel'
import DemoTargetsBar from './components/DemoTargetsBar'
import SpeedControlPanel from './components/SpeedControlPanel'
import TimeSlider from './components/TimeSlider'
import { parseURLParams, findTargetById, updateURLParams } from './utils/urlParams'

export default function App() {
  const controlsRef = useRef<CameraControlsImpl | null>(null)
  
  // Zaman kontrolleri - Günümüzden başlat (4 Ekim 2025)
  const currentYear = 2025
  const currentDayOfYear = 277 // 4 Ekim
  
  const [timeControl, setTimeControl] = useState<TimeControl>({
    speed: 0.5, // Başlangıç hızı 0.5x - daha detaylı gözlem için
    isPaused: false,
    currentTime: currentDayOfYear,
    year: currentYear
  })
  
  // Seçili exoplanet hedefi
  const [selectedTarget, setSelectedTarget] = useState<ExoplanetTarget | null>(null)
  const [sector, setSector] = useState<number | undefined>(undefined)
  
  // URL parametrelerinden hedef yükle
  useEffect(() => {
    const params = parseURLParams()
    if (params.target) {
      const target = findTargetById(params.target)
      if (target) {
        setSelectedTarget(target)
        setSector(params.sector)
      }
    }
  }, [])
  
  // Hedef değiştiğinde URL'yi güncelle
  useEffect(() => {
    if (selectedTarget) {
      updateURLParams({
        target: selectedTarget.id,
        sector,
        model: 'v0.1'
      })
    } else {
      updateURLParams({})
    }
  }, [selectedTarget, sector])

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)'
    }}>
      {/* Modern Search Bar */}
      <SearchBar 
        controlsRef={controlsRef}
        onTargetSelect={setSelectedTarget}
      />

      {/* Canvas - Ana 3D Sahne */}
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

      {/* Sol alt: Hız Kontrol Paneli (her zaman görünür) */}
      <SpeedControlPanel 
        timeControl={timeControl}
        setTimeControl={setTimeControl}
      />

      {/* Sol alt sağ: Zaman Çizelgesi Slider (365 gün) */}
      <TimeSlider 
        timeControl={timeControl}
        setTimeControl={setTimeControl}
      />
      
      {/* Sol üst orta: Zaman kontrol paneli (sadece solar system için) */}
      {/* {!selectedTarget && (
        <div style={{ position: 'absolute', top: 90, left: 16, zIndex: 100 }}>
          <TimeControlPanel 
            timeControl={timeControl}
            setTimeControl={setTimeControl}
          />
        </div>
      )} */}
      
      {/* Sağ: Exoplanet analiz paneli */}
      <AnalysisPanel selectedTarget={selectedTarget} />
      
      {/* Sağ alt: Paylaşım paneli (exoplanet modunda) */}
      {selectedTarget && (
        <SharePanel 
          target={selectedTarget}
          sector={sector}
          modelVersion="v0.1"
        />
      )}
      
      {/* Demo hedefler (exoplanet modunda değilken) */}
      {!selectedTarget && (
        <DemoTargetsBar onSelectTarget={setSelectedTarget} />
      )}
    </div>
  )
}
