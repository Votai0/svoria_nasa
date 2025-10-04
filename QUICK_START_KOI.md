# Quick Start: Kepler KOI API Integration

## 🚀 5-Minute Setup

### 1. Configure API URL
```bash
# Create .env file
cp .env.example .env

# Edit .env and set your API URL
VITE_KEPLER_API_URL=http://localhost:8000
# Or use your deployed API URL
# VITE_KEPLER_API_URL=https://your-api.com
```

### 2. Import and Use

#### Option A: Use the KOI Explorer Component (Recommended)
```tsx
// In your App.tsx or any component
import KOIExplorer from './components/KOIExplorer'

function App() {
  return <KOIExplorer />
}
```

#### Option B: Use Custom Hooks
```tsx
import { useKOIPlanets, useKOIStatistics } from './hooks/useKOIData'

function MyComponent() {
  const { planets, loading } = useKOIPlanets({ 
    limit: 50, 
    only_confirmed: true 
  })
  
  const { stats } = useKOIStatistics()
  
  return (
    <div>
      <h2>Confirmed Planets: {stats?.predicted_confirmed}</h2>
      {planets.map(p => (
        <div key={p.kepid}>{p.kepler_name}</div>
      ))}
    </div>
  )
}
```

#### Option C: Direct API Calls
```tsx
import { fetchKOIPlanets, getKOIStatistics } from './services/exoplanetAPI'

async function loadData() {
  const planets = await fetchKOIPlanets({ limit: 100 })
  const stats = await getKOIStatistics()
  console.log(planets, stats)
}
```

### 3. Display KOI Data
```tsx
import KOIInfoPanel from './components/KOIInfoPanel'
import { useKOIPlanet } from './hooks/useKOIData'

function PlanetDetails({ kepid }: { kepid: number }) {
  const { planet, loading } = useKOIPlanet(kepid, true, true)
  
  return <KOIInfoPanel koiData={planet} isLoading={loading} />
}
```

## 📋 Quick Examples

### Example 1: Show Statistics Dashboard
```tsx
import { useKOIStatistics, useModelStatus } from './hooks/useKOIData'

function Dashboard() {
  const { stats } = useKOIStatistics()
  const { status } = useModelStatus()
  
  return (
    <div>
      <h2>ML Model Status: {status?.model_loaded ? '✅' : '❌'}</h2>
      <p>Total KOIs: {stats?.total_count}</p>
      <p>Confirmed: {stats?.predicted_confirmed}</p>
      <p>Accuracy: {(stats?.accuracy! * 100).toFixed(2)}%</p>
    </div>
  )
}
```

### Example 2: Filter by Disposition
```tsx
import { useKOIPlanets } from './hooks/useKOIData'

function ConfirmedPlanets() {
  const { planets } = useKOIPlanets({ 
    disposition: 'CONFIRMED',
    limit: 20,
    include_probabilities: true 
  })
  
  return (
    <ul>
      {planets.map(p => (
        <li key={p.kepid}>
          {p.kepler_name} - {(p.prediction_probability! * 100).toFixed(1)}% confidence
        </li>
      ))}
    </ul>
  )
}
```

### Example 3: Search Planets
```tsx
import { searchKOIPlanets } from './services/exoplanetAPI'

async function handleSearch(query: string) {
  const results = await searchKOIPlanets(query)
  // Returns ExoplanetTarget[] - compatible with existing UI
  console.log(results)
}
```

## 🎨 Pre-built Components

### KOIExplorer
Full-featured explorer with planet list, filtering, stats dashboard, and detail panel.
```tsx
<KOIExplorer />
```

### KOIInfoPanel
Detailed panel showing KOI data with ML predictions, orbital parameters, and stellar properties.
```tsx
<KOIInfoPanel koiData={planet} isLoading={false} />
```

## 🔄 Integration with Existing Solar System

Keep your existing solar system viewer and add KOI data as a side panel:

```tsx
import { Canvas } from '@react-three/fiber'
import SolarSystem from './components/SolarSystem'
import KOIExplorer from './components/KOIExplorer'

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Solar System (left) */}
      <div style={{ flex: 1 }}>
        <Canvas>
          <SolarSystem />
        </Canvas>
      </div>
      
      {/* KOI Explorer (right) */}
      <div style={{ width: '800px' }}>
        <KOIExplorer />
      </div>
    </div>
  )
}
```

## 🐛 Troubleshooting

### API not responding
```tsx
// The search function has automatic fallback
const results = await searchKOIPlanets('kepler')
// Falls back to demo data if API fails
```

### CORS errors
Make sure your API has proper CORS headers:
```python
# FastAPI example
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Type errors
All types are defined in `src/types/exoplanet.ts`:
- `KOIPlanet`
- `KeplerDisposition`
- `ModelStatus`
- `KOIStatistics`

## 📖 Full Documentation

For comprehensive docs, see:
- [KEPLER_API_INTEGRATION.md](./KEPLER_API_INTEGRATION.md) - Complete API reference
- [EXOPLANET_README.md](./EXOPLANET_README.md) - Project overview
- [AGENTS.md](./AGENTS.md) - Development guidelines
