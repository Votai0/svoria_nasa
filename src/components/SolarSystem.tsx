import type { TimeControl } from '../types'
import { planets } from '../constants/planets'
import Planet from './Planet'
import TimeUpdater from './TimeUpdater'

// Güneş Sistemi bileşeni
export default function SolarSystem({ timeControl, setTimeControl }: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
}) {
  return (
    <group>
      <TimeUpdater timeControl={timeControl} setTimeControl={setTimeControl} />
      {planets.map((planet) => (
        <Planet key={planet.name} {...planet} currentTime={timeControl.currentTime} />
      ))}
    </group>
  )
}

