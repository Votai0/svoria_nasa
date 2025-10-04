// NASA JPL Horizons verilerine dayalı gerçek gezegen konumları
// J2000.0 (1 Ocak 2000, 12:00 TT) referans tarihi

// Gezegenlerin ortalama boylamları (degrees) - J2000.0 referansı
// Ve yıllık değişim oranları (degrees/year)
const planetOrbitalElements = {
  'Merkür': { L0: 252.25084, LRate: 149472.6746 },
  'Venüs': { L0: 181.97973, LRate: 58517.8156 },
  'Dünya': { L0: 100.46435, LRate: 35999.3720 },
  'Mars': { L0: 355.45332, LRate: 19140.2993 },
  'Jüpiter': { L0: 34.40438, LRate: 3034.9057 },
  'Satürn': { L0: 49.94432, LRate: 1222.1138 },
  'Uranüs': { L0: 313.23218, LRate: 428.4677 },
  'Neptün': { L0: 304.88003, LRate: 218.4862 }
}

/**
 * Belirli bir tarih için gezegenin yörünge açısını hesaplar
 * @param planetName - Gezegen adı
 * @param year - Yıl
 * @param dayOfYear - Yılın günü (0-365.25)
 * @returns Açı radyan cinsinden
 */
export function calculatePlanetPosition(
  planetName: string, 
  year: number, 
  dayOfYear: number
): number {
  const elements = planetOrbitalElements[planetName as keyof typeof planetOrbitalElements]
  
  if (!elements) return 0
  
  // J2000.0'dan bu yana geçen yıllar
  const yearsFromJ2000 = year - 2000 + (dayOfYear / 365.25)
  
  // Ortalama boylam hesabı (degrees)
  const meanLongitude = (elements.L0 + elements.LRate * yearsFromJ2000) % 360
  
  // Radyana çevir ve π/2 çıkar (koordinat sistemi düzeltmesi)
  return (meanLongitude * Math.PI / 180) - (Math.PI / 2)
}

/**
 * Tüm gezegenlerin başlangıç konumlarını hesaplar
 * @param year - Yıl
 * @param dayOfYear - Yılın günü
 * @returns Gezegen adı -> açı map'i
 */
export function calculateAllPlanetPositions(
  year: number, 
  dayOfYear: number = 0
): Record<string, number> {
  const positions: Record<string, number> = {}
  
  Object.keys(planetOrbitalElements).forEach(planet => {
    positions[planet] = calculatePlanetPosition(planet, year, dayOfYear)
  })
  
  return positions
}

/**
 * İki tarih arasındaki gün farkını hesaplar
 * @param year1 - İlk yıl
 * @param day1 - İlk gün
 * @param year2 - İkinci yıl
 * @param day2 - İkinci gün
 * @returns Gün farkı
 */
export function daysBetweenDates(
  year1: number,
  day1: number,
  year2: number,
  day2: number
): number {
  return (year2 - year1) * 365.25 + (day2 - day1)
}

