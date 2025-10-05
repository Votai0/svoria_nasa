import { useState, useEffect } from 'react'
import type { 
  ExoplanetTarget,
  KOIPlanet,
  LightCurveData, 
  PeriodogramData, 
  PhaseFoldedData,
  BLSResult,
  ModelPrediction,
  CatalogInfo 
} from '../types/exoplanet'
import type { Planet } from '../types'
import LightCurvePanel from './LightCurvePanel'
import PeriodogramPanel from './PeriodogramPanel'
import PhaseFoldedPanel from './PhaseFoldedPanel'
import ModelPredictionPanel from './ModelPredictionPanel'
import CatalogPanel from './CatalogPanel'
import {
  fetchLightCurve,
  runBLSAnalysis,
  foldLightCurve,
  predictPlanetCandidate,
  fetchCatalogInfo
} from '../services/exoplanetAPI'

type AnalysisTab = 'lightcurve' | 'periodogram' | 'folded' | 'model' | 'catalog'

type Props = {
  selectedTarget: ExoplanetTarget | null
  selectedKOI?: KOIPlanet | null
  selectedPlanet?: Planet | null
  isVisible: boolean
  onToggle: () => void
}

export default function AnalysisPanel({ selectedTarget, selectedKOI, selectedPlanet, isVisible, onToggle }: Props) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('lightcurve')
  const [dataType, setDataType] = useState<'SAP' | 'PDCSAP'>('PDCSAP')
  
  // Data states
  const [lightCurve, setLightCurve] = useState<LightCurveData | null>(null)
  const [periodogram, setPeriodogram] = useState<PeriodogramData | null>(null)
  const [phaseFolded, setPhaseFolded] = useState<PhaseFoldedData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<BLSResult | null>(null)
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null)
  const [catalogInfo, setCatalogInfo] = useState<CatalogInfo | null>(null)
  
  // Loading states
  const [isLoadingLC, setIsLoadingLC] = useState(false)
  const [isLoadingBLS, setIsLoadingBLS] = useState(false)
  const [isLoadingFolded, setIsLoadingFolded] = useState(false)
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false)
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // 1. Load light curve (with KOI parameters) - AUTOMATIC PIPELINE
  const handleLoadLightCurve = async () => {
    if (!selectedTarget || !selectedKOI) return
    
    setError(null)
    setIsLoadingLC(true)
    
    try {
      // Generate light curve using KOI parameters
      const data = await fetchLightCurve(selectedTarget.id, dataType, undefined, selectedKOI)
      setLightCurve(data)
      
      console.log('📈 Light curve loaded:', {
        period: selectedKOI.koi_period,
        depth: selectedKOI.koi_depth,
        duration: selectedKOI.koi_duration,
        snr: selectedKOI.koi_model_snr
      })
      
      // Generate catalog info from KOI data (parallel)
      setIsLoadingCatalog(true)
      const catalog = await fetchCatalogInfo(selectedTarget.id, selectedKOI)
      setCatalogInfo(catalog)
      setIsLoadingCatalog(false)
      
      // AUTOMATIC: Start BLS analysis
      setIsLoadingBLS(true)
      const blsResult = await runBLSAnalysis(data, selectedKOI)
      setPeriodogram(blsResult)
      
      console.log('📈 BLS analysis completed:', {
        bestPeriod: blsResult.bestPeriods[0]?.period,
        koiCatalogPeriod: selectedKOI.koi_period
      })
      
      // AUTOMATIC: Select best period and fold
      if (blsResult.bestPeriods.length > 0) {
        const bestPeriod = blsResult.bestPeriods[0]
        setSelectedPeriod(bestPeriod)
        
        setIsLoadingFolded(true)
        const folded = await foldLightCurve(
          data,
          bestPeriod.period,
          bestPeriod.t0,
          dataType
        )
        setPhaseFolded(folded)
        setIsLoadingFolded(false)
        
        console.log('🌓 Phase folding completed')
        
        // AUTOMATIC: Make AI prediction
        setIsLoadingPrediction(true)
        const pred = await predictPlanetCandidate(bestPeriod, data, selectedKOI)
        setPrediction(pred)
        setIsLoadingPrediction(false)
        
        console.log('🤖 AI Prediction:', {
          probability: pred.probability,
          disposition: selectedKOI.koi_pdisposition,
          confidence: pred.confidence
        })
      }
      
      setIsLoadingBLS(false)
      
    } catch (err) {
      setError('Analysis pipeline error: ' + (err as Error).message)
      console.error(err)
      setIsLoadingLC(false)
      setIsLoadingBLS(false)
      setIsLoadingFolded(false)
      setIsLoadingPrediction(false)
      setIsLoadingCatalog(false)
    } finally {
      setIsLoadingLC(false)
    }
  }
  
  // 2. BLS analysis (referenced to KOI period)
  const handleRunBLS = async () => {
    if (!lightCurve || !selectedKOI) return
    
    setError(null)
    setIsLoadingBLS(true)
    setActiveTab('periodogram')
    
    try {
      // BLS analysis with KOI data
      const result = await runBLSAnalysis(lightCurve, selectedKOI)
      setPeriodogram(result)
      
      // Automatically select best period (will be KOI catalog period)
      if (result.bestPeriods.length > 0) {
        handleSelectPeriod(result.bestPeriods[0])
      }
      
      console.log('📈 BLS analysis completed:', {
        bestPeriod: result.bestPeriods[0]?.period,
        koiCatalogPeriod: selectedKOI.koi_period,
        match: Math.abs((result.bestPeriods[0]?.period || 0) - (selectedKOI.koi_period || 0)) < 0.01
      })
    } catch (err) {
      setError('BLS analysis failed')
      console.error(err)
    } finally {
      setIsLoadingBLS(false)
    }
  }
  
  // 3. Select period and fold
  const handleSelectPeriod = async (period: BLSResult) => {
    if (!lightCurve) return
    
    setSelectedPeriod(period)
    setIsLoadingFolded(true)
    setActiveTab('folded')
    
    try {
      const folded = await foldLightCurve(
        lightCurve,
        period.period,
        period.t0,
        dataType
      )
      setPhaseFolded(folded)
    } catch (err) {
      setError('Phase folding failed')
      console.error(err)
    } finally {
      setIsLoadingFolded(false)
    }
  }
  
  // 4. AI prediction (with KOI catalog data)
  const handlePredict = async () => {
    if (!selectedPeriod || !lightCurve) return
    
    setError(null)
    setIsLoadingPrediction(true)
    setActiveTab('model')
    
    try {
      // AI prediction using KOI data
      const result = await predictPlanetCandidate(selectedPeriod, lightCurve, selectedKOI || undefined)
      setPrediction(result)
      
      console.log('🤖 AI Prediction:', {
        probability: result.probability,
        disposition: selectedKOI?.koi_pdisposition,
        confirmed: selectedKOI?.koi_disposition,
        confidence: result.confidence
      })
    } catch (err) {
      setError('AI prediction failed')
      console.error(err)
    } finally {
      setIsLoadingPrediction(false)
    }
  }
  
  // Reset when target changes
  const resetAnalysis = () => {
    setLightCurve(null)
    setPeriodogram(null)
    setPhaseFolded(null)
    setSelectedPeriod(null)
    setPrediction(null)
    setCatalogInfo(null)
    setError(null)
    setActiveTab('lightcurve')
  }
  
  // Clear analysis data when planet is selected
  useEffect(() => {
    if (selectedPlanet) {
      resetAnalysis()
    }
  }, [selectedPlanet])
  
  // Monitor target changes - auto-load if KOI data exists
  const currentTargetId = selectedTarget?.id
  const prevTargetId = lightCurve?.targetId
  if (currentTargetId && currentTargetId !== prevTargetId && !isLoadingLC && selectedKOI) {
    resetAnalysis()
    handleLoadLightCurve()
  }
  
  const tabs: { id: AnalysisTab; label: string; icon: string; disabled?: boolean }[] = [
    { id: 'lightcurve', label: 'Light Curve', icon: '📊' },
    { id: 'periodogram', label: 'Periodogram', icon: '📈', disabled: !periodogram },
    { id: 'folded', label: 'Folded', icon: '🌓', disabled: !phaseFolded },
    { id: 'model', label: 'AI Predict', icon: '🤖', disabled: !prediction },
    { id: 'catalog', label: 'Catalog', icon: '📚', disabled: !catalogInfo }
  ]
  
  return (
    <>
      {/* Toggle Button - Outside panel on left middle when open */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: isVisible ? 'calc(16px + min(480px, calc(100vw - 440px)) + 8px)' : 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 101,
          background: '#1a1a1a',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          width: 36,
          height: 36,
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        title={isVisible ? 'Hide panel' : 'Show panel'}
      >
        {isVisible ? '‹' : '📊'}
      </button>
      
      <div style={{
        position: 'absolute',
        right: isVisible ? 16 : -560,
        top: 16,
        bottom: 16,
        width: 'min(480px, calc(100vw - 440px))',
        minWidth: 400,
        maxWidth: 520,
        background: '#1a1a1a',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        zIndex: 100,
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}>
      {/* Header Section - Only show when exoplanet is selected */}
      {!selectedPlanet && (
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: '#202020'
        }}>
          <div style={{
            marginBottom: 16
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: 0.8,
              color: 'rgba(147, 151, 234, 0.9)',
              marginBottom: 6,
              textTransform: 'uppercase'
            }}>
              Exoplanet Analysis
            </div>
            {selectedTarget && (
              <div style={{
                fontSize: 18,
                fontWeight: 500,
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {selectedTarget.name}
              </div>
            )}
          </div>
          
          {/* Navigation Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 6,
            marginBottom: 12,
            alignItems: 'end'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                title={tab.label}
                style={{
                  padding: '8px 4px',
                  background: activeTab === tab.id 
                    ? 'rgba(147, 151, 234, 0.15)' 
                    : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id
                    ? '2px solid rgb(147, 151, 234)'
                    : '2px solid transparent',
                  borderRadius: '4px 4px 0 0',
                  color: activeTab === tab.id 
                    ? '#ffffff' 
                    : tab.disabled 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'rgba(255, 255, 255, 0.6)',
                  cursor: tab.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  opacity: tab.disabled ? 0.4 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 4,
                  height: 62
                }}
              >
                <span style={{ 
                  fontSize: 18,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 22,
                  width: '100%'
                }}>
                  {tab.icon}
                </span>
                <span style={{ 
                  fontSize: 9, 
                  fontWeight: 600,
                  lineHeight: 1.2,
                  textAlign: 'center',
                  display: 'block',
                  height: 20,
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingTop: 2
                }}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Action Button */}
          {lightCurve && selectedPeriod && !prediction && (
            <button
              onClick={handlePredict}
              disabled={isLoadingPrediction}
              style={{
                width: '100%',
                padding: '12px',
                background: isLoadingPrediction 
                  ? 'rgba(147, 151, 234, 0.3)' 
                  : 'rgba(147, 151, 234, 0.9)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 13,
                fontWeight: 500,
                cursor: isLoadingPrediction ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(147, 151, 234, 0.3)',
                letterSpacing: 0.3
              }}
            >
              {isLoadingPrediction ? 'Processing...' : '🎯 Run AI Prediction'}
            </button>
          )}
        </div>
      )}
      
      {/* Error Alert */}
      {error && (
        <div style={{
          padding: '12px 24px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'rgb(248, 180, 180)',
          fontSize: 12
        }}>
          <div style={{
            width: '100%'
          }}>
            <span style={{ marginRight: 8 }}>⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                color: 'rgb(248, 180, 180)',
                cursor: 'pointer',
                fontSize: 18,
                padding: 0,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div style={{ 
        height: selectedPlanet ? '100%' : 'calc(100% - 180px)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {selectedPlanet ? (
          <PlanetInfoContent planet={selectedPlanet} />
        ) : !selectedTarget ? (
          <div style={{
            height: '100%',
            textAlign: 'center',
            paddingTop: '25%'
          }}>
            <div style={{ 
              fontSize: 72,
              marginBottom: 20,
              opacity: 0.3
            }}>🔭</div>
            <div style={{ 
              fontSize: 15,
              color: 'rgba(255, 255, 255, 0.5)',
              maxWidth: 300,
              margin: '0 auto',
              lineHeight: 1.5
            }}>
              Select an exoplanet or planet
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'lightcurve' && (
              <LightCurvePanel
                data={lightCurve}
                isLoading={isLoadingLC}
                onAnalyze={lightCurve ? handleRunBLS : undefined}
                selectedDataType={dataType}
                onDataTypeChange={setDataType}
              />
            )}
            
            {activeTab === 'periodogram' && (
              <PeriodogramPanel
                data={periodogram}
                isLoading={isLoadingBLS}
                onPeriodSelect={handleSelectPeriod}
                selectedPeriod={selectedPeriod ?? undefined}
              />
            )}
            
            {activeTab === 'folded' && (
              <PhaseFoldedPanel
                data={phaseFolded}
                periodInfo={selectedPeriod}
                isLoading={isLoadingFolded}
              />
            )}
            
            {activeTab === 'model' && (
              <ModelPredictionPanel
                prediction={prediction}
                isLoading={isLoadingPrediction}
                onPredict={lightCurve && selectedPeriod ? handlePredict : undefined}
              />
            )}
            
            {activeTab === 'catalog' && (
              <CatalogPanel
                catalogInfo={catalogInfo}
                isLoading={isLoadingCatalog}
                koiData={selectedKOI}
              />
            )}
          </>
        )}
      </div>
      
      {/* Status Footer */}
      {selectedTarget && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 24px',
          background: '#202020',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{
            width: '100%',
            fontSize: 11,
            fontFamily: 'monospace',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: lightCurve ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
              marginRight: 6,
              verticalAlign: 'middle'
            }} />
            <span style={{ marginRight: 16, color: lightCurve ? '#ffffff' : 'rgba(255, 255, 255, 0.4)' }}>Data</span>
            
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: periodogram ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
              marginRight: 6,
              verticalAlign: 'middle'
            }} />
            <span style={{ marginRight: 16, color: periodogram ? '#ffffff' : 'rgba(255, 255, 255, 0.4)' }}>BLS</span>
            
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: phaseFolded ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
              marginRight: 6,
              verticalAlign: 'middle'
            }} />
            <span style={{ marginRight: 16, color: phaseFolded ? '#ffffff' : 'rgba(255, 255, 255, 0.4)' }}>Fold</span>
            
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: prediction ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
              marginRight: 6,
              verticalAlign: 'middle'
            }} />
            <span style={{ color: prediction ? '#ffffff' : 'rgba(255, 255, 255, 0.4)' }}>AI</span>
            
            {prediction && (
              <span style={{
                float: 'right',
                padding: '4px 10px',
                background: 'rgba(147, 151, 234, 0.2)',
                borderRadius: 4,
                color: 'rgb(196, 181, 253)',
                fontWeight: 600,
                fontSize: 11
              }}>
                {(prediction.probability * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}

// Planet info content
function PlanetInfoContent({ planet }: { planet: Planet }) {
  const getPlanetDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      'Sun': 'The star at the center of our solar system. 4.6 billion years old and produces energy through hydrogen fusion.',
      'Mercury': 'The closest planet to the Sun. Daytime temperature reaches 430°C, while it drops to -180°C at night.',
      'Venus': 'The hottest planet in the solar system. Its dense atmosphere creates a greenhouse effect raising temp to 470°C.',
      'Earth': 'The only known habitable planet. 71% covered with water and has a protective atmosphere.',
      'Mars': 'The red planet. Reddish due to iron oxide. Believed to have had liquid water in the past.',
      'Jupiter': 'The largest planet in the solar system. A giant gas planet with a powerful magnetic field.',
      'Saturn': 'Famous for its magnificent rings. The rings are made of ice and rock particles.',
      'Uranus': 'An interesting planet that rotates on its side. Its blue-green color comes from methane gas.',
      'Neptune': 'The farthest planet from the Sun. Has winds reaching speeds of 2,000 km/h.'
    }
    return descriptions[name] || 'Detailed information about this celestial body is not available.'
  }

  const formatOrbitalPeriod = (orbitSpeed: number): string => {
    const BASE_SPEED = 0.01
    const periodInYears = BASE_SPEED / orbitSpeed
    
    if (periodInYears < 1) {
      const days = Math.round(periodInYears * 365.25)
      return `${days} day${days !== 1 ? 's' : ''}`
    } else if (periodInYears < 2) {
      return '1 year'
    } else {
      return `${periodInYears.toFixed(1)} years`
    }
  }

  const formatRotationPeriod = (period: number): string => {
    const absPeriod = Math.abs(period)
    const isRetrograde = period < 0
    
    if (absPeriod < 1) {
      const hours = Math.round(absPeriod * 24)
      return `~${hours} hour${hours !== 1 ? 's' : ''}${isRetrograde ? ' (retrograde)' : ''}`
    } else if (absPeriod === 1) {
      return '1 day'
    } else {
      return `${absPeriod.toFixed(1)} days${isRetrograde ? ' (retrograde)' : ''}`
    }
  }

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '24px'
    }}>
      {/* Planet name */}
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        marginBottom: 16,
        background: 'linear-gradient(135deg, #fff 0%, #a0a0ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        {planet.name}
      </div>

      {/* Description */}
      <p style={{
        fontSize: 14,
        lineHeight: 1.6,
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: 24
      }}>
        {getPlanetDescription(planet.name)}
      </p>

      {/* Properties */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {planet.distance > 0 && (
          <>
            <InfoRow
              label="Distance from Sun"
              value={`${planet.distance} AU`}
              color="#FFD700"
            />
            <InfoRow
              label="Orbital Period"
              value={formatOrbitalPeriod(planet.orbitSpeed)}
              color="#FFA500"
            />
          </>
        )}

        <InfoRow
          label="Rotation Period"
          value={formatRotationPeriod(planet.rotationPeriod)}
          color="#87CEEB"
        />

        {planet.moons && planet.moons.length > 0 && (
          <InfoRow
            label="Number of Moons"
            value={`${planet.moons.length} moon${planet.moons.length !== 1 ? 's' : ''}`}
            color="#DDA0DD"
          />
        )}

        {planet.hasRings && (
          <InfoRow
            label="Special Feature"
            value="Ring system"
            color="#F0E68C"
          />
        )}
      </div>

      {/* Moons */}
      {planet.moons && planet.moons.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 12,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Moons
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {planet.moons.map((moon, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderLeft: '3px solid rgba(147, 151, 234, 0.5)'
                }}
              >
                <span style={{ fontWeight: 600, color: '#fff' }}>{moon.name}</span>
                {' • '}
                <span>Orbit: {formatOrbitalPeriod(moon.orbitSpeed)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Info row
function InfoRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      borderLeft: `3px solid ${color}`
    }}>
      <span style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#fff'
      }}>
        {value}
      </span>
    </div>
  )
}

