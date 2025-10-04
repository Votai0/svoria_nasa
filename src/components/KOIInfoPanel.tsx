import type { KOIPlanet, KeplerDisposition } from '../types/exoplanet'

type Props = {
  koiData: KOIPlanet | null
  isLoading: boolean
}

function getDispositionColor(disposition?: KeplerDisposition) {
  switch (disposition) {
    case 'CONFIRMED':
      return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: 'rgb(134, 239, 172)' }
    case 'FALSE_POSITIVE':
      return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: 'rgb(252, 165, 165)' }
    case 'CANDIDATE':
      return { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.5)', text: 'rgb(250, 204, 21)' }
    default:
      return { bg: 'rgba(100, 100, 100, 0.2)', border: 'rgba(100, 100, 100, 0.5)', text: 'rgb(200, 200, 200)' }
  }
}

export default function KOIInfoPanel({ koiData, isLoading }: Props) {
  
  if (isLoading) {
    return (
      <div style={{
        height: '100%',
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
          Kepler KOI verileri yükleniyor...
        </div>
      </div>
    )
  }
  
  if (!koiData) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        padding: 20
      }}>
        <div style={{ fontSize: 48 }}>🔭</div>
        <div style={{ fontSize: 14, textAlign: 'center' }}>
          KOI verisi bulunamadı
        </div>
      </div>
    )
  }
  
  const dispColors = getDispositionColor(koiData.koi_pdisposition)
  
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(147, 51, 234, 0.2))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 12
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          color: 'rgba(99, 102, 241, 1)',
          letterSpacing: 1,
          marginBottom: 4
        }}>
          KEPLER OBJECT OF INTEREST
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'white',
          fontFamily: 'monospace'
        }}>
          {koiData.kepler_name || koiData.kepoi_name || `KOI-${koiData.kepid}`}
        </div>
        <div style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'monospace',
          marginTop: 4
        }}>
          KepID: {koiData.kepid}
        </div>
      </div>
      
      {/* ML Prediction */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: 12,
          letterSpacing: 1
        }}>
          🤖 ML MODEL TAHMİNİ
        </div>
        
        <div style={{
          padding: '16px',
          background: dispColors.bg,
          border: `2px solid ${dispColors.border}`,
          borderRadius: 12,
          marginBottom: 12
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
              Predicted Disposition
            </span>
            <span style={{
              fontSize: 16,
              fontWeight: 800,
              color: dispColors.text,
              letterSpacing: 0.5
            }}>
              {koiData.koi_pdisposition || 'UNKNOWN'}
            </span>
          </div>
          
          {koiData.prediction_probability !== undefined && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: 6
              }}>
                <span>Probability</span>
                <span>{(koiData.prediction_probability * 100).toFixed(1)}%</span>
              </div>
              <div style={{
                height: 6,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${koiData.prediction_probability * 100}%`,
                  background: dispColors.text,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          )}
        </div>
        
        {/* Full Probabilities */}
        {koiData.probabilities && (
          <div style={{
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
              Sınıf Olasılıkları
            </div>
            {Object.entries(koiData.probabilities).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <span>{key}</span>
                  <span>{(value * 100).toFixed(2)}%</span>
                </div>
                <div style={{
                  height: 4,
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${value * 100}%`,
                    background: getDispositionColor(key as KeplerDisposition).text,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Actual Disposition (if available) */}
      {koiData.actual_disposition && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 10
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 4 }}>
            Actual Disposition (Ground Truth)
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgb(147, 197, 253)' }}>
            {koiData.actual_disposition}
          </div>
        </div>
      )}
      
      {/* Orbital Parameters */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: 12,
          letterSpacing: 1
        }}>
          🛰️ YÖRÜNGE PARAMETRELERİ
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 10
        }}>
          {koiData.koi_period && (
            <InfoRow label="Period" value={`${koiData.koi_period.toFixed(4)} gün`} />
          )}
          {koiData.koi_duration && (
            <InfoRow label="Transit Duration" value={`${koiData.koi_duration.toFixed(2)} saat`} />
          )}
          {koiData.koi_depth && (
            <InfoRow label="Transit Depth" value={`${(koiData.koi_depth * 1000).toFixed(2)} ppm`} />
          )}
          {koiData.koi_impact !== undefined && (
            <InfoRow label="Impact Parameter" value={koiData.koi_impact.toFixed(3)} />
          )}
        </div>
      </div>
      
      {/* Planetary Properties */}
      {(koiData.koi_prad || koiData.koi_teq || koiData.koi_insol) && (
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            🪐 GEZEGEN ÖZELLİKLERİ
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 10
          }}>
            {koiData.koi_prad && (
              <InfoRow 
                label="Planet Radius" 
                value={`${koiData.koi_prad.toFixed(2)} R⊕`}
                highlighted
              />
            )}
            {koiData.koi_teq && (
              <InfoRow 
                label="Equilibrium Temperature" 
                value={`${koiData.koi_teq.toFixed(0)} K`}
                highlighted
              />
            )}
            {koiData.koi_insol && (
              <InfoRow 
                label="Insolation Flux" 
                value={`${koiData.koi_insol.toFixed(2)}× S⊕`}
                highlighted
              />
            )}
          </div>
        </div>
      )}
      
      {/* Stellar Properties */}
      {(koiData.koi_steff || koiData.koi_srad || koiData.koi_slogg) && (
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            ⭐ YILDIZ ÖZELLİKLERİ
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 10
          }}>
            {koiData.koi_steff && (
              <InfoRow label="Stellar Teff" value={`${koiData.koi_steff.toFixed(0)} K`} />
            )}
            {koiData.koi_srad && (
              <InfoRow label="Stellar Radius" value={`${koiData.koi_srad.toFixed(3)} R⊙`} />
            )}
            {koiData.koi_slogg && (
              <InfoRow label="Stellar log(g)" value={koiData.koi_slogg.toFixed(2)} />
            )}
          </div>
        </div>
      )}
      
      {/* Coordinates */}
      {(koiData.ra !== undefined || koiData.dec !== undefined) && (
        <div style={{
          marginTop: 'auto',
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 10
        }}>
          <div style={{
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 600,
            marginBottom: 8
          }}>
            KOORDİNATLAR
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {koiData.ra !== undefined && (
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.4)' }}>RA</div>
                <div style={{ fontSize: 12, color: 'white', fontFamily: 'monospace' }}>
                  {koiData.ra.toFixed(4)}°
                </div>
              </div>
            )}
            {koiData.dec !== undefined && (
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.4)' }}>DEC</div>
                <div style={{ fontSize: 12, color: 'white', fontFamily: 'monospace' }}>
                  {koiData.dec >= 0 ? '+' : ''}{koiData.dec.toFixed(4)}°
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ 
  label, 
  value, 
  highlighted = false 
}: { 
  label: string
  value: string
  highlighted?: boolean 
}) {
  return (
    <div style={{
      padding: '12px 14px',
      background: highlighted ? 'rgba(147, 51, 234, 0.1)' : 'rgba(0, 0, 0, 0.3)',
      border: `1px solid ${highlighted ? 'rgba(147, 51, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
        {label}
      </span>
      <span style={{
        fontSize: 14,
        fontWeight: 700,
        color: highlighted ? 'rgb(196, 181, 253)' : 'white',
        fontFamily: 'monospace'
      }}>
        {value}
      </span>
    </div>
  )
}
