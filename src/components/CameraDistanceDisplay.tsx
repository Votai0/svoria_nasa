import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { TimeControl } from '../types'

// 1 AU = 149,597,870.7 km
// 1 ışık yılı = 9,460,730,472,580.8 km
// 1 AU = 0.0000158125 ışık yılı
const AU_TO_LIGHT_YEARS = 0.0000158125

// Sahne birimini AU'ya çevir (DISTANCE_SCALE = 10)
const SCENE_UNITS_TO_AU = 0.1

type Props = {
  timeControl: TimeControl
  onDistanceChange: (distance: number) => void
}

// Canvas içinde çalışan tracker bileşeni
export function CameraDistanceTracker({ timeControl, onDistanceChange }: Props) {
  const { camera } = useThree()

  useFrame(() => {
    // Dünya'nın pozisyonunu hesapla
    // Dünya Güneş'ten 10 birim uzaklıkta (1 AU * 10)
    const earthDistance = 10 // REAL_DISTANCES_AU.earth * DISTANCE_SCALE
    
    // Zaman kontrolüne göre Dünya'nın açısını hesapla
    // Dünya'nın yörünge periyodu 365.25 gün
    const orbitalPeriodInDays = 365.25
    const angle = ((timeControl.currentTime % orbitalPeriodInDays) / orbitalPeriodInDays) * (2 * Math.PI) + 2.1 // startAngle = 2.1
    
    // Dünya'nın 3D pozisyonu
    const earthPos = new Vector3(
      Math.cos(angle) * earthDistance,
      0,
      Math.sin(angle) * earthDistance
    )
    
    // Kamera ile Dünya arasındaki mesafe
    const distanceInSceneUnits = camera.position.distanceTo(earthPos)
    
    // Sahne birimlerini AU'ya, sonra ışık yılına çevir
    const distanceInAU = distanceInSceneUnits * SCENE_UNITS_TO_AU
    const distanceInLightYears = distanceInAU * AU_TO_LIGHT_YEARS
    
    onDistanceChange(distanceInLightYears)
  })

  return null // Canvas içinde render edilecek ama UI olarak görünmeyecek
}

// Canvas dışında kullanılacak UI bileşeni
export default function CameraDistanceDisplay({ distance, isVisible, onToggle }: { 
  distance: number
  isVisible: boolean
  onToggle: () => void
}) {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          bottom: 20,
          left: isVisible ? 'calc(50% + 140px)' : 'calc(50% - 18px)',
          transform: 'translateX(-50%)',
          zIndex: 101,
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          width: 36,
          height: 36,
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        title={isVisible ? 'Mesafe göstergesini gizle' : 'Mesafe göstergesini göster'}
      >
        {isVisible ? '×' : '📍'}
      </button>
      
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)',
          zIndex: 100,
          padding: '12px 24px',
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
      >
      <div style={{ color: '#4A90E2', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Dünya'dan Uzaklık
      </div>
      <div style={{ fontSize: '18px', color: '#fff' }}>
        {distance < 0.00001 
          ? (distance * 9460730472580.8).toFixed(0) + ' km'
          : distance < 0.001
          ? (distance * 63241.077).toFixed(2) + ' AU'
          : distance < 1
          ? (distance * 63241.077).toFixed(1) + ' AU'
          : distance.toFixed(3) + ' ışık yılı'
        }
      </div>
    </div>
    </>
  )
}
