import { DEMO_TARGETS } from '../services/exoplanetAPI'
import type { ExoplanetTarget } from '../types/exoplanet'

type Props = {
  onSelectTarget: (target: ExoplanetTarget) => void
}

export default function DemoTargetsBar({ onSelectTarget }: Props) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 180,
      left: 16,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: 'min(200px, calc(100vw - 580px))',
      minWidth: 160
    }}>
      <div style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: 1.2,
        color: 'rgba(147, 51, 234, 1)',
        marginBottom: 2,
        paddingLeft: 4
      }}>
        ⚡ HIZLI DEMO
      </div>
      
      {DEMO_TARGETS.slice(0, 3).map((target) => (
        <button
          key={target.id}
          onClick={() => onSelectTarget(target)}
          style={{
            padding: '8px 10px',
            background: 'rgba(147, 51, 234, 0.15)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            borderRadius: 10,
            color: 'white',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(147, 51, 234, 0.25)'
            e.currentTarget.style.transform = 'translateX(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(147, 51, 234, 0.15)'
            e.currentTarget.style.transform = 'translateX(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 10 }}>{target.name}</div>
          <div style={{
            fontSize: 8,
            opacity: 0.6,
            fontFamily: 'monospace'
          }}>
            {target.id}
          </div>
        </button>
      ))}
    </div>
  )
}

