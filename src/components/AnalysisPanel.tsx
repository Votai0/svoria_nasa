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
      width: 'min(520px, calc(100vw - 440px))',
      minWidth: 420,
      maxWidth: 600,
      maxHeight: '80%',
      background: 'rgba(10, 10, 15, 0.92)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: 16,
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 100,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: 'rgba(147, 51, 234, 1)',
              marginBottom: 4
            }}>
              EXOPLANET ANALİZİ
            </div>
            {selectedTarget && (
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {selectedTarget.name}
              </div>
            )}
          </div>
          
          {lightCurve && selectedPeriod && !prediction && (
            <button
              onClick={handlePredict}
              disabled={isLoadingPrediction}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(79, 70, 229, 0.9))',
                border: '1px solid rgba(147, 51, 234, 0.5)',
                borderRadius: 8,
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                cursor: isLoadingPrediction ? 'wait' : 'pointer',
                opacity: isLoadingPrediction ? 0.6 : 1,
                boxShadow: '0 2px 12px rgba(147, 51, 234, 0.4)',
                whiteSpace: 'nowrap'
              }}
            >
              🎯 AI Tahmin
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 4,
          marginTop: 10
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
                  ? 'rgba(147, 51, 234, 0.25)' 
                  : 'rgba(255, 255, 255, 0.04)',
                border: activeTab === tab.id
                  ? '1px solid rgba(147, 51, 234, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                color: tab.disabled ? 'rgba(255, 255, 255, 0.25)' : 'white',
                fontSize: 9,
                fontWeight: 600,
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                opacity: tab.disabled ? 0.4 : 1
              }}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, lineHeight: 1 }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Error Bar */}
      {error && (
        <div style={{
          padding: '8px 14px',
          background: 'rgba(239, 68, 68, 0.15)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'rgb(252, 165, 165)',
          fontSize: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span style={{ fontSize: 12 }}>⚠️</span>
          <span style={{ flex: 1, fontSize: 10 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgb(252, 165, 165)',
              cursor: 'pointer',
              fontSize: 14,
              padding: 0,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!selectedTarget ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ fontSize: 64 }}>🔭</div>
            <div style={{ fontSize: 16, textAlign: 'center', maxWidth: 320 }}>
              Bir exoplanet hedefi seçerek analize başlayın
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
      
      {/* Progress Indicator */}
      {selectedTarget && (
        <div style={{
          padding: '8px 14px',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          fontSize: 9,
          fontFamily: 'monospace'
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: lightCurve ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.25)',
            boxShadow: lightCurve ? '0 0 6px rgba(34, 197, 94, 0.6)' : 'none'
          }} />
          <span style={{ color: lightCurve ? 'white' : 'rgba(255, 255, 255, 0.4)', fontSize: 9 }}>Data</span>
          
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: periodogram ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.25)',
            boxShadow: periodogram ? '0 0 6px rgba(34, 197, 94, 0.6)' : 'none'
          }} />
          <span style={{ color: periodogram ? 'white' : 'rgba(255, 255, 255, 0.4)', fontSize: 9 }}>BLS</span>
          
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: phaseFolded ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.25)',
            boxShadow: phaseFolded ? '0 0 6px rgba(34, 197, 94, 0.6)' : 'none'
          }} />
          <span style={{ color: phaseFolded ? 'white' : 'rgba(255, 255, 255, 0.4)', fontSize: 9 }}>Fold</span>
          
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: prediction ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.25)',
            boxShadow: prediction ? '0 0 6px rgba(34, 197, 94, 0.6)' : 'none'
          }} />
          <span style={{ color: prediction ? 'white' : 'rgba(255, 255, 255, 0.4)', fontSize: 9 }}>AI</span>
          
          {prediction && (
            <div style={{
              marginLeft: 'auto',
              padding: '3px 8px',
              background: 'rgba(147, 51, 234, 0.25)',
              borderRadius: 6,
              color: 'rgb(196, 181, 253)',
              fontWeight: 700,
              fontSize: 9
            }}>
              {(prediction.probability * 100).toFixed(0)}%
            </div>
          )}
        </div>
      )}
    </div>
  )
}

