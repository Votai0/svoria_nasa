import CameraControlsImpl from 'camera-controls'
import type { Planet } from '../types'

// Gezegene uçma fonksiyonu - gezegenin gerçek pozisyonunu hesaplayıp odaklan
export const flyToPlanet = (
  controlsRef: React.RefObject<CameraControlsImpl | null>, 
  planet: Planet,
  currentTime: number,
  realPosition?: number
) => {
  if (!controlsRef.current) return
  
  // Güneş için özel durum
  if (planet.distance === 0) {
    const viewDistance = 8
    const angle = Math.PI / 4
    const height = viewDistance * 0.3
    controlsRef.current.setLookAt(
      viewDistance * Math.cos(angle),
      height,
      viewDistance * Math.sin(angle),
      0, 0, 0,
      true
    )
    return
  }
  
  // Gezegenin şu anki pozisyonunu hesapla
  const baseAngle = realPosition !== undefined ? realPosition : (planet.startAngle || 0)
  const orbitalPeriodInDays = 365.25 / (planet.orbitSpeed * 100)
  const angle = baseAngle + (currentTime / orbitalPeriodInDays) * (2 * Math.PI)
  
  // Gezegenin 3D pozisyonu
  const planetX = Math.cos(angle) * planet.distance
  const planetZ = Math.sin(angle) * planet.distance
  
  // Kamerayı gezegenin yakınına yerleştir (gezegenden biraz uzak)
  const cameraDistance = planet.size * 4 + 2 // Gezegen boyutuna göre dinamik mesafe
  const cameraAngle = angle + Math.PI / 6 // Gezegenden biraz kaydırılmış açı
  const cameraHeight = planet.size * 0.8
  
  const cameraX = planetX + Math.cos(cameraAngle) * cameraDistance
  const cameraZ = planetZ + Math.sin(cameraAngle) * cameraDistance
  
  // Kamerayı gezegene odakla
  controlsRef.current.setLookAt(
    cameraX,
    cameraHeight,
    cameraZ,
    planetX, 0, planetZ, // Gezegene bak
    true
  )
}

// Belirli bir yöne uçma fonksiyonu
export const flyToDirection = (
  controlsRef: React.RefObject<CameraControlsImpl | null>,
  dir: [number, number, number],
  dist = 10
) => {
  if (!controlsRef.current) return
  const [dx, dy, dz] = dir
  const len = Math.hypot(dx, dy, dz) || 1
  const nx = dx / len, ny = dy / len, nz = dz / len
  const cx = nx * dist, cy = ny * dist, cz = nz * dist
  controlsRef.current.setLookAt(cx, cy, cz, 0, 0, 0, true)
}

// RA(saat), Dec(derece) -> yön vektörü
export const raDecToDir = (raHours: number, decDeg: number): [number, number, number] => {
  const ra = (raHours * Math.PI) / 12 // 24h -> 2π
  const dec = (decDeg * Math.PI) / 180
  const x = Math.cos(dec) * Math.cos(ra)
  const y = Math.sin(dec)
  const z = Math.cos(dec) * Math.sin(ra)
  return [x, y, z]
}

