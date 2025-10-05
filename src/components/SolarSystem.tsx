import { useMemo } from 'react'
import type { TimeControl, Planet as PlanetType } from '../types'
import { planets } from '../constants/planets'
import Planet from './Planet'
import TimeUpdater from './TimeUpdater'
import { calculateAllPlanetPositions } from '../utils/astronomy'

// Solar System component
export default function SolarSystem({ timeControl, setTimeControl, onPlanetClick }: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
  onPlanetClick?: (planet: PlanetType) => void
}) {
  // Calculate starting positions ONLY ON FIRST RENDER (start date: October 4, 2025)
  // Even if year changes, these positions should remain fixed, only currentTime increases
  const referencePositions = useMemo(() => {
    return calculateAllPlanetPositions(2025, 277) // October 4, 2025 - Start date
  }, []) // Empty dependency array - calculate only once

  return (
    <group>
      <TimeUpdater timeControl={timeControl} setTimeControl={setTimeControl} />
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
    </group>
  )
}

