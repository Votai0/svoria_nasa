import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { Moon as MoonType } from '../types'
import Moon from './Moon'
import { ROTATION_SCALE } from '../constants/time'

// Planet bileşeni props tipi
type PlanetProps = {
  name: string
  distance: number
  size: number
  color: string
  orbitSpeed: number
  rotationPeriod: number
  emissive?: string
  emissiveIntensity?: number
  hasRings?: boolean
  startAngle?: number
  moons?: MoonType[]
  texture?: string
  nightTexture?: string
  cloudsTexture?: string
  ringTexture?: string
  currentTime: number
  year: number
  realPosition?: number // Gerçek konum (radyan)
}

// Planet bileşeni
export default function Planet({
  distance,
  size,
  color,
  orbitSpeed,
  rotationPeriod,
  emissive,
  emissiveIntensity,
  hasRings,
  startAngle,
  moons,
  texture,
  nightTexture,
  cloudsTexture,
  ringTexture,
  currentTime,
  year,
  realPosition
}: PlanetProps) {
  const groupRef = useRef<any>(null)
  const cloudsRef = useRef<any>(null)

  // Texture yükleme
  const planetTexture = texture ? useTexture(texture) : null
  const nightMap = nightTexture ? useTexture(nightTexture) : null
  const cloudsMap = cloudsTexture ? useTexture(cloudsTexture) : null
  const ringMap = ringTexture ? useTexture(ringTexture) : null
  
  useFrame(() => {
    if (groupRef.current && distance > 0) {
      // Yörünge hareketi: realPosition (yıl başı konumu) + yıl içindeki hareket
      const baseAngle = realPosition !== undefined ? realPosition : (startAngle || 0)
      // currentTime: 0-365.25 arası gün sayısı
      // orbitSpeed = BASE_SPEED / orbital_period
      // orbital_period: gezegenin bir tur için gereken Dünya yılı sayısı
      // Dünya: period=1 → 365.25 günde tam tur (2π radyan)
      // Mars: period=1.88 → 687 günde tam tur (2π radyan)
      const orbitalPeriodInDays = 365.25 / (orbitSpeed * 100) // BASE_SPEED=0.01 → *100
      const angle = baseAngle + (currentTime / orbitalPeriodInDays) * (2 * Math.PI)
      groupRef.current.position.x = Math.cos(angle) * distance
      groupRef.current.position.z = Math.sin(angle) * distance

      // Kendi ekseni dönüşü - gerçek rotasyon periyoduna göre
      const daysElapsed = currentTime
      groupRef.current.rotation.y = (2 * Math.PI * daysElapsed * ROTATION_SCALE) / Math.abs(rotationPeriod)
    }

    // Bulutlar %20 daha hızlı dönsün (atmosfer etkisi)
    if (cloudsRef.current) {
      const daysElapsed = currentTime
      cloudsRef.current.rotation.y = (2 * Math.PI * daysElapsed * ROTATION_SCALE * 1.2) / Math.abs(rotationPeriod)
    }
  })

  if (distance === 0) {
    // Güneş - merkezde, ışık saçan
    const sunRef = useRef<any>(null)
    
    useFrame(() => {
      if (sunRef.current) {
        const daysElapsed = currentTime
        sunRef.current.rotation.y = (2 * Math.PI * daysElapsed * ROTATION_SCALE) / rotationPeriod
      }
    })
    
    return (
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          map={planetTexture}
          color={color} 
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    )
  }

  return (
    <group>
      {/* Yörünge çizgisi */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.05, distance + 0.05, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>

      {/* Gezegen ve halkaları bir arada */}
      <group ref={groupRef}>
        {/* Gezegen */}
        <mesh>
          <sphereGeometry args={[size, 64, 64]} />
          {nightMap ? (
            // Dünya için özel gece/gündüz sistemi
            <meshStandardMaterial 
              map={planetTexture}
              emissiveMap={nightMap}
              emissive="#ffffff"
              emissiveIntensity={0.6}
              roughness={0.6}
              metalness={0.1}
            />
          ) : (
            <meshStandardMaterial 
              map={planetTexture || undefined}
              color={color}
              emissive={color}
              emissiveIntensity={0.15}
              roughness={0.6}
              metalness={0.1}
            />
          )}
        </mesh>

        {/* Dünya bulutları */}
        {cloudsMap && (
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[size * 1.01, 64, 64]} />
            <meshStandardMaterial 
              map={cloudsMap}
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Satürn'ün halkaları */}
        {hasRings && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.5, size * 2.2, 64]} />
            <meshStandardMaterial 
              map={ringMap || undefined}
              color={ringMap ? "#ffffff" : "#C9B89A"}
              transparent 
              opacity={ringMap ? 1 : 0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Uydular */}
        {moons && moons.map((moon) => (
          <Moon key={moon.name} {...moon} currentTime={currentTime} />
        ))}
      </group>
    </group>
  )
}

