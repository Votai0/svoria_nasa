import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import type { Moon as MoonType } from '../types'
import { ONE_DAY_UNITS, ROTATION_SCALE } from '../constants/time'

// Uydu bileşeni
export default function Moon({ distance, size, color, orbitSpeed, rotationPeriod, startAngle, texture, currentTime }: MoonType & { currentTime: number }) {
  const moonRef = useRef<any>(null)
  
  // Texture yükleme
  const moonTexture = texture ? useTexture(texture) : null

  useFrame(() => {
    if (moonRef.current) {
      // Yörünge hareketi
      const angle = startAngle + currentTime * orbitSpeed
      moonRef.current.position.x = Math.cos(angle) * distance
      moonRef.current.position.z = Math.sin(angle) * distance
      
      // Kendi ekseni dönüşü - görsel amaçlı yavaşlatılmış
      const daysElapsed = currentTime / ONE_DAY_UNITS
      moonRef.current.rotation.y = (2 * Math.PI * daysElapsed * ROTATION_SCALE) / Math.abs(rotationPeriod)
    }
  })

  return (
    <group>
      {/* Uydu yörünge çizgisi */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.02, distance + 0.02, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>

      {/* Uydu */}
      <mesh ref={moonRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          map={moonTexture || undefined}
          color={color}
          emissive={color}
          emissiveIntensity={0.12}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
    </group>
  )
}

