import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { KOIPlanet } from '../types/exoplanet'

type Props = {
  koiPlanets: KOIPlanet[]
  selectedKepid?: number
}

// Parsek'i Three.js birimlerine çevir (1 parsek = 3.26 ışık yılı = 0.001 Three.js birimi)
const PARSEC_TO_SCENE_UNIT = 0.00001 // Ölçekleme faktörü

export default function ExoplanetMarkers({ koiPlanets, selectedKepid }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  
  // KOI gezegenlerini 3D pozisyonlarına dönüştür
  const exoplanetData = useMemo(() => {
    const validPlanets = koiPlanets.filter(koi => 
      koi.x_pc !== undefined && 
      koi.y_pc !== undefined && 
      koi.z_pc !== undefined &&
      !isNaN(koi.x_pc) &&
      !isNaN(koi.y_pc) &&
      !isNaN(koi.z_pc)
    )
    
    const positions = new Float32Array(validPlanets.length * 3)
    const colors = new Float32Array(validPlanets.length * 3)
    const sizes = new Float32Array(validPlanets.length)
    
    validPlanets.forEach((koi, i) => {
      // 3D pozisyonu ayarla (parsek -> scene units)
      positions[i * 3 + 0] = (koi.x_pc || 0) * PARSEC_TO_SCENE_UNIT
      positions[i * 3 + 1] = (koi.z_pc || 0) * PARSEC_TO_SCENE_UNIT // Y ve Z swap (Three.js koordinat sistemi)
      positions[i * 3 + 2] = -(koi.y_pc || 0) * PARSEC_TO_SCENE_UNIT
      
      // Renk - disposition'a göre
      const isConfirmed = koi.koi_disposition === 'CONFIRMED'
      const isFalsePositive = koi.koi_disposition === 'FALSE POSITIVE'
      
      if (isFalsePositive) {
        // Kırmızı - False Positive
        colors[i * 3 + 0] = 1.0
        colors[i * 3 + 1] = 0.3
        colors[i * 3 + 2] = 0.3
      } else if (isConfirmed) {
        // Yeşil - Confirmed
        colors[i * 3 + 0] = 0.3
        colors[i * 3 + 1] = 1.0
        colors[i * 3 + 2] = 0.5
      } else {
        // Beyaz/Sarımsı - Candidate
        colors[i * 3 + 0] = 1.0
        colors[i * 3 + 1] = 1.0
        colors[i * 3 + 2] = 0.9
      }
      
      // Büyüklük - ML confidence veya SNR'a göre
      const confidence = koi.confidence || 0.5
      const snr = koi.koi_model_snr || 5
      sizes[i] = Math.max(2, Math.min(8, snr * 0.5 * confidence))
    })
    
    return { positions, colors, sizes, planets: validPlanets }
  }, [koiPlanets])
  
  // Pulse animasyonu
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime()
      const pulse = Math.sin(t * 2) * 0.2 + 1.0
      
      // Seçili gezegeni vurgula
      if (selectedKepid) {
        const index = exoplanetData.planets.findIndex(p => p.kepid === selectedKepid)
        if (index >= 0 && exoplanetData.sizes[index]) {
          const baseSize = exoplanetData.sizes[index]
          exoplanetData.sizes[index] = baseSize * pulse
        }
      }
    }
  })
  
  if (exoplanetData.planets.length === 0) {
    return null
  }
  
  return (
    <group ref={groupRef}>
      {/* Ana nokta bulutu */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[exoplanetData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[exoplanetData.colors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[exoplanetData.sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={3}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Parlama efekti için glow layer */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[exoplanetData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[exoplanetData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={6}
          vertexColors
          transparent
          opacity={0.3}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Seçili gezegen için özel marker */}
      {selectedKepid && (() => {
        const selected = exoplanetData.planets.find(p => p.kepid === selectedKepid)
        if (!selected || !selected.x_pc) return null
        
        return (
          <mesh
            position={[
              selected.x_pc * PARSEC_TO_SCENE_UNIT,
              (selected.z_pc || 0) * PARSEC_TO_SCENE_UNIT,
              -(selected.y_pc || 0) * PARSEC_TO_SCENE_UNIT
            ]}
          >
            <sphereGeometry args={[0.0002, 16, 16]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.8}
            />
            {/* Dış halo */}
            <mesh scale={[2, 2, 2]}>
              <sphereGeometry args={[0.0002, 16, 16]} />
              <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={0.2}
                side={THREE.BackSide}
              />
            </mesh>
          </mesh>
        )
      })()}
    </group>
  )
}
