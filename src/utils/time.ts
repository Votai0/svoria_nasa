import { ONE_DAY_UNITS } from '../constants/time'

// Zamanı gün ve saat cinsinden formatla
export const formatTime = (currentTime: number): string => {
  const totalDays = (currentTime / ONE_DAY_UNITS) % 365.25
  const days = Math.floor(totalDays)
  const hours = Math.floor((totalDays % 1) * 24)
  return `${days} gün ${hours} saat`
}

