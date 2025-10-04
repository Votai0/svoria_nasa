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
    <div style={{ height: '100%', display: 'inline', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Data Type Toggle - Mükemmel hizalanmış butonlar */}
        <div style={{ 
          display: 'inline',
          alignItems: 'center' // Parent div'de de hizalama
        }}>
          <button
            onClick={() => onDataTypeChange('SAP')}
            disabled={isLoading || !data}
            style={{
              display: 'inline',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              padding: 0, // Padding kaldırıldı, boyut sabit
              background: selectedDataType === 'SAP' 
                ? 'rgba(147, 51, 234, 0.8)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              height: 32, // Sabit yükseklik (px olmadan - number)
              width: 65, // Sabit genişlik
              minHeight: 32, // Garanti
              minWidth: 65,
              cursor: isLoading || !data ? 'not-allowed' : 'pointer',
              opacity: isLoading || !data ? 0.5 : 1,
              boxSizing: 'border-box', // Border dahil hesaplama
              flexShrink: 0 // Küçülmeyi engelle
            }}
          >
            SAP
          </button>
          <button
            onClick={() => onDataTypeChange('PDCSAP')}
            disabled={isLoading || !data}
            style={{
              display: 'inline',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0, // Padding kaldırıldı, boyut sabit
              background: selectedDataType === 'PDCSAP' 
                ? 'rgba(147, 51, 234, 0.8)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              height: 32, // Aynı yükseklik
              width: 85, // Sabit genişlik (daha uzun text için)
              minHeight: 32, // Garanti
              minWidth: 85,
              cursor: isLoading || !data ? 'not-allowed' : 'pointer',
              opacity: isLoading || !data ? 0.5 : 1,
              boxSizing: 'border-box', // Border dahil hesaplama
              flexShrink: 0 // Küçülmeyi engelle
            }}
          >
            PDCSAP
          </button>
        </div>
        
        {/* Quality Flags Toggle - Hizalanmış */}
        <label style={{ 
          display: 'inline', 
          alignItems: 'center', 
          verticalAlign: 'middle',
           
          cursor: 'pointer',
          height: 32, // Butonlarla aynı yükseklik
          margin: 0
        }}>
          <input
            type="checkbox"
            checked={showQualityFlags}
            onChange={(e) => setShowQualityFlags(e.target.checked)}
            disabled={!data}
            style={{ 
              display: 'inline',
              cursor: data ? 'pointer' : 'not-allowed',
              width: 14,
              height: 14,
              margin: 0
            }}
          />
          <span style={{ 
            fontSize: 11, 
            color: 'rgba(255, 255, 255, 0.8)',
            whiteSpace: 'nowrap' // Text taşmayı engelle
          }}>
            Kalite bayrakları
          </span>
        </label>
        
        <div style={{ 
          display: 'inline',
          alignItems: 'center',
          verticalAlign: 'middle'  }} />
        
        {/* Actions - Tüm butonlar hizalı */}
        {data && (
          <>
            <button
              onClick={handleDownloadCSV}
              style={{
                display: 'inline',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0, // Padding kaldırıldı, boyut sabit
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: 8,
                color: 'rgb(134, 239, 172)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                height: 32, // Aynı yükseklik
                width: 50, // Sabit genişlik (daha uzun text için)
                minHeight: 32, // Garanti
                minWidth: 32,
                opacity: isLoading || !data ? 0.5 : 1,
                boxSizing: 'border-box', // Border dahil hesaplama
                flexShrink: 0, // Küçülmeyi engelle
              
              }}
            >
              📥 CSV
            </button>
            <button
              onClick={handleDownloadPNG}
              style={{
                display: 'inline',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0, // Padding kaldırıldı, boyut sabit
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: 8,
                color: 'rgb(147, 197, 253)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                height: 32, // Aynı yükseklik
                width: 50, // Sabit genişlik (daha uzun text için)
                minHeight: 32, // Garanti
                minWidth: 32,
                opacity: isLoading || !data ? 0.5 : 1,
                boxSizing: 'border-box', // Border dahil hesaplama
                flexShrink: 0 // Küçülmeyi engelle  
           
              }}
            >
              📥 PNG
            </button>
            {onAnalyze && (
              <button
                onClick={onAnalyze}
                style={{
                  display: 'inline',
                  alignItems: 'center',
                  justifyContent: 'center',
                  verticalAlign: 'middle',
                  padding: '0 16px',
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8), rgba(79, 70, 229, 0.8))',
                  border: '1px solid rgba(147, 51, 234, 0.4)',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
                  height: 32, // Aynı yükseklik
                  minHeight: 32,
                  
                }}
              >
                ⚡ Analiz Et
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Zoom Controls */}
      {data && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: 12,
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>Zoom:</span>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.1"
            value={zoom.start}
            onChange={(e) => setZoom({ ...zoom, start: parseFloat(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace' }}>
            {(zoom.start * 100).toFixed(0)}% - {(zoom.end * 100).toFixed(0)}%
          </span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={zoom.end}
            onChange={(e) => setZoom({ ...zoom, end: parseFloat(e.target.value) })}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => setZoom({ start: 0, end: 1 })}
            style={{
              padding: '4px 10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 6,
              color: 'white',
              fontSize: 10,
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
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
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: 20,
          fontSize: 11,
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'monospace'
        }}>
          <div>Hedef: <span style={{ color: 'white' }}>{data.targetId}</span></div>
          <div>Misyon: <span style={{ color: 'white' }}>{data.mission}</span></div>
          {data.sector && <div>Sector: <span style={{ color: 'white' }}>{data.sector}</span></div>}
          <div>
            Nokta sayısı: <span style={{ color: 'white' }}>
              {(selectedDataType === 'SAP' ? data.sapFlux : data.pdcsapFlux).length.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

