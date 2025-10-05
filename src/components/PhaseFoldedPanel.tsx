import { useRef, useEffect } from 'react'
import type { PhaseFoldedData, BLSResult } from '../types/exoplanet'

type Props = {
  data: PhaseFoldedData | null
  periodInfo: BLSResult | null
  isLoading: boolean
}

export default function PhaseFoldedPanel({ data, periodInfo, isLoading }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!data || !canvasRef.current || !periodInfo) return
    
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
    
    const { phase, flux, binned_phase, binned_flux, binned_err } = data
    
    const minFlux = Math.min(...flux)
    const maxFlux = Math.max(...flux)
    const fluxRange = maxFlux - minFlux
    
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
      const f = maxFlux - (fluxRange * i) / 5
      const y = padding + (height * i) / 5
      ctx.fillText(f.toFixed(4), padding - 10, y + 4)
    }
    
    // Transit window (shaded area)
    const transitDuration = periodInfo.duration / 24 / periodInfo.period // Faz birimi
    const transitStart = 0.5 - transitDuration / 2
    const transitEnd = 0.5 + transitDuration / 2
    
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
    ctx.fillRect(
      padding + transitStart * width,
      padding,
      (transitEnd - transitStart) * width,
      height
    )
    
    // Bireysel noktalar (soluk)
    phase.forEach((p, i) => {
      const x = padding + p * width
      const y = padding + height - ((flux[i] - minFlux) / fluxRange) * height
      
      ctx.fillStyle = 'rgba(147, 51, 234, 0.15)'
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1)
    })
    
    // Binned noktalar (belirgin)
    if (binned_phase && binned_flux && binned_err) {
      binned_phase.forEach((p, i) => {
        const x = padding + p * width
        const y = padding + height - ((binned_flux[i] - minFlux) / fluxRange) * height
        const errY = (binned_err[i] / fluxRange) * height
        
        // Error bars
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, y - errY)
        ctx.lineTo(x, y + errY)
        ctx.stroke()
        
        // Nokta
        ctx.fillStyle = 'rgba(147, 51, 234, 0.9)'
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    
    // Transit center line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding + 0.5 * width, padding)
    ctx.lineTo(padding + 0.5 * width, padding + height)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Eksen etiketleri
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Phase', padding + width / 2, rect.height - 10)
    
    // X-axis ticks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px monospace'
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * width
      const phaseLabel = (i / 10).toFixed(1)
      ctx.fillText(phaseLabel, x, padding + height + 20)
    }
    
    ctx.save()
    ctx.translate(15, padding + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Normalized Flux', 0, 0)
    ctx.restore()
    
  }, [data, periodInfo])
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Info Section */}
      <div style={{
        padding: '14px 20px',
        background: 'rgba(251, 191, 36, 0.08)',
        borderBottom: '1px solid rgba(251, 191, 36, 0.2)'
      }}>
        <div style={{
          fontSize: 11,
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.85)'
        }}>
          <strong style={{ color: 'rgb(253, 224, 71)' }}>💡 What is Phase Folding?</strong>
          <div style={{ marginTop: 6, color: 'rgba(255, 255, 255, 0.7)' }}>
            All transit events are stacked based on the detected period. This amplifies the weak transit signal and allows us to clearly see the planet passing in front of the star. The dip at the center represents the transit event.
          </div>
        </div>
      </div>
      
      {/* Period Info */}
      {periodInfo && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 11, fontFamily: 'monospace' }}>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Period: </span>
              <span style={{ color: 'white', fontWeight: 700 }}>{periodInfo.period.toFixed(4)} days</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Duration: </span>
              <span style={{ color: 'white', fontWeight: 700 }}>{periodInfo.duration.toFixed(2)} hours</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Depth: </span>
              <span style={{ color: 'white', fontWeight: 700 }}>{(periodInfo.depth * 100).toFixed(3)}%</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>SNR: </span>
              <span style={{ color: 'white', fontWeight: 700 }}>{periodInfo.snr.toFixed(2)}</span>
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
              Phase folding in progress...
            </div>
          </div>
        ) : !data || !periodInfo ? (
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
            <div style={{ fontSize: 48 }}>🌓</div>
            <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
              Select a period from the Periodogram
            </div>
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
      
      {/* Legend */}
      {data && periodInfo && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: 20,
          fontSize: 11
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'rgba(147, 51, 234, 0.3)'
            }} />
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Raw data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'rgba(147, 51, 234, 0.9)'
            }} />
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Binned data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 16,
              height: 8,
              background: 'rgba(239, 68, 68, 0.2)'
            }} />
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Transit window</span>
          </div>
        </div>
      )}
    </div>
  )
}

