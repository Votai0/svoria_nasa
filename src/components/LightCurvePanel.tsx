import { useRef, useEffect, useState } from 'react'
import type { LightCurveData } from '../types/exoplanet'

type Props = {
  data: LightCurveData | null
  isLoading: boolean
  onAnalyze?: () => void
  selectedDataType: 'SAP' | 'PDCSAP'
  onDataTypeChange: (type: 'SAP' | 'PDCSAP') => void
}

export default function LightCurvePanel({ 
  data, 
  isLoading, 
  onAnalyze,
  selectedDataType,
  onDataTypeChange
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showQualityFlags, setShowQualityFlags] = useState(false)
  const [zoom, setZoom] = useState({ start: 0, end: 1 })
  
  // Canvas'a light curve çiz
  useEffect(() => {
    if (!data || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Canvas boyutlarını ayarla
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    // Temizle
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    const points = selectedDataType === 'SAP' ? data.sapFlux : data.pdcsapFlux
    
    // Zoom uygula
    const startIdx = Math.floor(points.length * zoom.start)
    const endIdx = Math.floor(points.length * zoom.end)
    const visiblePoints = points.slice(startIdx, endIdx)
    
    if (visiblePoints.length === 0) return
    
    // Eksenleri hesapla
    const padding = 40
    const width = rect.width - padding * 2
    const height = rect.height - padding * 2
    
    const times = visiblePoints.map(p => p.time)
    const fluxes = visiblePoints.map(p => p.flux)
    
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    const minFlux = Math.min(...fluxes)
    const maxFlux = Math.max(...fluxes)
    
    const timeRange = maxTime - minTime
    const fluxRange = maxFlux - minFlux
    
    // Grid çiz
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height * i) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + width, y)
      ctx.stroke()
    }
    
    // Etiketler
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px monospace'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const flux = maxFlux - (fluxRange * i) / 5
      const y = padding + (height * i) / 5
      ctx.fillText(flux.toFixed(4), padding - 10, y + 4)
    }
    
    // Veri noktalarını çiz
    visiblePoints.forEach((point) => {
      const x = padding + ((point.time - minTime) / timeRange) * width
      const y = padding + height - ((point.flux - minFlux) / fluxRange) * height
      
      // Kalite bayraklarını göster
      if (showQualityFlags && point.quality > 0) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'
        ctx.fillRect(x - 1, padding, 2, height)
      }
      
      // Nokta çiz
      ctx.fillStyle = point.quality > 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(147, 51, 234, 0.6)'
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1)
    })
    
    // Eksen etiketleri
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Time (BJD)', padding + width / 2, rect.height - 10)
    
    ctx.save()
    ctx.translate(15, padding + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Normalized Flux', 0, 0)
    ctx.restore()
    
  }, [data, selectedDataType, showQualityFlags, zoom])
  
  const handleDownloadCSV = () => {
    if (!data) return
    
    const points = selectedDataType === 'SAP' ? data.sapFlux : data.pdcsapFlux
    let csv = 'time,flux,flux_err,quality\n'
    points.forEach(p => {
      csv += `${p.time},${p.flux},${p.flux_err},${p.quality}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lightcurve_${data.targetId}_${selectedDataType}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleDownloadPNG = () => {
    if (!canvasRef.current) return
    
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `lightcurve_${data?.targetId}_${selectedDataType}.png`
    a.click()
  }
  
  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      {/* Controls Section */}
      <div style={{
        padding: '16px 20px',
        background: '#202020',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {/* Row 1: Data Type Selector */}
        <div style={{
          marginBottom: 12
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 8,
            letterSpacing: 0.5
          }}>
            Data Type
          </div>
          <div>
            <button
              onClick={() => onDataTypeChange('SAP')}
              disabled={isLoading || !data}
              style={{
                padding: '10px 20px',
                background: selectedDataType === 'SAP' 
                  ? 'rgba(147, 151, 234, 0.9)' 
                  : 'rgba(255, 255, 255, 0.08)',
                border: selectedDataType === 'SAP'
                  ? '1px solid rgba(147, 151, 234, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px 0 0 6px',
                color: selectedDataType === 'SAP' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                fontWeight: 500,
                cursor: isLoading || !data ? 'not-allowed' : 'pointer',
                opacity: isLoading || !data ? 0.5 : 1,
                transition: 'all 0.2s',
                width: 80
              }}
            >
              SAP
            </button>
            <button
              onClick={() => onDataTypeChange('PDCSAP')}
              disabled={isLoading || !data}
              style={{
                padding: '10px 20px',
                background: selectedDataType === 'PDCSAP' 
                  ? 'rgba(147, 151, 234, 0.9)' 
                  : 'rgba(255, 255, 255, 0.08)',
                border: selectedDataType === 'PDCSAP'
                  ? '1px solid rgba(147, 151, 234, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0 6px 6px 0',
                borderLeft: 'none',
                color: selectedDataType === 'PDCSAP' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                fontWeight: 500,
                cursor: isLoading || !data ? 'not-allowed' : 'pointer',
                opacity: isLoading || !data ? 0.5 : 1,
                transition: 'all 0.2s',
                width: 100
              }}
            >
              PDCSAP
            </button>
          </div>
        </div>

        {/* Row 2: Quality Flags */}
        <div style={{
          marginBottom: 12
        }}>
          <label style={{ 
            cursor: data ? 'pointer' : 'not-allowed',
            opacity: data ? 1 : 0.5
          }}>
            <input
              type="checkbox"
              checked={showQualityFlags}
              onChange={(e) => setShowQualityFlags(e.target.checked)}
              disabled={!data}
              style={{ 
                cursor: data ? 'pointer' : 'not-allowed',
                width: 16,
                height: 16,
                marginRight: 8,
                verticalAlign: 'middle'
              }}
            />
            <span style={{ 
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.7)',
              verticalAlign: 'middle'
            }}>
              Show quality flags
            </span>
          </label>
        </div>
        
        {/* Row 3: Action Buttons */}
        {data && (
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: 12
          }}>
            <button
              onClick={handleDownloadCSV}
              style={{
                padding: '8px 16px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: 6,
                color: 'rgb(134, 239, 172)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                marginRight: 8,
                transition: 'all 0.2s'
              }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleDownloadPNG}
              style={{
                padding: '8px 16px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 6,
                color: 'rgb(147, 197, 253)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                marginRight: 8,
                transition: 'all 0.2s'
              }}
            >
              📥 Export PNG
            </button>
            {onAnalyze && (
              <button
                onClick={onAnalyze}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(147, 151, 234, 0.9)',
                  border: 'none',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(147, 151, 234, 0.3)',
                  transition: 'all 0.2s',
                  float: 'right'
                }}
              >
                🔄 Re-analyze BLS
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Zoom Controls */}
      {data && (
        <div style={{
          padding: '12px 20px',
          background: '#1a1a1a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 10,
            letterSpacing: 0.5
          }}>
            Zoom Range
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.1"
                value={zoom.start}
                onChange={(e) => setZoom({ ...zoom, start: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={zoom.end}
                onChange={(e) => setZoom({ ...zoom, end: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <span style={{ 
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                marginRight: 12
              }}>
                {(zoom.start * 100).toFixed(0)}% - {(zoom.end * 100).toFixed(0)}%
              </span>
              <button
                onClick={() => setZoom({ start: 0, end: 1 })}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  float: 'right'
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', minHeight: 300 }}>
        {isLoading ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16
          }}>
            <div style={{
              width: 40,
              height: 40,
              border: '4px solid rgba(147, 51, 234, 0.2)',
              borderTop: '4px solid rgb(147, 51, 234)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
              Işık eğrisi yükleniyor...
            </div>
          </div>
        ) : !data ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <div style={{ fontSize: 14 }}>Bir hedef seçin ve analiz başlatın</div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              cursor: 'crosshair'
            }}
          />
        )}
      </div>
      
      {/* Info Bar */}
      {data && (
        <div style={{
          padding: '12px 20px',
          background: '#202020',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'monospace',
            lineHeight: 1.6
          }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Target:</span>{' '}
              <span style={{ color: '#ffffff' }}>{data.targetId}</span>
              <span style={{ marginLeft: 16, color: 'rgba(255, 255, 255, 0.5)' }}>Mission:</span>{' '}
              <span style={{ color: '#ffffff' }}>{data.mission}</span>
            </div>
            {data.sector && (
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Sector:</span>{' '}
                <span style={{ color: '#ffffff' }}>{data.sector}</span>
              </div>
            )}
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Data Points:</span>{' '}
              <span style={{ color: '#ffffff' }}>
                {(selectedDataType === 'SAP' ? data.sapFlux : data.pdcsapFlux).length.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

