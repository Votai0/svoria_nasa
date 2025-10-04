import type { ExoplanetTarget } from '../types/exoplanet'

export type URLParams = {
  target?: string
  sector?: number
  model?: string
}

export function parseURLParams(): URLParams {
  const params = new URLSearchParams(window.location.search)
  
  return {
    target: params.get('target') || undefined,
    sector: params.get('sector') ? parseInt(params.get('sector')!) : undefined,
    model: params.get('model') || undefined
  }
}

export function findTargetById(targetId: string, targets: ExoplanetTarget[]): ExoplanetTarget | null {
  return targets.find((t: ExoplanetTarget) => t.id === targetId) || null
}

export function updateURLParams(params: URLParams) {
  const searchParams = new URLSearchParams()
  
  if (params.target) searchParams.set('target', params.target)
  if (params.sector) searchParams.set('sector', params.sector.toString())
  if (params.model) searchParams.set('model', params.model)
  
  const newUrl = searchParams.toString() 
    ? `${window.location.pathname}?${searchParams.toString()}`
    : window.location.pathname
  
  window.history.replaceState({}, '', newUrl)
}

