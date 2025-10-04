import type { Planet } from '../types'

type Props = {
  planet: Planet | null
  onClose: () => void
}

// Gezegen bilgilerini detaylı açıklamalarla göster
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

// Yörünge periyodunu insan okunabilir formata çevir
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

// Dönüş periyodunu formatla
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

export default function PlanetInfoPanel({ planet, onClose }: Props) {
  if (!planet) return null

  return (
    <div style={{
      position: 'absolute',
      top: 90,
      right: 16,
      width: 360,
      maxHeight: 'calc(100vh - 180px)',
      overflowY: 'auto',
      background: 'rgba(15, 15, 25, 0.92)',
      backdropFilter: 'blur(16px)',
      borderRadius: 16,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      padding: 20,
      zIndex: 100,
      color: '#fff'
    }}>
      {/* Başlık ve kapat butonu */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: 24,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fff 0%, #a0a0ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {planet.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          Kapat
        </button>
      </div>

      {/* Açıklama */}
      <p style={{ 
        fontSize: 14, 
        lineHeight: 1.6,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 20
      }}>
        {getPlanetDescription(planet.name)}
      </p>

      {/* Özellikler */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Güneş değilse yörünge bilgisi göster */}
        {planet.distance > 0 && (
          <>
            <InfoRow 
              label="Güneş'e Uzaklık" 
              value={`${planet.distance} AU (Astronomik Birim)`}
              color="#FFD700"
            />
            <InfoRow 
              label="Yörünge Periyodu" 
              value={formatOrbitalPeriod(planet.orbitSpeed)}
              color="#FFA500"
            />
          </>
        )}
        
        <InfoRow 
          label="Dönüş Periyodu" 
          value={formatRotationPeriod(planet.rotationPeriod)}
          color="#87CEEB"
        />
        
        {planet.moons && planet.moons.length > 0 && (
          <InfoRow 
            label="Uydu Sayısı" 
            value={`${planet.moons.length} uydu`}
            color="#DDA0DD"
          />
        )}

        {planet.hasRings && (
          <InfoRow 
            label="Özel Özellik" 
            value="Halka sistemi mevcut"
            color="#F0E68C"
          />
        )}
      </div>

      {/* Uydular listesi */}
      {planet.moons && planet.moons.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            marginBottom: 10,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Uydular
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {planet.moons.map((moon, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <span style={{ fontWeight: 600, color: '#fff' }}>{moon.name}</span>
                {' • '}
                <span>Yörünge: {formatOrbitalPeriod(moon.orbitSpeed)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Bilgi satırı komponenti
function InfoRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
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
