import { useRef, useMemo } from 'react'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import type { ExoplanetTarget } from '../types/exoplanet'

type Props = {
  target: ExoplanetTarget
  distance?: number // Işık yılı cinsinden mesafe (varsayılan: 1500)
}

export default function ExoplanetMarker({ target, distance = 1500 }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // RA/Dec -> 3D Kartezyen koordinat dönüşümü
  const position = useMemo(() => {
    // RA: derece cinsinden (0-360)
    // Dec: derece cinsinden (-90 - +90)
    const ra = (target.ra * Math.PI) / 180 // derece -> radyan
    const dec = (target.dec * Math.PI) / 180 // derece -> radyan
    
    // Küresel koordinattan Kartezyen koordinata
    const x = distance * Math.cos(dec) * Math.cos(ra)
    const y = distance * Math.sin(dec)
    const z = distance * Math.cos(dec) * Math.sin(ra)
    
    return [x, y, z] as [number, number, number]
  }, [target.ra, target.dec, distance])
  
  return (
    <group position={position}>
      {/* Ana beyaz parlak küre */}
      <Sphere ref={meshRef} args={[0.8, 16, 16]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* Dış glow efekti - Katman 1 */}
      <Sphere args={[1.5, 16, 16]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Dış glow efekti - Katman 2 */}
      <Sphere args={[2.5, 16, 16]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Pulsing glow efekti - En dış */}
      <Sphere args={[4, 16, 16]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Point light - parlak glow */}
      <pointLight
        position={[0, 0, 0]}
        color="#ffffff"
        intensity={100}
        distance={20}
        decay={2}
      />
    </group>
  )
}
