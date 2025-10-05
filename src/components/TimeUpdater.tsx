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
        
        // Yıl hesapla (gösterim için)
        // currentTime sürekli artacak, yılı sadece görüntüleme için hesaplıyoruz
        const DAYS_IN_YEAR = 365.25
        const startDayOfYear = 277 // 4 Ekim (başlangıç günü)
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

