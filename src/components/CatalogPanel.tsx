import type { CatalogInfo } from '../types/exoplanet'

type Props = {
  catalogInfo: CatalogInfo | null
  isLoading: boolean
}

export default function CatalogPanel({ catalogInfo, isLoading }: Props) {
  
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
          Katalog bilgileri yükleniyor...
        </div>
      </div>
    )
  }
  
  if (!catalogInfo) {
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
        <div style={{ fontSize: 48 }}>📚</div>
        <div style={{ fontSize: 14, textAlign: 'center' }}>
          Katalog bilgileri mevcut değil
        </div>
      </div>
    )
  }
  
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
          HEDEF KATALOG BİLGİSİ
        </div>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'white',
          fontFamily: 'monospace'
        }}>
          {catalogInfo.targetId}
        </div>
      </div>
      
      {/* Stellar Parameters */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: 12,
          letterSpacing: 1
        }}>
          ⭐ YILDIZ PARAMETRELERİ
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 10
        }}>
          {catalogInfo.stellar.teff && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                Etkin Sıcaklık (T<sub>eff</sub>)
              </span>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {catalogInfo.stellar.teff.toLocaleString()} K
              </span>
            </div>
          )}
          
          {catalogInfo.stellar.radius && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                Yarıçap (R<sub>⊙</sub>)
              </span>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {catalogInfo.stellar.radius.toFixed(3)} R<sub>⊙</sub>
              </span>
            </div>
          )}
          
          {catalogInfo.stellar.mass && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                Kütle (M<sub>⊙</sub>)
              </span>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {catalogInfo.stellar.mass.toFixed(3)} M<sub>⊙</sub>
              </span>
            </div>
          )}
          
          {catalogInfo.stellar.logg && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                Yüzey Çekimi (log g)
              </span>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {catalogInfo.stellar.logg.toFixed(2)}
              </span>
            </div>
          )}
          
          {catalogInfo.stellar.metallicity !== undefined && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                Metallik [Fe/H]
              </span>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {catalogInfo.stellar.metallicity >= 0 ? '+' : ''}{catalogInfo.stellar.metallicity.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Planetary Parameters */}
      {catalogInfo.planetary && (
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            🪐 GEZEGEN PARAMETRELERİ
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 10
          }}>
            {catalogInfo.planetary.radius && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(147, 51, 234, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Yarıçap (R<sub>⊕</sub>)
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {catalogInfo.planetary.radius.toFixed(2)} R<sub>⊕</sub>
                </span>
              </div>
            )}
            
            {catalogInfo.planetary.period && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(147, 51, 234, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Yörünge Periyodu
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {catalogInfo.planetary.period.toFixed(4)} gün
                </span>
              </div>
            )}
            
            {catalogInfo.planetary.semi_major_axis && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(147, 51, 234, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Yarı Büyük Eksen
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {catalogInfo.planetary.semi_major_axis.toFixed(4)} AU
                </span>
              </div>
            )}
            
            {catalogInfo.planetary.equilibrium_temp && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(147, 51, 234, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Denge Sıcaklığı
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {catalogInfo.planetary.equilibrium_temp.toFixed(0)} K
                </span>
              </div>
            )}
            
            {catalogInfo.planetary.insolation && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(147, 51, 234, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Işınım (Dünya'ya göre)
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {catalogInfo.planetary.insolation.toFixed(2)}× S<sub>⊕</sub>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Source */}
      <div style={{
        marginTop: 'auto',
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{
          fontSize: 10,
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 600
        }}>
          VERİ KAYNAĞI
        </div>
        <div style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          {catalogInfo.source}
        </div>
        <a
          href={catalogInfo.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 14px',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 8,
            color: 'rgb(165, 180, 252)',
            fontSize: 11,
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'
          }}
        >
          🔗 Kaynağı Göster
        </a>
      </div>
    </div>
  )
}

