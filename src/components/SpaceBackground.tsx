import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// Space Background component - texture disappears after 50 AU
export default function SpaceBackground() {
  const spaceTexture = useTexture('/textures/stars/8k_stars_milky_way.jpg')
  const { camera } = useThree()
  const textureRef = useRef<THREE.Mesh>(null)
  const blackRef = useRef<THREE.Mesh>(null)
  
  // Track camera distance - 50 AU = 500 scene units
  useFrame(() => {
    const cameraDistance = camera.position.length() // Distance from Sun (0,0,0)
    const shouldShowTexture = cameraDistance < 500 // 50 AU = 500 sahne birimi (DISTANCE_SCALE = 10)
    
    // Directly change mesh visibility (no state, no re-render)
    if (textureRef.current) {
      textureRef.current.visible = shouldShowTexture
    }
    if (blackRef.current) {
      blackRef.current.visible = !shouldShowTexture
    }
  })
  
  return (
    <>
      {/* Textured starry space (close distance) */}
      <mesh ref={textureRef}>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial 
          map={spaceTexture} 
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      
      {/* Black void (far distance) */}
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

