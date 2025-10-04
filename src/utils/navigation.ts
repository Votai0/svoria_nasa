import CameraControlsImpl from 'camera-controls'

// Gezegene uçma fonksiyonu
export const flyToPlanet = (controlsRef: React.RefObject<CameraControlsImpl | null>, distance: number) => {
  if (!controlsRef.current) return
  const angle = Math.PI / 4 // 45 derece
  const height = distance * 0.3
  controlsRef.current.setLookAt(
    distance * Math.cos(angle),
    height,
    distance * Math.sin(angle),
    0, 0, 0,
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

