import { useMemo } from 'react'
import type { TimeControl, Planet as PlanetType } from '../types'
import { planets } from '../constants/planets'
import Planet from './Planet'
import TimeUpdater from './TimeUpdater'
import { calculateAllPlanetPositions } from '../utils/astronomy'

// Güneş Sistemi bileşeni
export default function SolarSystem({ timeControl, setTimeControl, onPlanetClick }: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
  onPlanetClick?: (planet: PlanetType) => void
}) {
  // Başlangıç konumları SADECE İLK RENDER'DA hesapla (başlangıç tarihi: 4 Ekim 2025)
  // Yıl değişse bile bu pozisyonlar sabit kalmalı, sadece currentTime artmalı
  const referencePositions = useMemo(() => {
    return calculateAllPlanetPositions(2025, 277) // 4 Ekim 2025 - Başlangıç tarihi
  }, []) // Dependency array boş - sadece bir kez hesapla

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

