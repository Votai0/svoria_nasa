import type { Planet } from '../types'

type Props = {
  planet: Planet | null
  onClose: () => void
  realDistanceAU?: number
}

export default function PlanetInfoPanel({ planet, onClose, realDistanceAU }: Props) {
  if (!planet) return null

  // Orbital period hesapla (yıl cinsinden)
  const orbitalPeriodYears = planet.orbitSpeed > 0 ? 0.01 / planet.orbitSpeed : 0
  const orbitalPeriodDays = orbitalPeriodYears * 365.25

  return (
    <div style={{
      position: 'absolute',
      left: 16,
      top: 90,
      width: 320,
      background: '#1a1a1a',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
      zIndex: 100
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: '#202020'
      }}>
        <div style={{
          width: '100%'
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 0.8,
            color: 'rgba(147, 151, 234, 0.9)',
            marginBottom: 8,
            textTransform: 'uppercase'
          }}>
            Planet Information
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#ffffff',
            marginBottom: 4
          }}>
            {planet.name}
          </div>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 18,
              cursor: 'pointer',
              width: 32,
              height: 32,
              padding: 0,
              lineHeight: 1,
              transition: 'all 0.2s'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px 24px',
        maxHeight: 400,
        overflowY: 'auto'
      }}>
        {/* Distance */}
        {realDistanceAU && planet.distance > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 6,
              letterSpacing: 0.5
            }}>
              Distance from Sun
            </div>
            <div style={{
              fontSize: 15,
              color: '#ffffff',
              fontFamily: 'monospace'
            }}>
              {realDistanceAU.toFixed(3)} AU
              <span style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.5)',
                marginLeft: 8
              }}>
                (~{(realDistanceAU * 149.6).toFixed(1)} million km)
              </span>
            </div>
          </div>
        )}

        {/* Orbital Period */}
        {planet.distance > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 6,
              letterSpacing: 0.5
            }}>
              Orbital Period
            </div>
            <div style={{
              fontSize: 15,
              color: '#ffffff',
              fontFamily: 'monospace'
            }}>
              {orbitalPeriodYears >= 1 
                ? `${orbitalPeriodYears.toFixed(2)} Earth years`
                : `${orbitalPeriodDays.toFixed(0)} Earth days`
              }
            </div>
          </div>
        )}

        {/* Rotation Period */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 6,
            letterSpacing: 0.5
          }}>
            Rotation Period (Day Length)
          </div>
          <div style={{
            fontSize: 15,
            color: '#ffffff',
            fontFamily: 'monospace'
          }}>
            {Math.abs(planet.rotationPeriod).toFixed(2)} Earth days
            {planet.rotationPeriod < 0 && (
              <span style={{
                fontSize: 11,
                color: 'rgba(255, 100, 100, 0.9)',
                marginLeft: 8
              }}>
                (retrograde)
              </span>
            )}
          </div>
        </div>

        {/* Moons */}
        {planet.moons && planet.moons.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 8,
              letterSpacing: 0.5
            }}>
              Moons ({planet.moons.length})
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 8,
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {planet.moons.map((moon, idx) => (
                <div 
                  key={moon.name}
                  style={{
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '6px 0',
                    borderTop: idx > 0 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none'
                  }}
                >
                  • {moon.name}
                  <span style={{
                    fontSize: 11,
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginLeft: 8
                  }}>
                    (orbit: {(moon.orbitSpeed > 0 ? (0.01 / moon.orbitSpeed * 365.25) : 0).toFixed(1)} days)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Features */}
        {planet.hasRings && (
          <div style={{
            background: 'rgba(147, 151, 234, 0.1)',
            borderRadius: 8,
            padding: '12px 16px',
            border: '1px solid rgba(147, 151, 234, 0.2)',
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.5
          }}>
            <span style={{ fontSize: 16, marginRight: 8 }}>💫</span>
            This planet has a spectacular ring system
          </div>
        )}
      </div>
    </div>
  )
}
