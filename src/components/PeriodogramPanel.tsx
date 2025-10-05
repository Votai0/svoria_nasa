import { useRef, useEffect, useState } from 'react'
import type { PeriodogramData, BLSResult } from '../types/exoplanet'

type Props = {
  data: PeriodogramData | null
  isLoading: boolean
  onPeriodSelect?: (result: BLSResult) => void
  selectedPeriod?: BLSResult
}

export default function PeriodogramPanel({ data, isLoading, onPeriodSelect, selectedPeriod }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPeriod, setHoveredPeriod] = useState<number | null>(null)
  
  useEffect(() => {
    if (!data || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    // Temizle
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    const padding = 50
    const width = rect.width - padding * 2
    const height = rect.height - padding * 2
    
    const { periods, power } = data
    const minPower = Math.min(...power)
    const maxPower = Math.max(...power)
    const powerRange = maxPower - minPower
    
    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height * i) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + width, y)
      ctx.stroke()
    }
    
    // Y-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px monospace'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const p = maxPower - (powerRange * i) / 5
      const y = padding + (height * i) / 5
      ctx.fillText(p.toFixed(3), padding - 10, y + 4)
    }
    
    // Periodogram çiz
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    periods.forEach((period, i) => {
      const x = padding + (i / periods.length) * width
      const y = padding + height - ((power[i] - minPower) / powerRange) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    
    // En iyi periyotları işaretle
    data.bestPeriods.forEach((result, idx) => {
      const periodIdx = periods.findIndex(p => Math.abs(p - result.period) < 0.01)
      if (periodIdx === -1) return
      
      const x = padding + (periodIdx / periods.length) * width
      const y = padding + height - ((power[periodIdx] - minPower) / powerRange) * height
      
      const isSelected = selectedPeriod?.period === result.period
      const colors = [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)'
      ]
      
      // Dikey çizgi
      ctx.strokeStyle = isSelected ? 'rgba(255, 255, 255, 0.8)' : colors[idx]
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.setLineDash(isSelected ? [] : [5, 5])
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, padding + height)
      ctx.stroke()
      ctx.setLineDash([])
      
      // Nokta
      ctx.fillStyle = isSelected ? 'white' : colors[idx]
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 6 : 4, 0, Math.PI * 2)
      ctx.fill()
      
      // Label
      ctx.fillStyle = isSelected ? 'white' : colors[idx]
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`#${idx + 1}`, x, padding - 10)
    })
    
    // Eksen etiketleri
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Period (days)', padding + width / 2, rect.height - 10)
    
    ctx.save()
    ctx.translate(15, padding + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('BLS Power', 0, 0)
    ctx.restore()
    
  }, [data, selectedPeriod])
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Info Bar */}
      {data && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 8 }}>
            En güçlü {data.bestPeriods.length} periyot tespit edildi. Birini seçerek katlanmış görünümü inceleyin.
          </div>
        </div>
      )}
      
      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', minHeight: 250 }}>
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
              BLS analizi çalışıyor...
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
            <div style={{ fontSize: 48 }}>📈</div>
            <div style={{ fontSize: 14 }}>BLS analizini başlatın</div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        )}
      </div>
      
      {/* Results Table */}
      {data && data.bestPeriods.length > 0 && (
        <div style={{
          padding: 16,
          background: 'rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: 200,
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr 1fr',
            gap: '8px 16px',
            fontSize: 11,
            fontFamily: 'monospace'
          }}>
            {/* Header */}
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>#</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Period (d)</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>t₀ (BJD)</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Duration (h)</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>Depth</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>SNR</div>
            
            {/* Rows */}
            {data.bestPeriods.map((result, idx) => {
              const isSelected = selectedPeriod?.period === result.period
              const colors = ['#22c55e', '#3b82f6', '#fbbf24']
              
              return (
                <button
                  key={idx}
                  onClick={() => onPeriodSelect?.(result)}
                  style={{
                    gridColumn: '1 / -1',
                    display: 'grid',
                    gridTemplateColumns: 'subgrid',
                    gap: '8px 16px',
                    padding: '8px 12px',
                    background: isSelected 
                      ? 'rgba(147, 51, 234, 0.3)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected
                      ? '2px solid rgba(147, 51, 234, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div style={{ color: colors[idx], fontWeight: 700 }}>#{idx + 1}</div>
                  <div>{result.period.toFixed(4)}</div>
                  <div>{result.t0.toFixed(3)}</div>
                  <div>{result.duration.toFixed(2)}</div>
                  <div>{(result.depth * 100).toFixed(3)}%</div>
                  <div>{result.snr.toFixed(2)}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

