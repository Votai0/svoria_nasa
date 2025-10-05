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
 * Get list of KOI planets with ML predictions (single request)
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
 * Fetch ALL KOI planets in batches of 1000
 * Automatically handles pagination until all data is retrieved
 */
export async function fetchAllKOIPlanets(params?: {
  disposition?: KeplerDisposition
  only_confirmed?: boolean
  include_actual?: boolean
  include_probabilities?: boolean
  onProgress?: (loaded: number) => void
}): Promise<KOIPlanet[]> {
  const BATCH_SIZE = 1000
  let allPlanets: KOIPlanet[] = []
  let skip = 0
  let hasMore = true
  
  console.log('🚀 Tüm KOI gezegenleri yükleniyor (1000\'lik batch\'lerle)...')
  
  while (hasMore) {
    const batch = await fetchKOIPlanets({
      skip,
      limit: BATCH_SIZE,
      disposition: params?.disposition,
      only_confirmed: params?.only_confirmed,
      include_actual: params?.include_actual,
      include_probabilities: params?.include_probabilities
    })
    
    allPlanets = allPlanets.concat(batch)
    
    console.log(`📦 Batch yüklendi: ${skip + batch.length} / toplam`)
    
    // Progress callback
    if (params?.onProgress) {
      params.onProgress(allPlanets.length)
    }
    
    // Eğer dönen veri BATCH_SIZE'dan azsa, son batch'teyiz demektir
    if (batch.length < BATCH_SIZE) {
      hasMore = false
      console.log(`✅ TÜM veriler yüklendi: ${allPlanets.length} gezegen`)
    } else {
      skip += BATCH_SIZE
    }
  }
  
  return allPlanets
}

/**
 * Get a single KOI planet by Kepler ID
 */
export async function fetchKOIPlanetById(
  kepid: number,
  include_actual = true,
  include_probabilities = true
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
 * Physical transit model with limb darkening
 */
function transitModel(
  phase: number,
  depth: number,
  duration: number,
  period: number,
  impact: number = 0.5
): number {
  // Normalize phase to [-0.5, 0.5]
  let p = phase
  if (p > 0.5) p -= 1
  if (p < -0.5) p += 1
  
  const halfDuration = (duration / period) / 2
  
  // Outside transit
  if (Math.abs(p) > halfDuration) {
    return 1.0
  }
  
  // Transit ingress/egress with smooth curve
  const transitFraction = Math.abs(p) / halfDuration
  
  // Limb darkening effect (quadratic)
  const limbDarkening = 1.0 - 0.3 * (1.0 - Math.sqrt(1.0 - transitFraction * transitFraction))
  
  // Impact parameter effect
  const impactFactor = 1.0 - impact * 0.3
  
  // Smooth ingress/egress
  let transitDepth = depth * limbDarkening * impactFactor
  
  if (transitFraction > 0.8) {
    // Smooth edges
    const edgeFactor = (1.0 - transitFraction) / 0.2
    transitDepth *= edgeFactor
  }
  
  return 1.0 - transitDepth
}

/**
 * Add realistic stellar variability and noise
 */
function addStellarVariability(
  time: number,
  flux: number,
  variabilityPeriod: number = 25.0,
  variabilityAmp: number = 0.002
): number {
  // Stellar rotation/spots (sinusoidal)
  const stellarVar = variabilityAmp * Math.sin(2 * Math.PI * time / variabilityPeriod)
  
  // Long-term trend
  const longTrend = 0.0005 * Math.sin(2 * Math.PI * time / 100)
  
  return flux + stellarVar + longTrend
}

/**
 * Generate correlated (red) noise
 */
function generateRedNoise(time: number, amplitude: number, frequency: number = 0.1): number {
  // Multiple frequency components for realistic noise
  let noise = 0
  for (let i = 1; i <= 5; i++) {
    noise += Math.sin(2 * Math.PI * frequency * i * time + Math.random() * 2 * Math.PI) / i
  }
  return noise * amplitude / 3
}

/**
 * Fetch light curve data from KOI parameters
 * Generates realistic light curve based on KOI transit parameters
 * with physical transit model, limb darkening, and stellar variability
 */
export async function fetchLightCurve(
  targetId: string,
  _dataType: 'SAP' | 'PDCSAP' = 'PDCSAP',
  sector?: number,
  koiData?: KOIPlanet
): Promise<LightCurveData> {
  console.log('🔬 Generating realistic light curve from KOI parameters:', {
    period: koiData?.koi_period,
    depth: koiData?.koi_depth,
    duration: koiData?.koi_duration,
    t0: koiData?.koi_time0bk,
    impact: koiData?.koi_impact,
    snr: koiData?.koi_model_snr
  })
  
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // KOI gerçek parametreleri
  const period = koiData?.koi_period || 3.85 // gün
  const t0 = koiData?.koi_time0bk ? (koiData.koi_time0bk % period) : 0.5
  const duration = koiData?.koi_duration ? koiData.koi_duration / 24 : 0.12 // saat → gün
  const depth = koiData?.koi_depth ? koiData.koi_depth / 1e6 : 0.01 // ppm → normalized
  const impact = koiData?.koi_impact !== undefined ? koiData.koi_impact : 0.5
  const snr = koiData?.koi_model_snr || 20
  
  // Noise levels based on SNR
  const noiseLevel = depth / snr * 5 // Gerçekçi noise
  
  const numPoints = 12000
  const cadence = 0.00139 // ~2 dakika (Kepler long cadence ~30 dakika = 0.02 gün)
  const totalTime = numPoints * cadence
  const numTransits = Math.floor(totalTime / period)
  
  console.log(`📊 ${numPoints} nokta, ${numTransits} transit, ${cadence.toFixed(5)} gün cadence`)
  
  const sapFlux = []
  const pdcsapFlux = []
  
  for (let i = 0; i < numPoints; i++) {
    const time = i * cadence
    
    // Transit model
    const phase = ((time - t0) % period) / period
    let flux = transitModel(phase, depth, duration, period, impact)
    
    // Stellar variability
    flux = addStellarVariability(time, flux, period * 3.5, 0.0015)
    
    // Red noise
    const redNoise = generateRedNoise(time, noiseLevel * 0.5)
    
    // White noise
    const whiteNoise = (Math.random() - 0.5) * noiseLevel
    
    // Quality flags (realistic bad data points)
    const quality = Math.random() > 0.98 ? 1 : 0
    
    // SAP: daha çok noise ve systematik
    const sapFluxValue = flux + redNoise * 1.5 + whiteNoise * 2.0
    sapFlux.push({
      time,
      flux: sapFluxValue,
      flux_err: noiseLevel * 1.5,
      quality
    })
    
    // PDCSAP: temizlenmiş, daha az noise
    const pdcsapFluxValue = flux + redNoise * 0.5 + whiteNoise
    pdcsapFlux.push({
      time,
      flux: pdcsapFluxValue,
      flux_err: noiseLevel * 0.7,
      quality
    })
  }
  
  console.log('✅ Light curve generated:', {
    points: numPoints,
    transits: numTransits,
    depth: (depth * 1e6).toFixed(1) + ' ppm',
    snr: snr.toFixed(1)
  })
  
  return {
    targetId,
    sector: sector || 1,
    sapFlux,
    pdcsapFlux,
    mission: 'Kepler'
  }
}

/**
 * Run BLS (Box Least Squares) analysis on light curve
 * Generates realistic periodogram with harmonics and aliases
 * Based on KOI catalog parameters
 */
export async function runBLSAnalysis(
  lightCurve: LightCurveData,
  koiData?: KOIPlanet,
  minPeriod: number = 0.5,
  maxPeriod: number = 20
): Promise<PeriodogramData> {
  console.log('📈 Running BLS analysis with KOI parameters:', {
    truePeriod: koiData?.koi_period,
    depth: koiData?.koi_depth,
    snr: koiData?.koi_model_snr,
    numTransits: koiData?.koi_num_transits
  })
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // KOI gerçek parametreleri
  const truePeriod = koiData?.koi_period || 3.85
  const trueT0 = koiData?.koi_time0bk || 0.5
  const trueDuration = koiData?.koi_duration || 2.88 // saat
  const trueDepth = koiData?.koi_depth ? koiData.koi_depth / 1e6 : 0.01
  const trueSNR = koiData?.koi_model_snr || 15
  const numTransits = koiData?.koi_num_transits || 10
  
  // Periodogram resolution
  const step = 0.005 // 0.005 gün resolution
  const periods: number[] = []
  const power: number[] = []
  
  // BLS power calculation (simplified but realistic)
  for (let p = minPeriod; p <= maxPeriod; p += step) {
    periods.push(p)
    
    // Main signal at true period
    const mainDist = Math.abs(p - truePeriod)
    const mainSignal = Math.exp(-mainDist * mainDist / 0.015) * (trueSNR / 15)
    
    // Harmonics (P/2, P/3, 2P, 3P)
    const harmonic1 = Math.exp(-Math.pow(p - truePeriod / 2, 2) / 0.01) * 0.3
    const harmonic2 = Math.exp(-Math.pow(p - truePeriod / 3, 2) / 0.008) * 0.2
    const harmonic3 = Math.exp(-Math.pow(p - truePeriod * 2, 2) / 0.02) * 0.25
    
    // Aliases (due to window function)
    const alias1 = Math.exp(-Math.pow(p - (truePeriod + 0.5), 2) / 0.01) * 0.15
    const alias2 = Math.exp(-Math.pow(p - (truePeriod - 0.5), 2) / 0.01) * 0.15
    
    // Noise floor (scaled by SNR)
    const noiseFloor = 0.05 + Math.random() * (0.1 / (trueSNR / 10))
    
    // Red noise component (1/f noise)
    const redNoise = 0.02 / Math.sqrt(p) * Math.random()
    
    // Total power
    const totalPower = mainSignal + harmonic1 + harmonic2 + harmonic3 + 
                       alias1 + alias2 + noiseFloor + redNoise
    
    power.push(Math.min(totalPower, 1.0)) // Cap at 1.0
  }
  
  // Find top 5 peaks
  const peaks: BLSResult[] = []
  const sortedIndices = power
    .map((p, i) => ({ power: p, index: i }))
    .sort((a, b) => b.power - a.power)
    .slice(0, 5)
  
  sortedIndices.forEach(({ power: p, index: i }, rank) => {
    const period = periods[i]
    const isMainPeak = rank === 0
    
    // Main peak uses exact KOI values
    if (isMainPeak) {
      peaks.push({
        period: truePeriod,
        t0: trueT0,
        duration: trueDuration,
        depth: trueDepth,
        snr: trueSNR,
        power: p
      })
    } else {
      // Other peaks are harmonics/aliases
      peaks.push({
        period,
        t0: trueT0 % period,
        duration: trueDuration * (truePeriod / period),
        depth: trueDepth * 0.5,
        snr: p * trueSNR * 0.6,
        power: p
      })
    }
  })
  
  console.log('✅ BLS complete:', {
    bestPeriod: peaks[0].period.toFixed(3) + ' days',
    power: peaks[0].power.toFixed(3),
    snr: peaks[0].snr.toFixed(1),
    peaks: peaks.length
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
  
  // Backend'den gelen AI tahminini kullan (öncelikli)
  let baseScore = 0.5
  let usingBackendProbability = false
  
  if (koiData) {
    // 1. Backend'den gelen probabilities.CONFIRMED değerini kullan (EN ÖNCELİKLİ)
    if (koiData.probabilities?.CONFIRMED !== undefined) {
      baseScore = koiData.probabilities.CONFIRMED
      usingBackendProbability = true
      console.log('✅ Backend AI probability kullanılıyor:', baseScore)
    }
    // 2. prediction_probability varsa onu kullan
    else if (koiData.prediction_probability !== undefined && koiData.prediction_probability !== null) {
      baseScore = koiData.prediction_probability
      usingBackendProbability = true
      console.log('✅ Backend prediction_probability kullanılıyor:', baseScore)
    }
    // 3. KOI score varsa direkt kullan (0-1 arası)
    else if (koiData.koi_score !== undefined && koiData.koi_score !== null) {
      baseScore = koiData.koi_score
      console.log('ℹ️ KOI score kullanılıyor:', baseScore)
    }
    // 4. Disposition'dan tahmin et (fallback)
    else {
      if (koiData.koi_pdisposition === 'CONFIRMED') {
        baseScore = 0.95
      } else if (koiData.koi_disposition === 'CONFIRMED') {
        baseScore = 0.92
      } else if (koiData.koi_pdisposition === 'CANDIDATE') {
        baseScore = 0.65
      } else if (koiData.koi_pdisposition === 'FALSE_POSITIVE') {
        baseScore = 0.15
      }
      console.log('ℹ️ Disposition\'dan skor hesaplandı:', baseScore)
    }
    
    // False positive flagları varsa skoru düşür (sadece backend skoru yoksa)
    if (!usingBackendProbability && (koiData.koi_fpflag_nt || koiData.koi_fpflag_ss || 
        koiData.koi_fpflag_co || koiData.koi_fpflag_ec)) {
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
    confidence: usingBackendProbability ? 0.98 : (koiData ? 0.95 : 0.75),
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

