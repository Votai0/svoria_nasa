/**
 * INTEGRATION EXAMPLE: Adding KOI Explorer to existing Solar System App
 * 
 * This file shows two integration approaches:
 * 1. Side-by-side panels (Solar System + KOI Explorer)
 * 2. Tabbed interface (Switch between views)
 */

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import type { TimeControl, Planet } from './types'
import type { ExoplanetTarget } from './types/exoplanet'

// Existing components
import SpaceBackground from './components/SpaceBackground'
import SolarSystem from './components/SolarSystem'
import SearchBar from './components/SearchBar'
import AnalysisPanel from './components/AnalysisPanel'
import SpeedControlPanel from './components/SpeedControlPanel'
import TimeSlider from './components/TimeSlider'
import CameraDistanceDisplay, { CameraDistanceTracker } from './components/CameraDistanceDisplay'

// NEW: KOI Integration
import KOIExplorer from './components/KOIExplorer'

// Utils
import { parseURLParams, findTargetById, updateURLParams } from './utils/urlParams'
import { flyToPlanet } from './utils/navigation'
import { calculateAllPlanetPositions } from './utils/astronomy'
import { planets } from './constants/planets'

// ============================================================================
// APPROACH 1: Side-by-Side Panels (Recommended for dual-view)
// ============================================================================

export function AppWithSideBySide() {
  const controlsRef = useRef<CameraControlsImpl | null>(null)
  const currentYear = 2025
  const currentDayOfYear = 277
  
  const [timeControl, setTimeControl] = useState<TimeControl>({
    speed: 0.5,
    isPaused: false,
    currentTime: currentDayOfYear,
    year: currentYear
  })
  
  const [selectedTarget, setSelectedTarget] = useState<ExoplanetTarget | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [cameraDistance, setCameraDistance] = useState(0)
  
  // NEW: Toggle KOI panel visibility
  const [showKOIPanel, setShowKOIPanel] = useState(false)
  
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
  
  const [referencePositions, setReferencePositions] = useState(() => 
    calculateAllPlanetPositions(timeControl.year, 0)
  )
  
  useEffect(() => {
    setReferencePositions(calculateAllPlanetPositions(timeControl.year, 0))
  }, [timeControl.year])
  
  useEffect(() => {
    const params = parseURLParams()
    if (params.target) {
      const target = findTargetById(params.target)
      if (target) {
        setSelectedTarget(target)
      }
    }
  }, [])
  
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
      background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
      display: 'flex'
    }}>
      {/* Left: Solar System (Main View) */}
      <div style={{ 
        flex: showKOIPanel ? 1 : '100%',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        <SearchBar 
          controlsRef={controlsRef}
          onTargetSelect={setSelectedTarget}
          timeControl={timeControl}
          isVisible={panelsVisible.search}
          onToggle={() => togglePanel('search')}
        />

        <Canvas
          camera={{ fov: 50, position: [0, 15, 30] }}
          gl={{ antialias: true }}
        >
          <CameraControls
            ref={controlsRef}
            makeDefault
            smoothTime={0.5}
            dollyToCursor
            infinityDolly={true}
            minDistance={2}
            maxDistance={Infinity}
          />

          <ambientLight intensity={0.3} />
          <pointLight position={[0, 0, 0]} intensity={3} distance={0} decay={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          <Suspense fallback={null}>
            <SpaceBackground />
            <SolarSystem 
              timeControl={timeControl} 
              setTimeControl={setTimeControl}
              onPlanetClick={setSelectedPlanet}
            />
            <CameraDistanceTracker 
              timeControl={timeControl} 
              onDistanceChange={setCameraDistance}
            />
          </Suspense>
        </Canvas>

        <SpeedControlPanel 
          timeControl={timeControl}
          setTimeControl={setTimeControl}
          isVisible={panelsVisible.speedControl}
          onToggle={() => togglePanel('speedControl')}
        />

        <TimeSlider 
          timeControl={timeControl}
          setTimeControl={setTimeControl}
          isVisible={panelsVisible.timeSlider}
          onToggle={() => togglePanel('timeSlider')}
        />
        
        {!showKOIPanel && (
          <AnalysisPanel 
            selectedTarget={selectedTarget} 
            selectedPlanet={selectedPlanet}
            isVisible={panelsVisible.analysis}
            onToggle={() => togglePanel('analysis')}
          />
        )}
        
        <CameraDistanceDisplay 
          distance={cameraDistance}
          isVisible={panelsVisible.distance}
          onToggle={() => togglePanel('distance')}
        />
        
        {/* NEW: Toggle button for KOI panel */}
        <button
          onClick={() => setShowKOIPanel(!showKOIPanel)}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: '12px 20px',
            background: showKOIPanel 
              ? 'rgba(147, 51, 234, 0.3)' 
              : 'rgba(99, 102, 241, 0.2)',
            border: showKOIPanel
              ? '2px solid rgba(147, 51, 234, 0.6)'
              : '2px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 12,
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            zIndex: 1000
          }}
        >
          🔭 {showKOIPanel ? 'Hide' : 'Show'} Kepler KOI Data
        </button>
      </div>
      
      {/* Right: KOI Explorer Panel (Slides in) */}
      {showKOIPanel && (
        <div style={{
          width: '800px',
          borderLeft: '2px solid rgba(147, 51, 234, 0.3)',
          animation: 'slideIn 0.3s ease-out',
          overflow: 'hidden'
        }}>
          <KOIExplorer />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// APPROACH 2: Tabbed Interface (Switch between views)
// ============================================================================

export function AppWithTabs() {
  const controlsRef = useRef<CameraControlsImpl | null>(null)
  const currentYear = 2025
  const currentDayOfYear = 277
  
  const [timeControl, setTimeControl] = useState<TimeControl>({
    speed: 0.5,
    isPaused: false,
    currentTime: currentDayOfYear,
    year: currentYear
  })
  
  const [selectedTarget, setSelectedTarget] = useState<ExoplanetTarget | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [cameraDistance, setCameraDistance] = useState(0)
  
  // NEW: Tab state
  const [activeTab, setActiveTab] = useState<'solar-system' | 'koi-explorer'>('solar-system')
  
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
  
  const [referencePositions, setReferencePositions] = useState(() => 
    calculateAllPlanetPositions(timeControl.year, 0)
  )
  
  useEffect(() => {
    setReferencePositions(calculateAllPlanetPositions(timeControl.year, 0))
  }, [timeControl.year])

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)'
    }}>
      {/* Tab Navigation */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: 12,
        padding: 8,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={() => setActiveTab('solar-system')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'solar-system' 
              ? 'rgba(99, 102, 241, 0.4)' 
              : 'transparent',
            border: activeTab === 'solar-system'
              ? '2px solid rgba(99, 102, 241, 0.6)'
              : '2px solid transparent',
            borderRadius: 12,
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🌍 Solar System
        </button>
        <button
          onClick={() => setActiveTab('koi-explorer')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'koi-explorer' 
              ? 'rgba(147, 51, 234, 0.4)' 
              : 'transparent',
            border: activeTab === 'koi-explorer'
              ? '2px solid rgba(147, 51, 234, 0.6)'
              : '2px solid transparent',
            borderRadius: 12,
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔭 Kepler KOI Explorer
        </button>
      </div>
      
      {/* Solar System View */}
      {activeTab === 'solar-system' && (
        <>
          <SearchBar 
            controlsRef={controlsRef}
            onTargetSelect={setSelectedTarget}
            timeControl={timeControl}
            isVisible={panelsVisible.search}
            onToggle={() => togglePanel('search')}
          />

          <Canvas
            camera={{ fov: 50, position: [0, 15, 30] }}
            gl={{ antialias: true }}
          >
            <CameraControls
              ref={controlsRef}
              makeDefault
              smoothTime={0.5}
              dollyToCursor
              infinityDolly={true}
              minDistance={2}
              maxDistance={Infinity}
            />

            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={3} distance={0} decay={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />

            <Suspense fallback={null}>
              <SpaceBackground />
              <SolarSystem 
                timeControl={timeControl} 
                setTimeControl={setTimeControl}
                onPlanetClick={setSelectedPlanet}
              />
              <CameraDistanceTracker 
                timeControl={timeControl} 
                onDistanceChange={setCameraDistance}
              />
            </Suspense>
          </Canvas>

          <SpeedControlPanel 
            timeControl={timeControl}
            setTimeControl={setTimeControl}
            isVisible={panelsVisible.speedControl}
            onToggle={() => togglePanel('speedControl')}
          />

          <TimeSlider 
            timeControl={timeControl}
            setTimeControl={setTimeControl}
            isVisible={panelsVisible.timeSlider}
            onToggle={() => togglePanel('timeSlider')}
          />
          
          <AnalysisPanel 
            selectedTarget={selectedTarget} 
            selectedPlanet={selectedPlanet}
            isVisible={panelsVisible.analysis}
            onToggle={() => togglePanel('analysis')}
          />
          
          <CameraDistanceDisplay 
            distance={cameraDistance}
            isVisible={panelsVisible.distance}
            onToggle={() => togglePanel('distance')}
          />
        </>
      )}
      
      {/* KOI Explorer View */}
      {activeTab === 'koi-explorer' && (
        <KOIExplorer />
      )}
    </div>
  )
}

// ============================================================================
// CSS Animation (add to your global styles or index.css)
// ============================================================================

/*
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
*/

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*
To use in your App.tsx:

1. For Side-by-Side approach:
   - Replace default export with AppWithSideBySide
   - export default AppWithSideBySide

2. For Tabbed approach:
   - Replace default export with AppWithTabs
   - export default AppWithTabs

3. Add the slideIn animation to your index.css or App.css

Both approaches keep your solar system intact and add KOI data as requested!
*/
