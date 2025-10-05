import { useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useNavigate } from 'react-router-dom'
import type { TimeControl } from '../types'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_KEPLER_API_URL || '/api'

// 1 AU = 149,597,870.7 km
// 1 ışık yılı = 9,460,730,472,580.8 km
// 1 AU = 0.0000158125 ışık yılı
const AU_TO_LIGHT_YEARS = 0.0000158125

// Sahne birimini AU'ya çevir (DISTANCE_SCALE = 10)
const SCENE_UNITS_TO_AU = 0.1

type Props = {
  timeControl: TimeControl
  onDistanceChange: (distance: number) => void
}

// Canvas içinde çalışan tracker bileşeni
export function CameraDistanceTracker({ timeControl, onDistanceChange }: Props) {
  const { camera } = useThree()

  useFrame(() => {
    // Dünya'nın pozisyonunu hesapla
    // Dünya Güneş'ten 10 birim uzaklıkta (1 AU * 10)
    const earthDistance = 10 // REAL_DISTANCES_AU.earth * DISTANCE_SCALE
    
    // Zaman kontrolüne göre Dünya'nın açısını hesapla
    // Dünya'nın yörünge periyodu 365.25 gün
    const orbitalPeriodInDays = 365.25
    const angle = ((timeControl.currentTime % orbitalPeriodInDays) / orbitalPeriodInDays) * (2 * Math.PI) + 2.1 // startAngle = 2.1
    
    // Dünya'nın 3D pozisyonu
    const earthPos = new Vector3(
      Math.cos(angle) * earthDistance,
      0,
      Math.sin(angle) * earthDistance
    )
    
    // Kamera ile Dünya arasındaki mesafe
    const distanceInSceneUnits = camera.position.distanceTo(earthPos)
    
    // Sahne birimlerini AU'ya, sonra ışık yılına çevir
    const distanceInAU = distanceInSceneUnits * SCENE_UNITS_TO_AU
    const distanceInLightYears = distanceInAU * AU_TO_LIGHT_YEARS
    
    onDistanceChange(distanceInLightYears)
  })

  return null // Canvas içinde render edilecek ama UI olarak görünmeyecek
}

// Canvas dışında kullanılacak UI bileşeni
export default function CameraDistanceDisplay({ distance, isVisible, onToggle }: { 
  distance: number
  isVisible: boolean
  onToggle: () => void
}) {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('filename', file.name)

      const response = await fetch(`${API_BASE_URL}/train`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      setUploadStatus('✅ Yüklendi!')
      console.log('Train CSV uploaded:', result)
      
      // 2 saniye sonra mesajı temizle
      setTimeout(() => setUploadStatus(null), 2000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('❌ Hata!')
      setTimeout(() => setUploadStatus(null), 3000)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          bottom: 20,
          left: isVisible ? 'calc(50% + 140px)' : 'calc(50% - 18px)',
          transform: 'translateX(-50%)',
          zIndex: 101,
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          width: 36,
          height: 36,
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        title={isVisible ? 'Mesafe göstergesini gizle' : 'Mesafe göstergesini göster'}
      >
        {isVisible ? '×' : '📍'}
      </button>
      
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)',
          zIndex: 100,
          padding: '12px 24px',
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div>
          <div style={{ color: '#4A90E2', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Dünya'dan Uzaklık
          </div>
          <div style={{ fontSize: '18px', color: '#fff' }}>
            {distance < 0.00001 
              ? (distance * 9460730472580.8).toFixed(0) + ' km'
              : distance < 0.001
              ? (distance * 63241.077).toFixed(2) + ' AU'
              : distance < 1
              ? (distance * 63241.077).toFixed(1) + ' AU'
              : distance.toFixed(3) + ' ışık yılı'
            }
          </div>
        </div>

        {/* CSV Upload Button */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 12 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="train-csv-upload"
          />
          <label
            htmlFor="train-csv-upload"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: isUploading 
                ? 'rgba(234, 179, 8, 0.2)' 
                : 'rgba(99, 102, 241, 0.2)',
              border: isUploading 
                ? '1px solid rgba(234, 179, 8, 0.5)' 
                : '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              color: isUploading ? 'rgb(253, 224, 71)' : 'rgb(165, 180, 252)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading) {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'
              }
            }}
          >
            {isUploading ? '⏳ Yükleniyor...' : '📄 Add Train CSV'}
          </label>
          
          {/* Upload Status */}
          {uploadStatus && (
            <div style={{
              marginTop: 8,
              fontSize: 11,
              color: uploadStatus.includes('✅') ? 'rgb(134, 239, 172)' : 'rgb(248, 113, 113)',
              fontWeight: 600
            }}>
              {uploadStatus}
            </div>
          )}
        </div>
      </div>

      {/* Model Performance Button */}
      <button
        onClick={() => navigate('/model-performance')}
        style={{
          position: 'absolute',
          bottom: 20,
          left: isVisible ? 'calc(50% + 320px)' : 'calc(50% + 160px)',
          transform: 'translateX(-50%)',
          zIndex: 100,
          padding: '12px 20px',
          background: 'rgba(99, 102, 241, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          color: 'rgb(165, 180, 252)',
          fontFamily: 'monospace',
          fontSize: '13px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)'
          e.currentTarget.style.transform = 'translateX(-50%) translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'
          e.currentTarget.style.transform = 'translateX(-50%) translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.2)'
        }}
        title="View Model Performance"
      >
        <span style={{ fontSize: 16 }}>🤖</span>
        Model Performance
      </button>
    </>
  )
}
