import type { TimeControl } from '../types'

type Props = {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
  isVisible: boolean
  onToggle: () => void
}

export default function SpeedControlPanel({ timeControl, setTimeControl, isVisible, onToggle }: Props) {
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0.01, parseFloat(e.target.value)) // Minimum 0.01x
    setTimeControl(prev => ({ ...prev, speed: value }))
  }

  const togglePause = () => {
    setTimeControl(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          bottom: 16,
          left: isVisible ? 'min(336px, calc(100vw - 564px))' : 16,
          zIndex: 101,
          background: 'rgba(15, 15, 30, 0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          width: 36,
          height: 36,
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        title={isVisible ? 'Hız kontrolünü gizle' : 'Hız kontrolünü göster'}
      >
        {isVisible ? '×' : '⚡'}
      </button>
      
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: isVisible ? 16 : -360,
        zIndex: 100,
        background: 'rgba(15, 15, 30, 0.92)',
        backdropFilter: 'blur(24px)',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        width: 'min(320px, calc(100vw - 580px))',
        minWidth: 260,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}>
      {/* Başlık */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
      }}>
        <span style={{
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          opacity: 0.9
        }}>
          ⚡ Simülasyon Hızı
        </span>
        <button
          onClick={togglePause}
          style={{
            background: timeControl.isPaused
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(34, 197, 94, 0.2)',
            border: timeControl.isPaused
              ? '1px solid rgba(239, 68, 68, 0.4)'
              : '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          {timeControl.isPaused ? '▶️ Oynat' : '⏸️ Durdur'}
        </button>
      </div>

      {/* Hız Göstergesi */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
      }}>
        <span style={{ color: '#aaa', fontSize: 11 }}>Hız Çarpanı</span>
        <span style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '5px 12px',
          borderRadius: 8,
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          minWidth: 60,
          textAlign: 'center'
        }}>
          {timeControl.speed < 0.1 ? timeControl.speed.toFixed(2) : timeControl.speed.toFixed(1)}x
        </span>
      </div>

      {/* Slider - 0.01x ile 50x arası hassas kontrol */}
      <input
        type="range"
        min="0.01"
        max="50"
        step="0.01"
        value={Math.max(0.01, timeControl.speed)}
        onChange={handleSpeedChange}
        disabled={timeControl.isPaused}
        className="speed-slider"
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          outline: 'none',
          background: `linear-gradient(to right, 
            rgba(102, 126, 234, 0.8) 0%, 
            rgba(102, 126, 234, 0.8) ${(Math.min(Math.max(0.01, timeControl.speed), 50) / 50) * 100}%, 
            rgba(255, 255, 255, 0.1) ${(Math.min(Math.max(0.01, timeControl.speed), 50) / 50) * 100}%, 
            rgba(255, 255, 255, 0.1) 100%)`,
          cursor: timeControl.isPaused ? 'not-allowed' : 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          opacity: timeControl.isPaused ? 0.5 : 1,
          marginBottom: 12
        }}
      />

      {/* Preset Butonları - Detaylı kontrol */}
      <div style={{ whiteSpace: 'nowrap' }}>
  {[
    { label: '0.01×', value: 0.01, hint: 'Ultra yavaş - Gerçek zamana yakın' },
    { label: '0.1×', value: 0.1, hint: '10x yavaş - İç gezegenler' },
    { label: '0.5×', value: 0.5, hint: 'Yarı hız - Detaylı gözlem' },
    { label: '1×', value: 1, hint: 'Normal hız' },
    { label: '10×', value: 10, hint: '10x hızlı - Orta gezegenler' },
    { label: '50×', value: 50, hint: 'Maksimum - Dış gezegenler' }
  ].map((preset, idx, arr) => (
    <button
      key={preset.value}
      onClick={() => setTimeControl(prev => ({ ...prev, speed: preset.value }))}
      disabled={timeControl.isPaused}
      title={preset.hint}
      style={{
        display: 'inline-block',
        width: '48px', // tüm butonlar aynı genişlikte
        marginRight: idx !== arr.length - 1 ? '6px' : 0,
        padding: '6px 3px',
        background: timeControl.speed === preset.value
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'rgba(255, 255, 255, 0.08)',
        border: timeControl.speed === preset.value
          ? '1px solid rgba(102, 126, 234, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 6,
        color: '#fff',
        fontSize: 9,
        cursor: timeControl.isPaused ? 'not-allowed' : 'pointer',
        fontWeight: timeControl.speed === preset.value ? 700 : 500,
        transition: 'all 0.15s',
        boxShadow: timeControl.speed === preset.value
          ? '0 2px 8px rgba(102, 126, 234, 0.3)'
          : 'none',
        opacity: timeControl.isPaused ? 0.5 : 1,
        textAlign: 'center'
      }}
    >
      {preset.label}
    </button>
  ))}
</div>



{/* Açıklama - Dinamik */}
<div style={{
  marginTop: 10,
  padding: '8px 10px',
  background: timeControl.speed < 0.1 
    ? 'rgba(34, 197, 94, 0.1)' 
    : timeControl.speed < 1 
    ? 'rgba(251, 191, 36, 0.1)'
    : 'rgba(99, 102, 241, 0.1)',
  border: timeControl.speed < 0.1
    ? '1px solid rgba(34, 197, 94, 0.2)'
    : timeControl.speed < 1
    ? '1px solid rgba(251, 191, 36, 0.2)'
    : '1px solid rgba(99, 102, 241, 0.2)',
  borderRadius: 8,
  fontSize: 9,
  color: 'rgba(255, 255, 255, 0.7)',
  lineHeight: 1.4
}}>
  <strong style={{ 
    color: timeControl.speed < 0.1 
      ? 'rgba(34, 197, 94, 1)' 
      : timeControl.speed < 1
      ? 'rgba(251, 191, 36, 1)'
      : 'rgba(99, 102, 241, 1)' 
  }}>
    {timeControl.speed < 0.1 ? '🐌 Ultra Yavaş:' : timeControl.speed < 1 ? '🔍 Detaylı:' : '⚡ Hızlı:'}
  </strong> {
    timeControl.speed < 0.1 
      ? 'Merkür\'ün günlük hareketini görebilirsiniz!' 
      : timeControl.speed < 1
      ? 'İç gezegenlerin (Merkür, Venüs, Dünya) hareketleri izlenebilir.'
      : timeControl.speed < 10
      ? 'Mars ve Jüpiter\'i rahatça gözlemleyin.'
      : timeControl.speed <= 50
      ? 'Dış gezegenler (Satürn, Uranüs, Neptün) için ideal hız.'
      : 'Maksimum hız: Neptün\'ün yörüngesini izleyin!'
  }
</div>


      <style>{`
        .speed-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
          transition: all 0.2s;
        }
        .speed-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.7);
        }
        .speed-slider:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .speed-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
          border: none;
          transition: all 0.2s;
        }
        .speed-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.7);
        }
      `}</style>
    </div>
    </>
  )
}

