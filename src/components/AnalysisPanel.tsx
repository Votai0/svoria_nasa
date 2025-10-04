import { useState } from 'react'
import type { Planet } from '../types'
import type { 
  ExoplanetTarget, 
  LightCurveData, 
  PeriodogramData, 
  PhaseFoldedData,
  BLSResult,
  ModelPrediction,
  CatalogInfo 
} from '../types/exoplanet'
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
  selectedPlanet: Planet | null
}

export default function AnalysisPanel({ selectedTarget, selectedPlanet }: Props) {
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
  
  // 1. Light curve yükle
  const handleLoadLightCurve = async () => {
    if (!selectedTarget) return
    
    setError(null)
    setIsLoadingLC(true)
    
    try {
      const data = await fetchLightCurve(selectedTarget.id, dataType)
      setLightCurve(data)
      
      // Katalog bilgilerini de yükle
      setIsLoadingCatalog(true)
      const catalog = await fetchCatalogInfo(selectedTarget.id)
      setCatalogInfo(catalog)
      setIsLoadingCatalog(false)
    } catch (err) {
      setError('Işık eğrisi yüklenirken hata oluştu')
      console.error(err)
    } finally {
      setIsLoadingLC(false)
    }
  }
  
  // 2. BLS analizi
  const handleRunBLS = async () => {
    if (!lightCurve) return
    
    setError(null)
    setIsLoadingBLS(true)
    setActiveTab('periodogram')
    
    try {
      const result = await runBLSAnalysis(lightCurve)
      setPeriodogram(result)
      
      // En iyi periyodu otomatik seç
      if (result.bestPeriods.length > 0) {
        handleSelectPeriod(result.bestPeriods[0])
      }
    } catch (err) {
      setError('BLS analizi başarısız oldu')
      console.error(err)
    } finally {
      setIsLoadingBLS(false)
    }
  }
  
  // 3. Periyot seç ve foldla
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
      setError('Faz katlaması başarısız oldu')
      console.error(err)
    } finally {
      setIsLoadingFolded(false)
    }
  }
  
  // 4. AI tahmini
  const handlePredict = async () => {
    if (!selectedPeriod || !lightCurve) return
    
    setError(null)
    setIsLoadingPrediction(true)
    setActiveTab('model')
    
    try {
      const result = await predictPlanetCandidate(selectedPeriod, lightCurve)
      setPrediction(result)
    } catch (err) {
      setError('AI tahmini başarısız oldu')
      console.error(err)
    } finally {
      setIsLoadingPrediction(false)
    }
  }
  
  // Hedef değiştiğinde sıfırla
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
  
  // Hedef değişimini izle
  const currentTargetId = selectedTarget?.id
  const prevTargetId = lightCurve?.targetId
  if (currentTargetId && currentTargetId !== prevTargetId && !isLoadingLC) {
    resetAnalysis()
    handleLoadLightCurve()
  }
  
  const tabs: { id: AnalysisTab; label: string; icon: string; disabled?: boolean }[] = [
    { id: 'lightcurve', label: 'Işık Eğrisi', icon: '📊' },
    { id: 'periodogram', label: 'Periodogram', icon: '📈', disabled: !periodogram },
    { id: 'folded', label: 'Katlanmış', icon: '🌓', disabled: !phaseFolded },
    { id: 'model', label: 'AI Tahmin', icon: '🤖', disabled: !prediction },
    { id: 'catalog', label: 'Katalog', icon: '📚', disabled: !catalogInfo }
  ]
  
  return (
    <div style={{
      position: 'absolute',
      right: 16,
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
      zIndex: 100,
      display: 'grid',
      gridTemplateRows: 'auto auto 1fr auto'
    }}>
      {/* Header Section */}
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
            {selectedPlanet ? 'Gezegen Bilgileri' : 'Exoplanet Analysis'}
          </div>
          {(selectedTarget || selectedPlanet) && (
            <div style={{
              fontSize: 18,
              fontWeight: 500,
              color: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {selectedPlanet ? selectedPlanet.name : selectedTarget?.name}
            </div>
          )}
        </div>
        
        {/* Navigation Tabs - sadece exoplanet için */}
        {!selectedPlanet && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 6,
            marginBottom: 12
          }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              title={tab.label}
              style={{
                padding: '10px 8px',
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
                fontSize: 20,
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                opacity: tab.disabled ? 0.4 : 1
              }}
            >
              {tab.icon}
            </button>
          ))}
          </div>
        )}

        {/* Action Button - sadece exoplanet için */}
        {!selectedPlanet && lightCurve && selectedPeriod && !prediction && (
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
        overflow: 'auto',
        position: 'relative'
      }}>
        {!selectedTarget && !selectedPlanet ? (
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
              Bir gezegen veya exoplanet seçin
            </div>
          </div>
        ) : selectedPlanet ? (
          <PlanetInfoPanel planet={selectedPlanet} />
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
                selectedPeriod={selectedPeriod || undefined}
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
              />
            )}
          </>
        )}
      </div>
      
      {/* Status Footer - sadece exoplanet için */}
      {selectedTarget && !selectedPlanet && (
        <div style={{
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
  )
}

// Solar Sistem gezegeni bilgi paneli
function PlanetInfoPanel({ planet }: { planet: Planet }) {
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '24px',
      color: 'white'
    }}>
      <div style={{
        marginBottom: 24,
        textAlign: 'center'
      }}>
        <div style={{
          width: 120,
          height: 120,
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: planet.color,
          boxShadow: `0 0 40px ${planet.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48
        }}>
          {planet.name === 'Güneş' ? '☀️' : '🪐'}
        </div>
        <h2 style={{
          fontSize: 28,
          fontWeight: 600,
          margin: 0,
          color: planet.color
        }}>
          {planet.name}
        </h2>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <InfoRow label="Güneş'e Uzaklık" value={planet.distance === 0 ? 'Merkez' : `${planet.distance} AU`} />
        <InfoRow label="Çap" value={`${planet.size.toFixed(1)} birim`} />
        <InfoRow label="Yörünge Hızı" value={planet.distance === 0 ? 'Sabit' : `${planet.orbitSpeed.toFixed(6)} rad/gün`} />
        <InfoRow 
          label="Dönüş Periyodu" 
          value={planet.rotationPeriod === 0 
            ? 'Yok' 
            : `${Math.abs(planet.rotationPeriod).toFixed(1)} Dünya günü${planet.rotationPeriod < 0 ? ' (retrograde)' : ''}`
          } 
        />
        
        {planet.moons && planet.moons.length > 0 && (
          <>
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Uydular ({planet.moons.length})
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                {planet.moons.map((moon) => (
                  <div
                    key={moon.name}
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8
                    }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: moon.color,
                        boxShadow: `0 0 8px ${moon.color}`
                      }} />
                      <div style={{
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        {moon.name}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'rgba(255, 255, 255, 0.6)',
                      paddingLeft: 18
                    }}>
                      Uzaklık: {moon.distance.toFixed(1)} birim • Çap: {moon.size.toFixed(2)} birim
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {planet.hasRings && (
          <div style={{
            marginTop: 8,
            padding: '12px 16px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: 8,
            fontSize: 13,
            color: 'rgba(255, 215, 0, 0.9)'
          }}>
            ✨ Bu gezegen halka sistemine sahiptir
          </div>
        )}

        <div style={{
          marginTop: 16,
          padding: '16px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 8,
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: 1.6
        }}>
          <strong style={{ color: 'rgba(99, 102, 241, 1)' }}>ℹ️ Not:</strong> Bu veriler Solar Sistemimizin gerçek astronomik ölçümlerine dayanmaktadır. Yörünge hızları ve dönüş periyotları NASA JPL verilerinden alınmıştır.
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 8,
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: 500
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.95)',
        fontWeight: 600,
        fontFamily: 'monospace'
      }}>
        {value}
      </div>
    </div>
  )
}

