import type { TimeControl } from '../types'
import { ONE_DAY_UNITS, ONE_YEAR_UNITS } from '../constants/time'
import { formatFullDate } from '../utils/time'
import YearSelector from './YearSelector'

// Zaman Kontrol Paneli bileşeni
export default function TimeControlPanel({ timeControl, setTimeControl }: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
}) {
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setTimeControl(prev => ({ ...prev, speed: value }))
  }

  const togglePause = () => {
    setTimeControl(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }

  const resetTime = () => {
    setTimeControl({ speed: 1, isPaused: false, currentTime: 277, year: 2025 })
  }
  
  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseFloat(e.target.value)
    const currentYearElapsed = Math.floor(timeControl.currentTime / ONE_YEAR_UNITS)
    const timeUnits = (currentYearElapsed * ONE_YEAR_UNITS) + (days * ONE_DAY_UNITS)
    setTimeControl(prev => ({ ...prev, currentTime: timeUnits }))
  }

  return (
    <div style={{
      background: 'rgba(15, 15, 30, 0.92)',
      backdropFilter: 'blur(24px)',
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      width: 'min(280px, calc(100vw - 580px))',
      minWidth: 240,
      border: '1px solid rgba(255, 255, 255, 0.12)'
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
          fontWeight: 600,
          opacity: 0.9
        }}>
          ⏱️ Zaman
        </span>
        <button
          onClick={resetTime}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 6,
            padding: '4px 8px',
            color: '#fff',
            fontSize: 10,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
          }}
        >
          🔄
        </button>
      </div>

      {/* Yıl Seçici */}
      <YearSelector timeControl={timeControl} setTimeControl={setTimeControl} />

      {/* Zaman Çizelgesi (Timeline) */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <span style={{ color: '#aaa', fontSize: 12 }}>📅 Tarih</span>
          <span style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '4px 12px',
            borderRadius: 8,
            color: '#000',
            fontSize: 11,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(250, 112, 154, 0.3)'
          }}>
            {formatFullDate(timeControl.year, timeControl.currentTime)}
          </span>
        </div>

        {/* Timeline Slider */}
        <input
          type="range"
          min="0"
          max="365.25"
          step="0.25"
          value={Math.floor(timeControl.currentTime / ONE_DAY_UNITS) % 365.25}
          onChange={handleTimelineChange}
          className="timeline-slider"
          style={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            outline: 'none',
            background: `linear-gradient(to right, 
              rgba(250, 112, 154, 0.8) 0%, 
              rgba(250, 112, 154, 0.8) ${((Math.floor(timeControl.currentTime / ONE_DAY_UNITS) % 365.25) / 365.25) * 100}%, 
              rgba(255, 255, 255, 0.1) ${((Math.floor(timeControl.currentTime / ONE_DAY_UNITS) % 365.25) / 365.25) * 100}%, 
              rgba(255, 255, 255, 0.1) 100%)`,
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none'
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4
        }}>
          <span style={{ color: '#666', fontSize: 10 }}>1 Ocak</span>
          <span style={{ color: '#666', fontSize: 10 }}>31 Aralık</span>
        </div>
        <style>{`
          .timeline-slider::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(250, 112, 154, 0.6);
            transition: all 0.2s;
          }
          .timeline-slider::-webkit-slider-thumb:hover {
            transform: scale(1.3);
            box-shadow: 0 4px 16px rgba(250, 112, 154, 0.8);
          }
          .timeline-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(250, 112, 154, 0.6);
            border: none;
            transition: all 0.2s;
          }
          .timeline-slider::-moz-range-thumb:hover {
            transform: scale(1.3);
            box-shadow: 0 4px 16px rgba(250, 112, 154, 0.8);
          }
        `}</style>
      </div>

      {/* Not: Oynat/Duraklat butonu artık SpeedControlPanel'de */}
      <div style={{
        padding: '8px 10px',
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        borderRadius: 8,
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 1.4,
        textAlign: 'center'
      }}>
        Hız kontrolü için <strong style={{ color: 'rgba(34, 197, 94, 1)' }}>sol alttaki paneli</strong> kullanın
      </div>

      {/* ESKİ OYNAT/DURAKLAT BUTONU KALDIRILDI */}
      <div style={{ display: 'none' }}>
        <button
          onClick={togglePause}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: timeControl.isPaused
              ? 'linear-gradient(135deg, rgba(255, 100, 100, 0.4) 0%, rgba(255, 150, 100, 0.4) 100%)'
              : 'linear-gradient(135deg, rgba(100, 200, 255, 0.4) 0%, rgba(100, 255, 200, 0.4) 100%)',
            border: timeControl.isPaused
              ? '2px solid rgba(255, 100, 100, 0.6)'
              : '2px solid rgba(100, 200, 255, 0.6)',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: timeControl.isPaused
              ? '0 4px 16px rgba(255, 100, 100, 0.3)'
              : '0 4px 16px rgba(100, 200, 255, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {timeControl.isPaused ? '▶️' : '⏸️'}
        </button>
      </div>

      {/* ESKİ ZAMAN ÇİZELGESİ - ÜSTTEKİ YENİ İLE DEĞİŞTİRİLDİ */}
      <div style={{ display: 'none', marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <span style={{ color: '#aaa', fontSize: 12 }}>📅 Zaman</span>
          <span style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '4px 12px',
            borderRadius: 8,
            color: '#000',
            fontSize: 11,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(250, 112, 154, 0.3)'
          }}>
            {formatFullDate(timeControl.year, timeControl.currentTime)}
          </span>
        </div>

        {/* Timeline Slider */}
        <input
          type="range"
          min="0"
          max="365.25"
          step="0.25"
          value={Math.floor(timeControl.currentTime / ONE_DAY_UNITS) % 365.25}
          onChange={handleTimelineChange}
          className="timeline-slider"
          style={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            outline: 'none',
            background: `linear-gradient(to right, 
              rgba(250, 112, 154, 0.8) 0%, 
              rgba(250, 112, 154, 0.8) ${((Math.floor(timeControl.currentTime / ONE_DAY_UNITS) % 365.25) / 365.25) * 100}%, 
              rgba(255, 255, 255, 0.1) ${((Math.floor(timeControl.currentTime / ONE_DAY_UNITS) % 365.25) / 365.25) * 100}%, 
              rgba(255, 255, 255, 0.1) 100%)`,
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none'
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4
        }}>
          <span style={{ color: '#666', fontSize: 10 }}>0 gün</span>
          <span style={{ color: '#666', fontSize: 10 }}>365 gün</span>
        </div>
        <style>{`
          .timeline-slider::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(250, 112, 154, 0.6);
            transition: all 0.2s;
          }
          .timeline-slider::-webkit-slider-thumb:hover {
            transform: scale(1.3);
            box-shadow: 0 4px 16px rgba(250, 112, 154, 0.8);
          }
          .timeline-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(250, 112, 154, 0.6);
            border: none;
            transition: all 0.2s;
          }
          .timeline-slider::-moz-range-thumb:hover {
            transform: scale(1.3);
            box-shadow: 0 4px 16px rgba(250, 112, 154, 0.8);
          }
        `}</style>
      </div>

      {/* ESKİ HIZ GÖSTERGESİ - KALDIRILDI (SpeedControlPanel'de) */}
      <div style={{ display: 'none', marginBottom: 8 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <span style={{ color: '#aaa', fontSize: 12 }}>Hız</span>
          <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '4px 12px',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }}>
            {timeControl.speed.toFixed(1)}x
          </span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0.1"
          max="100"
          step="0.1"
          value={timeControl.speed}
          onChange={handleSpeedChange}
          className="speed-slider"
          style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            outline: 'none',
            background: `linear-gradient(to right, 
              rgba(102, 126, 234, 0.8) 0%, 
              rgba(102, 126, 234, 0.8) ${(timeControl.speed / 100) * 100}%, 
              rgba(255, 255, 255, 0.1) ${(timeControl.speed / 100) * 100}%, 
              rgba(255, 255, 255, 0.1) 100%)`,
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none'
          }}
        />
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

      {/* ESKİ HIZ PRESET BUTONLARI - KALDIRILDI (SpeedControlPanel'de) - GİZLENDİ */}
      <div style={{ display: 'none' }}>
        {[
          { label: '0.5x', value: 0.5 },
          { label: '1x', value: 1 },
          { label: '10x', value: 10 },
          { label: '1 gün', value: 50 },
          { label: '1 ay', value: 200 }
        ].map((preset) => (
          <button
            key={preset.value}
            onClick={() => setTimeControl(prev => ({ ...prev, speed: preset.value }))}
            style={{
              padding: '6px 8px',
              background: timeControl.speed === preset.value
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              border: timeControl.speed === preset.value
                ? '1px solid rgba(102, 126, 234, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 10,
              cursor: 'pointer',
              fontWeight: timeControl.speed === preset.value ? 700 : 400,
              transition: 'all 0.2s',
              boxShadow: timeControl.speed === preset.value
                ? '0 2px 8px rgba(102, 126, 234, 0.3)'
                : 'none',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (timeControl.speed !== preset.value) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
              }
            }}
            onMouseLeave={(e) => {
              if (timeControl.speed !== preset.value) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

