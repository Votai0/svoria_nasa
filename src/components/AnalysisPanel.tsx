import { useState } from 'react'
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
}

export default function AnalysisPanel({ selectedTarget }: Props) {
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
      overflow: 'hidden',
      zIndex: 100
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
        height: 'calc(100% - 180px)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {!selectedTarget ? (
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
              Select an exoplanet target to begin analysis
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
                selectedPeriod={selectedPeriod}
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
  )
}

