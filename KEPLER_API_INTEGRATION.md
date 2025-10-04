# Kepler KOI API Integration Guide

## Overview
This project integrates with the Kepler KOI Exoplanet Classification API that provides real exoplanet data with ML-based predictions using XGBoost classifier.

## API Configuration

### Setup Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `VITE_KEPLER_API_URL` with your actual API base URL:
   ```bash
   VITE_KEPLER_API_URL=https://your-api-domain.com
   ```

## API Endpoints

### 1. List Planets
```typescript
import { fetchKOIPlanets } from './services/exoplanetAPI'

const planets = await fetchKOIPlanets({
  skip: 0,
  limit: 100,
  disposition: 'CONFIRMED', // 'CONFIRMED' | 'FALSE_POSITIVE' | 'CANDIDATE'
  only_confirmed: false,
  include_actual: true,
  include_probabilities: true
})
```

### 2. Get Planet by Kepler ID
```typescript
import { fetchKOIPlanetById } from './services/exoplanetAPI'

const planet = await fetchKOIPlanetById(
  10905746, // kepid
  true, // include_actual
  true  // include_probabilities
)
```

### 3. Get Model Status
```typescript
import { getModelStatus } from './services/exoplanetAPI'

const status = await getModelStatus()
// Returns: { model_loaded, model_available, features_count, classes }
```

### 4. Get Statistics
```typescript
import { getKOIStatistics } from './services/exoplanetAPI'

const stats = await getKOIStatistics()
// Returns: { total_count, predicted_confirmed, predicted_false_positive, accuracy, etc. }
```

### 5. Search KOI Planets
```typescript
import { searchKOIPlanets } from './services/exoplanetAPI'

const results = await searchKOIPlanets('kepler-22')
// Returns ExoplanetTarget[] for compatibility with existing UI
```

## Component Usage

### KOI Info Panel
Display detailed KOI data with ML predictions:

```tsx
import KOIInfoPanel from './components/KOIInfoPanel'
import { fetchKOIPlanetById } from './services/exoplanetAPI'

function MyComponent() {
  const [koiData, setKoiData] = useState<KOIPlanet | null>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    async function loadKOI() {
      setLoading(true)
      try {
        const data = await fetchKOIPlanetById(10905746, true, true)
        setKoiData(data)
      } catch (error) {
        console.error('Failed to load KOI:', error)
      } finally {
        setLoading(false)
      }
    }
    loadKOI()
  }, [])
  
  return <KOIInfoPanel koiData={koiData} isLoading={loading} />
}
```

## Data Types

### KOIPlanet
```typescript
type KOIPlanet = {
  kepid: number
  kepoi_name?: string
  kepler_name?: string
  koi_disposition?: string // Actual disposition
  koi_pdisposition?: 'CONFIRMED' | 'FALSE_POSITIVE' | 'CANDIDATE' // ML predicted
  koi_period?: number // Orbital period (days)
  koi_duration?: number // Transit duration (hours)
  koi_depth?: number // Transit depth
  koi_prad?: number // Planet radius (Earth radii)
  koi_teq?: number // Equilibrium temperature (K)
  koi_insol?: number // Insolation flux
  koi_steff?: number // Stellar effective temperature (K)
  koi_srad?: number // Stellar radius (solar radii)
  koi_slogg?: number // Stellar surface gravity
  ra?: number // Right Ascension
  dec?: number // Declination
  prediction_probability?: number // ML prediction confidence (0-1)
  probabilities?: {
    CONFIRMED: number
    FALSE_POSITIVE: number
    CANDIDATE: number
  }
  actual_disposition?: string // For comparison with ML prediction
}
```

## Integration with Existing Components

The API provides a `koiToExoplanetTarget()` converter function to make KOI data compatible with existing UI components:

```typescript
import { koiToExoplanetTarget } from './services/exoplanetAPI'

const koiPlanet = await fetchKOIPlanetById(12345)
const target: ExoplanetTarget = koiToExoplanetTarget(koiPlanet)

// Now compatible with SearchBar, TargetSelector, etc.
```

## Error Handling

All API functions throw errors on failure. Implement proper error handling:

```typescript
try {
  const planets = await fetchKOIPlanets({ limit: 100 })
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message)
  }
  // Fallback to demo data or show error UI
}
```

## Fallback Behavior

The `searchKOIPlanets()` function automatically falls back to demo/mock data if the API is unavailable, ensuring the app remains functional during development or API downtime.

## Performance Considerations

- **Caching**: Consider caching API responses in `localStorage` or state management
- **Pagination**: Use `skip` and `limit` parameters to load data in chunks
- **Debouncing**: Debounce search queries to reduce API calls
- **Loading States**: Always show loading indicators for better UX

## Example: Complete Integration

```tsx
import { useState, useEffect } from 'react'
import { fetchKOIPlanets, getKOIStatistics } from './services/exoplanetAPI'
import KOIInfoPanel from './components/KOIInfoPanel'

function ExoplanetExplorer() {
  const [planets, setPlanets] = useState<KOIPlanet[]>([])
  const [stats, setStats] = useState<KOIStatistics | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<KOIPlanet | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [planetsData, statsData] = await Promise.all([
          fetchKOIPlanets({ 
            limit: 50, 
            only_confirmed: true,
            include_probabilities: true 
          }),
          getKOIStatistics()
        ])
        setPlanets(planetsData)
        setStats(statsData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])
  
  return (
    <div>
      {/* Stats Display */}
      {stats && (
        <div>
          <h3>Dataset Statistics</h3>
          <p>Total KOIs: {stats.total_count}</p>
          <p>Confirmed: {stats.predicted_confirmed}</p>
          <p>Accuracy: {(stats.accuracy! * 100).toFixed(2)}%</p>
        </div>
      )}
      
      {/* Planet List */}
      <div>
        {planets.map(planet => (
          <button 
            key={planet.kepid}
            onClick={() => setSelectedPlanet(planet)}
          >
            {planet.kepler_name || planet.kepoi_name}
          </button>
        ))}
      </div>
      
      {/* Selected Planet Details */}
      <KOIInfoPanel koiData={selectedPlanet} isLoading={loading} />
    </div>
  )
}
```

## API Response Examples

### List Planets Response
```json
[
  {
    "kepid": 10905746,
    "kepoi_name": "K00752.01",
    "kepler_name": "Kepler-22 b",
    "koi_pdisposition": "CONFIRMED",
    "koi_period": 289.8623,
    "koi_depth": 0.00283,
    "koi_prad": 2.38,
    "koi_teq": 262,
    "prediction_probability": 0.95,
    "probabilities": {
      "CONFIRMED": 0.95,
      "FALSE_POSITIVE": 0.03,
      "CANDIDATE": 0.02
    }
  }
]
```

### Statistics Response
```json
{
  "total_count": 9564,
  "predicted_confirmed": 2321,
  "predicted_false_positive": 6543,
  "predicted_candidate": 700,
  "accuracy": 0.89,
  "precision": 0.87,
  "recall": 0.91,
  "f1_score": 0.89
}
```
