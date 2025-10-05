import { useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useNavigate } from 'react-router-dom'
import type { TimeControl } from '../types'
import HyperparameterModal from './HyperparameterModal'
import type { HyperparameterConfig } from './HyperparameterModal'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_KEPLER_API_URL || '/api'

// 1 AU = 149,597,870.7 km
// 1 light year = 9,460,730,472,580.8 km
// 1 AU = 0.0000158125 light years
const AU_TO_LIGHT_YEARS = 0.0000158125

// Convert scene units to AU (DISTANCE_SCALE = 10)
const SCENE_UNITS_TO_AU = 0.1

type Props = {
  timeControl: TimeControl
  onDistanceChange: (distance: number) => void
}

// Tracker component running inside Canvas
export function CameraDistanceTracker({ timeControl, onDistanceChange }: Props) {
  const { camera } = useThree()

  useFrame(() => {
    // Calculate Earth's position
    // Earth is 10 units away from the Sun (1 AU * 10)
    const earthDistance = 10 // REAL_DISTANCES_AU.earth * DISTANCE_SCALE
    
    // Calculate Earth's angle according to time control
    // Earth's orbital period is 365.25 days
    const orbitalPeriodInDays = 365.25
    const angle = ((timeControl.currentTime % orbitalPeriodInDays) / orbitalPeriodInDays) * (2 * Math.PI) + 2.1 // startAngle = 2.1
    
    // Earth's 3D position
    const earthPos = new Vector3(
      Math.cos(angle) * earthDistance,
      0,
      Math.sin(angle) * earthDistance
    )
    
    // Distance between camera and Earth
    const distanceInSceneUnits = camera.position.distanceTo(earthPos)
    
    // Convert scene units to AU, then to light years
    const distanceInAU = distanceInSceneUnits * SCENE_UNITS_TO_AU
    const distanceInLightYears = distanceInAU * AU_TO_LIGHT_YEARS
    
    onDistanceChange(distanceInLightYears)
  })

  return null // Will be rendered inside Canvas but won't be visible as UI
}

// UI component to be used outside Canvas
export default function CameraDistanceDisplay({ distance, isVisible, onToggle }: { 
  distance: number
  isVisible: boolean
  onToggle: () => void
}) {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showModal, setShowModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setShowModal(true)
  }

  const handleModalSubmit = async (config: HyperparameterConfig) => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append('training_file', selectedFile)
      formData.append('model_name', config.model_name)
      formData.append('use_existing_data', config.use_existing_data ? 'true' : 'false')
      
      // XGBoost hyperparameters
      formData.append('max_depth', config.max_depth.toString())
      formData.append('learning_rate', config.learning_rate.toString())
      formData.append('n_estimators', config.n_estimators.toString())
      formData.append('min_child_weight', config.min_child_weight.toString())
      formData.append('gamma', config.gamma.toString())
      formData.append('subsample', config.subsample.toString())
      formData.append('colsample_bytree', config.colsample_bytree.toString())
      formData.append('reg_alpha', config.reg_alpha.toString())
      formData.append('reg_lambda', config.reg_lambda.toString())
      
      // Training configuration
      formData.append('test_size', config.test_size.toString())
      formData.append('val_size', config.val_size.toString())
      formData.append('n_folds', config.n_folds.toString())
      formData.append('early_stopping_rounds', config.early_stopping_rounds.toString())

      // Debug: Log all FormData entries
      console.log('📤 Sending training request with config:', config)
      console.log('📤 FormData entries:')
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? `File(${value.name})` : value}`)
      }

      const response = await fetch(`${API_BASE_URL}/train`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      setUploadStatus('✅ Training started!')
      console.log('Training started:', result)
      
      // Clear message after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setUploadStatus(null), 5000)
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
        title={isVisible ? 'Hide distance indicator' : 'Show distance indicator'}
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
            Distance from Earth
          </div>
          <div style={{ fontSize: '18px', color: '#fff' }}>
            {distance < 0.00001 
              ? (distance * 9460730472580.8).toFixed(0) + ' km'
              : distance < 0.001
              ? (distance * 63241.077).toFixed(2) + ' AU'
              : distance < 1
              ? (distance * 63241.077).toFixed(1) + ' AU'
              : distance.toFixed(3) + ' light years'
            }
          </div>
        </div>

        {/* CSV Upload Button */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 12 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="train-csv-upload"
            disabled={isUploading}
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
              letterSpacing: '0.5px',
              opacity: isUploading ? 0.6 : 1
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
            {isUploading ? '⏳ Training...' : '📄 Add Train CSV'}
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

      {/* Hyperparameter Modal */}
      <HyperparameterModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        fileName={selectedFile?.name || ''}
      />

      {/* Model Performance Button - Next to Distance Display */}
      <button
        onClick={() => navigate('/model-performance')}
        style={{
          position: 'absolute',
          bottom: 20,
          left: isVisible ? 'calc(50% - 300px)' : 'calc(50% - 180px)',
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
