import { useFrame } from '@react-three/fiber'
import type { TimeControl } from '../types'

// Time update component
export default function TimeUpdater({ timeControl, setTimeControl }: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
}) {
  useFrame((_, delta) => {
    if (!timeControl.isPaused) {
      setTimeControl(prev => {
        const newTime = prev.currentTime + delta * prev.speed
        
        // Calculate year (for display)
        // currentTime will continuously increase, we calculate year only for display
        const DAYS_IN_YEAR = 365.25
        const startDayOfYear = 277 // October 4 (start day)
        const totalDaysSinceStart = newTime - startDayOfYear
        const yearsSinceStart = Math.floor(totalDaysSinceStart / DAYS_IN_YEAR)
        const newYear = 2025 + yearsSinceStart

        return {
          ...prev,
          currentTime: newTime,
          year: newYear
        }
      })
    }
  })
  return null
}

