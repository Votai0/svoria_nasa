// Zaman sabitleri - Fiziksel olarak doğru simülasyon
// BASE_SPEED = 0.01 → Dünya 1 yılda (365.25 gün) tam tur atar
export const ONE_YEAR_UNITS = 2 * Math.PI / 0.01 // 628.32
export const ONE_DAY_UNITS = ONE_YEAR_UNITS / 365.25 // ~1.72

// Rotation Scale: Kendi ekseni dönüşünü görsel olarak görmek için hızlandırma faktörü
// 1.0 = gerçek hız (çok yavaş), 0.05 = %5 (hala yavaş ama görünür)
// Simülasyonda gezegenler gerçek hızlarıyla dönerse görsel olarak hiç dönmüyor gibi görünür
export const ROTATION_SCALE = 0.05 // Görsel amaçlı hızlandırma

// Hız Presetleri - TimeControlPanel'de kullanılır
export const SPEED_PRESETS = {
  REALTIME: 1,        // 1x: 1 saniye = 1 simülasyon saniyesi
  HOUR: 3600,         // 1 saniye = 1 saat
  DAY: 86400,         // 1 saniye = 1 gün
  WEEK: 604800,       // 1 saniye = 1 hafta
  MONTH: 2592000      // 1 saniye = 30 gün
}

