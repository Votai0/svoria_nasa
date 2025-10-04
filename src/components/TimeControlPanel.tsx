import type { TimeControl } from '../types'
import { ONE_DAY_UNITS, ONE_YEAR_UNITS } from '../constants/time'
import { formatTime } from '../utils/time'

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
    setTimeControl({ speed: 1, isPaused: false, currentTime: 0 })
  }
  
  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseFloat(e.target.value)
    const timeUnits = days * ONE_DAY_UNITS
    setTimeControl(prev => ({ ...prev, currentTime: timeUnits }))
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      minWidth: 280,
      maxWidth: 320,
      border: '1px solid rgba(255, 255, 255, 0.1)'
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
          fontSize: 14,
          fontWeight: 600,
          opacity: 0.9
        }}>
          ⏱️ Zaman Kontrolü
        </span>
        <button
          onClick={resetTime}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            padding: '4px 10px',
            color: '#fff',
            fontSize: 11,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Oynat/Duraklat */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 16
      }}>
        <button
          onClick={togglePause}
          style={{
            width: 50,
            height: 50,
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

      {/* Zaman Çizelgesi (Timeline) */}
      <div style={{ marginBottom: 16 }}>
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
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(250, 112, 154, 0.3)'
          }}>
            {formatTime(timeControl.currentTime)}
          </span>
        </div>

        {/* Timeline Slider */}
        <input
          type="range"
          min="0"
          max="365.25"
          step="0.25"
          value={(timeControl.currentTime / ONE_DAY_UNITS) % 365.25}
          onChange={handleTimelineChange}
          className="timeline-slider"
          style={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            outline: 'none',
            background: `linear-gradient(to right, 
              rgba(250, 112, 154, 0.8) 0%, 
              rgba(250, 112, 154, 0.8) ${(((timeControl.currentTime / ONE_DAY_UNITS) % 365.25) / 365.25) * 100}%, 
              rgba(255, 255, 255, 0.1) ${(((timeControl.currentTime / ONE_DAY_UNITS) % 365.25) / 365.25) * 100}%, 
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

      {/* Hız göstergesi ve slider */}
      <div style={{ marginBottom: 8 }}>
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

      {/* Hız preset butonları */}
      <div style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[0.5, 1, 5, 10, 50].map((speed) => (
          <button
            key={speed}
            onClick={() => setTimeControl(prev => ({ ...prev, speed }))}
            style={{
              padding: '6px 10px',
              background: timeControl.speed === speed
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              border: timeControl.speed === speed
                ? '1px solid rgba(102, 126, 234, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: timeControl.speed === speed ? 700 : 400,
              transition: 'all 0.2s',
              boxShadow: timeControl.speed === speed
                ? '0 2px 8px rgba(102, 126, 234, 0.3)'
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (timeControl.speed !== speed) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
              }
            }}
            onMouseLeave={(e) => {
              if (timeControl.speed !== speed) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  )
}

