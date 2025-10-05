import { useState } from 'react'

export interface HyperparameterConfig {
  max_depth: number
  learning_rate: number
  n_estimators: number
  min_child_weight: number
  gamma: number
  subsample: number
  colsample_bytree: number
  reg_alpha: number
  reg_lambda: number
  test_size: number
  val_size: number
  n_folds: number
  early_stopping_rounds: number
  use_existing_data: boolean
  model_name: string
}

const DEFAULT_CONFIG: HyperparameterConfig = {
  max_depth: 6,
  learning_rate: 0.05,
  n_estimators: 500,
  min_child_weight: 3,
  gamma: 0.1,
  subsample: 0.8,
  colsample_bytree: 0.8,
  reg_alpha: 0.1,
  reg_lambda: 1.0,
  test_size: 0.2,
  val_size: 0.1,
  n_folds: 5,
  early_stopping_rounds: 50,
  use_existing_data: true,
  model_name: 'custom_model'
}

interface HyperparameterModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (config: HyperparameterConfig) => void
  fileName: string
}

export default function HyperparameterModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  fileName 
}: HyperparameterModalProps) {
  const [config, setConfig] = useState<HyperparameterConfig>(DEFAULT_CONFIG)

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit(config)
    onClose()
  }

  const updateConfig = (key: keyof HyperparameterConfig, value: number | boolean | string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: 20,
        padding: 32,
        maxWidth: 800,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: 24,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 16
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'white',
            marginBottom: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ⚙️ Model Hiperparametre Ayarları
          </h2>
          <p style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0
          }}>
            📄 {fileName}
          </p>
        </div>

        {/* Configuration Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 20,
          marginBottom: 24
        }}>
          {/* Model Settings */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            padding: 20,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'rgb(165, 180, 252)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🎯 Model Ayarları
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 8
              }}>
                Model İsmi
              </label>
              <input
                type="text"
                value={config.model_name}
                onChange={(e) => updateConfig('model_name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 14
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <input
                type="checkbox"
                id="use_existing_data"
                checked={config.use_existing_data}
                onChange={(e) => updateConfig('use_existing_data', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label
                htmlFor="use_existing_data"
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Mevcut veri ile birleştir
              </label>
            </div>
          </div>

          {/* XGBoost Hyperparameters */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            padding: 20,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'rgb(165, 180, 252)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🌲 XGBoost Parametreleri
            </h3>

            <SliderControl
              label="Max Depth"
              value={config.max_depth}
              min={3}
              max={10}
              step={1}
              onChange={(v) => updateConfig('max_depth', v)}
              description="Ağaç derinliği (3-10)"
            />

            <SliderControl
              label="Learning Rate"
              value={config.learning_rate}
              min={0.01}
              max={0.3}
              step={0.01}
              onChange={(v) => updateConfig('learning_rate', v)}
              description="Öğrenme hızı (0.01-0.3)"
            />

            <SliderControl
              label="N Estimators"
              value={config.n_estimators}
              min={100}
              max={1000}
              step={50}
              onChange={(v) => updateConfig('n_estimators', v)}
              description="Boost iterasyonu (100-1000)"
            />

            <SliderControl
              label="Min Child Weight"
              value={config.min_child_weight}
              min={1}
              max={10}
              step={1}
              onChange={(v) => updateConfig('min_child_weight', v)}
              description="Min örnek ağırlığı (1-10)"
            />

            <SliderControl
              label="Gamma"
              value={config.gamma}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => updateConfig('gamma', v)}
              description="Min kayıp azalması (0-1)"
            />

            <SliderControl
              label="Subsample"
              value={config.subsample}
              min={0.5}
              max={1}
              step={0.05}
              onChange={(v) => updateConfig('subsample', v)}
              description="Örnek oranı (0.5-1.0)"
            />

            <SliderControl
              label="Colsample ByTree"
              value={config.colsample_bytree}
              min={0.5}
              max={1}
              step={0.05}
              onChange={(v) => updateConfig('colsample_bytree', v)}
              description="Sütun oranı (0.5-1.0)"
            />

            <SliderControl
              label="Reg Alpha (L1)"
              value={config.reg_alpha}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => updateConfig('reg_alpha', v)}
              description="L1 regülarizasyon (0-1)"
            />

            <SliderControl
              label="Reg Lambda (L2)"
              value={config.reg_lambda}
              min={0}
              max={10}
              step={0.5}
              onChange={(v) => updateConfig('reg_lambda', v)}
              description="L2 regülarizasyon (0-10)"
            />
          </div>

          {/* Training Configuration */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            padding: 20,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            gridColumn: 'span 2'
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'rgb(165, 180, 252)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📊 Eğitim Konfigürasyonu
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16
            }}>
              <SliderControl
                label="Test Size"
                value={config.test_size}
                min={0.1}
                max={0.3}
                step={0.05}
                onChange={(v) => updateConfig('test_size', v)}
                description="Test veri oranı (0.1-0.3)"
              />

              <SliderControl
                label="Validation Size"
                value={config.val_size}
                min={0.1}
                max={0.2}
                step={0.05}
                onChange={(v) => updateConfig('val_size', v)}
                description="Validasyon oranı (0.1-0.2)"
              />

              <SliderControl
                label="N Folds (CV)"
                value={config.n_folds}
                min={3}
                max={10}
                step={1}
                onChange={(v) => updateConfig('n_folds', v)}
                description="Cross-validation fold (3-10)"
              />

              <SliderControl
                label="Early Stopping"
                value={config.early_stopping_rounds}
                min={20}
                max={100}
                step={10}
                onChange={(v) => updateConfig('early_stopping_rounds', v)}
                description="Erken durdurma (20-100)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: 20
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            ❌ İptal
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            🚀 Eğitime Başla
          </button>
        </div>
      </div>
    </div>
  )
}

// Slider Control Component
function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  description
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  description: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
      }}>
        <label style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          {label}
        </label>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'rgb(99, 102, 241)',
          background: 'rgba(99, 102, 241, 0.15)',
          padding: '2px 8px',
          borderRadius: 6
        }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: 'rgba(99, 102, 241, 0.2)',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      <div style={{
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4
      }}>
        {description}
      </div>
    </div>
  )
}
