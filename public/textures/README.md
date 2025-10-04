# Texture Klasörleri

Bu klasör güneş sistemi objelerinin texture'larını içerir.

## Klasör Yapısı

### 📁 planets/
Gezegen texture'ları buraya konulur:
- `sun.jpg` - Güneş
- `mercury.jpg` - Merkür
- `venus.jpg` - Venüs
- `earth.jpg` - Dünya
- `mars.jpg` - Mars
- `jupiter.jpg` - Jüpiter
- `saturn.jpg` - Satürn
- `saturn_ring.png` - Satürn halkaları (transparan)
- `uranus.jpg` - Uranüs
- `neptune.jpg` - Neptün

### 📁 moons/
Uydu texture'ları buraya konulur:
- `moon.jpg` - Ay (Dünya)
- `phobos.jpg` - Phobos (Mars)
- `deimos.jpg` - Deimos (Mars)
- `io.jpg` - Io (Jüpiter)
- `europa.jpg` - Europa (Jüpiter)
- `ganymede.jpg` - Ganymede (Jüpiter)
- `callisto.jpg` - Callisto (Jüpiter)
- `titan.jpg` - Titan (Satürn)
- `rhea.jpg` - Rhea (Satürn)
- `enceladus.jpg` - Enceladus (Satürn)
- `titania.jpg` - Titania (Uranüs)
- `oberon.jpg` - Oberon (Uranüs)
- `triton.jpg` - Triton (Neptün)

### 📁 stars/
Yıldız ve arka plan texture'ları buraya konulur:
- `starfield.jpg` - Yıldız arka planı (panorama)
- `milkyway.jpg` - Samanyolu

## Önerilen Texture Kaynakları

1. **NASA:**
   - https://solarsystem.nasa.gov/resources/
   - Gerçek gezegen fotoğrafları ve texture'ları

2. **Solar System Scope:**
   - https://www.solarsystemscope.com/textures/
   - Ücretsiz 2K ve 4K texture'lar

3. **Planet Pixel Emporium:**
   - http://planetpixelemporium.com/
   - Yüksek kaliteli gezegen texture'ları

## Dosya Format Önerileri

- **Format:** JPG veya PNG
- **Boyut:** 2K (2048x1024) veya 4K (4096x2048) önerilir
- **Harita Tipi:** Equirectangular projection (gezegen küreleri için)
- **Halkalar:** PNG format (alpha channel için)

## Kullanım

Texture'ları ekledikten sonra, `App.tsx` dosyasında `useTexture` hook'u ile yükleyebilirsiniz:

```typescript
import { useTexture } from '@react-three/drei'

const earthTexture = useTexture('/textures/planets/earth.jpg')
```

