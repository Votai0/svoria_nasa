import { ONE_DAY_UNITS } from '../constants/time'

// Format time in days and hours
export const formatTime = (currentTime: number): string => {
  const totalDays = (currentTime / ONE_DAY_UNITS) % 365.25
  const days = Math.floor(totalDays)
  const hours = Math.floor((totalDays % 1) * 24)
  return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`
}

// Display time in year + day format
export const formatFullDate = (year: number, currentTime: number): string => {
  const totalDays = (currentTime / ONE_DAY_UNITS)
  const years = Math.floor(totalDays / 365.25)
  const days = Math.floor(totalDays % 365.25)
  const hours = Math.floor(((totalDays % 365.25) % 1) * 24)
  
  const finalYear = year + years
  return `${finalYear} - ${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`
}

// Format for date picker
export const formatDateForInput = (year: number, dayOfYear: number): string => {
  const date = new Date(year, 0, 1)
  date.setDate(date.getDate() + Math.floor(dayOfYear))
  return date.toISOString().split('T')[0]
}

