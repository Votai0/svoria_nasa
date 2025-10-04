import { useMemo } from 'react'
import type { TimeControl } from '../types'
import { planets } from '../constants/planets'
import Planet from './Planet'
import TimeUpdater from './TimeUpdater'
import { calculateAllPlanetPositions } from '../utils/astronomy'

// Güneş Sistemi bileşeni
export default function SolarSystem({ timeControl, setTimeControl }: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
}) {
  // Başlangıç yılı için referans konumları hesapla (sadece yıl değiştiğinde)
  const referencePositions = useMemo(() => {
    return calculateAllPlanetPositions(timeControl.year, 0)
  }, [timeControl.year])

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
        />
      ))}
    </group>
  )
}

