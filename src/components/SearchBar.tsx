import { useState, useEffect } from 'react'
import CameraControlsImpl from 'camera-controls'
import { planets } from '../constants/planets'
import { flyToPlanet } from '../utils/navigation'
import { searchExoplanetTargets, DEMO_TARGETS } from '../services/exoplanetAPI'
import type { ExoplanetTarget } from '../types/exoplanet'

export default function SearchBar({ 
  controlsRef,
  onTargetSelect
}: {
  controlsRef: React.RefObject<CameraControlsImpl | null>
  onTargetSelect?: (target: ExoplanetTarget) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchMode, setSearchMode] = useState<'planets' | 'exoplanets'>('planets')
  const [exoplanetResults, setExoplanetResults] = useState<ExoplanetTarget[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Gezegen arama sonuçlarını filtrele
  const filteredPlanets = planets.filter(planet =>
    planet.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Exoplanet arama - debounced
  useEffect(() => {
    if (searchMode === 'exoplanets' && searchQuery.length >= 2) {
      setIsSearching(true)
      const timer = setTimeout(async () => {
        try {
          const results = await searchExoplanetTargets(searchQuery)
          setExoplanetResults(results)
        } catch (error) {
          console.error('Arama hatası:', error)
          setExoplanetResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
      
      return () => clearTimeout(timer)
    } else if (searchMode === 'exoplanets' && searchQuery.length === 0) {
      setExoplanetResults(DEMO_TARGETS)
    }
  }, [searchQuery, searchMode])

  const handlePlanetClick = (distance: number) => {
    if (distance === 0) {
      flyToPlanet(controlsRef, 5) // Güneş için
    } else {
      flyToPlanet(controlsRef, distance)
    }
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
      {/* Floating Search Bar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        width: 'min(380px, calc(100vw - 580px))',
        minWidth: 300
      }}>
        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 10
        }}>
          <button
            onClick={() => {
              setSearchMode('planets')
              setSearchQuery('')
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: searchMode === 'planets' 
                ? 'rgba(99, 102, 241, 0.85)' 
                : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              backdropFilter: 'blur(20px)',
              boxShadow: searchMode === 'planets' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            🪐 Solar
          </button>
          <button
            onClick={() => {
              setSearchMode('exoplanets')
              setSearchQuery('')
              if (!searchQuery) setExoplanetResults(DEMO_TARGETS)
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: searchMode === 'exoplanets' 
                ? 'rgba(147, 51, 234, 0.85)' 
                : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              backdropFilter: 'blur(20px)',
              boxShadow: searchMode === 'exoplanets' ? '0 2px 8px rgba(147, 51, 234, 0.3)' : 'none'
            }}
          >
            🔭 Exo
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder={searchMode === 'planets' 
              ? '🔍 Gezegen ara...' 
              : '🔍 TIC / EPIC / KOI ara...'}
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
        {(isSearchExpanded || searchQuery) && (
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
            {/* PLANETS MODE */}
            {searchMode === 'planets' && searchQuery && filteredPlanets.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredPlanets.map((planet) => (
                  <button
                    key={planet.name}
                    onClick={() => handlePlanetClick(planet.distance)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
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
                          {planet.moons.length} uydu
                        </div>
                      )}
                    </div>
                    <div style={{ opacity: 0.5, fontSize: 18 }}>→</div>
                  </button>
                ))}
              </div>
            ) : searchMode === 'planets' && searchQuery ? (
              <div style={{ 
                padding: 20, 
                textAlign: 'center', 
                color: '#888',
                fontSize: 13
              }}>
                Sonuç bulunamadı
              </div>
            ) : searchMode === 'planets' ? (
              <div>
                <div style={{ 
                  fontSize: 12, 
                  color: '#888', 
                  marginBottom: 12,
                  fontWeight: 600
                }}>
                  TÜM GEZEGENLER
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {planets.map((planet) => (
                    <button
                      key={planet.name}
                      onClick={() => handlePlanetClick(planet.distance)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
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
                            {planet.moons.length} uydu
                          </div>
                        )}
                      </div>
                      <div style={{ opacity: 0.5, fontSize: 18 }}>→</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* EXOPLANETS MODE */}
            {searchMode === 'exoplanets' && (
              <div>
                {isSearching ? (
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
                    Aranıyor...
                  </div>
                ) : exoplanetResults.length > 0 ? (
                  <>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#888', 
                      marginBottom: 12,
                      fontWeight: 600
                    }}>
                      {searchQuery ? 'ARAMA SONUÇLARI' : 'DEMO HEDEFLER'}
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
                                ✓ DOĞRULANDI
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
                  </>
                ) : (
                  <div style={{ 
                    padding: 20, 
                    textAlign: 'center', 
                    color: '#888',
                    fontSize: 13
                  }}>
                    Hedef bulunamadı
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close overlay when clicking outside */}
      {(isSearchExpanded || searchQuery) && (
        <div
          onClick={() => {
            setIsSearchExpanded(false)
            setSearchQuery('')
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

