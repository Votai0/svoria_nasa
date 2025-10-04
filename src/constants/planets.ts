import type { Planet } from '../types'

// Gerçek evrendeki yörünge periyotları (Dünya yılı cinsinden)
// Kaynak: NASA JPL Solar System Dynamics
const ORBITAL_PERIODS = {
  mercury: 0.240846,    // 88 gün
  venus: 0.615198,      // 225 gün
  earth: 1.0,           // 365.25 gün
  mars: 1.880848,       // 687 gün
  jupiter: 11.862615,   // 4,333 gün
  saturn: 29.457491,    // 10,759 gün
  uranus: 84.016846,    // 30,687 gün
  neptune: 164.79132    // 60,190 gün
}

// Gerçek güneşten uzaklıklar (AU - Astronomical Unit cinsinden)
// 1 AU = Dünya-Güneş arası mesafe (~150 million km)
// Kaynak: NASA JPL Solar System Dynamics
const REAL_DISTANCES_AU = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1.000,
  mars: 1.524,
  jupiter: 5.203,  // Gerçekte çok uzak!
  saturn: 9.537,
  uranus: 19.191,
  neptune: 30.069
}

// Temel hız sabiti (Dünya'nın referans hızı)
const BASE_SPEED = 0.01

// Gerçek orbital hızları hesapla: speed = BASE_SPEED / period
const calculateOrbitSpeed = (period: number) => BASE_SPEED / period

// BİREBİR GERÇEK ÖLÇEK - Görsel ölçek faktörü
// Dünya 10 birim uzaklıkta olacak şekilde tüm oranlar AYNEN korunuyor
const SCALE_FACTOR = 10.0

// Mesafe ölçeklendirme - GERÇEK AU ORANI × GÖRSEL FAKTÖR
// Hiçbir logaritma veya değişiklik YOK - tam gerçek oranlar!
const scaleDistance = (au: number): number => {
  return au * SCALE_FACTOR
}

// Gezegen verileri - %100 GERÇEK FİZİKSEL ORANLAR
// distance = gerçek AU × 10 (oranlar 1:1 korunuyor)
// orbitSpeed = gerçek yörünge periyotları
// rotationPeriod = gerçek dönüş hızları
export const planets: Planet[] = [
  { 
    name: 'Güneş', 
    distance: 0, 
    size: 2.5, 
    color: '#FDB813', 
    orbitSpeed: 0, 
    rotationPeriod: 25, // 25 Dünya günü
    emissive: '#FDB813', 
    emissiveIntensity: 0.8, 
    startAngle: 0,
    texture: '/textures/planets/8k_sun.jpg'
  },
  { 
    name: 'Merkür', 
    distance: scaleDistance(REAL_DISTANCES_AU.mercury), // ~3.1
    size: 0.3, 
    color: '#8C7853', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.mercury), // 0.0415 (en hızlı gezegen!)
    rotationPeriod: 58.6, // 58.6 Dünya günü
    startAngle: 0.5,
    texture: '/textures/planets/8k_mercury.jpg'
  },
  { 
    name: 'Venüs', 
    distance: scaleDistance(REAL_DISTANCES_AU.venus), // ~5.8
    size: 0.5, 
    color: '#FFC649', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.venus), // 0.0163
    rotationPeriod: -243, // 243 Dünya günü (retrograde - ters dönüş)
    startAngle: 1.2,
    texture: '/textures/planets/4k_venus_atmosphere.jpg'
  },
  { 
    name: 'Dünya', 
    distance: scaleDistance(REAL_DISTANCES_AU.earth), // 8.0
    size: 0.6, 
    color: '#4A90E2', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.earth), // 0.01 (referans)
    rotationPeriod: 1, // 1 Dünya günü (24 saat)
    startAngle: 2.1,
    texture: '/textures/planets/2k_earth_daymap.jpg',
    nightTexture: '/textures/planets/2k_earth_nightmap.jpg',
    cloudsTexture: '/textures/planets/2k_earth_clouds.jpg',
    moons: [
      { 
        name: 'Ay', 
        distance: 1.5, // Dünya'dan biraz daha uzak (çakışmayı önlemek için)
        size: 0.15, 
        color: '#C0C0C0', 
        orbitSpeed: calculateOrbitSpeed(27.3 / 365.25), // 27.3 günde Dünya etrafında tur
        rotationPeriod: 27.3, // Tidal locked - aynı yüz her zaman Dünya'ya bakar
        startAngle: 0,
        texture: '/textures/moons/8k_moon.jpg'
      }
    ]
  },
  { 
    name: 'Mars', 
    distance: scaleDistance(REAL_DISTANCES_AU.mars), // ~12.2
    size: 0.4, 
    color: '#E27B58', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.mars), // 0.00532
    rotationPeriod: 1.03, // 1.03 Dünya günü (24.6 saat)
    startAngle: 3.5,
    texture: '/textures/planets/8k_mars.jpg',
    moons: [
      { name: 'Phobos', distance: 0.6, size: 0.06, color: '#8B7355', orbitSpeed: calculateOrbitSpeed(0.319 / 365.25), rotationPeriod: 0.32, startAngle: 0 },
      { name: 'Deimos', distance: 0.9, size: 0.05, color: '#A0826D', orbitSpeed: calculateOrbitSpeed(1.263 / 365.25), rotationPeriod: 1.26, startAngle: 3 }
    ]
  },
  { 
    name: 'Jüpiter', 
    distance: scaleDistance(REAL_DISTANCES_AU.jupiter), // ~29.3 (İÇ GEZEGENLERDEN ÇOK UZAK!)
    size: 1.4, 
    color: '#C88B3A', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.jupiter), // 0.000843 (11.86 yılda tur!)
    rotationPeriod: 0.41, // 0.41 Dünya günü (~10 saat) - ÇOK HIZLI dönüş!
    startAngle: 4.8,
    texture: '/textures/planets/8k_jupiter.jpg',
    moons: [
      { name: 'Io', distance: 2.2, size: 0.2, color: '#FFD700', orbitSpeed: calculateOrbitSpeed(1.77 / 365.25), rotationPeriod: 1.77, startAngle: 0 },
      { name: 'Europa', distance: 2.8, size: 0.18, color: '#D4AF37', orbitSpeed: calculateOrbitSpeed(3.55 / 365.25), rotationPeriod: 3.55, startAngle: 1.5 },
      { name: 'Ganymede', distance: 3.5, size: 0.25, color: '#8B8B7A', orbitSpeed: calculateOrbitSpeed(7.15 / 365.25), rotationPeriod: 7.15, startAngle: 3 },
      { name: 'Callisto', distance: 4.3, size: 0.22, color: '#6B6B5A', orbitSpeed: calculateOrbitSpeed(16.7 / 365.25), rotationPeriod: 16.7, startAngle: 4.5 }
    ]
  },
  { 
    name: 'Satürn', 
    distance: scaleDistance(REAL_DISTANCES_AU.saturn), // ~34.2
    size: 1.2, 
    color: '#FAD5A5', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.saturn), // 0.000340 (29.5 yılda tur!)
    rotationPeriod: 0.45, // 0.45 Dünya günü (~10.7 saat) - ÇOK HIZLI dönüş!
    startAngle: 0.3, 
    hasRings: true,
    texture: '/textures/planets/8k_saturn.jpg',
    ringTexture: '/textures/planets/8k_saturn_ring_alpha.png',
    moons: [
      { name: 'Titan', distance: 3.5, size: 0.24, color: '#FFA500', orbitSpeed: calculateOrbitSpeed(15.95 / 365.25), rotationPeriod: 15.95, startAngle: 0 },
      { name: 'Rhea', distance: 2.7, size: 0.12, color: '#D3D3D3', orbitSpeed: calculateOrbitSpeed(4.52 / 365.25), rotationPeriod: 4.52, startAngle: 2 },
      { name: 'Enceladus', distance: 2.1, size: 0.1, color: '#F0F8FF', orbitSpeed: calculateOrbitSpeed(1.37 / 365.25), rotationPeriod: 1.37, startAngle: 4 }
    ]
  },
  { 
    name: 'Uranüs', 
    distance: scaleDistance(REAL_DISTANCES_AU.uranus), // ~39.5
    size: 0.9, 
    color: '#4FD0E7', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.uranus), // 0.000119 (84 yılda tur!)
    rotationPeriod: -0.72, // 0.72 Dünya günü (~17.2 saat) - retrograde
    startAngle: 5.5,
    texture: '/textures/planets/2k_uranus.jpg',
    moons: [
      { name: 'Titania', distance: 2.1, size: 0.15, color: '#B0C4DE', orbitSpeed: calculateOrbitSpeed(8.71 / 365.25), rotationPeriod: 8.71, startAngle: 0 },
      { name: 'Oberon', distance: 2.6, size: 0.14, color: '#A0B0C0', orbitSpeed: calculateOrbitSpeed(13.46 / 365.25), rotationPeriod: 13.46, startAngle: 3 }
    ]
  },
  { 
    name: 'Neptün', 
    distance: scaleDistance(REAL_DISTANCES_AU.neptune), // ~43.2
    size: 0.85, 
    color: '#4166F5', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.neptune), // 0.0000607 (165 yılda tur!)
    rotationPeriod: 0.67, // 0.67 Dünya günü (~16 saat)
    startAngle: 2.8,
    texture: '/textures/planets/2k_neptune.jpg',
    moons: [
      { name: 'Triton', distance: 2.3, size: 0.17, color: '#ADD8E6', orbitSpeed: -calculateOrbitSpeed(5.88 / 365.25), rotationPeriod: -5.88, startAngle: 0 } // retrograde orbit!
    ]
  },
]

