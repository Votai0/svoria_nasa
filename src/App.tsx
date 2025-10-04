import { useState } from 'react'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)'
    }}>
      {/* Floating Search Bar */}
      <div style={{
        position: 'absolute',
        top: 30,
        left: 30,
        zIndex: 1000,
        width: 320
      }}>
        <div style={{ position: 'relative' }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="🔍 Search planets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchExpanded(true)}
            style={{
              width: '100%',
              padding: '14px 44px 14px 20px',
              background: 'rgba(10, 10, 15, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 50,
              color: 'white',
              fontSize: 15,
              outline: 'none',
              transition: 'all 0.3s',
              boxSizing: 'border-box',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              fontWeight: 400
            }}
          />
          
          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            >
              ×
            </button>
          )}
        </div>

        {/* Expanded Results Panel */}
        {(isSearchExpanded || searchQuery) && (
          <div style={{
            marginTop: 12,
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 20,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            maxHeight: '70vh',
            overflowY: 'auto',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div style={{ 
              padding: 20, 
              textAlign: 'center', 
              color: '#888',
              fontSize: 13
            }}>
              Henüz veri yok
            </div>
          </div>
        )}
      </div>

      {/* Close overlay when clicking outside */}
      {(isSearchExpanded || searchQuery) && (
        <div
          onClick={() => setIsSearchExpanded(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

