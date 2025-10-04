import type { CatalogInfo, KOIPlanet } from '../types/exoplanet'

type Props = {
  catalogInfo: CatalogInfo | null
  isLoading: boolean
  koiData?: KOIPlanet | null // Detaylı KOI verisi
}

export default function CatalogPanel({ catalogInfo, isLoading, koiData = null }: Props) {
  
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
            <DataRow
              label="Etkin Sıcaklık (Teff)"
              value={`${catalogInfo.stellar.teff.toLocaleString()} K`}
            />
          )}
          
          {catalogInfo.stellar.radius && (
            <DataRow
              label="Yarıçap (R☉)"
              value={`${catalogInfo.stellar.radius.toFixed(3)} R☉`}
            />
          )}
          
          {catalogInfo.stellar.mass && (
            <DataRow
              label="Kütle (M☉)"
              value={`${catalogInfo.stellar.mass.toFixed(3)} M☉`}
            />
          )}
          
          {catalogInfo.stellar.logg && (
            <DataRow
              label="Yüzey Çekimi (log g)"
              value={catalogInfo.stellar.logg.toFixed(2)}
            />
          )}
          
          {catalogInfo.stellar.metallicity !== undefined && (
            <DataRow
              label="Metallik [Fe/H]"
              value={`${catalogInfo.stellar.metallicity >= 0 ? '+' : ''}${catalogInfo.stellar.metallicity.toFixed(2)}`}
            />
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
              <DataRow
                label="Yarıçap (R⊕)"
                value={`${catalogInfo.planetary.radius.toFixed(2)} R⊕`}
                bgColor="rgba(147, 51, 234, 0.1)"
                borderColor="rgba(147, 51, 234, 0.3)"
                valueColor="rgb(196, 181, 253)"
              />
            )}
            
            {catalogInfo.planetary.period && (
              <DataRow
                label="Yörünge Periyodu"
                value={`${catalogInfo.planetary.period.toFixed(4)} gün`}
                bgColor="rgba(147, 51, 234, 0.1)"
                borderColor="rgba(147, 51, 234, 0.3)"
                valueColor="rgb(196, 181, 253)"
              />
            )}
            
            {catalogInfo.planetary.semi_major_axis && (
              <DataRow
                label="Yarı Büyük Eksen"
                value={`${catalogInfo.planetary.semi_major_axis.toFixed(4)} AU`}
                bgColor="rgba(147, 51, 234, 0.1)"
                borderColor="rgba(147, 51, 234, 0.3)"
                valueColor="rgb(196, 181, 253)"
              />
            )}
            
            {catalogInfo.planetary.equilibrium_temp && (
              <DataRow
                label="Denge Sıcaklığı"
                value={`${catalogInfo.planetary.equilibrium_temp.toFixed(0)} K`}
                bgColor="rgba(147, 51, 234, 0.1)"
                borderColor="rgba(147, 51, 234, 0.3)"
                valueColor="rgb(196, 181, 253)"
              />
            )}
            
            {catalogInfo.planetary.insolation && (
              <DataRow
                label="Işınım (Dünya'ya göre)"
                value={`${catalogInfo.planetary.insolation.toFixed(2)}× S⊕`}
                bgColor="rgba(147, 51, 234, 0.1)"
                borderColor="rgba(147, 51, 234, 0.3)"
                valueColor="rgb(196, 181, 253)"
              />
            )}
          </div>
        </div>
      )}
      
      {/* Transit Parameters (from KOI data) */}
      {koiData && (
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            🌗 TRANSİT PARAMETRELERİ
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 10
          }}>
            {koiData.koi_duration && (
              <DataRow
                label="Transit Süresi"
                value={`${koiData.koi_duration.toFixed(2)} saat`}
                error={koiData.koi_duration_err1 ? `±${koiData.koi_duration_err1.toFixed(2)}` : undefined}
              />
            )}
            
            {koiData.koi_depth && (
              <DataRow
                label="Transit Derinliği"
                value={`${koiData.koi_depth.toFixed(0)} ppm`}
                error={koiData.koi_depth_err1 ? `±${koiData.koi_depth_err1.toFixed(0)}` : undefined}
              />
            )}
            
            {koiData.koi_ror && (
              <DataRow
                label="Yarıçap Oranı (Rp/R★)"
                value={koiData.koi_ror.toFixed(4)}
                error={koiData.koi_ror_err1 ? `±${koiData.koi_ror_err1.toFixed(4)}` : undefined}
              />
            )}
            
            {koiData.koi_dor && (
              <DataRow
                label="a/R★ (Ölçeklendirilmiş)"
                value={koiData.koi_dor.toFixed(2)}
                error={koiData.koi_dor_err1 ? `±${koiData.koi_dor_err1.toFixed(2)}` : undefined}
              />
            )}
            
            {koiData.koi_impact !== null && koiData.koi_impact !== undefined && (
              <DataRow
                label="İmpakt Parametresi (b)"
                value={koiData.koi_impact.toFixed(3)}
                error={koiData.koi_impact_err1 ? `±${koiData.koi_impact_err1.toFixed(3)}` : undefined}
              />
            )}
            
            {koiData.koi_model_snr && (
              <DataRow
                label="Sinyal-Gürültü Oranı"
                value={koiData.koi_model_snr.toFixed(1)}
                valueColor={koiData.koi_model_snr > 10 ? 'rgb(134, 239, 172)' : 'rgb(252, 211, 77)'}
              />
            )}
            
            {koiData.koi_num_transits && (
              <DataRow
                label="Transit Sayısı"
                value={koiData.koi_num_transits.toString()}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Validation Status */}
      {koiData && (
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            ✅ DOĞRULAMA DURUMU
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            {koiData.koi_disposition && (
              <div style={{
                padding: '12px 14px',
                background: getDispositionColor(koiData.koi_disposition).bg,
                border: `1px solid ${getDispositionColor(koiData.koi_disposition).border}`,
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Disposition
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: getDispositionColor(koiData.koi_disposition).text,
                  fontFamily: 'monospace'
                }}>
                  {koiData.koi_disposition}
                </span>
              </div>
            )}
            
            {koiData.koi_score !== null && koiData.koi_score !== undefined && (
              <DataRow
                label="KOI Score"
                value={koiData.koi_score.toFixed(3)}
                valueColor={koiData.koi_score > 0.9 ? 'rgb(134, 239, 172)' : koiData.koi_score > 0.5 ? 'rgb(252, 211, 77)' : 'rgb(248, 113, 113)'}
              />
            )}
            
            {(koiData.koi_fpflag_nt || koiData.koi_fpflag_ss || koiData.koi_fpflag_co || koiData.koi_fpflag_ec) && (
              <div style={{
                padding: '10px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                fontSize: 11
              }}>
                <div style={{ color: 'rgb(248, 180, 180)', fontWeight: 600, marginBottom: 6 }}>
                  False Positive Flags:
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {koiData.koi_fpflag_nt === 1 && <span>• Not Transit-Like</span>}
                  {koiData.koi_fpflag_ss === 1 && <span>• Stellar Eclipse</span>}
                  {koiData.koi_fpflag_co === 1 && <span>• Centroid Offset</span>}
                  {koiData.koi_fpflag_ec === 1 && <span>• Ephemeris Match</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* KOI Validation Status */}
      {koiData && (
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            ✓ DOĞRULAMA DURUMU
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 10
          }}>
            {/* Disposition Status */}
            <div style={{
              padding: '14px 16px',
              background: koiData.koi_pdisposition === 'CONFIRMED' 
                ? 'rgba(34, 197, 94, 0.15)'
                : koiData.koi_pdisposition === 'FALSE_POSITIVE'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(234, 179, 8, 0.15)',
              border: koiData.koi_pdisposition === 'CONFIRMED'
                ? '1px solid rgba(34, 197, 94, 0.4)'
                : koiData.koi_pdisposition === 'FALSE_POSITIVE'
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                Disposition
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: koiData.koi_pdisposition === 'CONFIRMED'
                  ? 'rgb(134, 239, 172)'
                  : koiData.koi_pdisposition === 'FALSE_POSITIVE'
                    ? 'rgb(248, 113, 113)'
                    : 'rgb(253, 224, 71)',
                fontFamily: 'monospace'
              }}>
                {koiData.koi_pdisposition || koiData.koi_disposition || 'UNKNOWN'}
              </span>
            </div>
            
            {/* Number of Transits */}
            {koiData.koi_num_transits && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Gözlenen Transit Sayısı
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(165, 180, 252)',
                  fontFamily: 'monospace'
                }}>
                  {koiData.koi_num_transits}
                </span>
              </div>
            )}
            
            {/* KOI Score */}
            {koiData.koi_score !== undefined && koiData.koi_score !== null && (
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
                  KOI Skor
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {koiData.koi_score.toFixed(3)}
                </span>
              </div>
            )}
            
            {/* False Positive Flags */}
            {(koiData.koi_fpflag_nt || koiData.koi_fpflag_ss || koiData.koi_fpflag_co || koiData.koi_fpflag_ec) && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 10
              }}>
                <div style={{ fontSize: 11, color: 'rgb(248, 113, 113)', fontWeight: 600, marginBottom: 8 }}>
                  ⚠️ False Positive Bayrakları
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {koiData.koi_fpflag_nt === 1 && <div>• Not Transit-Like</div>}
                  {koiData.koi_fpflag_ss === 1 && <div>• Stellar Eclipse (SS)</div>}
                  {koiData.koi_fpflag_co === 1 && <div>• Centroid Offset (CO)</div>}
                  {koiData.koi_fpflag_ec === 1 && <div>• Ephemeris Match (EC)</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* KOI Transit Geometry */}
      {koiData && (koiData.koi_ror || koiData.koi_dor || koiData.koi_impact !== undefined) && (
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            🔭 TRANSİT GEOMETRİSİ
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 10
          }}>
            {koiData.koi_ror && (
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
                  Rp/R★ Oranı
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {koiData.koi_ror.toFixed(5)}
                  {koiData.koi_ror_err1 && (
                    <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>
                      {' '}±{((koiData.koi_ror_err1 + Math.abs(koiData.koi_ror_err2 || 0))/2).toFixed(5)}
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {koiData.koi_dor && (
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
                  a/R★ Oranı
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {koiData.koi_dor.toFixed(2)}
                  {koiData.koi_dor_err1 && (
                    <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>
                      {' '}±{((koiData.koi_dor_err1 + Math.abs(koiData.koi_dor_err2 || 0))/2).toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {koiData.koi_impact !== undefined && koiData.koi_impact !== null && (
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
                  Impact Parameter (b)
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {koiData.koi_impact.toFixed(3)}
                  {koiData.koi_impact_err1 && (
                    <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>
                      {' '}±{((koiData.koi_impact_err1 + Math.abs(koiData.koi_impact_err2 || 0))/2).toFixed(3)}
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {koiData.koi_incl && (
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
                  Eğim (i)
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgb(196, 181, 253)',
                  fontFamily: 'monospace'
                }}>
                  {koiData.koi_incl.toFixed(2)}°
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

// Helper component for data rows
function DataRow({ 
  label, 
  value, 
  error,
  bgColor = 'rgba(0, 0, 0, 0.3)',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  valueColor = 'white'
}: { 
  label: string
  value: string
  error?: string
  bgColor?: string
  borderColor?: string
  valueColor?: string
}) {
  return (
    <div style={{
      padding: '12px 14px',
      background: bgColor,
      border: `1px solid ${borderColor}`,
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
        color: valueColor,
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'baseline',
        gap: 6
      }}>
        {value}
        {error && (
          <span style={{ 
            fontSize: 10, 
            opacity: 0.6, 
            fontWeight: 400 
          }}>
            {error}
          </span>
        )}
      </span>
    </div>
  )
}

// Get color scheme based on disposition
function getDispositionColor(disposition: string) {
  switch (disposition.toUpperCase()) {
    case 'CONFIRMED':
      return {
        bg: 'rgba(34, 197, 94, 0.1)',
        border: 'rgba(34, 197, 94, 0.4)',
        text: 'rgb(134, 239, 172)'
      }
    case 'FALSE POSITIVE':
    case 'FALSE_POSITIVE':
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.4)',
        text: 'rgb(248, 113, 113)'
      }
    case 'CANDIDATE':
      return {
        bg: 'rgba(234, 179, 8, 0.1)',
        border: 'rgba(234, 179, 8, 0.4)',
        text: 'rgb(252, 211, 77)'
      }
    default:
      return {
        bg: 'rgba(147, 51, 234, 0.1)',
        border: 'rgba(147, 51, 234, 0.3)',
        text: 'rgb(196, 181, 253)'
      }
  }
}

