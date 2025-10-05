import { useState } from 'react'
import { useKOIPlanets, useKOIStatistics, useModelStatus } from '../hooks/useKOIData'
import KOIInfoPanel from './KOIInfoPanel'
import type { KOIPlanet } from '../types/exoplanet'

/**
 * Example component demonstrating Kepler KOI API integration
 * This can be added to your main App.tsx or used as a separate panel
 */
export default function KOIExplorer() {
  const [selectedPlanet, setSelectedPlanet] = useState<KOIPlanet | null>(null)
  const [filterDisposition, setFilterDisposition] = useState<'ALL' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'CANDIDATE'>('ALL')
  
  // Fetch planets with filtering
  const { planets, loading: planetsLoading, error: planetsError } = useKOIPlanets({
    disposition: filterDisposition === 'ALL' ? undefined : filterDisposition,
    include_probabilities: true
  })
  
  // Fetch statistics
  const { stats } = useKOIStatistics()
  
  // Fetch model status
  const { status: modelStatus } = useModelStatus()
  
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(to bottom, #0a0a0f, #1a1a2e)',
      color: 'white'
    }}>
      {/* Left Panel - Planet List & Stats */}
      <div style={{
        width: '400px',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(147, 51, 234, 0.2))',
          borderBottom: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
            🔭 Kepler KOI Explorer
          </h2>
          <p style={{ margin: '8px 0 0 0', fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' }}>
            ML-Powered Exoplanet Classification
          </p>
        </div>
        
        {/* Model Status */}
        {modelStatus && (
          <div style={{
            padding: '16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            margin: '16px',
            borderRadius: 10
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 6 }}>
              MODEL STATUS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: modelStatus.model_loaded ? '#22c55e' : '#ef4444'
              }} />
              <span style={{ fontSize: 12, color: 'white' }}>
                {modelStatus.model_loaded ? 'Model Loaded' : 'Model Not Available'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 }}>
              {modelStatus.features_count} features • {modelStatus.classes.length} classes
            </div>
          </div>
        )}
        
        {/* Statistics */}
        {stats && (
          <div style={{
            padding: '16px',
            margin: '0 16px 16px 16px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12
          }}>
            <StatCard label="Total KOIs" value={stats.total_count.toLocaleString()} />
            <StatCard label="Confirmed" value={stats.predicted_confirmed.toLocaleString()} color="#22c55e" />
            <StatCard label="False Pos." value={stats.predicted_false_positive.toLocaleString()} color="#ef4444" />
            <StatCard label="Candidates" value={stats.predicted_candidate.toLocaleString()} color="#eab308" />
            {stats.accuracy && (
              <StatCard 
                label="Model Accuracy" 
                value={`${(stats.accuracy * 100).toFixed(1)}%`} 
                color="#6366f1"
                span2
              />
            )}
          </div>
        )}
        
        {/* Filter */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 8 }}>
            FILTER BY DISPOSITION
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['ALL', 'CONFIRMED', 'FALSE_POSITIVE', 'CANDIDATE'] as const).map(disp => (
              <button
                key={disp}
                onClick={() => setFilterDisposition(disp)}
                style={{
                  padding: '6px 12px',
                  background: filterDisposition === disp 
                    ? 'rgba(99, 102, 241, 0.3)' 
                    : 'rgba(0, 0, 0, 0.3)',
                  border: filterDisposition === disp
                    ? '1px solid rgba(99, 102, 241, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {disp}
              </button>
            ))}
          </div>
        </div>
        
        {/* Planet List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px' }}>
          {planetsLoading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255, 255, 255, 0.5)' }}>
              Loading planets...
            </div>
          )}
          
          {planetsError && (
            <div style={{
              padding: 16,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              color: '#f87171'
            }}>
              Error: {planetsError.message}
            </div>
          )}
          
          {!planetsLoading && planets.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255, 255, 255, 0.5)' }}>
              No planets found
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {planets.map(planet => (
              <PlanetCard
                key={planet.kepid}
                planet={planet}
                isSelected={selectedPlanet?.kepid === planet.kepid}
                onClick={() => setSelectedPlanet(planet)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Panel - Planet Details */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <KOIInfoPanel 
          koiData={selectedPlanet} 
          isLoading={false} 
        />
      </div>
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  color = 'white',
  span2 = false 
}: { 
  label: string
  value: string
  color?: string
  span2?: boolean
}) {
  return (
    <div style={{
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      gridColumn: span2 ? 'span 2' : 'span 1'
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'monospace' }}>
        {value}
      </div>
    </div>
  )
}

function PlanetCard({ 
  planet, 
  isSelected, 
  onClick 
}: { 
  planet: KOIPlanet
  isSelected: boolean
  onClick: () => void
}) {
  const getColor = () => {
    switch (planet.koi_pdisposition) {
      case 'CONFIRMED': return '#22c55e'
      case 'FALSE_POSITIVE': return '#ef4444'
      case 'CANDIDATE': return '#eab308'
      default: return '#666'
    }
  }
  
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px',
        background: isSelected 
          ? 'rgba(99, 102, 241, 0.2)' 
          : 'rgba(0, 0, 0, 0.3)',
        border: isSelected
          ? '1px solid rgba(99, 102, 241, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: getColor(),
          marginTop: 6,
          flexShrink: 0
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'white',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {planet.kepler_name || planet.kepoi_name || `KOI-${planet.kepid}`}
          </div>
          <div style={{
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 6
          }}>
            KepID: {planet.kepid}
          </div>
          <div style={{
            display: 'flex',
            gap: 12,
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            {planet.koi_period && (
              <span>P: {planet.koi_period.toFixed(2)}d</span>
            )}
            {planet.koi_prad && (
              <span>R: {planet.koi_prad.toFixed(2)}R⊕</span>
            )}
          </div>
          {planet.prediction_probability !== undefined && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                height: 4,
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${planet.prediction_probability * 100}%`,
                  background: getColor(),
                  transition: 'width 0.3s'
                }} />
              </div>
              <div style={{
                fontSize: 9,
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: 4
              }}>
                Confidence: {(planet.prediction_probability * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
