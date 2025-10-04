import { useState } from 'react'
import CameraControlsImpl from 'camera-controls'
import { planets } from '../constants/planets'
import { flyToPlanet } from '../utils/navigation'

export default function SearchBar({ controlsRef }: {
  controlsRef: React.RefObject<CameraControlsImpl | null>
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // Arama sonuçlarını filtrele
  const filteredPlanets = planets.filter(planet =>
    planet.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlanetClick = (distance: number) => {
    if (distance === 0) {
      flyToPlanet(controlsRef, 5) // Güneş için
    } else {
      flyToPlanet(controlsRef, distance)
    }
    setSearchQuery('')
    setIsSearchExpanded(false)
  }

  return (
    <>
      {/* Floating Search Bar */}
      <div style={{
        position: 'absolute',
        top: 30,
        left: 30,
        zIndex: 1000,
        width: 320
      }}>
        <div style={{ position: 'relative' }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="🔍 Gezegen ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchExpanded(true)}
            style={{
              width: '100%',
              padding: '14px 44px 14px 20px',
              background: 'rgba(10, 10, 15, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 50,
              color: 'white',
              fontSize: 15,
              outline: 'none',
              transition: 'all 0.3s',
              boxSizing: 'border-box',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
            {searchQuery && filteredPlanets.length > 0 ? (
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
            ) : searchQuery ? (
              <div style={{ 
                padding: 20, 
                textAlign: 'center', 
                color: '#888',
                fontSize: 13
              }}>
                Sonuç bulunamadı
              </div>
            ) : (
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
      `}</style>
    </>
  )
}

