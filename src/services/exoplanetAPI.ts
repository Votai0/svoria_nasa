import type {
  ExoplanetTarget,
  LightCurveData,
  PeriodogramData,
  ModelPrediction,
  CatalogInfo,
  BLSResult,
  PhaseFoldedData,
  KOIPlanet,
  ModelStatus,
  KOIStatistics,
  KeplerDisposition
} from '../types/exoplanet'

// ============================================================================
// KEPLER KOI API CONFIGURATION
// ============================================================================
// Use /api for proxy in development (see vite.config.ts)
// In production, set VITE_KEPLER_API_URL to your API domain
const KEPLER_API_BASE_URL = import.meta.env.VITE_KEPLER_API_URL || '/api'

// ============================================================================
// KEPLER KOI API FUNCTIONS (Real Data)
// ============================================================================

/**
 * Get list of KOI planets with ML predictions
 */
export async function fetchKOIPlanets(params?: {
  skip?: number
  limit?: number
  disposition?: KeplerDisposition
  only_confirmed?: boolean
  include_actual?: boolean
  include_probabilities?: boolean
}): Promise<KOIPlanet[]> {
  const queryParams = new URLSearchParams()
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
  if (params?.disposition) queryParams.append('disposition', params.disposition)
  if (params?.only_confirmed !== undefined) queryParams.append('only_confirmed', params.only_confirmed.toString())
  if (params?.include_actual !== undefined) queryParams.append('include_actual', params.include_actual.toString())
  if (params?.include_probabilities !== undefined) queryParams.append('include_probabilities', params.include_probabilities.toString())
  
  const url = `${KEPLER_API_BASE_URL}/planets?${queryParams.toString()}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch KOI planets: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get a single KOI planet by Kepler ID
 */
export async function fetchKOIPlanetById(
  kepid: number,
  include_actual = false,
  include_probabilities = false
): Promise<KOIPlanet> {
  const queryParams = new URLSearchParams()
  queryParams.append('include_actual', include_actual.toString())
  queryParams.append('include_probabilities', include_probabilities.toString())
  
  const url = `${KEPLER_API_BASE_URL}/planets/${kepid}?${queryParams.toString()}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch KOI planet ${kepid}: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get ML model status
 */
export async function getModelStatus(): Promise<ModelStatus> {
  const response = await fetch(`${KEPLER_API_BASE_URL}/model/status`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch model status: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get dataset and model statistics
 */
export async function getKOIStatistics(): Promise<KOIStatistics> {
  const response = await fetch(`${KEPLER_API_BASE_URL}/stats`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Convert KOI planet to ExoplanetTarget format for compatibility
 */
export function koiToExoplanetTarget(koi: KOIPlanet): ExoplanetTarget {
  return {
    id: `KOI-${koi.kepid}`,
    name: koi.kepler_name || koi.kepoi_name || `KOI-${koi.kepid}`,
    ra: koi.ra || 0,
    dec: koi.dec || 0,
    type: 'KOI',
    confirmed: koi.koi_pdisposition === 'CONFIRMED'
  }
}

/**
 * Search KOI planets by name or ID with real API data
 */
export async function searchKOIPlanets(query: string): Promise<ExoplanetTarget[]> {
  try {
    // Fetch all planets (set to 1000 max, adjust based on API)
    const planets = await fetchKOIPlanets({ limit: 1000, include_probabilities: true })
    
    const lowerQuery = query.toLowerCase()
    const filtered = planets.filter(planet => {
      const kepid = planet.kepid.toString()
      const koiName = planet.kepoi_name?.toLowerCase() || ''
      const keplerName = planet.kepler_name?.toLowerCase() || ''
      
      return kepid.includes(lowerQuery) || 
             koiName.includes(lowerQuery) || 
             keplerName.includes(lowerQuery)
    })
    
    return filtered.slice(0, 20).map(koiToExoplanetTarget)
  } catch (error) {
    console.error('Failed to search KOI planets:', error)
    return []
  }
}

// ============================================================================
// LEGACY MOCK DATA (Kept for backward compatibility with other components)
// ============================================================================
// Note: SearchBar now uses searchKOIPlanets() with real API data

/**
 * Fetch light curve data from KOI parameters
 * Generates synthetic light curve based on real KOI transit parameters
 */
export async function fetchLightCurve(
  targetId: string,
  _dataType: 'SAP' | 'PDCSAP' = 'PDCSAP',
  sector?: number,
  koiData?: KOIPlanet
): Promise<LightCurveData> {
  // Gerçek uygulamada MAST Archive API kullanılır
  // https://mast.stsci.edu/api/v0/pyex.html
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // KOI parametrelerinden gerçekçi veri üret
  const numPoints = 10000
  const period = koiData?.koi_period || 3.85 // gün
  const t0 = koiData?.koi_time0bk ? (koiData.koi_time0bk % period) : 0.5
  const duration = koiData?.koi_duration ? koiData.koi_duration / 24 : 0.12 // saatten güne
  const depth = koiData?.koi_depth ? koiData.koi_depth / 1e6 : 0.01 // ppm'den normalize
  
  const sapFlux = []
  const pdcsapFlux = []
  
  for (let i = 0; i < numPoints; i++) {
    const time = i * 0.002 // 2 dakika cadence
    const noise = (Math.random() - 0.5) * 0.001
    
    // Transit modeli
    let flux = 1.0
    const phase = ((time - t0) % period) / period
    const transitPhase = phase < 0 ? phase + 1 : phase
    
    if (Math.abs(transitPhase - 0.5) < (duration / period / 2) || 
        transitPhase < (duration / period / 2) || 
        transitPhase > (1 - duration / period / 2)) {
      flux = 1.0 - depth
    }
    
    const finalFlux = flux + noise
    const quality = Math.random() > 0.95 ? 1 : 0
    
    sapFlux.push({
      time,
      flux: finalFlux + noise * 0.5, // SAP daha gürültülü
      flux_err: 0.0005,
      quality
    })
    
    pdcsapFlux.push({
      time,
      flux: finalFlux,
      flux_err: 0.0003,
      quality
    })
  }
  
  return {
    targetId,
    sector: sector || 44,
    sapFlux,
    pdcsapFlux,
    mission: 'TESS'
  }
}

/**
 * Run BLS (Box Least Squares) analysis on light curve
 * Uses KOI catalog period as reference for realistic periodogram
 */
export async function runBLSAnalysis(
  _lightCurve: LightCurveData,
  koiData?: KOIPlanet,
  minPeriod: number = 0.5,
  maxPeriod: number = 20
): Promise<PeriodogramData> {
  // Gerçek uygulamada astropy BLS veya lightkurve kullanılır
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // KOI katalog periyodunu kullan
  const truePeriod = koiData?.koi_period || 3.85
  const trueT0 = koiData?.koi_time0bk || 0.5
  const trueDuration = koiData?.koi_duration || 2.88 // saat
  const trueDepth = koiData?.koi_depth ? koiData.koi_depth / 1e6 : 0.01
  const trueSNR = koiData?.koi_model_snr || 15
  
  const periods: number[] = []
  const power: number[] = []
  
  for (let p = minPeriod; p <= maxPeriod; p += 0.01) {
    periods.push(p)
    // Gerçek periyotta pik oluştur
    const dist = Math.abs(p - truePeriod)
    const signal = Math.exp(-dist * dist / 0.02)
    const noise = Math.random() * 0.1
    power.push(signal + noise)
  }
  
  // En yüksek 3 piki bul (gerçek KOI periyodu ilk sırada olacak)
  const peaks: BLSResult[] = []
  const sortedIndices = power
    .map((p, i) => ({ power: p, index: i }))
    .sort((a, b) => b.power - a.power)
    .slice(0, 3)
  
  sortedIndices.forEach(({ power: p, index: i }, rank) => {
    const period = periods[i]
    // İlk peak (en güçlü) KOI katalog değerlerini kullanır
    const isMainPeak = rank === 0
    peaks.push({
      period: isMainPeak ? truePeriod : period,
      t0: isMainPeak ? trueT0 : 0.5,
      duration: isMainPeak ? trueDuration : 2.88,
      depth: isMainPeak ? trueDepth : 0.01,
      snr: isMainPeak ? trueSNR : p * 10,
      power: p
    })
  })
  
  return {
    periods,
    power,
    bestPeriods: peaks
  }
}

// Phase-folded veri oluştur
export async function foldLightCurve(
  lightCurve: LightCurveData,
  period: number,
  t0: number,
  dataType: 'SAP' | 'PDCSAP' = 'PDCSAP',
  nBins: number = 100
): Promise<PhaseFoldedData> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const data = dataType === 'SAP' ? lightCurve.sapFlux : lightCurve.pdcsapFlux
  
  // Faz hesapla
  const phase: number[] = []
  const flux: number[] = []
  const flux_err: number[] = []
  
  data.forEach(point => {
    if (point.quality === 0) { // Sadece kaliteli veri
      const p = ((point.time - t0) % period) / period
      const normalizedPhase = p < 0 ? p + 1 : p
      phase.push(normalizedPhase)
      flux.push(point.flux)
      flux_err.push(point.flux_err)
    }
  })
  
  // Binned veriler oluştur
  const binned_phase: number[] = []
  const binned_flux: number[] = []
  const binned_err: number[] = []
  
  for (let i = 0; i < nBins; i++) {
    const binStart = i / nBins
    const binEnd = (i + 1) / nBins
    const binCenter = (binStart + binEnd) / 2
    
    const binPoints = phase
      .map((p, idx) => ({ phase: p, flux: flux[idx], err: flux_err[idx] }))
      .filter(point => point.phase >= binStart && point.phase < binEnd)
    
    if (binPoints.length > 0) {
      const meanFlux = binPoints.reduce((sum, p) => sum + p.flux, 0) / binPoints.length
      const stdErr = Math.sqrt(
        binPoints.reduce((sum, p) => sum + Math.pow(p.flux - meanFlux, 2), 0) / binPoints.length
      ) / Math.sqrt(binPoints.length)
      
      binned_phase.push(binCenter)
      binned_flux.push(meanFlux)
      binned_err.push(stdErr)
    }
  }
  
  return {
    phase,
    flux,
    flux_err,
    binned_phase,
    binned_flux,
    binned_err
  }
}

/**
 * AI model prediction using KOI catalog data and BLS results
 * Simulates ML model using real KOI parameters
 */
export async function predictPlanetCandidate(
  blsResult: BLSResult,
  _lightCurve: LightCurveData,
  koiData?: KOIPlanet
): Promise<ModelPrediction> {
  // Gerçek uygulamada TensorFlow.js veya backend ML modeli
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const { snr, depth, duration } = blsResult
  
  // KOI disposition skorunu kullan (eğer varsa)
  let baseScore = 0.5
  if (koiData) {
    // KOI score varsa direkt kullan (0-1 arası)
    if (koiData.koi_score !== undefined && koiData.koi_score !== null) {
      baseScore = koiData.koi_score
    }
    
    // veya disposition'dan tahmin et
    if (koiData.koi_pdisposition === 'CONFIRMED') {
      baseScore = 0.95
    } else if (koiData.koi_disposition === 'CONFIRMED') {
      baseScore = 0.92
    } else if (koiData.koi_pdisposition === 'CANDIDATE') {
      baseScore = 0.65
    } else if (koiData.koi_pdisposition === 'FALSE_POSITIVE') {
      baseScore = 0.15
    }
    
    // False positive flagları varsa skoru düşür
    if (koiData.koi_fpflag_nt || koiData.koi_fpflag_ss || 
        koiData.koi_fpflag_co || koiData.koi_fpflag_ec) {
      baseScore *= 0.7
    }
  } else {
    // KOI verisi yoksa BLS parametrelerinden hesapla
    const snrScore = Math.min(snr / 20, 1)
    const depthScore = depth > 0.001 && depth < 0.1 ? 1 : 0.5
    const durationScore = duration > 1 && duration < 10 ? 1 : 0.6
    const shapeScore = 0.82
    baseScore = (snrScore * 0.4 + depthScore * 0.2 + durationScore * 0.2 + shapeScore * 0.2)
  }
  
  const probability = Math.max(0, Math.min(1, baseScore))
  
  let explanation = ''
  let disposition = ''
  
  if (koiData) {
    disposition = koiData.koi_pdisposition || koiData.koi_disposition || 'UNKNOWN'
    
    if (disposition === 'CONFIRMED') {
      explanation = `✓ Onaylanmış exoplanet. Kepler katalog verileri transit sinyalini doğruladı. SNR: ${snr.toFixed(1)}, Periyot: ${blsResult.period.toFixed(3)} gün.`
    } else if (disposition === 'CANDIDATE') {
      explanation = `Gezegen adayı. Transit sinyali mevcut ancak ek doğrulama gerekli. SNR: ${snr.toFixed(1)}, Derinlik: ${(depth * 1e6).toFixed(0)} ppm.`
    } else if (disposition === 'FALSE_POSITIVE') {
      explanation = `Yanlış pozitif olarak işaretlenmiş. Sinyal muhtemelen stellar aktivite veya ikili yıldız etkisi.`
    } else {
      explanation = `Transit benzeri sinyal tespit edildi. Katalog skoru: ${probability.toFixed(2)}`
    }
    
    // Ek bilgiler ekle
    if (koiData.koi_num_transits) {
      explanation += ` ${koiData.koi_num_transits} transit gözlendi.`
    }
  } else {
    if (probability > 0.8) {
      explanation = 'Güçlü transit sinyali, tutarlı periyot ve uygun derinlik. Yüksek gezegen adayı olasılığı.'
    } else if (probability > 0.5) {
      explanation = 'Transit benzeri sinyal mevcut, ancak SNR veya şekil özellikleri belirsizlik içeriyor.'
    } else {
      explanation = 'Zayıf sinyal veya stellar aktivite ile karışabilir. Ek doğrulama gerekli.'
    }
  }
  
  return {
    probability,
    confidence: koiData ? 0.95 : 0.75,
    features: {
      snr,
      depth,
      duration_ratio: duration / (blsResult.period * 24),
      shape_score: koiData?.koi_score || 0.82
    },
    explanation,
    threshold: 0.75
  }
}

/**
 * Convert KOI planet data to CatalogInfo
 */
export function koiToCatalogInfo(koi: KOIPlanet): CatalogInfo {
  return {
    targetId: koi.kepler_name || koi.kepoi_name || `KOI-${koi.kepid}`,
    stellar: {
      teff: koi.koi_steff || koi.st_teff,
      radius: koi.koi_srad || koi.st_rad,
      mass: koi.koi_smass || koi.st_mass,
      logg: koi.koi_slogg || koi.st_logg,
      metallicity: koi.koi_smet || koi.st_met
    },
    planetary: {
      radius: koi.koi_prad, // Earth radii
      period: koi.koi_period, // days
      semi_major_axis: koi.koi_sma, // AU
      equilibrium_temp: koi.koi_teq, // K
      insolation: koi.koi_insol // Earth flux
    },
    source: 'Kepler Objects of Interest (KOI) - NASA Exoplanet Archive',
    sourceUrl: `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/DisplayOverview/nph-DisplayOverview?objname=KOI-${koi.kepid}`
  }
}

/**
 * Fetch catalog info from KOI data directly
 */
export async function fetchCatalogInfo(
  _targetId: string,
  koiData: KOIPlanet
): Promise<CatalogInfo> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // KOI verisinden katalog bilgisi oluştur
  return koiToCatalogInfo(koiData)
}

/**
 * Fetch catalog info from KOI data
 */
export async function fetchCatalogInfoFromKOI(kepid: number): Promise<CatalogInfo> {
  try {
    const koi = await fetchKOIPlanetById(kepid, false, false)
    return koiToCatalogInfo(koi)
  } catch (error) {
    console.error('Failed to fetch KOI catalog info:', error)
    throw error
  }
}

