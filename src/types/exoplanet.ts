// Exoplanet hedef tipi
export type ExoplanetTarget = {
  id: string // TIC/EPIC/KOI ID
  name: string
  ra: number // Right Ascension
  dec: number // Declination
  type: 'TIC' | 'EPIC' | 'KOI' | 'TOI'
  confirmed?: boolean
  koiData?: KOIPlanet // Tam KOI verisi (varsa)
}

// Light curve veri noktası
export type LightCurvePoint = {
  time: number // Barycentric Julian Date
  flux: number // Normalized flux
  flux_err: number // Flux error
  quality: number // Quality flags
}

// Light curve verisi
export type LightCurveData = {
  targetId: string
  sector?: number // TESS sector
  quarter?: number // Kepler quarter
  campaign?: number // K2 campaign
  sapFlux: LightCurvePoint[]
  pdcsapFlux: LightCurvePoint[]
  mission: 'TESS' | 'Kepler' | 'K2'
}

// BLS analiz sonucu
export type BLSResult = {
  period: number // En güçlü periyot (gün)
  t0: number // Transit zamanı (BJD)
  duration: number // Transit süresi (saat)
  depth: number // Transit derinliği
  snr: number // Signal-to-noise ratio
  power: number // BLS güç değeri
}

// Periodogram verisi
export type PeriodogramData = {
  periods: number[]
  power: number[]
  bestPeriods: BLSResult[] // En iyi 3 periyot
}

// Phase-folded veri
export type PhaseFoldedData = {
  phase: number[] // 0-1 arası faz
  flux: number[]
  flux_err: number[]
  binned_phase?: number[] // Binned veriler için
  binned_flux?: number[]
  binned_err?: number[]
}

// AI Model tahmini
export type ModelPrediction = {
  probability: number // 0-1 arası tahmin
  confidence: number
  features: {
    snr: number
    depth: number
    duration_ratio: number
    shape_score: number
  }
  explanation: string
  threshold: number
}

// Katalog bilgileri
export type CatalogInfo = {
  targetId: string
  stellar: {
    teff?: number // Effective temperature (K)
    radius?: number // Stellar radius (solar radii)
    mass?: number // Stellar mass (solar masses)
    logg?: number // Surface gravity
    metallicity?: number // [Fe/H]
  }
  planetary?: {
    radius?: number // Planet radius (Earth radii)
    period?: number // Orbital period (days)
    semi_major_axis?: number // AU
    equilibrium_temp?: number // K
    insolation?: number // Relative to Earth
  }
  source: string // NASA Exoplanet Archive, ExoFOP, etc.
  sourceUrl: string
}

// Analiz durumu
export type AnalysisState = 
  | { status: 'idle' }
  | { status: 'loading'; message: string }
  | { status: 'error'; error: string }
  | { status: 'success'; data: AnalysisResults }

// Tam analiz sonuçları
export type AnalysisResults = {
  target: ExoplanetTarget
  lightCurve: LightCurveData
  periodogram?: PeriodogramData
  phaseFolded?: PhaseFoldedData
  selectedPeriod?: BLSResult
  modelPrediction?: ModelPrediction
  catalogInfo?: CatalogInfo
}

// Demo hedefler
export type DemoTarget = {
  id: string
  name: string
  description: string
  sector?: number
  expectedResult: 'planet' | 'false-positive' | 'uncertain'
}

// Kepler KOI API Types
export type KeplerDisposition = 'CONFIRMED' | 'FALSE_POSITIVE' | 'CANDIDATE'

export type KOIPlanet = {
  kepid: number
  kepoi_name?: string
  kepler_name?: string
  koi_disposition?: string
  koi_pdisposition?: KeplerDisposition // ML predicted disposition
  koi_score?: number
  koi_period?: number
  koi_time0bk?: number
  koi_impact?: number
  koi_duration?: number
  koi_depth?: number
  koi_prad?: number // Planet radius in Earth radii
  koi_teq?: number // Equilibrium temperature
  koi_insol?: number // Insolation flux
  koi_steff?: number // Stellar effective temperature
  koi_slogg?: number // Stellar surface gravity
  koi_srad?: number // Stellar radius in solar radii
  ra?: number
  dec?: number
  prediction_probability?: number
  probabilities?: {
    CONFIRMED: number
    FALSE_POSITIVE: number
    CANDIDATE: number
  }
  actual_disposition?: string // For comparison
  [key: string]: any // Allow additional properties
}

export type ModelStatus = {
  model_loaded: boolean
  model_available: boolean
  features_count: number
  classes: string[]
}

export type KOIStatistics = {
  total_count: number
  predicted_confirmed: number
  predicted_false_positive: number
  predicted_candidate: number
  accuracy?: number
  precision?: number
  recall?: number
  f1_score?: number
  [key: string]: any
}

