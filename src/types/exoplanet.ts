// Exoplanet hedef tipi
export type ExoplanetTarget = {
  id: string // TIC/EPIC/KOI ID
  name: string
  ra: number // Right Ascension
  dec: number // Declination
  type: 'TIC' | 'EPIC' | 'KOI' | 'TOI'
  confirmed?: boolean
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

