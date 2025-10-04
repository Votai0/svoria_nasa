import { useState } from 'react'
import type { 
  ExoplanetTarget, 
  LightCurveData,
  CatalogInfo 
} from '../types/exoplanet'
import type { Planet } from '../types'
import LightCurvePanel from './LightCurvePanel'
import CatalogPanel from './CatalogPanel'
import {
  fetchLightCurve,
  fetchCatalogInfo
} from '../services/exoplanetAPI'

type AnalysisTab = 'lightcurve' | 'catalog'
type PlanetTab = 'overview' | 'orbit' | 'physical' | 'moons'

type Props = {
  selectedTarget: ExoplanetTarget | null
  selectedPlanet?: Planet | null
}

export default function AnalysisPanel({ selectedTarget, selectedPlanet }: Props) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('lightcurve')
  const [activePlanetTab, setActivePlanetTab] = useState<PlanetTab>('overview')
  const [dataType, setDataType] = useState<'SAP' | 'PDCSAP'>('PDCSAP')
  
  // Data states
  const [lightCurve, setLightCurve] = useState<LightCurveData | null>(null)
  const [catalogInfo, setCatalogInfo] = useState<CatalogInfo | null>(null)
  
  // Loading states
  const [isLoadingLC, setIsLoadingLC] = useState(false)
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // 1. Light curve yükle
  const handleLoadLightCurve = async () => {
    if (!selectedTarget) return
    
    setError(null)
    setIsLoadingLC(true)
    
    try {
      const data = await fetchLightCurve(selectedTarget.id, dataType)
      setLightCurve(data)
      
      // Katalog bilgilerini de yükle
      setIsLoadingCatalog(true)
      const catalog = await fetchCatalogInfo(selectedTarget.id)
      setCatalogInfo(catalog)
      setIsLoadingCatalog(false)
    } catch (err) {
      setError('Işık eğrisi yüklenirken hata oluştu')
      console.error(err)
    } finally {
      setIsLoadingLC(false)
    }
  }
  
  
  // Hedef değiştiğinde sıfırla
  const resetAnalysis = () => {
    setLightCurve(null)
    setCatalogInfo(null)
    setError(null)
    setActiveTab('lightcurve')
  }
  
  // Hedef değişimini izle
  const currentTargetId = selectedTarget?.id
  const prevTargetId = lightCurve?.targetId
  if (currentTargetId && currentTargetId !== prevTargetId && !isLoadingLC) {
    resetAnalysis()
    handleLoadLightCurve()
  }
  
  const tabs: { id: AnalysisTab; label: string; icon: string; disabled?: boolean }[] = [
    { id: 'lightcurve', label: 'Işık Eğrisi', icon: '📊' },
    { id: 'catalog', label: 'Katalog', icon: '📚', disabled: !catalogInfo }
  ]
  
  const planetTabs: { id: PlanetTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Genel', icon: '🌍' },
    { id: 'orbit', label: 'Yörünge', icon: '🔄' },
    { id: 'physical', label: 'Fiziksel', icon: '⚛️' },
    { id: 'moons', label: 'Uydular', icon: '🌙' }
  ]
  
  return (
    <div style={{
      position: 'absolute',
      right: 16,
      top: 16,
      bottom: 16,
      width: 'min(480px, calc(100vw - 440px))',
      minWidth: 400,
      maxWidth: 520,
      background: '#1a1a1a',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
      overflow: 'hidden',
      zIndex: 100
    }}>
      {/* Header Section */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: '#202020'
      }}>
        <div style={{
          marginBottom: 16
        }}>
          {selectedPlanet ? (
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: selectedPlanet.color,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textShadow: `0 0 20px ${selectedPlanet.color}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: 32 }}>{selectedPlanet.name === 'Güneş' ? '☀️' : '🪐'}</span>
              {selectedPlanet.name}
            </div>
          ) : (
            <>
              <div style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 0.8,
                color: 'rgba(147, 151, 234, 0.9)',
                marginBottom: 6,
                textTransform: 'uppercase'
              }}>
                Exoplanet Analysis
              </div>
              {selectedTarget && (
                <div style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#ffffff',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {selectedTarget.name}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Navigation Tabs */}
        {selectedPlanet ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            marginTop: 16
          }}>
            {planetTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePlanetTab(tab.id)}
                style={{
                  padding: '10px 8px',
                  background: activePlanetTab === tab.id 
                    ? 'rgba(99, 102, 241, 0.2)' 
                    : 'transparent',
                  border: 'none',
                  borderBottom: activePlanetTab === tab.id
                    ? `2px solid ${selectedPlanet.color}`
                    : '2px solid transparent',
                  borderRadius: '4px 4px 0 0',
                  color: activePlanetTab === tab.id 
                    ? '#ffffff' 
                    : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: 600,
                  lineHeight: 1.1
                }}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 6,
            marginBottom: 12
          }}>
            {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              title={tab.label}
              style={{
                padding: '8px 4px',
                background: activeTab === tab.id 
                  ? 'rgba(147, 151, 234, 0.15)' 
                  : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id
                  ? '2px solid rgb(147, 151, 234)'
                  : '2px solid transparent',
                borderRadius: '4px 4px 0 0',
                color: activeTab === tab.id 
                  ? '#ffffff' 
                  : tab.disabled 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'rgba(255, 255, 255, 0.6)',
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                opacity: tab.disabled ? 0.4 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span style={{ 
                fontSize: 9, 
                fontWeight: 600,
                lineHeight: 1.1
              }}>
                {tab.label}
              </span>
            </button>
            ))}
          </div>
        )}

      </div>
      
      {/* Error Alert */}
      {error && (
        <div style={{
          padding: '12px 24px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'rgb(248, 180, 180)',
          fontSize: 12
        }}>
          <div style={{
            width: '100%'
          }}>
            <span style={{ marginRight: 8 }}>⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                color: 'rgb(248, 180, 180)',
                cursor: 'pointer',
                fontSize: 18,
                padding: 0,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div style={{ 
        height: 'calc(100% - 180px)',
        overflow: selectedPlanet ? 'auto' : 'hidden',
        position: 'relative'
      }}>
        {selectedPlanet ? (
          <PlanetTabContent planet={selectedPlanet} activeTab={activePlanetTab} />
        ) : !selectedTarget ? (
          <div style={{
            height: '100%',
            textAlign: 'center',
            paddingTop: '25%'
          }}>
            <div style={{ 
              fontSize: 72,
              marginBottom: 20,
              opacity: 0.3
            }}>🔭</div>
            <div style={{ 
              fontSize: 15,
              color: 'rgba(255, 255, 255, 0.5)',
              maxWidth: 300,
              margin: '0 auto',
              lineHeight: 1.5
            }}>
              Bir exoplanet veya gezegen seçin
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'lightcurve' && (
              <LightCurvePanel
                data={lightCurve}
                isLoading={isLoadingLC}
                selectedDataType={dataType}
                onDataTypeChange={setDataType}
              />
            )}
            
            {activeTab === 'catalog' && (
              <CatalogPanel
                catalogInfo={catalogInfo}
                isLoading={isLoadingCatalog}
              />
            )}
          </>
        )}
      </div>
      
      {/* Status Footer */}
      {selectedTarget && !selectedPlanet && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 24px',
          background: '#202020',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{
            width: '100%',
            fontSize: 11,
            fontFamily: 'monospace',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: lightCurve ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
              marginRight: 6,
              verticalAlign: 'middle'
            }} />
            <span style={{ marginRight: 16, color: lightCurve ? '#ffffff' : 'rgba(255, 255, 255, 0.4)' }}>Işık Eğrisi</span>
            
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: catalogInfo ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
              marginRight: 6,
              verticalAlign: 'middle'
            }} />
            <span style={{ color: catalogInfo ? '#ffffff' : 'rgba(255, 255, 255, 0.4)' }}>Katalog</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Gezegen tab içeriği
function PlanetTabContent({ planet, activeTab }: { planet: Planet; activeTab: PlanetTab }) {
  const getPlanetDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      'Güneş': 'Güneş sistemimizin merkezindeki yıldız. 4.6 milyar yıllık ve hidrojen füzyonu ile enerji üretiyor.',
      'Merkür': 'Güneş\'e en yakın gezegen. Gündüz sıcaklığı 430°C\'ye ulaşırken, gece -180°C\'ye düşüyor.',
      'Venüs': 'Güneş sisteminin en sıcak gezegeni. Yoğun atmosferi sera etkisi oluşturarak 470°C\'ye çıkıyor.',
      'Dünya': 'Bilinen tek yaşanabilir gezegen. %71\'i su ile kaplı ve koruyucu bir atmosfere sahip.',
      'Mars': 'Kızıl gezegen. Demir oksit nedeniyle kırmızı renkli. Geçmişte sıvı su bulunduğu düşünülüyor.',
      'Jüpiter': 'Güneş sisteminin en büyük gezegeni. Dev bir gaz gezegeni ve güçlü manyetik alana sahip.',
      'Satürn': 'İhtişamlı halkaları ile ünlü. Halkalar buz ve kaya parçacıklarından oluşuyor.',
      'Uranüs': 'Yanlamasına dönen ilginç bir gezegen. Mavi-yeşil rengi metan gazından kaynaklanıyor.',
      'Neptün': 'Güneşten en uzak gezegen. 2,000 km/sa hıza ulaşan rüzgarları var.'
    }
    return descriptions[name] || 'Bu gök cismi hakkında detaylı bilgi mevcut değil.'
  }

  const formatOrbitalPeriod = (orbitSpeed: number): string => {
    const BASE_SPEED = 0.01
    const periodInYears = BASE_SPEED / orbitSpeed
    
    if (periodInYears < 1) {
      const days = Math.round(periodInYears * 365.25)
      return `${days} gün`
    } else if (periodInYears < 2) {
      return '1 yıl'
    } else {
      return `${periodInYears.toFixed(1)} yıl`
    }
  }

  const formatRotationPeriod = (period: number): string => {
    const absPeriod = Math.abs(period)
    const isRetrograde = period < 0
    
    if (absPeriod < 1) {
      const hours = Math.round(absPeriod * 24)
      return `~${hours} saat${isRetrograde ? ' (ters yönde)' : ''}`
    } else if (absPeriod === 1) {
      return '1 gün'
    } else {
      return `${absPeriod.toFixed(1)} gün${isRetrograde ? ' (ters yönde)' : ''}`
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      {activeTab === 'overview' && (
        <>
          <p style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 24,
            padding: '16px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: 8,
            borderLeft: `4px solid ${planet.color}`
          }}>
            {getPlanetDescription(planet.name)}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {planet.distance > 0 && (
              <InfoRow label="Güneş'e Uzaklık" value={`${planet.distance} AU`} color={planet.color} />
            )}
            <InfoRow label="Çap" value={`${planet.size.toFixed(1)} birim`} color={planet.color} />
            {planet.moons && planet.moons.length > 0 && (
              <InfoRow label="Uydu Sayısı" value={`${planet.moons.length} uydu`} color={planet.color} />
            )}
            {planet.hasRings && (
              <div style={{
                marginTop: 12,
                padding: '12px 16px',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: 8,
                fontSize: 13,
                color: 'rgba(255, 215, 0, 0.9)'
              }}>
                ✨ Bu gezegen halka sistemine sahiptir
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'orbit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionTitle>Yörünge Özellikleri</SectionTitle>
          {planet.distance > 0 ? (
            <>
              <InfoRow label="Güneş'e Uzaklık" value={`${planet.distance} AU`} color="#FFD700" />
              <InfoRow label="Yörünge Hızı" value={`${planet.orbitSpeed.toFixed(6)} rad/gün`} color="#FFA500" />
              <InfoRow label="Yörünge Periyodu" value={formatOrbitalPeriod(planet.orbitSpeed)} color="#FF6347" />
              <InfoRow label="Başlangıç Açısı" value={`${(planet.startAngle * 180 / Math.PI).toFixed(1)}°`} color="#87CEEB" />
            </>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 14
            }}>
              Güneş sistemin merkezinde yer alır ve yörünge hareketi yoktur.
            </div>
          )}
        </div>
      )}

      {activeTab === 'physical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionTitle>Fiziksel Özellikler</SectionTitle>
          <InfoRow label="Çap" value={`${planet.size.toFixed(1)} birim`} color="#9370DB" />
          <InfoRow label="Renk" value={planet.color} color={planet.color} />
          <InfoRow 
            label="Dönüş Periyodu" 
            value={formatRotationPeriod(planet.rotationPeriod)} 
            color="#87CEEB" 
          />
          {planet.emissive && (
            <InfoRow label="Işıma" value="Aktif (Yıldız)" color={planet.emissive} />
          )}
          {planet.hasRings && (
            <InfoRow label="Halkalar" value="Mevcut" color="#F0E68C" />
          )}
        </div>
      )}

      {activeTab === 'moons' && (
        <div>
          <SectionTitle>Uydular ({planet.moons?.length || 0})</SectionTitle>
          {planet.moons && planet.moons.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {planet.moons.map((moon) => (
                <div
                  key={moon.name}
                  style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 10,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 12
                  }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: moon.color,
                      boxShadow: `0 0 10px ${moon.color}`
                    }} />
                    <div style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: '#fff'
                    }}>
                      {moon.name}
                    </div>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    <div>
                      <div style={{ opacity: 0.6, marginBottom: 4 }}>Uzaklık</div>
                      <div style={{ fontWeight: 600 }}>{moon.distance.toFixed(1)} birim</div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.6, marginBottom: 4 }}>Çap</div>
                      <div style={{ fontWeight: 600 }}>{moon.size.toFixed(2)} birim</div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.6, marginBottom: 4 }}>Yörünge Periyodu</div>
                      <div style={{ fontWeight: 600 }}>{formatOrbitalPeriod(Math.abs(moon.orbitSpeed))}</div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.6, marginBottom: 4 }}>Dönüş</div>
                      <div style={{ fontWeight: 600 }}>{formatRotationPeriod(moon.rotationPeriod)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 14
            }}>
              Bu gezegenin bilinen uydus u yoktur.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Bölüm başlığı
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      textTransform: 'uppercase',
      letterSpacing: 1
    }}>
      {children}
    </h3>
  )
}

// Bilgi satırı
function InfoRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      borderLeft: `3px solid ${color}`
    }}>
      <span style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#fff'
      }}>
        {value}
      </span>
    </div>
  )
}

