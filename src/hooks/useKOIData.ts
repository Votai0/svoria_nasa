import { useState, useEffect, useCallback } from 'react'
import type { KOIPlanet, KOIStatistics, ModelStatus, KeplerDisposition } from '../types/exoplanet'
import { fetchKOIPlanets, fetchKOIPlanetById, getKOIStatistics, getModelStatus } from '../services/exoplanetAPI'

/**
 * Hook to fetch ALL KOI planets with pagination (500 per batch)
 * Progressive loading - ilk batch gelince kullanılabilir, arka planda yüklemeye devam eder
 */
export function useKOIPlanets(params?: {
  disposition?: KeplerDisposition
  only_confirmed?: boolean
  include_actual?: boolean
  include_probabilities?: boolean
}) {
  const [planets, setPlanets] = useState<KOIPlanet[]>([])
  const [loading, setLoading] = useState(true) // İlk batch için
  const [isLoadingMore, setIsLoadingMore] = useState(false) // Arka plan yüklemesi
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setTotalCount(null)
    
    try {
      // İlk batch'i özel olarak çek
      const BATCH_SIZE = 500
      let allPlanets: KOIPlanet[] = []
      let skip = 0
      let hasMore = true
      let isFirstBatch = true
      
      while (hasMore) {
        const startTime = performance.now()
        const batch = await fetchKOIPlanets({
          skip,
          limit: BATCH_SIZE,
          disposition: params?.disposition,
          only_confirmed: params?.only_confirmed,
          include_actual: params?.include_actual,
          include_probabilities: params?.include_probabilities
        })
        const endTime = performance.now()
        
        allPlanets = allPlanets.concat(batch)
        
        // Update state IMMEDIATELY - progressive loading
        setPlanets(allPlanets)
        
        console.log(`📦 Batch #${Math.floor(skip / BATCH_SIZE) + 1}: Got ${batch.length} planets, Total now: ${allPlanets.length} (took ${(endTime - startTime).toFixed(0)}ms)`)
        
        // First batch arrived - user can use it!
        if (isFirstBatch) {
          setLoading(false) // İlk batch geldi - loading tamamlandı!
          setIsLoadingMore(true) // Arka planda devam ediyor
          isFirstBatch = false
          console.log('✅ First batch ready - search available!')
        }
        
        // Is this the last batch?
        if (batch.length < BATCH_SIZE) {
          hasMore = false
          setTotalCount(allPlanets.length)
          setIsLoadingMore(false)
          console.log(`🎉 ALL data loaded: ${allPlanets.length.toLocaleString()} planets`)
        } else {
          skip += BATCH_SIZE
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch KOI planets'))
      setLoading(false)
      setIsLoadingMore(false)
    }
  }, [JSON.stringify(params)])
  
  useEffect(() => {
    refetch()
  }, [refetch])
  
  return { 
    planets, 
    loading, // İlk batch yükleniyor mu?
    isLoadingMore, // Arka planda daha fazla yükleniyor mu?
    error, 
    totalCount, // Toplam yüklenecek (bilindiğinde)
    refetch 
  }
}

/**
 * Hook to fetch a single KOI planet by Kepler ID
 */
export function useKOIPlanet(
  kepid: number | null,
  include_actual = false,
  include_probabilities = false
) {
  const [planet, setPlanet] = useState<KOIPlanet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const refetch = useCallback(async () => {
    if (!kepid) {
      setPlanet(null)
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const data = await fetchKOIPlanetById(kepid, include_actual, include_probabilities)
      setPlanet(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch KOI planet ${kepid}`))
    } finally {
      setLoading(false)
    }
  }, [kepid, include_actual, include_probabilities])
  
  useEffect(() => {
    refetch()
  }, [refetch])
  
  return { planet, loading, error, refetch }
}

/**
 * Hook to fetch KOI statistics
 */
export function useKOIStatistics() {
  const [stats, setStats] = useState<KOIStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getKOIStatistics()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch KOI statistics'))
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    refetch()
  }, [refetch])
  
  return { stats, loading, error, refetch }
}

/**
 * Hook to fetch ML model status
 */
export function useModelStatus() {
  const [status, setStatus] = useState<ModelStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getModelStatus()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch model status'))
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    refetch()
  }, [refetch])
  
  return { status, loading, error, refetch }
}

/**
 * Composite hook to fetch all KOI-related data at once
 */
export function useKOIDashboard() {
  const { planets, loading: planetsLoading, error: planetsError, refetch: refetchPlanets } = useKOIPlanets({
    include_probabilities: true
  })
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useKOIStatistics()
  const { status, loading: statusLoading, error: statusError, refetch: refetchStatus } = useModelStatus()
  
  const loading = planetsLoading || statsLoading || statusLoading
  const error = planetsError || statsError || statusError
  
  const refetchAll = useCallback(async () => {
    await Promise.all([refetchPlanets(), refetchStats(), refetchStatus()])
  }, [refetchPlanets, refetchStats, refetchStatus])
  
  return {
    planets,
    stats,
    modelStatus: status,
    loading,
    error,
    refetchAll
  }
}
