import CameraControlsImpl from 'camera-controls'
import { planets } from '../constants/planets'
import { flyToPlanet, flyToDirection, raDecToDir } from '../utils/navigation'

// Sidebar bileşeni
export default function Sidebar({ controlsRef }: {
  controlsRef: React.RefObject<CameraControlsImpl>
}) {
  return (
    <aside style={{ width: 320, padding: 12, background: '#0b0b0e', color: 'white', overflowY: 'auto' }}>
      <h3>Güneş Sistemi</h3>
      
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 8, fontSize: 14, opacity: 0.8 }}>Gezegenler</h4>
        {planets.map((planet) => (
          <button
            key={planet.name}
            onClick={() => planet.distance === 0 ? flyToPlanet(controlsRef, 5) : flyToPlanet(controlsRef, planet.distance)}
            style={{
              display: 'block',
              width: '100%',
              marginBottom: 6,
              padding: '8px 12px',
              background: planet.color,
              color: planet.name === 'Güneş' ? '#000' : '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
              textAlign: 'left'
            }}
          >
            {planet.name}
          </button>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '16px 0' }} />

      <h4 style={{ marginBottom: 8, fontSize: 14, opacity: 0.8 }}>Diğer Kontroller</h4>
      <button
        onClick={() => flyToDirection(controlsRef, [0, 0, 1], 8)}
        style={{ display: 'block', marginBottom: 8, width: '100%', padding: '6px 12px' }}
      >
        +Z yönüne uç
      </button>
      <button
        onClick={() => flyToDirection(controlsRef, raDecToDir(19.5, 40), 12)}
        style={{ display: 'block', marginBottom: 8, width: '100%', padding: '6px 12px' }}
      >
        RA=19.5h, Dec=40° yönüne uç
      </button>
      <p style={{ opacity: 0.8, fontSize: 12, marginTop: 12 }}>
        Scroll ile zoom; fare sağ tık/orta tuş ile pan; solda orbit.
      </p>
    </aside>
  )
}

