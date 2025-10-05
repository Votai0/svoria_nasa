import { useState, useEffect, useMemo } from 'react'
import CameraControlsImpl from 'camera-controls'
import { planets } from '../constants/planets'
import { flyToPlanet } from '../utils/navigation'
import { calculateAllPlanetPositions } from '../utils/astronomy'
import type { ExoplanetTarget } from '../types/exoplanet'
import type { TimeControl, Planet } from '../types'

export default function SearchBar({ 
  controlsRef,
  onTargetSelect,
  onPlanetSelect,
  timeControl,
  isVisible,
  onToggle,
  koiTargets = [],
  koiLoading = false
}: {
  controlsRef: React.RefObject<CameraControlsImpl | null>
  onTargetSelect?: (target: ExoplanetTarget | null) => void
  onPlanetSelect?: (planet: Planet) => void
  timeControl: TimeControl
  isVisible: boolean
  onToggle: () => void
  koiTargets?: ExoplanetTarget[]
  koiLoading?: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [exoplanetResults, setExoplanetResults] = useState<ExoplanetTarget[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(50) // Initial KOI count to display
  
  // Calculate planet reference positions
  const referencePositions = useMemo(() => {
    return calculateAllPlanetPositions(timeControl.year, 0)
  }, [timeControl.year])

  // Filter planet search results
  const filteredPlanets = planets.filter(planet =>
    planet.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Exoplanet filtering - Client-side (FAST!)
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        // Filter existing koiTargets - NO API call!
        const lowerQuery = searchQuery.toLowerCase()
        const filtered = koiTargets.filter(target => {
          return target.name.toLowerCase().includes(lowerQuery) ||
                 target.id.toLowerCase().includes(lowerQuery)
        })
        setExoplanetResults(filtered.slice(0, 100)) // First 100 results
        setIsSearching(false)
      }, 150) // Reduced debounce
      
      return () => clearTimeout(timer)
    } else if (searchQuery.length === 0 && koiTargets.length > 0 && isSearchExpanded) {
      // Show loaded KOIs when search is empty and panel is open
      setExoplanetResults(koiTargets.slice(0, displayLimit))
    } else if (!isSearchExpanded) {
      setExoplanetResults([])
    }
  }, [searchQuery, koiTargets, displayLimit, isSearchExpanded])

  const handlePlanetClick = (planetName: string) => {
    const planet = planets.find(p => p.name === planetName)
    if (!planet) return
    
    const realPosition = referencePositions[planet.name]
    flyToPlanet(controlsRef, planet, timeControl.currentTime, realPosition)
    
    // Clear exoplanet state when planet is selected and show planet info
    onTargetSelect?.(null)
    onPlanetSelect?.(planet)
    
    setSearchQuery('')
    setIsSearchExpanded(false)
  }

  const handleExoplanetSelect = (target: ExoplanetTarget) => {
    onTargetSelect?.(target)
    setSearchQuery('')
    setIsSearchExpanded(false)
  }

  return (
    <>
      {/* Toggle Button - Outside panel on right middle when open */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '4%',
          transform: 'translateY(-50%)',
          left: isVisible ? 'calc(16px + min(380px, calc(100vw - 580px)))' : 16,
          zIndex: 1001,
          background: 'rgba(10, 10, 15, 0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          width: 36,
          height: 36,
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        title={isVisible ? 'Hide search' : 'Show search'}
      >
        {isVisible ? '‹' : '🔍'}
      </button>
      
      {/* Floating Search Bar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: isVisible ? 16 : -400,
        zIndex: 1000,
        width: 'min(380px, calc(100vw - 580px))',
        minWidth: 300,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}>
        <div style={{ position: 'relative' }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder='🔍 Search planet or exoplanet (TIC, EPIC, KOI)...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchExpanded(true)}
            style={{
              width: '100%',
              padding: '12px 40px 12px 16px',
              background: 'rgba(10, 10, 15, 0.88)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 12,
              color: 'white',
              fontSize: 13,
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              fontWeight: 400
            }}
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            >
              ×
            </button>
          )}
        </div>

        {/* Expanded Results Panel */}
        {(isSearchExpanded || searchQuery || exoplanetResults.length > 0) && (
          <div style={{
            marginTop: 12,
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 20,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            maxHeight: '70vh',
            overflowY: 'auto',
            animation: 'slideDown 0.3s ease-out'
          }}>
            {(isSearching || koiLoading) ? (
              <div style={{ 
                padding: 30, 
                textAlign: 'center', 
                color: '#888' 
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  border: '3px solid rgba(147, 51, 234, 0.3)',
                  borderTop: '3px solid rgb(147, 51, 234)',
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  animation: 'spin 1s linear infinite'
                }} />
                {koiLoading ? 'Loading KOI Data...' : 'Searching...'}
              </div>
            ) : (
              <>
                {/* SOLAR SYSTEM PLANETS */}
                {filteredPlanets.length > 0 && (
                  <div style={{ marginBottom: exoplanetResults.length > 0 ? 20 : 0 }}>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#888', 
                      marginBottom: 12,
                      fontWeight: 600
                    }}>
                      🪐 SOLAR SYSTEM
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {filteredPlanets.map((planet) => (
                        <button
                          key={planet.name}
                          onClick={() => handlePlanetClick(planet.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: 12,
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'
                            e.currentTarget.style.transform = 'translateX(4px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'
                            e.currentTarget.style.transform = 'translateX(0)'
                          }}
                        >
                          <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: planet.color,
                            boxShadow: `0 0 10px ${planet.color}`
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{planet.name}</div>
                            {planet.moons && planet.moons.length > 0 && (
                              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                                {planet.moons.length} moon{planet.moons.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          <div style={{ opacity: 0.5, fontSize: 18 }}>→</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* EXOPLANET TARGETS */}
                {exoplanetResults.length > 0 && (
                  <div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12
                    }}>
                      <div style={{ 
                        fontSize: 12, 
                        color: '#888', 
                        fontWeight: 600
                      }}>
                        🔭 KEPLER KOI EXOPLANETS
                      </div>
                      <div style={{ 
                        fontSize: 11, 
                        color: '#666',
                        fontWeight: 600
                      }}>
                        {searchQuery ? exoplanetResults.length + ' result' + (exoplanetResults.length !== 1 ? 's' : '') : `${exoplanetResults.length} / ${koiTargets.length}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {exoplanetResults.map((target) => (
                        <button
                          key={target.id}
                          onClick={() => handleExoplanetSelect(target)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            padding: '14px 16px',
                            background: 'rgba(147, 51, 234, 0.1)',
                            border: '1px solid rgba(147, 51, 234, 0.3)',
                            borderRadius: 12,
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)'
                            e.currentTarget.style.transform = 'translateX(4px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)'
                            e.currentTarget.style.transform = 'translateX(0)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              padding: '4px 8px',
                              background: 'rgba(147, 51, 234, 0.3)',
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 700
                            }}>
                              {target.type}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{target.name}</div>
                              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2, fontFamily: 'monospace' }}>
                                {target.id}
                              </div>
                            </div>
                            {target.confirmed && (
                              <div style={{
                                padding: '3px 8px',
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid rgba(34, 197, 94, 0.4)',
                                borderRadius: 6,
                                fontSize: 9,
                                fontWeight: 700,
                                color: 'rgb(134, 239, 172)'
                              }}>
                                ✓ CONFIRMED
                              </div>
                            )}
                          </div>
                          <div style={{ 
                            fontSize: 11, 
                            opacity: 0.5,
                            fontFamily: 'monospace'
                          }}>
                            RA: {target.ra.toFixed(3)}° / Dec: {target.dec.toFixed(3)}°
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Load More Button */}
                    {!searchQuery && koiTargets.length > displayLimit && exoplanetResults.length < koiTargets.length && (
                      <button
                        onClick={() => setDisplayLimit(prev => prev + 50)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          marginTop: 12,
                          background: 'rgba(147, 51, 234, 0.15)',
                          border: '1px solid rgba(147, 51, 234, 0.4)',
                          borderRadius: 10,
                          color: 'rgb(196, 181, 253)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.25)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.15)'
                        }}
                      >
                        ⬇️ Load More ({koiTargets.length - displayLimit} remaining)
                      </button>
                    )}
                  </div>
                )}

                {/* NO RESULTS FOUND */}
                {filteredPlanets.length === 0 && exoplanetResults.length === 0 && searchQuery && (
                  <div style={{ 
                    padding: 20, 
                    textAlign: 'center', 
                    color: '#888',
                    fontSize: 13
                  }}>
                    No results found
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Close overlay when clicking outside */}
      {(isSearchExpanded || searchQuery || exoplanetResults.length > 0) && (
        <div
          onClick={() => {
            setIsSearchExpanded(false)
            setSearchQuery('')
            setDisplayLimit(50)
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

