import { useState, useEffect, useCallback } from 'react'
import type { KOIPlanet, KOIStatistics, ModelStatus, KeplerDisposition } from '../types/exoplanet'
import { fetchKOIPlanets, fetchKOIPlanetById, getKOIStatistics, getModelStatus } from '../services/exoplanetAPI'

/**
 * Hook to fetch list of KOI planets with optional filtering
 */
export function useKOIPlanets(params?: {
  skip?: number
  limit?: number
  disposition?: KeplerDisposition
  only_confirmed?: boolean
  include_actual?: boolean
  include_probabilities?: boolean
}) {
  const [planets, setPlanets] = useState<KOIPlanet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchKOIPlanets(params)
      setPlanets(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch KOI planets'))
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])
  
  useEffect(() => {
    refetch()
  }, [refetch])
  
  return { planets, loading, error, refetch }
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
    limit: 100,
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
