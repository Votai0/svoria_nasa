import type { Planet } from '../types'

type Props = {
  planet: Planet | null
  onClose: () => void
}

// Display planet information with detailed descriptions
const getPlanetDescription = (name: string): string => {
  const descriptions: Record<string, string> = {
    'Sun': 'The star at the center of our solar system. 4.6 billion years old and produces energy through hydrogen fusion.',
    'Mercury': 'The closest planet to the Sun. Daytime temperature reaches 430°C, while it drops to -180°C at night.',
    'Venus': 'The hottest planet in the solar system. Its dense atmosphere creates a greenhouse effect raising temp to 470°C.',
    'Earth': 'The only known habitable planet. 71% covered with water and has a protective atmosphere.',
    'Mars': 'The red planet. Reddish due to iron oxide. Believed to have had liquid water in the past.',
    'Jupiter': 'The largest planet in the solar system. A giant gas planet with a powerful magnetic field.',
    'Saturn': 'Famous for its magnificent rings. The rings are made of ice and rock particles.',
    'Uranus': 'An interesting planet that rotates on its side. Its blue-green color comes from methane gas.',
    'Neptune': 'The farthest planet from the Sun. Has winds reaching speeds of 2,000 km/h.'
  }
  return descriptions[name] || 'Detailed information about this celestial body is not available.'
}

// Convert orbital period to human-readable format
const formatOrbitalPeriod = (orbitSpeed: number): string => {
  const BASE_SPEED = 0.01
  const periodInYears = BASE_SPEED / orbitSpeed
  
  if (periodInYears < 1) {
    const days = Math.round(periodInYears * 365.25)
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (periodInYears < 2) {
    return '1 year'
  } else {
    return `${periodInYears.toFixed(1)} years`
  }
}

// Format rotation period
const formatRotationPeriod = (period: number): string => {
  const absPeriod = Math.abs(period)
  const isRetrograde = period < 0
  
  if (absPeriod < 1) {
    const hours = Math.round(absPeriod * 24)
    return `~${hours} hour${hours !== 1 ? 's' : ''}${isRetrograde ? ' (retrograde)' : ''}`
  } else if (absPeriod === 1) {
    return '1 day'
  } else {
    return `${absPeriod.toFixed(1)} days${isRetrograde ? ' (retrograde)' : ''}`
  }
}

export default function PlanetInfoPanel({ planet, onClose }: Props) {
  if (!planet) return null

  return (
    <div style={{
      position: 'absolute',
      top: 90,
      right: 16,
      width: 360,
      maxHeight: 'calc(100vh - 180px)',
      overflowY: 'auto',
      background: 'rgba(15, 15, 25, 0.92)',
      backdropFilter: 'blur(16px)',
      borderRadius: 16,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      padding: 20,
      zIndex: 100,
      color: '#fff'
    }}>
      {/* Header and close button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: 24,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fff 0%, #a0a0ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {planet.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          Close
        </button>
      </div>

      {/* Description */}
      <p style={{ 
        fontSize: 14, 
        lineHeight: 1.6,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 20
      }}>
        {getPlanetDescription(planet.name)}
      </p>

      {/* Properties */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Show orbital info if not the Sun */}
        {planet.distance > 0 && (
          <>
            <InfoRow 
              label="Distance from Sun" 
              value={`${planet.distance} AU (Astronomical Unit)`}
              color="#FFD700"
            />
            <InfoRow 
              label="Orbital Period" 
              value={formatOrbitalPeriod(planet.orbitSpeed)}
              color="#FFA500"
            />
          </>
        )}
        
        <InfoRow 
          label="Rotation Period" 
          value={formatRotationPeriod(planet.rotationPeriod)}
          color="#87CEEB"
        />
        
        {planet.moons && planet.moons.length > 0 && (
          <InfoRow 
            label="Number of Moons" 
            value={`${planet.moons.length} moon${planet.moons.length !== 1 ? 's' : ''}`}
            color="#DDA0DD"
          />
        )}

        {planet.hasRings && (
          <InfoRow 
            label="Special Feature" 
            value="Has ring system"
            color="#F0E68C"
          />
        )}
      </div>

      {/* Moons list */}
      {planet.moons && planet.moons.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            marginBottom: 10,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Moons
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {planet.moons.map((moon, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <span style={{ fontWeight: 600, color: '#fff' }}>{moon.name}</span>
                {' • '}
                <span>Orbit: {formatOrbitalPeriod(moon.orbitSpeed)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Info row component
function InfoRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      borderLeft: `3px solid ${color}`
    }}>
      <span style={{ 
        fontSize: 13, 
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        {label}
      </span>
      <span style={{ 
        fontSize: 13, 
        fontWeight: 600,
        color: '#fff'
      }}>
        {value}
      </span>
    </div>
  )
}
