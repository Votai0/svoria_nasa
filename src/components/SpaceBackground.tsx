import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Uzay Arka Planı bileşeni
export default function SpaceBackground() {
  const spaceTexture = useTexture('/textures/stars/8k_stars_milky_way.jpg')
  
  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial 
        map={spaceTexture} 
        side={THREE.BackSide} // İçten görünür
        toneMapped={false}
      />
    </mesh>
  )
}

