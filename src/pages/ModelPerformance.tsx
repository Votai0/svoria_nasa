import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// API Base URL (matches exoplanetAPI.ts configuration)
const API_BASE_URL = import.meta.env.VITE_KEPLER_API_URL || '/api'

interface ModelVisualization {
  plot_base64: string
  timestamp: string
  filename: string
  description: string
  created_at: string
  file_size_bytes: number
  image_format: string
  metrics: {
    test_accuracy: number
    test_precision: number
    test_recall: number
    test_f1: number
    cv_mean: number
    cv_std: number
    cv_scores: number[]
  }
  classification_report: {
    [key: string]: {
      precision: number
      recall: number
      'f1-score': number
      support: number
    }
  }
  confusion_matrix: number[][]
  metrics_timestamp: string
}

export default function ModelPerformance() {
  const navigate = useNavigate()
  const [data, setData] = useState<ModelVisualization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const url = `${API_BASE_URL}/latest-visualization`
        console.log('🔍 Fetching from:', url)
        
        const response = await fetch(url)
        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Error response:', errorText)
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
        }
        
        const rawText = await response.text()
        console.log('📦 Raw response:', rawText)
        
        const result = JSON.parse(rawText)
        console.log('✅ Parsed data:', result)
        console.log('🖼️ Base64 length:', result.plot_base64?.length || 0)
        console.log('📊 Metrics:', result.metrics)
        
        setData(result)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load model performance data'
        console.error('❌ Model performance fetch error:', err)
        console.error('❌ Error details:', errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatPercentage = (value: number) => (value * 100).toFixed(2) + '%'
  const formatNumber = (value: number) => value.toFixed(4)

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
      color: 'white',
      overflow: 'auto',
      padding: '24px'
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: 24,
          left: 24,
          zIndex: 1000,
          background: 'rgba(10, 10, 15, 0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          padding: '12px 20px',
          color: 'white',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)'
          e.currentTarget.style.transform = 'translateX(-4px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(10, 10, 15, 0.88)'
          e.currentTarget.style.transform = 'translateX(0)'
        }}
      >
        ← Geri
      </button>

      <div style={{
        maxWidth: 1400,
        margin: '80px auto 0',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: 36,
          fontWeight: 700,
          marginBottom: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🤖 Model Performance
        </h1>
        <p style={{
          fontSize: 16,
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: 40
        }}>
          Exoplanet Classification Model - Training & Evaluation Results
        </p>

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{
              width: 48,
              height: 48,
              border: '4px solid rgba(99, 102, 241, 0.2)',
              borderTop: '4px solid rgb(99, 102, 241)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            Yükleniyor...
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 12,
            padding: '20px',
            color: 'rgb(248, 113, 113)',
            fontSize: 14
          }}>
            ⚠️ {error}
          </div>
        )}

        {data && (
          <>
            {/* Visualization Image */}
            {data.plot_base64 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: 24,
                marginBottom: 32
              }}>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  📊 Training Visualization
                </h2>
                <img
                  src={`data:image/${data.image_format};base64,${data.plot_base64}`}
                  alt="Model Evaluation"
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                />
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: 12
                }}>
                  {data.description}
                </p>
              </div>
            )}

            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 32
            }}>
              <MetricCard
                title="Test Accuracy"
                value={formatPercentage(data.metrics.test_accuracy)}
                icon="🎯"
                color="#22c55e"
              />
              <MetricCard
                title="Test Precision"
                value={formatPercentage(data.metrics.test_precision)}
                icon="🔍"
                color="#3b82f6"
              />
              <MetricCard
                title="Test Recall"
                value={formatPercentage(data.metrics.test_recall)}
                icon="📈"
                color="#f59e0b"
              />
              <MetricCard
                title="Test F1 Score"
                value={formatPercentage(data.metrics.test_f1)}
                icon="⚡"
                color="#a855f7"
              />
              <MetricCard
                title="CV Mean"
                value={formatPercentage(data.metrics.cv_mean)}
                icon="📊"
                color="#06b6d4"
              />
              <MetricCard
                title="CV Std Dev"
                value={formatNumber(data.metrics.cv_std)}
                icon="📉"
                color="#ec4899"
              />
            </div>

            {/* Classification Report */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 32
            }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 20,
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                📋 Classification Report
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <th style={tableHeaderStyle}>Class</th>
                      <th style={tableHeaderStyle}>Precision</th>
                      <th style={tableHeaderStyle}>Recall</th>
                      <th style={tableHeaderStyle}>F1-Score</th>
                      <th style={tableHeaderStyle}>Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.classification_report)
                      .filter(([key]) => !['accuracy', 'macro avg', 'weighted avg'].includes(key))
                      .map(([className, metrics]) => (
                        <tr key={className} style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                          <td style={tableCellStyle}>
                            <strong>{className}</strong>
                          </td>
                          <td style={tableCellStyle}>{formatPercentage(metrics.precision)}</td>
                          <td style={tableCellStyle}>{formatPercentage(metrics.recall)}</td>
                          <td style={tableCellStyle}>{formatPercentage(metrics['f1-score'])}</td>
                          <td style={tableCellStyle}>{metrics.support}</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    {['macro avg', 'weighted avg'].map((avgType) => {
                      const metrics = data.classification_report[avgType]
                      if (!metrics) return null
                      return (
                        <tr key={avgType} style={{
                          borderTop: '2px solid rgba(255, 255, 255, 0.1)',
                          fontWeight: 600
                        }}>
                          <td style={tableCellStyle}>
                            <strong>{avgType}</strong>
                          </td>
                          <td style={tableCellStyle}>{formatPercentage(metrics.precision)}</td>
                          <td style={tableCellStyle}>{formatPercentage(metrics.recall)}</td>
                          <td style={tableCellStyle}>{formatPercentage(metrics['f1-score'])}</td>
                          <td style={tableCellStyle}>{metrics.support}</td>
                        </tr>
                      )
                    })}
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Metadata */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 24
            }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 16,
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                ℹ️ Metadata
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 12,
                fontSize: 13
              }}>
                <InfoRow label="Created At" value={new Date(data.created_at).toLocaleString('tr-TR')} />
                <InfoRow label="Timestamp" value={data.timestamp} />
                <InfoRow label="Filename" value={data.filename} />
                <InfoRow label="File Size" value={`${(data.file_size_bytes / 1024).toFixed(2)} KB`} />
                <InfoRow label="Image Format" value={data.image_format.toUpperCase()} />
                <InfoRow label="Metrics Timestamp" value={data.metrics_timestamp} />
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Helper Components
function MetricCard({ title, value, icon, color }: {
  title: string
  value: string
  icon: string
  color: string
}) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
      padding: 20,
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
      e.currentTarget.style.transform = 'translateY(-4px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    >
      <div style={{
        fontSize: 28,
        marginBottom: 8
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 6
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        color
      }}>
        {value}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{label}:</span>
      <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  color: 'rgba(255, 255, 255, 0.7)',
  fontWeight: 600
}

const tableCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: 'rgba(255, 255, 255, 0.9)'
}
