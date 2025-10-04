import type { Planet } from '../types'

// Gezegen verileri - gerçek yörünge periyotlarına göre
// orbitSpeed = baseSpeed(0.01) / yörünge_periyodu(yıl cinsinden)
// rotationSpeed = kendi ekseni dönüş hızı (Dünya günü cinsinden)
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
    distance: 4, 
    size: 0.3, 
    color: '#8C7853', 
    orbitSpeed: 0.0417,
    rotationPeriod: 58.6, // 58.6 Dünya günü
    startAngle: 0.5,
    texture: '/textures/planets/8k_mercury.jpg'
  },
  { 
    name: 'Venüs', 
    distance: 6, 
    size: 0.5, 
    color: '#FFC649', 
    orbitSpeed: 0.0161,
    rotationPeriod: -243, // 243 Dünya günü (retrograde - ters dönüş)
    startAngle: 1.2,
    texture: '/textures/planets/4k_venus_atmosphere.jpg'
  },
  { 
    name: 'Dünya', 
    distance: 8, 
    size: 0.6, 
    color: '#4A90E2', 
    orbitSpeed: 0.01,
    rotationPeriod: 1, // 1 Dünya günü (24 saat)
    startAngle: 2.1,
    texture: '/textures/planets/2k_earth_daymap.jpg',
    nightTexture: '/textures/planets/2k_earth_nightmap.jpg',
    cloudsTexture: '/textures/planets/2k_earth_clouds.jpg',
    moons: [
      { 
        name: 'Ay', 
        distance: 1.2, 
        size: 0.15, 
        color: '#C0C0C0', 
        orbitSpeed: 0.3,
        rotationPeriod: 27.3, // 27.3 Dünya günü (tidal locked)
        startAngle: 0,
        texture: '/textures/moons/8k_moon.jpg'
      }
    ]
  },
  { 
    name: 'Mars', 
    distance: 10, 
    size: 0.4, 
    color: '#E27B58', 
    orbitSpeed: 0.0053,
    rotationPeriod: 1.03, // 1.03 Dünya günü (24.6 saat)
    startAngle: 3.5,
    texture: '/textures/planets/8k_mars.jpg',
    moons: [
      { name: 'Phobos', distance: 0.5, size: 0.06, color: '#8B7355', orbitSpeed: 0.8, rotationPeriod: 0.32, startAngle: 0 },
      { name: 'Deimos', distance: 0.7, size: 0.05, color: '#A0826D', orbitSpeed: 0.5, rotationPeriod: 1.26, startAngle: 3 }
    ]
  },
  { 
    name: 'Jüpiter', 
    distance: 14, 
    size: 1.4, 
    color: '#C88B3A', 
    orbitSpeed: 0.00084,
    rotationPeriod: 0.41, // 0.41 Dünya günü (~10 saat) - ÇOK HIZLI!
    startAngle: 4.8,
    texture: '/textures/planets/8k_jupiter.jpg',
    moons: [
      { name: 'Io', distance: 2, size: 0.2, color: '#FFD700', orbitSpeed: 0.5, rotationPeriod: 1.77, startAngle: 0 },
      { name: 'Europa', distance: 2.5, size: 0.18, color: '#D4AF37', orbitSpeed: 0.4, rotationPeriod: 3.55, startAngle: 1.5 },
      { name: 'Ganymede', distance: 3, size: 0.25, color: '#8B8B7A', orbitSpeed: 0.3, rotationPeriod: 7.15, startAngle: 3 },
      { name: 'Callisto', distance: 3.6, size: 0.22, color: '#6B6B5A', orbitSpeed: 0.2, rotationPeriod: 16.7, startAngle: 4.5 }
    ]
  },
  { 
    name: 'Satürn', 
    distance: 18, 
    size: 1.2, 
    color: '#FAD5A5', 
    orbitSpeed: 0.00034,
    rotationPeriod: 0.45, // 0.45 Dünya günü (~10.7 saat) - ÇOK HIZLI!
    startAngle: 0.3, 
    hasRings: true,
    texture: '/textures/planets/8k_saturn.jpg',
    ringTexture: '/textures/planets/8k_saturn_ring_alpha.png',
    moons: [
      { name: 'Titan', distance: 3, size: 0.24, color: '#FFA500', orbitSpeed: 0.25, rotationPeriod: 15.95, startAngle: 0 },
      { name: 'Rhea', distance: 2.3, size: 0.12, color: '#D3D3D3', orbitSpeed: 0.35, rotationPeriod: 4.52, startAngle: 2 },
      { name: 'Enceladus', distance: 1.8, size: 0.1, color: '#F0F8FF', orbitSpeed: 0.45, rotationPeriod: 1.37, startAngle: 4 }
    ]
  },
  { 
    name: 'Uranüs', 
    distance: 22, 
    size: 0.9, 
    color: '#4FD0E7', 
    orbitSpeed: 0.00012,
    rotationPeriod: -0.72, // 0.72 Dünya günü (~17.2 saat) - retrograde
    startAngle: 5.5,
    texture: '/textures/planets/2k_uranus.jpg',
    moons: [
      { name: 'Titania', distance: 1.8, size: 0.15, color: '#B0C4DE', orbitSpeed: 0.3, rotationPeriod: 8.71, startAngle: 0 },
      { name: 'Oberon', distance: 2.2, size: 0.14, color: '#A0B0C0', orbitSpeed: 0.25, rotationPeriod: 13.46, startAngle: 3 }
    ]
  },
  { 
    name: 'Neptün', 
    distance: 26, 
    size: 0.85, 
    color: '#4166F5', 
    orbitSpeed: 0.000061,
    rotationPeriod: 0.67, // 0.67 Dünya günü (~16 saat)
    startAngle: 2.8,
    texture: '/textures/planets/2k_neptune.jpg',
    moons: [
      { name: 'Triton', distance: 1.9, size: 0.17, color: '#ADD8E6', orbitSpeed: 0.28, rotationPeriod: -5.88, startAngle: 0 } // retrograde orbit
    ]
  },
]

