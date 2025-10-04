import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// Uzay Arka Planı bileşeni - 50 AU'dan sonra texture kaybolur
export default function SpaceBackground() {
  const spaceTexture = useTexture('/textures/stars/8k_stars_milky_way.jpg')
  const { camera } = useThree()
  const textureRef = useRef<THREE.Mesh>(null)
  const blackRef = useRef<THREE.Mesh>(null)
  
  // Kamera mesafesini takip et - 50 AU = 500 sahne birimi
  useFrame(() => {
    const cameraDistance = camera.position.length() // Güneş'ten (0,0,0) uzaklık
    const shouldShowTexture = cameraDistance < 500 // 50 AU = 500 sahne birimi (DISTANCE_SCALE = 10)
    
    // Mesh visibility'sini direkt değiştir (state kullanma, re-render yok)
    if (textureRef.current) {
      textureRef.current.visible = shouldShowTexture
    }
    if (blackRef.current) {
      blackRef.current.visible = !shouldShowTexture
    }
  })
  
  return (
    <>
      {/* Texture'lı yıldızlı uzay (yakın mesafe) */}
      <mesh ref={textureRef}>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial 
          map={spaceTexture} 
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      
      {/* Siyah boşluk (uzak mesafe) */}
      <mesh ref={blackRef} visible={false}>
        <sphereGeometry args={[50000, 32, 32]} />
        <meshBasicMaterial 
          color="#000000"
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}

