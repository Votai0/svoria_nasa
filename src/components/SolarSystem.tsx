import { useMemo } from 'react'
import type { TimeControl, Planet as PlanetType } from '../types'
import type { KOIPlanet } from '../types/exoplanet'
import { planets } from '../constants/planets'
import Planet from './Planet'
import TimeUpdater from './TimeUpdater'
import ExoplanetMarkers from './ExoplanetMarkers'
import { calculateAllPlanetPositions } from '../utils/astronomy'

// Güneş Sistemi bileşeni
export default function SolarSystem({ 
  timeControl, 
  setTimeControl, 
  onPlanetClick,
  koiPlanets = [],
  selectedKepid
}: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
  onPlanetClick?: (planet: PlanetType) => void
  koiPlanets?: KOIPlanet[]
  selectedKepid?: number
}) {
  // Başlangıç yılı için referans konumları hesapla (sadece yıl değiştiğinde)
  const referencePositions = useMemo(() => {
    return calculateAllPlanetPositions(timeControl.year, 0)
  }, [timeControl.year])

  return (
    <group>
      <TimeUpdater timeControl={timeControl} setTimeControl={setTimeControl} />
      
      {/* Solar System Planets */}
      {planets.map((planet) => (
        <Planet
          key={planet.name}
          {...planet}
          currentTime={timeControl.currentTime}
          realPosition={referencePositions[planet.name]}
          year={timeControl.year}
          onClick={() => onPlanetClick?.(planet)}
        />
      ))}
      
      {/* KOI Exoplanets in 3D Space */}
      {koiPlanets.length > 0 && (
        <ExoplanetMarkers 
          koiPlanets={koiPlanets}
          selectedKepid={selectedKepid}
        />
      )}
    </group>
  )
}

