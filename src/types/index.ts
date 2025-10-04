// Zaman kontrol state'i için tip
export type TimeControl = {
  speed: number
  isPaused: boolean
  currentTime: number // gün cinsinden
  year: number // Hangi yılda başladığımız
}

// Uydu tipi
export type Moon = {
  name: string
  distance: number
  size: number
  color: string
  orbitSpeed: number
  rotationPeriod: number
  startAngle: number
  texture?: string
}

// Gezegen tipi
export type Planet = {
  name: string
  distance: number
  size: number
  color: string
  orbitSpeed: number
  rotationPeriod: number
  emissive?: string
  emissiveIntensity?: number
  hasRings?: boolean
  startAngle: number
  texture?: string
  nightTexture?: string
  cloudsTexture?: string
  ringTexture?: string
  moons?: Moon[]
}

