import type { TimeControl } from '../types'

// Yıl seçici bileşeni
export default function YearSelector({ timeControl, setTimeControl }: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
}) {
  const handleYearChange = (delta: number) => {
    setTimeControl(prev => {
      const newYear = prev.year + delta
      return {
        ...prev,
        year: newYear,
        // Yeni yıla geçerken zamanı sıfırla (yılın başı)
        currentTime: 0
      }
    })
  }

  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(e.target.value)
    if (!isNaN(newYear) && newYear >= 1900 && newYear <= 2100) {
      setTimeControl(prev => ({
        ...prev,
        year: newYear,
        // Yeni yıla geçerken zamanı sıfırla (yılın başı)
        currentTime: 0
      }))
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12
    }}>
      <span style={{ color: '#aaa', fontSize: 12, minWidth: 40 }}>📆 Yıl</span>
      
      <button
        onClick={() => handleYearChange(-10)}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          padding: '6px 10px',
          color: '#fff',
          fontSize: 11,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        -10
      </button>

      <button
        onClick={() => handleYearChange(-1)}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          padding: '6px 10px',
          color: '#fff',
          fontSize: 11,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        -1
      </button>

      <input
        type="number"
        value={timeControl.year}
        onChange={handleYearInput}
        min="1900"
        max="2100"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '1px solid rgba(102, 126, 234, 0.6)',
          borderRadius: 8,
          padding: '6px 12px',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          width: 70,
          textAlign: 'center',
          outline: 'none',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        }}
      />

      <button
        onClick={() => handleYearChange(1)}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          padding: '6px 10px',
          color: '#fff',
          fontSize: 11,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        +1
      </button>

      <button
        onClick={() => handleYearChange(10)}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          padding: '6px 10px',
          color: '#fff',
          fontSize: 11,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        +10
      </button>
    </div>
  )
}

