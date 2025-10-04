import type {
  ExoplanetTarget,
  LightCurveData,
  PeriodogramData,
  ModelPrediction,
  CatalogInfo,
  BLSResult,
  PhaseFoldedData
} from '../types/exoplanet'

// Demo veriler için mock hedefler
export const DEMO_TARGETS: ExoplanetTarget[] = [
  {
    id: 'TIC307210830',
    name: 'TOI 700 d',
    ra: 103.087,
    dec: -65.574,
    type: 'TIC',
    confirmed: true
  },
  {
    id: 'TIC441462736',
    name: 'AU Mic b',
    ra: 312.958,
    dec: -31.341,
    type: 'TIC',
    confirmed: true
  },
  {
    id: 'KOI-7016',
    name: 'KOI-7016.01',
    ra: 291.561,
    dec: 48.141,
    type: 'KOI',
    confirmed: false
  },
  {
    id: 'EPIC212521166',
    name: 'K2-18 b',
    ra: 165.483,
    dec: 7.588,
    type: 'EPIC',
    confirmed: true
  },
  {
    id: 'TIC259168516',
    name: 'TOI 178',
    ra: 29.421,
    dec: -34.986,
    type: 'TIC',
    confirmed: true
  }
]

// Exoplanet hedef arama (autosuggest için)
export async function searchExoplanetTargets(query: string): Promise<ExoplanetTarget[]> {
  // Gerçek uygulamada ExoFOP TESS, NASA Exoplanet Archive API'leri kullanılır
  // Şimdilik demo verilerden filtrele
  await new Promise(resolve => setTimeout(resolve, 300)) // Simüle gecikme
  
  const lowerQuery = query.toLowerCase()
  return DEMO_TARGETS.filter(target => 
    target.id.toLowerCase().includes(lowerQuery) ||
    target.name.toLowerCase().includes(lowerQuery)
  )
}

// Light curve verisi çek
export async function fetchLightCurve(
  targetId: string,
  dataType: 'SAP' | 'PDCSAP' = 'PDCSAP',
  sector?: number
): Promise<LightCurveData> {
  // Gerçek uygulamada MAST Archive API kullanılır
  // https://mast.stsci.edu/api/v0/pyex.html
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock veri üret - gerçek transit sinyali ile
  const numPoints = 10000
  const period = 3.85 // gün
  const t0 = 0.5
  const duration = 0.12 // gün
  const depth = 0.01 // %1 derinlik
  
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

// BLS analizi çalıştır
export async function runBLSAnalysis(
  lightCurve: LightCurveData,
  minPeriod: number = 0.5,
  maxPeriod: number = 20
): Promise<PeriodogramData> {
  // Gerçek uygulamada astropy BLS veya lightkurve kullanılır
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock periodogram
  const periods: number[] = []
  const power: number[] = []
  
  for (let p = minPeriod; p <= maxPeriod; p += 0.01) {
    periods.push(p)
    // Gerçek periyotta pik oluştur
    const truePeriod = 3.85
    const dist = Math.abs(p - truePeriod)
    const signal = Math.exp(-dist * dist / 0.02)
    const noise = Math.random() * 0.1
    power.push(signal + noise)
  }
  
  // En yüksek 3 piki bul
  const peaks: BLSResult[] = []
  const sortedIndices = power
    .map((p, i) => ({ power: p, index: i }))
    .sort((a, b) => b.power - a.power)
    .slice(0, 3)
  
  sortedIndices.forEach(({ power: p, index: i }) => {
    peaks.push({
      period: periods[i],
      t0: 0.5,
      duration: 2.88, // saat
      depth: 0.01,
      snr: p * 15,
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

// AI model tahmini
export async function predictPlanetCandidate(
  blsResult: BLSResult,
  lightCurve: LightCurveData
): Promise<ModelPrediction> {
  // Gerçek uygulamada TensorFlow.js veya backend ML modeli
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const { snr, depth, duration } = blsResult
  
  // Basit skor hesabı (gerçek model çok daha karmaşık)
  const snrScore = Math.min(snr / 20, 1)
  const depthScore = depth > 0.001 && depth < 0.1 ? 1 : 0.5
  const durationScore = duration > 1 && duration < 10 ? 1 : 0.6
  const shapeScore = 0.82 // Shape analizi skorunu simüle et
  
  const probability = (snrScore * 0.4 + depthScore * 0.2 + durationScore * 0.2 + shapeScore * 0.2)
  
  let explanation = ''
  if (probability > 0.8) {
    explanation = 'Güçlü transit sinyali, tutarlı periyot ve uygun derinlik. Yüksek gezegen adayı olasılığı.'
  } else if (probability > 0.5) {
    explanation = 'Transit benzeri sinyal mevcut, ancak SNR veya şekil özellikleri belirsizlik içeriyor.'
  } else {
    explanation = 'Zayıf sinyal veya stellar aktivite ile karışabilir. Ek doğrulama gerekli.'
  }
  
  return {
    probability,
    confidence: 0.85,
    features: {
      snr,
      depth,
      duration_ratio: duration / (blsResult.period * 24),
      shape_score: shapeScore
    },
    explanation,
    threshold: 0.75
  }
}

// Katalog bilgilerini çek
export async function fetchCatalogInfo(targetId: string): Promise<CatalogInfo> {
  // Gerçek uygulamada NASA Exoplanet Archive TAP service
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Mock katalog verisi
  return {
    targetId,
    stellar: {
      teff: 3500,
      radius: 0.42,
      mass: 0.45,
      logg: 4.82,
      metallicity: -0.15
    },
    planetary: {
      radius: 1.06,
      period: 3.85,
      semi_major_axis: 0.048,
      equilibrium_temp: 320,
      insolation: 1.2
    },
    source: 'NASA Exoplanet Archive',
    sourceUrl: 'https://exoplanetarchive.ipac.caltech.edu/'
  }
}

