import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import type { TimeControl, Planet } from './types'
import type { ExoplanetTarget } from './types/exoplanet'
import SpaceBackground from './components/SpaceBackground'
import SolarSystem from './components/SolarSystem'
import SearchBar from './components/SearchBar'
import AnalysisPanel from './components/AnalysisPanel'
import SpeedControlPanel from './components/SpeedControlPanel'
import TimeSlider from './components/TimeSlider'
import CameraDistanceDisplay, { CameraDistanceTracker } from './components/CameraDistanceDisplay'
import { parseURLParams, findTargetById, updateURLParams } from './utils/urlParams'
import { flyToPlanet } from './utils/navigation'
import { calculateAllPlanetPositions } from './utils/astronomy'
import { planets } from './constants/planets'
import { useKOIPlanets, useKOIStatistics } from './hooks/useKOIData'

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
  
  // Seçili gezegen
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  
  // Kamera mesafesi (Dünya'dan ışık yılı cinsinden)
  const [cameraDistance, setCameraDistance] = useState(0)
  
  // KOI planetlerini otomatik yükle - TÜM verileri çek
  const { planets: koiPlanets, loading: koiLoading, error: koiError } = useKOIPlanets({
    limit: 100000, // API'den maksimum veri çek
    include_probabilities: true
  })
  const { stats: koiStats } = useKOIStatistics()
  
  // KOI verilerini ExoplanetTarget formatına çevir
  const [koiTargets, setKoiTargets] = useState<ExoplanetTarget[]>([])
  
  useEffect(() => {
    if (koiPlanets.length > 0) {
      const targets = koiPlanets.map(koi => ({
        id: `KOI-${koi.kepid}`,
        name: koi.kepler_name || koi.kepoi_name || `KOI-${koi.kepid}`,
        ra: koi.ra || 0,
        dec: koi.dec || 0,
        type: 'KOI' as const,
        confirmed: koi.koi_pdisposition === 'CONFIRMED'
      }))
      setKoiTargets(targets)
      console.log('✅ KOI Planetleri yüklendi:', targets.length, 'gezegen')
      console.log('📊 İstatistikler:', koiStats)
    }
    if (koiError) {
      console.error('❌ KOI verileri yüklenemedi:', koiError.message)
    }
  }, [koiPlanets, koiStats, koiError])
  
  // Panel görünürlük kontrolü
  const [panelsVisible, setPanelsVisible] = useState({
    search: true,
    speedControl: true,
    timeSlider: true,
    analysis: true,
    distance: true
  })
  
  const togglePanel = (panel: keyof typeof panelsVisible) => {
    setPanelsVisible(prev => ({ ...prev, [panel]: !prev[panel] }))
  }
  
  // Gezegen pozisyonlarını hesapla (yıl değiştiğinde güncellenir)
  const [referencePositions, setReferencePositions] = useState(() => 
    calculateAllPlanetPositions(timeControl.year, 0)
  )
  
  useEffect(() => {
    setReferencePositions(calculateAllPlanetPositions(timeControl.year, 0))
  }, [timeControl.year])
  
  // URL parametrelerinden hedef yükle (koiTargets yüklendikten sonra)
  useEffect(() => {
    if (koiTargets.length > 0) {
      const params = parseURLParams()
      if (params.target) {
        const target = findTargetById(params.target, koiTargets)
        if (target) {
          setSelectedTarget(target)
          setSector(params.sector)
        }
      }
    }
  }, [koiTargets])
  
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
  
  // Gezegen seçildiğinde kamerayı odakla
  useEffect(() => {
    if (selectedPlanet && controlsRef.current) {
      const planet = planets.find(p => p.name === selectedPlanet.name)
      if (planet) {
        const realPosition = referencePositions[planet.name]
        flyToPlanet(controlsRef, planet, timeControl.currentTime, realPosition)
      }
    }
  }, [selectedPlanet])

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
        timeControl={timeControl}
        isVisible={panelsVisible.search}
        onToggle={() => togglePanel('search')}
        koiTargets={koiTargets}
        koiLoading={koiLoading}
      />
      
      {/* KOI Data Status Indicator */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        padding: '10px 16px',
        background: koiLoading 
          ? 'rgba(234, 179, 8, 0.2)' 
          : koiError 
            ? 'rgba(239, 68, 68, 0.2)'
            : 'rgba(34, 197, 94, 0.2)',
        border: koiLoading
          ? '1px solid rgba(234, 179, 8, 0.5)'
          : koiError
            ? '1px solid rgba(239, 68, 68, 0.5)'
            : '1px solid rgba(34, 197, 94, 0.5)',
        borderRadius: 10,
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: 'white',
        fontWeight: 600
      }}>
        {koiLoading ? (
          <>
            <div style={{
              width: 12,
              height: 12,
              border: '2px solid rgba(234, 179, 8, 0.3)',
              borderTop: '2px solid rgba(234, 179, 8, 1)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            KOI Verileri Yükleniyor...
          </>
        ) : koiError ? (
          <>
            ❌ KOI API Hatası
          </>
        ) : (
          <>
            ✅ {koiPlanets.length} KOI Gezegen Yüklendi
          </>
        )}
      </div>

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
          infinityDolly={true}
          minDistance={2}
          maxDistance={Infinity}
        />

        {/* Işıklar - Güneş'ten gelen ışık */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={3} distance={0} decay={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        {/* Uzay arka planı ve güneş sistemi */}
        <Suspense fallback={null}>
          <SpaceBackground />
          <SolarSystem 
            timeControl={timeControl} 
            setTimeControl={setTimeControl}
            onPlanetClick={setSelectedPlanet}
            koiPlanets={koiPlanets}
            selectedKepid={selectedTarget?.id.startsWith('KOI-') 
              ? parseInt(selectedTarget.id.replace('KOI-', '')) 
              : undefined
            }
          />
          <CameraDistanceTracker 
            timeControl={timeControl} 
            onDistanceChange={setCameraDistance}
          />
        </Suspense>
      </Canvas>

      {/* Sol alt: Hız Kontrol Paneli (her zaman görünür) */}
      <SpeedControlPanel 
        timeControl={timeControl}
        setTimeControl={setTimeControl}
        isVisible={panelsVisible.speedControl}
        onToggle={() => togglePanel('speedControl')}
      />

      {/* Sol alt sağ: Zaman Çizelgesi Slider (365 gün) */}
      <TimeSlider 
        timeControl={timeControl}
        setTimeControl={setTimeControl}
        isVisible={panelsVisible.timeSlider}
        onToggle={() => togglePanel('timeSlider')}
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
      
      {/* Sağ: Analiz paneli (hem exoplanet hem gezegen bilgileri) */}
      <AnalysisPanel 
        selectedTarget={selectedTarget} 
        selectedPlanet={selectedPlanet}
        isVisible={panelsVisible.analysis}
        onToggle={() => togglePanel('analysis')}
      />
      
      {/* Alt orta: Kamera mesafesi göstergesi */}
      <CameraDistanceDisplay 
        distance={cameraDistance}
        isVisible={panelsVisible.distance}
        onToggle={() => togglePanel('distance')}
      />
    </div> 
  )
}
