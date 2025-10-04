import { useFrame } from '@react-three/fiber'
import type { TimeControl } from '../types'

// Zaman güncelleme bileşeni
export default function TimeUpdater({ timeControl, setTimeControl }: {
  timeControl: TimeControl
  setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>
}) {
  useFrame((_, delta) => {
    if (!timeControl.isPaused) {
      setTimeControl(prev => {
        const newTime = prev.currentTime + delta * prev.speed

        return {
          ...prev,
          currentTime: newTime
        }
      })
    }
  })
  return null
}

