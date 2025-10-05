import type { ModelPrediction } from '../types/exoplanet'

type Props = {
  prediction: ModelPrediction | null
  isLoading: boolean
  onPredict?: () => void
}

export default function ModelPredictionPanel({ prediction, isLoading, onPredict }: Props) {
  
  const getProbabilityColor = (prob: number, threshold: number) => {
    if (prob >= threshold) return {
      bg: 'rgba(34, 197, 94, 0.2)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: 'rgb(134, 239, 172)',
      label: 'YÜK SEK OLASILIK'
    }
    if (prob >= threshold * 0.7) return {
      bg: 'rgba(251, 191, 36, 0.2)',
      border: 'rgba(251, 191, 36, 0.4)',
      text: 'rgb(253, 224, 71)',
      label: 'ORTA OLASILIK'
    }
    return {
      bg: 'rgba(239, 68, 68, 0.2)',
      border: 'rgba(239, 68, 68, 0.4)',
      text: 'rgb(252, 165, 165)',
      label: 'DÜŞÜK OLASILIK'
    }
  }
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 16, gap: 16 }}>
      {isLoading ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16
        }}>
          <div style={{
            width: 50,
            height: 50,
            border: '5px solid rgba(147, 51, 234, 0.2)',
            borderTop: '5px solid rgb(147, 51, 234)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}>
            AI modeli analiz ediyor...
          </div>
        </div>
      ) : !prediction ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div style={{ fontSize: 56 }}>🤖</div>
          <div style={{ fontSize: 15, textAlign: 'center', maxWidth: 320 }}>
            Transit analizi tamamlandıktan sonra AI tahmini yapılabilir
          </div>
          {onPredict && (
            <button
              onClick={onPredict}
              style={{
                marginTop: 12,
                padding: '10px 24px',
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8), rgba(79, 70, 229, 0.8))',
                border: '1px solid rgba(147, 51, 234, 0.4)',
                borderRadius: 10,
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(147, 51, 234, 0.4)'
              }}
            >
              🎯 Tahmin Et
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Main Prediction Card */}
          <div style={{
            padding: 24,
            background: getProbabilityColor(prediction.probability, prediction.threshold).bg,
            border: `2px solid ${getProbabilityColor(prediction.probability, prediction.threshold).border}`,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              color: getProbabilityColor(prediction.probability, prediction.threshold).text
            }}>
              {getProbabilityColor(prediction.probability, prediction.threshold).label}
            </div>
            
            <div style={{
              fontSize: 56,
              fontWeight: 900,
              color: getProbabilityColor(prediction.probability, prediction.threshold).text,
              fontFamily: 'monospace',
              lineHeight: 1
            }}>
              {(prediction.probability * 100).toFixed(1)}%
            </div>
            
            <div style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center'
            }}>
              Planet Candidate Probability
            </div>
            
            {/* Confidence Bar */}
            <div style={{ width: '100%', marginTop: 8 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 6
              }}>
                <span>Güven: {(prediction.confidence * 100).toFixed(0)}%</span>
                <span>Eşik: {(prediction.threshold * 100).toFixed(0)}%</span>
              </div>
              <div style={{
                width: '100%',
                height: 8,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${prediction.confidence * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(147, 51, 234, 0.8), rgba(79, 70, 229, 0.8))',
                  transition: 'width 0.5s ease-out'
                }} />
                {/* Threshold marker */}
                <div style={{
                  position: 'absolute',
                  left: `${prediction.threshold * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: 'white',
                  boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
                }} />
              </div>
            </div>
          </div>
          
          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12
          }}>
            <div style={{
              padding: 16,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12
            }}>
              <div style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 8,
                fontWeight: 600
              }}>
                SIGNAL-TO-NOISE
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {prediction.features.snr.toFixed(2)}
              </div>
            </div>
            
            <div style={{
              padding: 16,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12
            }}>
              <div style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 8,
                fontWeight: 600
              }}>
                TRANSIT DEPTH
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {(prediction.features.depth * 100).toFixed(3)}%
              </div>
            </div>
            
            <div style={{
              padding: 16,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12
            }}>
              <div style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 8,
                fontWeight: 600
              }}>
                DURATION RATIO
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {(prediction.features.duration_ratio * 100).toFixed(2)}%
              </div>
            </div>
            
            <div style={{
              padding: 16,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12
            }}>
              <div style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 8,
                fontWeight: 600
              }}>
                SHAPE SCORE
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {prediction.features.shape_score.toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* Explanation */}
          <div style={{
            padding: 16,
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 12
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(99, 102, 241, 1)',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>💡</span> AÇIKLAMA
            </div>
            <div style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.6
            }}>
              {prediction.explanation}
            </div>
          </div>
          
          {/* Model Info */}
          <div style={{
            marginTop: 'auto',
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}>
            Model: ExoML-Classifier v0.1 • Train: 50k TESS/Kepler LC
          </div>
        </>
      )}
    </div>
  )
}

