import { useState, useEffect } from 'react'
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
  
  // Input'lar için local state
  const [yearInputValue, setYearInputValue] = useState(timeControl.year.toString())
  const [dayInputValue, setDayInputValue] = useState((currentDay + 1).toString())
  const [hourInputValue, setHourInputValue] = useState(currentHourOfDay.toString())
  
  // timeControl değiştiğinde input'ları sync et
  useEffect(() => {
    setYearInputValue(timeControl.year.toString())
  }, [timeControl.year])
  
  useEffect(() => {
    setDayInputValue((currentDay + 1).toString())
    setHourInputValue(currentHourOfDay.toString())
  }, [currentDay, currentHourOfDay])

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hour = parseFloat(e.target.value)
    const newTime = hour / 24
    setTimeControl(prev => ({ 
      ...prev, 
      currentTime: Math.floor(prev.currentTime / 365.25) * 365.25 + newTime 
    }))
  }

  const handleDayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece input değerini güncelle
    setDayInputValue(e.target.value)
  }

  const handleDayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const day = parseInt(dayInputValue) || 1
      const clampedDay = Math.max(1, Math.min(365, day)) - 1
      const newTime = clampedDay + (currentHourOfDay / 24)
      setTimeControl(prev => ({ 
        ...prev, 
        currentTime: newTime 
      }))
      setDayInputValue((clampedDay + 1).toString())
    }
  }

  const handleDayBlur = () => {
    // Input'tan çıkınca geçerli değere geri dön
    setDayInputValue((currentDay + 1).toString())
  }

  const handleHourInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece input değerini güncelle
    setHourInputValue(e.target.value)
  }

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const hour = parseInt(hourInputValue) || 0
      const clampedHour = Math.max(0, Math.min(23, hour))
      const newTime = currentDay + (clampedHour / 24)
      setTimeControl(prev => ({ 
        ...prev, 
        currentTime: newTime 
      }))
      setHourInputValue(clampedHour.toString())
    }
  }

  const handleHourBlur = () => {
    // Input'tan çıkınca geçerli değere geri dön
    setHourInputValue(currentHourOfDay.toString())
  }

  const handleYearChange = (newYear: number) => {
    // Gün ve saat değerlerini koru, sadece yılı değiştir
    setTimeControl(prev => ({ 
      ...prev, 
      year: newYear
      // currentTime değişmeden kalacak
    }))
    setYearInputValue(newYear.toString())
  }

  const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece input değerini güncelle, state'i değiştirme
    setYearInputValue(e.target.value)
  }

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const year = parseInt(yearInputValue) || timeControl.year
      const clampedYear = Math.max(1900, Math.min(3000, year))
      // Yıl değiştir ama currentTime'ı koru
      setTimeControl(prev => ({ 
        ...prev, 
        year: clampedYear
      }))
      setYearInputValue(clampedYear.toString())
    }
  }

  const handleYearBlur = () => {
    // Input'tan çıkınca geçerli değere geri dön
    setYearInputValue(timeControl.year.toString())
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
          <input
            type="number"
            min="1900"
            max="3000"
            value={yearInputValue}
            onChange={handleYearInputChange}
            onKeyDown={handleYearKeyDown}
            onBlur={handleYearBlur}
            disabled={timeControl.isPaused}
            placeholder={timeControl.year.toString()}
            style={{
              width: 60,
              padding: '4px 8px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              textAlign: 'center',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              outline: 'none',
              cursor: timeControl.isPaused ? 'not-allowed' : 'text',
              opacity: timeControl.isPaused ? 0.5 : 1
            }}
          />
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
        <div style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center'
        }}>
          <input
            type="number"
            min="1"
            max="365"
            value={dayInputValue}
            onChange={handleDayInputChange}
            onKeyDown={handleDayKeyDown}
            onBlur={handleDayBlur}
            disabled={timeControl.isPaused}
            placeholder={(currentDay + 1).toString()}
            style={{
              width: 50,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '5px 8px',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              outline: 'none',
              cursor: timeControl.isPaused ? 'not-allowed' : 'text',
              opacity: timeControl.isPaused ? 0.5 : 1
            }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}>g</span>
          <input
            type="number"
            min="0"
            max="23"
            value={hourInputValue}
            onChange={handleHourInputChange}
            onKeyDown={handleHourKeyDown}
            onBlur={handleHourBlur}
            disabled={timeControl.isPaused}
            placeholder={currentHourOfDay.toString()}
            style={{
              width: 40,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '5px 8px',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              outline: 'none',
              cursor: timeControl.isPaused ? 'not-allowed' : 'text',
              opacity: timeControl.isPaused ? 0.5 : 1
            }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}>s</span>
        </div>
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
        
        /* Number input spin buttons kaldır */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  )
}

