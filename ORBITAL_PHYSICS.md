# 🌍 Orbital Physics - Gerçek Evren Simülasyonu

## 🎯 Fiziksel Doğruluk

Bu simülasyon, NASA JPL (Jet Propulsion Laboratory) verilerini kullanarak **gerçek evrendeki yörünge periyotlarını** modellemektedir.

## 📊 Gerçek Orbital Periyotlar

| Gezegen | Yörünge Periyodu (Dünya Günü) | Yörünge Periyodu (Dünya Yılı) | Hesaplanan Hız |
|---------|-------------------------------|-------------------------------|----------------|
| Merkür  | 88 gün | 0.241 yıl | **0.0415** (En hızlı!) |
| Venüs   | 225 gün | 0.615 yıl | 0.0163 |
| **Dünya** | **365.25 gün** | **1.0 yıl** | **0.01** (Referans) |
| Mars    | 687 gün | 1.88 yıl | 0.00532 |
| Jüpiter | 4,333 gün | 11.86 yıl | 0.000843 |
| Satürn  | 10,759 gün | 29.46 yıl | 0.000340 |
| Uranüs  | 30,687 gün | 84.01 yıl | 0.000119 |
| Neptün  | 60,190 gün | 164.79 yıl | **0.0000607** (En yavaş!) |

### 🔬 Hız Hesaplama Formülü

```typescript
orbitSpeed = BASE_SPEED / orbitalPeriod
```

Nerede:
- `BASE_SPEED = 0.01` (Dünya'nın referans hızı)
- `orbitalPeriod` = Yörünge periyodu (Dünya yılı cinsinden)

### 📐 Matematiksel Model

Gerçek dünyada, bir gezegenin açısal hızı:

```
ω = 2π / T
```

Nerede:
- `ω` = Açısal hız (radyan/zaman)
- `T` = Periyot (zaman)

Simülasyonda:
```
orbitSpeed = (2π / T) * normalizasyon_faktörü
orbitSpeed = 0.01 / (T_years)
```

## 🌙 Uydu Sistemleri

### Ay (Dünya'nın uydusu)
- **Periyot**: 27.3 gün
- **Orbital Hız**: `0.01 / (27.3/365.25) = 0.134`
- **Tidal Locking**: Aynı yüz her zaman Dünya'ya bakar

### Jüpiter'in Galilean Uyduları
| Uydu | Periyot | Gerçek Hız |
|------|---------|------------|
| Io | 1.77 gün | 0.206 |
| Europa | 3.55 gün | 0.103 |
| Ganymede | 7.15 gün | 0.051 |
| Callisto | 16.7 gün | 0.022 |

### Mars'ın Uydları
- **Phobos**: 0.319 gün (Mars'a ÇOK yakın, hızlı hareket)
- **Deimos**: 1.263 gün

### Satürn'ün Uydları
- **Titan**: 15.95 gün (En büyük uydu)
- **Rhea**: 4.52 gün
- **Enceladus**: 1.37 gün

## ⏱️ Zaman Skalası

### Simülasyon Zaman Birimleri
```typescript
ONE_YEAR_UNITS = 2π / 0.01 = 628.32 birim
ONE_DAY_UNITS = 628.32 / 365.25 = 1.72 birim
```

### Hız Çarpanları (Speed Presets)

| Preset | Değer | Gerçek Zaman Karşılığı |
|--------|-------|------------------------|
| 0.5x | 0.5 | Yarı hız (detaylı gözlem) |
| 1x | 1 | Normal hız |
| 10x | 10 | 10 kat hızlı |
| 1 gün | 50 | 1 saniye = yaklaşık 1 gün |
| 1 ay | 200 | 1 saniye = yaklaşık 1 ay |

**Not**: 1x hızda bile gezegenler çok yavaş hareket eder çünkü gerçek evrendeki hızları modellenmiştir. Jüpiter'in Güneş etrafında tam tur atması 11.86 yıl sürer!

## 🔄 Rotasyon (Kendi Ekseni Dönüşü)

Gezegenler yörünge hareketlerinin yanında kendi eksenleri etrafında da dönerler:

| Gezegen | Rotasyon Periyodu (Dünya Günü) | Özellik |
|---------|--------------------------------|---------|
| Merkür | 58.6 | Yavaş dönüş |
| Venüs | **-243** | **Retrograde** (ters yönde) |
| Dünya | 1.0 | 24 saat = 1 gün |
| Mars | 1.03 | Dünya'ya çok benzer |
| Jüpiter | **0.41** | **ÇOK HIZLI** (~10 saat) |
| Satürn | **0.45** | **ÇOK HIZLI** (~10.7 saat) |
| Uranüs | **-0.72** | **Retrograde** (~17.2 saat) |
| Neptün | 0.67 | ~16 saat |

### Görselleştirme Ayarı
```typescript
ROTATION_SCALE = 0.05 // %5 hızlandırma
```

Gerçek rotasyon hızları çok yavaş olduğu için görsel olarak görülmesi için %5 hızlandırma uygulanmıştır. Aksi takdirde Dünya'nın kendi etrafında tam tur atması 24 saat sürerdi (simülasyon zamanında).

## 🎮 Kullanıcı Deneyimi

### Neden Hız Kontrolü Gerekli?

1. **Gerçek Hızlar Çok Yavaş**: Neptün'ün 165 yıl süren yörüngesini izlemek pratik değil
2. **Eğitimsel Değer**: Farklı hızlarda gezegenlerin göreceli hareketlerini gözlemleyebilirsiniz
3. **Zaman Yolculuğu**: İstediğiniz tarihe hızlıca gidebilirsiniz

### Önerilen Hızlar

- **0.5x-1x**: Merkür ve Venüs'ün hareketini izlemek için
- **10x**: Dünya, Mars, Jüpiter hareketlerini görmek için
- **50x (1 gün)**: Dış gezegenlerin (Jüpiter, Satürn) hareketini görmek için
- **200x (1 ay)**: Uranüs ve Neptün'ün hareketini görmek için

## 🔬 Bilimsel Doğruluk

### Kepler'in Kanunları

Bu simülasyon **Kepler'in 3. Kanunu**'nu takip eder:

```
T² ∝ a³
```

Nerede:
- `T` = Yörünge periyodu
- `a` = Yarı büyük eksen (Güneş'e uzaklık)

**Sonuç**: Güneş'e daha uzak gezegenler daha yavaş hareket eder!

### Simplifikasyonlar

1. **Dairesel Yörüngeler**: Gerçek yörüngeler eliptiktir, ancak çoğu gezegen için yaklaşık dairesel
2. **Kütlesel Etkileşimler**: Gezegenlerin birbirlerine gravitasyonel etkileri ihmal edilmiştir
3. **3-Body Problem**: Güneş-Gezegen-Uydu sistemleri basitleştirilmiştir
4. **Relativistik Etkiler**: Newton mekaniği kullanılmıştır (Genel Görelilik değil)

## 📚 Kaynaklar

- [NASA JPL Solar System Dynamics](https://ssd.jpl.nasa.gov/)
- [IAU Planetary Constants](https://www.iau.org/)
- Kepler's Laws of Planetary Motion
- Newton's Law of Universal Gravitation

## 🎯 Sonuç

Bu simülasyon, gerçek evrendeki **fiziksel kanunları** takip eden, eğitimsel bir araçtır. Gezegenlerin yörünge hızları NASA verilerine dayanmaktadır ve görsel deneyimi optimize etmek için hız kontrolleri eklenmiştir.

**Gerçek evren bu kadar yavaş!** 🌌

