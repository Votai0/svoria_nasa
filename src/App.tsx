import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import type { TimeControl, Planet } from './types'
import type { ExoplanetTarget, KOIPlanet } from './types/exoplanet'
import SpaceBackground from './components/SpaceBackground'
import SolarSystem from './components/SolarSystem'
import SearchBar from './components/SearchBar'
import AnalysisPanel from './components/AnalysisPanel'
import SpeedControlPanel from './components/SpeedControlPanel'
import TimeSlider from './components/TimeSlider'
import CameraDistanceDisplay, { CameraDistanceTracker } from './components/CameraDistanceDisplay'
import { parseURLParams, findTargetById, updateURLParams } from './utils/urlParams'
import { flyToPlanet, lookAtDirection, raDecToDir } from './utils/navigation'
import { calculateAllPlanetPositions } from './utils/astronomy'
import { planets } from './constants/planets'
import { useKOIPlanets, useKOIStatistics } from './hooks/useKOIData'
import ExoplanetMarker from './components/ExoplanetMarker'

export default function App() {
  const controlsRef = useRef<CameraControlsImpl | null>(null)
  
  // Intro logo animation state
  const [showIntroLogo, setShowIntroLogo] = useState(true)
  
  useEffect(() => {
    // Hide intro logo after 2.5 seconds
    const timer = setTimeout(() => {
      setShowIntroLogo(false)
    }, 2500)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Time controls - Start from current day (October 4, 2025)
  const currentYear = 2025
  const currentDayOfYear = 277 // October 4
  
  const [timeControl, setTimeControl] = useState<TimeControl>({
    speed: 0.5, // Initial speed 0.5x - for more detailed observation
    isPaused: false,
    currentTime: currentDayOfYear,
    year: currentYear
  })
  
  // Selected exoplanet target
  const [selectedTarget, setSelectedTarget] = useState<ExoplanetTarget | null>(null)
  const [selectedKOI, setSelectedKOI] = useState<KOIPlanet | null>(null)
  const [sector, setSector] = useState<number | undefined>(undefined)
  
  // Selected planet
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  
  // Camera distance (from Earth in light years)
  const [cameraDistance, setCameraDistance] = useState(0)
  
  // Auto-load KOI planets - Progressive loading (in batches of 1000)
  const { 
    planets: koiPlanets, 
    loading: koiLoading, 
    isLoadingMore: koiLoadingMore,
    error: koiError, 
    totalCount 
  } = useKOIPlanets({
    include_probabilities: true
  })
  const { stats: koiStats } = useKOIStatistics()
  
  // Convert KOI data to ExoplanetTarget format
  const [koiTargets, setKoiTargets] = useState<ExoplanetTarget[]>([])
  
  useEffect(() => {
    if (koiPlanets.length > 0) {
      // Remove duplicates based on kepid (unique identifier)
      const uniqueKOIs = new Map<number, typeof koiPlanets[0]>()
      koiPlanets.forEach(koi => {
        if (!uniqueKOIs.has(koi.kepid)) {
          uniqueKOIs.set(koi.kepid, koi)
        }
      })
      
      const targets = Array.from(uniqueKOIs.values()).map(koi => ({
        id: `KOI-${koi.kepid}`,
        name: koi.kepler_name || koi.kepoi_name || `KOI-${koi.kepid}`,
        ra: koi.ra || 0,
        dec: koi.dec || 0,
        type: 'KOI' as const,
        confirmed: koi.koi_pdisposition === 'CONFIRMED'
      }))
      
      setKoiTargets(targets)
      console.log('✅ KOI Planets loaded:', targets.length, 'unique planets')
      console.log('📊 Statistics:', koiStats)
    }
    if (koiError) {
      console.error('❌ KOI data could not be loaded:', koiError.message)
    }
  }, [koiPlanets, koiStats, koiError])
  
  // KOI status popup visibility control
  const [koiStatusDismissed, setKoiStatusDismissed] = useState(false)
  
  // Panel visibility control
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
  
  // Calculate planet positions ONCE at start (October 4, 2025)
  // These reference positions stay fixed, currentTime provides continuous movement
  const [referencePositions] = useState(() => 
    calculateAllPlanetPositions(2025, 277) // October 4, 2025
  )
  
  // Load target from URL parameters (after koiTargets are loaded)
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
  
  // Find full KOI data when target is selected
  useEffect(() => {
    if (selectedTarget && koiPlanets.length > 0) {
      const kepid = parseInt(selectedTarget.id.replace('KOI-', ''))
      const fullKOI = koiPlanets.find(koi => koi.kepid === kepid)
      setSelectedKOI(fullKOI || null)
      console.log('🎯 Selected KOI:', fullKOI)
    } else {
      setSelectedKOI(null)
    }
  }, [selectedTarget, koiPlanets])
  
  // Update URL when target changes
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
  
  // Focus camera when planet is selected
  useEffect(() => {
    if (selectedPlanet && controlsRef.current) {
      const planet = planets.find(p => p.name === selectedPlanet.name)
      if (planet) {
        const realPosition = referencePositions[planet.name]
        flyToPlanet(controlsRef, planet, timeControl.currentTime, realPosition)
      }
    }
  }, [selectedPlanet])

  // Turn camera to that direction when exoplanet is selected (only when target changes)
  const [lastFlyTarget, setLastFlyTarget] = useState<string | null>(null)
  
  useEffect(() => {
    if (selectedTarget && controlsRef.current && lastFlyTarget !== selectedTarget.id) {
      const direction = raDecToDir(selectedTarget.ra / 15, selectedTarget.dec) // RA: degrees -> hours
      lookAtDirection(controlsRef, direction, 1500) // Only change viewing angle
      setLastFlyTarget(selectedTarget.id)
    }
    // Reset when target is removed
    if (!selectedTarget && lastFlyTarget !== null) {
      setLastFlyTarget(null)
    }
  }, [selectedTarget, lastFlyTarget])

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)'
    }}>
      {/* Intro Logo Animation */}
      {showIntroLogo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
          animation: 'logoFadeOut 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        }}>
          <img 
            src="/logo/Logo white.svg" 
            alt="Svoria" 
            style={{ 
              height: 120,
              width: 'auto',
              filter: 'drop-shadow(0 0 40px rgba(147, 51, 234, 0.6))',
              animation: 'logoSlideUp 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }} 
          />
        </div>
      )}
      
      {/* Modern Search Bar */}
      <SearchBar 
        controlsRef={controlsRef}
        onTargetSelect={(target) => {
          setSelectedTarget(target)
          // Clear planet selection when exoplanet is selected
          if (target) {
            setSelectedPlanet(null)
          }
        }}
        onPlanetSelect={(planet) => {
          // Show planet info when planet is selected from SearchBar and clear exoplanet selection
          setSelectedPlanet(planet)
          setSelectedKOI(null)
        }}
        timeControl={timeControl}
        isVisible={panelsVisible.search}
        onToggle={() => togglePanel('search')}
        koiTargets={koiTargets}
        koiLoading={koiLoading}
      />
      
      {/* KOI Data Status Indicator - Progressive Loading */}
      {!koiStatusDismissed && (
        <div 
          onClick={() => setKoiStatusDismissed(true)}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: '10px 16px',
            background: (koiLoading || koiLoadingMore)
              ? 'rgba(234, 179, 8, 0.2)' 
              : koiError 
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(34, 197, 94, 0.2)',
            border: (koiLoading || koiLoadingMore)
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
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s, opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.opacity = '1'
          }}
            title="Close KOI Data Status"
        >
        {koiLoading ? (
          <>
            <div style={{
              width: 12,
              border: '2px solid rgba(234, 179, 8, 0.3)',
              borderTop: '2px solid rgba(234, 179, 8, 1)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading Initial Batch...
          </>
        ) : koiError ? (
          <>
            ❌ KOI API Error
          </>
        ) : koiLoadingMore ? (
          <>
            <div style={{
              width: 12,
              height: 12,
              border: '2px solid rgba(234, 179, 8, 0.3)',
              borderTop: '2px solid rgba(234, 179, 8, 1)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            ✅ {koiPlanets.length.toLocaleString()} / Loading in background...
          </>
        ) : (
          <>
            ✅ {koiPlanets.length.toLocaleString()} KOI Planets
            {totalCount && totalCount > koiPlanets.length && (
              <span style={{ fontSize: 10, opacity: 0.7 }}>
                {' '}(+{(totalCount - koiPlanets.length).toLocaleString()} more)
              </span>
            )}
          </>
        )}
        </div>
      )}

      {/* Canvas - Main 3D Scene */}
      <Canvas
        camera={{ fov: 50, position: [0, 15, 30] }}
        gl={{ antialias: true }}
      >
        {/* Camera controls */}
        <CameraControls
          ref={controlsRef}
          makeDefault
          smoothTime={0.5}
          dollyToCursor
          infinityDolly={true}
          minDistance={2}
          maxDistance={Infinity}
        />

        {/* Lights - Light from the Sun */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={3} distance={0} decay={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        {/* Space background and solar system */}
        <Suspense fallback={null}>
          <SpaceBackground />
          <SolarSystem 
            timeControl={timeControl} 
            setTimeControl={setTimeControl}
            onPlanetClick={(planet) => {
              setSelectedPlanet(planet)
              // Clear exoplanet selection when planet is selected
              setSelectedTarget(null)
              setSelectedKOI(null)
            }}
          />
          <CameraDistanceTracker 
            timeControl={timeControl} 
            onDistanceChange={setCameraDistance}
          />
          
          {/* Show selected exoplanet marker */}
          {selectedTarget && (
            <ExoplanetMarker 
              target={selectedTarget} 
              distance={1500}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Bottom left: Speed Control Panel (always visible) */}
      <SpeedControlPanel 
        timeControl={timeControl}
        setTimeControl={setTimeControl}
        isVisible={panelsVisible.speedControl}
        onToggle={() => togglePanel('speedControl')}
      />

      {/* Bottom left right: Time Timeline Slider (365 days) */}
      <TimeSlider 
        timeControl={timeControl}
        setTimeControl={setTimeControl}
        isVisible={panelsVisible.timeSlider}
        onToggle={() => togglePanel('timeSlider')}
      />
      
      {/* Top left center: Time control panel (only for solar system) */}
      {/* {!selectedTarget && (
        <div style={{ position: 'absolute', top: 90, left: 16, zIndex: 100 }}>
          <TimeControlPanel 
            timeControl={timeControl}
            setTimeControl={setTimeControl}
          />
        </div>
      )} */}
      
      {/* Right: Analysis panel (both exoplanet and planet information) */}
      <AnalysisPanel 
        selectedTarget={selectedTarget}
        selectedKOI={selectedKOI}
        selectedPlanet={selectedPlanet}
        isVisible={panelsVisible.analysis}
        onToggle={() => togglePanel('analysis')}
      />
      
      {/* Bottom center: Camera distance display */}
      <CameraDistanceDisplay 
        distance={cameraDistance}
        isVisible={panelsVisible.distance}
        onToggle={() => togglePanel('distance')}
      />
      
      {/* Helper Button - Bottom Right */}
      <a
        href="/helper.html"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4c8bff, #2f6cf0)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(47, 108, 240, 0.3)',
          backdropFilter: 'blur(10px)',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(47, 108, 240, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(47, 108, 240, 0.3)'
        }}
        title="Beginners Guide - Learn about exoplanets"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </a>
      
      {/* Data Verification - DEV MODE ONLY */}
      {/* {import.meta.env.DEV && <DataVerification />} */}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes logoSlideUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          20% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          80% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.8);
          }
        }
        
        @keyframes logoFadeOut {
          0% {
            opacity: 1;
            backdrop-filter: blur(0px);
          }
          80% {
            opacity: 1;
            backdrop-filter: blur(0px);
          }
          100% {
            opacity: 0;
            backdrop-filter: blur(10px);
            pointer-events: none;
          }
        }
      `}</style>
    </div> 
  )
}
