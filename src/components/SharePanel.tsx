import { useEffect, useState } from 'react'
import type { ExoplanetTarget } from '../types/exoplanet'

type Props = {
  target: ExoplanetTarget | null
  sector?: number
  modelVersion?: string
}

export default function SharePanel({ target, sector, modelVersion = 'v0.1' }: Props) {
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  
  useEffect(() => {
    if (!target) {
      setShareUrl('')
      return
    }
    
    const params = new URLSearchParams()
    params.set('target', target.id)
    if (sector) params.set('sector', sector.toString())
    params.set('model', modelVersion)
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    setShareUrl(url)
  }, [target, sector, modelVersion])
  
  const handleCopy = async () => {
    if (!shareUrl) return
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Kopyalama hatası:', err)
    }
  }
  
  if (!target) return null
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      right: 16,
      zIndex: 100,
      width: 'min(340px, calc(100vw - 580px))',
      minWidth: 260,
      maxHeight: '20%',
      background: 'rgba(10, 10, 15, 0.92)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: 12,
      padding: 12,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1.2,
        color: 'rgba(99, 102, 241, 1)',
        marginBottom: 10
      }}>
        🔗 PAYLAŞ
      </div>
      
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 10
      }}>
        <input
          type="text"
          value={shareUrl}
          readOnly
          style={{
            flex: 1,
            padding: '8px 10px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            color: 'white',
            fontSize: 10,
            fontFamily: 'monospace',
            outline: 'none'
          }}
        />
        <button
          onClick={handleCopy}
          style={{
            padding: '8px 12px',
            background: copied 
              ? 'rgba(34, 197, 94, 0.25)' 
              : 'rgba(99, 102, 241, 0.25)',
            border: copied
              ? '1px solid rgba(34, 197, 94, 0.4)'
              : '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 8,
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
            minWidth: 70,
            whiteSpace: 'nowrap'
          }}
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
      
      <div style={{
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 1.4
      }}>
        Analiz durumunuzu paylaşılabilir link ile kaydedin
      </div>
    </div>
  )
}

