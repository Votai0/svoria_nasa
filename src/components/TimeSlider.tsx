import type { TimeControl } from '../types'

type Props = {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
}

export default function TimeSlider({ timeControl, setTimeControl }: Props) {
  // 365.25 gün (6 saat ekstra her yıl)
  const totalHoursInYear = 365.25 * 24
  const currentHour = (timeControl.currentTime * 24) % totalHoursInYear
  const currentDay = Math.floor(currentHour / 24)
  const currentHourOfDay = Math.floor(currentHour % 24)

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hour = parseFloat(e.target.value)
    const newTime = hour / 24
    setTimeControl(prev => ({ 
      ...prev, 
      currentTime: Math.floor(prev.currentTime / 365.25) * 365.25 + newTime 
    }))
  }

  const handleYearChange = (newYear: number) => {
    setTimeControl(prev => ({ 
      ...prev, 
      year: newYear,
      currentTime: 0 // Yeni yıla geçince zamanı sıfırla
    }))
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: 262, // SpeedControlPanel'in üstünde
      left: 16,
      zIndex: 100,
      background: 'rgba(15, 15, 30, 0.92)',
      backdropFilter: 'blur(24px)',
      borderRadius: 12,
      padding: '14px 16px 12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      width: 'min(320px, calc(100vw - 580px))',
      minWidth: 260,
      border: '1px solid rgba(255, 255, 255, 0.12)',
      maxHeight: 'calc(100vh - 280px)',
      overflowY: 'auto'
    }}>
      {/* Yıl Seçici */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        justifyContent: 'space-between'
      }}>
        <span style={{
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
          opacity: 0.7
        }}>
          🗓️ Yıl:
        </span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleYearChange(timeControl.year - 1)}
            disabled={timeControl.isPaused}
            style={{
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 10,
              cursor: timeControl.isPaused ? 'not-allowed' : 'pointer',
              opacity: timeControl.isPaused ? 0.5 : 1
            }}
          >
            ◄
          </button>
          <span style={{
            padding: '4px 12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            borderRadius: 6,
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            minWidth: 60,
            textAlign: 'center'
          }}>
            {timeControl.year}
          </span>
          <button
            onClick={() => handleYearChange(timeControl.year + 1)}
            disabled={timeControl.isPaused}
            style={{
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 10,
              cursor: timeControl.isPaused ? 'not-allowed' : 'pointer',
              opacity: timeControl.isPaused ? 0.5 : 1
            }}
          >
            ►
          </button>
        </div>
      </div>

      {/* Başlık ve Konum Göstergesi */}
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
          📅 Yıl İçi Konum
        </span>
        <span style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '5px 12px',
          borderRadius: 8,
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          minWidth: 100,
          textAlign: 'center'
        }}>
          {currentDay + 1}g {currentHourOfDay}s
        </span>
      </div>

      {/* Zaman Slider - 0-8766 saat arası (365.25 gün × 24 saat) */}
      <input
        type="range"
        min="0"
        max={totalHoursInYear}
        step="1"
        value={currentHour}
        onChange={handleTimeChange}
        disabled={timeControl.isPaused}
        className="time-slider"
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          outline: 'none',
          background: `linear-gradient(to right, 
            rgba(16, 185, 129, 0.8) 0%, 
            rgba(16, 185, 129, 0.8) ${(currentHour / totalHoursInYear) * 100}%, 
            rgba(255, 255, 255, 0.1) ${(currentHour / totalHoursInYear) * 100}%, 
            rgba(255, 255, 255, 0.1) 100%)`,
          cursor: timeControl.isPaused ? 'not-allowed' : 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          opacity: timeControl.isPaused ? 0.5 : 1,
          marginBottom: 8
        }}
      />

      {/* Alt bilgi */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        <span>0g</span>
        <span>365g 6s / yıl</span>
      </div>

      <style>{`
        .time-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
          transition: all 0.2s;
        }
        .time-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.7);
        }
        .time-slider:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .time-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
          border: none;
          transition: all 0.2s;
        }
        .time-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  )
}

