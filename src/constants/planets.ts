import type { Planet } from '../types'

// Real orbital periods in the universe (in Earth years)
// Source: NASA JPL Solar System Dynamics
const ORBITAL_PERIODS = {
  mercury: 0.240846,    // 88 days
  venus: 0.615198,      // 225 days
  earth: 1.0,           // 365.25 days
  mars: 1.880848,       // 687 days
  jupiter: 11.862615,   // 4,333 days
  saturn: 29.457491,    // 10,759 days
  uranus: 84.016846,    // 30,687 days
  neptune: 164.79132    // 60,190 days
}

// NASA JPL Solar System Dynamics - Real average distances (AU)
// Source: https://solarsystem.nasa.gov/planet-compare/
const REAL_DISTANCES_AU = {
  mercury: 0.39,   // 0.39 AU
  venus: 0.72,     // 0.72 AU
  earth: 1.00,     // 1.00 AU (reference)
  mars: 1.52,      // 1.52 AU
  jupiter: 5.20,   // 5.20 AU
  saturn: 9.54,    // 9.54 AU
  uranus: 19.19,   // 19.19 AU
  neptune: 30.07   // 30.07 AU
}

// Scale factor for visualization (for proper view in 3D scene)
// Should be at least 8-10 since the Sun's size is 2.5 so Mercury stays outside
const DISTANCE_SCALE = 10

// Base speed constant (Earth's reference speed)
const BASE_SPEED = 0.01

// Calculate real orbital speeds: speed = BASE_SPEED / period
const calculateOrbitSpeed = (period: number) => BASE_SPEED / period

// Planet data - Real distances according to NASA data
// distance = NASA AU value × DISTANCE_SCALE
// orbitSpeed = calculated based on real orbital period in the universe
// rotationPeriod = self-axis rotation speed (in Earth days)
export const planets: Planet[] = [
  { 
    name: 'Sun', 
    distance: 0, 
    size: 2.5, 
    color: '#FDB813', 
    orbitSpeed: 0, 
    rotationPeriod: 25, // 25 Earth days
    emissive: '#FDB813', 
    emissiveIntensity: 0.8, 
    startAngle: 0,
    texture: '/textures/planets/8k_sun.jpg'
  },
  { 
    name: 'Mercury', 
    distance: REAL_DISTANCES_AU.mercury * DISTANCE_SCALE, // 0.39 AU
    size: 0.38, 
    color: '#8C7853', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.mercury), // 0.0415 (fastest planet!)
    rotationPeriod: 58.6, // 58.6 Earth days
    startAngle: 0.5,
    texture: '/textures/planets/8k_mercury.jpg'
  },
  { 
    name: 'Venus', 
    distance: REAL_DISTANCES_AU.venus * DISTANCE_SCALE, // 0.72 AU
    size: 0.95, 
    color: '#FFC649', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.venus), // 0.0163
    rotationPeriod: -243, // 243 Earth days (retrograde)
    startAngle: 1.2,
    texture: '/textures/planets/4k_venus_atmosphere.jpg'
  },
  { 
    name: 'Earth', 
    distance: REAL_DISTANCES_AU.earth * DISTANCE_SCALE, // 1.00 AU (reference)
    size: 1.0, 
    color: '#4A90E2', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.earth), // 0.01 (reference)
    rotationPeriod: 1, // 1 Earth day (24 hours)
    startAngle: 2.1,
    texture: '/textures/planets/2k_earth_daymap.jpg',
    nightTexture: '/textures/planets/2k_earth_nightmap.jpg',
    cloudsTexture: '/textures/planets/2k_earth_clouds.jpg',
    moons: [
      { 
        name: 'Moon', 
        distance: 0.3, 
        size: 0.27, 
        color: '#C0C0C0', 
        orbitSpeed: calculateOrbitSpeed(27.3 / 365.25), // Orbits Earth in 27.3 days
        rotationPeriod: 27.3, // Tidal locked - same face always towards Earth
        startAngle: 0,
        texture: '/textures/moons/8k_moon.jpg'
      }
    ]
  },
  { 
    name: 'Mars', 
    distance: REAL_DISTANCES_AU.mars * DISTANCE_SCALE, // 1.52 AU
    size: 0.53, 
    color: '#E27B58', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.mars), // 0.00532
    rotationPeriod: 1.03, // 1.03 Earth days (24.6 hours)
    startAngle: 3.5,
    texture: '/textures/planets/8k_mars.jpg',
    moons: [
      { name: 'Phobos', distance: 0.15, size: 0.02, color: '#8B7355', orbitSpeed: calculateOrbitSpeed(0.319 / 365.25), rotationPeriod: 0.32, startAngle: 0 },
      { name: 'Deimos', distance: 0.25, size: 0.015, color: '#A0826D', orbitSpeed: calculateOrbitSpeed(1.263 / 365.25), rotationPeriod: 1.26, startAngle: 3 }
    ]
  },
  { 
    name: 'Jupiter', 
    distance: REAL_DISTANCES_AU.jupiter * DISTANCE_SCALE, // 5.20 AU
    size: 2.5, 
    color: '#C88B3A', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.jupiter), // 0.000843 (orbit in 11.86 years!)
    rotationPeriod: 0.41, // 0.41 Earth days (~10 hours) - VERY FAST rotation!
    startAngle: 4.8,
    texture: '/textures/planets/8k_jupiter.jpg',
    moons: [
      { name: 'Io', distance: 0.5, size: 0.36, color: '#FFD700', orbitSpeed: calculateOrbitSpeed(1.77 / 365.25), rotationPeriod: 1.77, startAngle: 0 },
      { name: 'Europa', distance: 0.8, size: 0.31, color: '#D4AF37', orbitSpeed: calculateOrbitSpeed(3.55 / 365.25), rotationPeriod: 3.55, startAngle: 1.5 },
      { name: 'Ganymede', distance: 1.2, size: 0.52, color: '#8B8B7A', orbitSpeed: calculateOrbitSpeed(7.15 / 365.25), rotationPeriod: 7.15, startAngle: 3 },
      { name: 'Callisto', distance: 1.6, size: 0.48, color: '#6B6B5A', orbitSpeed: calculateOrbitSpeed(16.7 / 365.25), rotationPeriod: 16.7, startAngle: 4.5 }
    ]
  },
  { 
    name: 'Saturn', 
    distance: REAL_DISTANCES_AU.saturn * DISTANCE_SCALE, // 9.54 AU
    size: 2.1, 
    color: '#FAD5A5', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.saturn), // 0.000340 (orbit in 29.5 years!)
    rotationPeriod: 0.45, // 0.45 Earth days (~10.7 hours) - VERY FAST rotation!
    startAngle: 0.3, 
    hasRings: true,
    texture: '/textures/planets/8k_saturn.jpg',
    ringTexture: '/textures/planets/8k_saturn_ring_alpha.png',
    moons: [
      { name: 'Titan', distance: 1.0, size: 0.51, color: '#FFA500', orbitSpeed: calculateOrbitSpeed(15.95 / 365.25), rotationPeriod: 15.95, startAngle: 0 },
      { name: 'Rhea', distance: 0.6, size: 0.15, color: '#D3D3D3', orbitSpeed: calculateOrbitSpeed(4.52 / 365.25), rotationPeriod: 4.52, startAngle: 2 },
      { name: 'Enceladus', distance: 0.4, size: 0.05, color: '#F0F8FF', orbitSpeed: calculateOrbitSpeed(1.37 / 365.25), rotationPeriod: 1.37, startAngle: 4 }
    ]
  },
  { 
    name: 'Uranus', 
    distance: REAL_DISTANCES_AU.uranus * DISTANCE_SCALE, // 19.19 AU
    size: 1.0, 
    color: '#4FD0E7', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.uranus), // 0.000119 (orbit in 84 years!)
    rotationPeriod: -0.72, // 0.72 Earth days (~17.2 hours) - retrograde
    startAngle: 5.5,
    texture: '/textures/planets/2k_uranus.jpg',
    moons: [
      { name: 'Titania', distance: 0.5, size: 0.16, color: '#B0C4DE', orbitSpeed: calculateOrbitSpeed(8.71 / 365.25), rotationPeriod: 8.71, startAngle: 0 },
      { name: 'Oberon', distance: 0.7, size: 0.15, color: '#A0B0C0', orbitSpeed: calculateOrbitSpeed(13.46 / 365.25), rotationPeriod: 13.46, startAngle: 3 }
    ]
  },
  { 
    name: 'Neptune', 
    distance: REAL_DISTANCES_AU.neptune * DISTANCE_SCALE, // 30.07 AU
    size: 0.97, 
    color: '#4166F5', 
    orbitSpeed: calculateOrbitSpeed(ORBITAL_PERIODS.neptune), // 0.0000607 (orbit in 165 years!)
    rotationPeriod: 0.67, // 0.67 Earth days (~16 hours)
    startAngle: 2.8,
    texture: '/textures/planets/2k_neptune.jpg',
    moons: [
      { name: 'Triton', distance: 0.5, size: 0.27, color: '#ADD8E6', orbitSpeed: -calculateOrbitSpeed(5.88 / 365.25), rotationPeriod: -5.88, startAngle: 0 } // retrograde orbit!
    ]
  },
]

