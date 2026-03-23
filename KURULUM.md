# 🔮 Kampüs Cadıları

**Güçlü Kadınlar, Güçlü Gelecek**

Kampüslerden sokaklara feminist direnişin sesi. Feminist aktivizm için modern, güvenli ve etkileyici dijital platform.

Referans: https://kampus.nicholai.work/ (tasarım ve konsept)

## 🚀 Kurulum

### Ön Koşullar
- Node.js 22.12.0 veya üzeri
- npm veya yarn

### Adım 1: Terminali Aç
```bash
cd c:\workspace\dijital-mor-karargah
```

### Adım 2: Bağımlılıkları Kur
```bash
npm install
```

### Adım 3: Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

Tarayıcında `http://localhost:4322` açın.

## 🔐 Admin Paneli

### Giriş Yap
→ `http://localhost:4322/admin-login` veya `/admin-login`

**Giriş Seçenekleri:**
- 🔑 GitHub OAuth
- 🔑 Google OAuth
- 📧 E-mail & Şifre

### Yazı Paylaş (CMS)
→ `/admin` (Decap CMS)

Adminler buradan herhangi bir hesap olmadan yazı, etkinlik ve sayfa ekleyebilir.

## 🛠️ Mevcut Komutlar

- `npm run dev` - Geliştirme sunucusu (hot reload)
- `npm run build` - Üretim derlemesi
- `npm run preview` - Derlenmiş siteyi ön izlemede aç

## 📁 Proje Yapısı

```
src/
├── pages/              # Astro sayfaları
│   ├── index.astro          # 🏠 Ana Sayfa (Hero + Değerler + Son Gündem)
│   ├── articles.astro       # 📚 Yazılar
│   ├── events.astro         # 🎯 Etkinlikler
│   ├── map.astro            # 🗺️ Bize Katıl (Türkiye Haritası)
│   └── admin-login.astro    # 🔐 Admin Giriş
├── layouts/
│   └── MainLayout.astro     # Header, Footer, Dark Mode
├── components/
│   ├── TurkeyMap.astro      # İnteraktif Harita
│   └── LanguageSwitcher.astro # TR/EN Dil Seçicisi
├── styles/
│   └── global.css           # Tema ve animasyonlar
└── utils/
    └── i18n.ts              # Çeviriler (TR/EN)

content/
├── articles/    # Blog yazıları (Decap CMS ile yönetilen)
└── events/      # Etkinlikler (Decap CMS)

admin/
├── config.yml   # CMS koleksiyonları
└── index.html   # CMS arayüzü

public/
└── images/      # Statik görseller
```

## 🎨 Tasarım Sistemi

### Renkler
- **Ana Mor**: `#632F86` (Tailwind: `text-purple-600`)
- **Vurgu Kırmızısı**: `#DA291C` (Tailwind: `text-red-600`)
- **Pembe Accent**: `#ec4899` (Tailwind: `text-pink-600`)
- **Gündüz**: `#1a1a1a` / `#f8f9fa`
- **Gece**: Koyu mor tema (🔥 ikonuna tıkla)

### Yazı Tipleri
- **Başlıklar**: Poppins (Bold, Black)
- **Body**: Inter (Regular, Medium)

### Animasyonlar
- ✨ Fade In
- 📈 Slide Up
- 💜 Pulse (Harita illeri)

## 📱 Sayfalar

### 🏠 Ana Sayfa (`/`)
- Hero Section: "Güçlü Kadınlar, Güçlü Gelecek"
- Değerler: Özgürlük (#01), Dayanışma (#02), Mücadele (#03)
- Ayın Yazısı + Sosyal Medya Akışı
- **SON GÜNDEM** - Güncel eylemler, kampanyalar, haberler
- Kategoriler: Hukuk, Röportajlar, Sosyal Medya
- "Sesini Duyur" CTA
- Newsletter abone formu
- İstatistikler

### 📚 Yazılar (`/articles`)
- Kategori filtreleme (Hukuk, Röportaj, Kültür Sanat, vb.)
- Yazı listesi grid
- Newsletter CTA

### 🎯 Etkinlikler (`/events`)
- Tematik etkinlikler (Dayanışma, Akademik, Kültürel)
- Etkinlik ayrıntıları: Tarih, Yer, Açıklama
- "Etkinlik Öner" formu

### 🗺️ Bize Katıl (`/map`)
- İnteraktif Türkiye Haritası (82 il)
- Katılım başvuru formu
- Neden katılmalısın bölümü
- Ağ statistikleri

### 🔐 Admin Giriş (`/admin-login`)
- GitHub OAuth
- Google OAuth
- E-mail giriş
- Decap CMS yönlendirmesi

## 🌐 Dil Desteği (i18n)

Sağ üst köşedeki 🇹🇷 / 🇬🇧 düğmesi ile dil değiştirebilir.

**Desteklenen Diller:**
- 🇹🇷 Türkçe (TR)
- 🇬🇧 English (EN)

Tercümeleri [src/utils/i18n.ts](src/utils/i18n.ts) dosyasından yönet.

## 🌙 Gece Modu

Sağ üst köşedeki 🔥 ikonuna tıklayarak gece modunu etkinleştir.

## 🚢 Deployment (Cloudflare Pages)

### Build et
```bash
npm run build
```

### Deploy et
```bash
# dist/ klasörünü Cloudflare Pages'e yükle
# ATAU kullan Wrangler CLI
wrangler pages deploy dist/
```

## 📝 CMS (Decap)

### Decap Ayarı
1. [Decap Dashboard](https://app.decapcms.org)'a git
2. GitHub repository'yi bağla
3. `/admin` sayfasında "Decap CMS Panel"e git

### Koleksiyonlar
- **articles**: Blog yazıları
  - Başlık, Açıklama, İçerik
  - Tarih, Kategori, Etiketler
  - Kapak resmi, Yayın durumu
- **events**: Etkinlikler
  - Başlık, Tarih, Yer
  - Açıklama, Afiş, Twitter linki
- **pages**: Dinamik sayfalar

## 🔧 Özellikler

✅ **Hızlı**: Astro.js ile 0.5 saniyede açılır  
✅ **Güvenli**: Statik hosting, DDoS koruması (Cloudflare)  
✅ **Admin Kolay**: Decap CMS ile WordPress'ten daha basit  
✅ **Tasarımlı**: Feminist renkler ve typografi  
✅ **Accessible**: WCAG 2.1 uyumlu  
✅ **Responsive**: Mobil optimized  
✅ **Dark Mode**: Meşale/Süpürge teması  
✅ **İnteraktif**: Harita, formlar, sosyal entegrasyon  
✅ **Açık Kaynak**: Tüm kod GitHub'da  

## 🎨 Yaratıcı Özellikler

💡 **Son Gündem Bölümü**: Güncel eylemleri vurgula  
💡 **Admin Giriş**: Hızlı ve güvenli erişim  
💡 **Dil Seçicisi**: TR/EN desteği  
💡 **Türkiye Haritası**: İnteraktif iller  
💡 **Gece Modu**: Koyu mor tema  
💡 **Sosyal Entegrasyon**: Instagram, Twitter, Telegram  
💡 **Newsletter**: Abone sistemi  

## 📚 Kaynaklar

- [Astro Docs](https://docs.astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [Decap CMS](https://decapcms.org)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [Kampus Cadilari (Original)](https://kampus.nicholai.work/)

## 🤝 Katkıda Bulun

**Yapabileceklerin:**
- 📝 Yazı yazma
- 🎨 Tasarım & UI/UX
- 💻 Kodlama
- 🌍 Tercüme
- 📣 Pazarlama
- 📸 Fotoğraf & Video
- 💰 Finansal destek

```bash
# Kodlamaya başla
git clone https://github.com/yourusername/kampus-cadilari.git
cd kampus-cadilari
npm install
npm run dev
```

Değişiklik yaptıktan sonra PR aç!

## 📞 İletişim

- 📧 **E-mail**: contact@kampuscadilari.org
- 📸 **Instagram**: @kampuscadilari
- 𝕏 **Twitter**: @kampuscadilari
- 💬 **Telegram**: @kampuscadilari

---

**EST. 2018**
**Feminist dayanışması ile inşa edildi.** 💜

*Güçlü Kadınlar, Güçlü Gelecek*

Feminist direnişin dijital kalesidir. Kampüs Cadıları ve feminist aktivistler için bilgi, dayanışma ve eylem merkezi.

## 🚀 Kurulum

### Ön Koşullar
- Node.js 22.12.0 veya üzeri
- npm veya yarn

### Adım 1: Bağımlılıkları Kur
```bash
npm install
```

### Adım 2: Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

Tarayıcında `http://localhost:4321` açın.

## 🛠️ Mevcut Komutlar

- `npm run dev` - Geliştirme sunucusunu başlat (hot reload)
- `npm run build` - Üretim için siteyi derle
- `npm run preview` - Derlenmiş siteı ön izlemede gör

## 📁 Proje Yapısı

```
src/
├── pages/              # Astro sayfaları (routing otomatik)
│   ├── index.astro    # Ana sayfa
│   ├── articles.astro # Yazılar sayfası
│   ├── events.astro   # Etkinlikler sayfası
│   └── map.astro      # Bize Katıl - Türkiye Haritası
├── layouts/           # Sayfa şablonları
│   └── MainLayout.astro
├── components/        # Astro ve React bileşenleri
├── styles/           # Global CSS ve Tailwind
└── utils/            # Yardımcı fonksiyonlar

content/
├── articles/         # Blog yazıları (Decap CMS)
└── events/          # Etkinlikler (Decap CMS)

admin/
├── config.yml       # Decap CMS konfigürasyonu
└── index.html       # Admin paneli
```

## 🎨 Tasarım Sistemi

### Renkler
- **Ana Mor**: `#632F86` - Arka planlar, butonlar
- **Vurgu Kırmızısı**: `#DA291C` - Dikkat çeken öğeler
- **Gcerik**: `#1a1a1a` / `#f8f9fa`

### Yazı Tipleri
- **Başlıklar**: Poppins (Bold/Semibold)
- **Body**: Inter (Regular/Medium)

## 📝 Admin Paneli (Decap CMS)

Decap CMS, WordPress'in statik jeneratör karşılığıdır. İçerik yönetmek için:

1. `http://localhost:4321/admin` adresine git
2. GitHub/Google ile giriş yap
3. Yazı, etkinlik ve sayfa ekle

**Koleksiyonlar:**
- **Yazılar**: Blog yazıları, röportajlar
- **Etkinlikler**: Dayanışma buluşmaları, atölyeler
- **Sayfalar**: Hakkında, İletişim vb.

## 🚢 Deployment (Cloudflare)

### Pages ile Deploy
```bash
npm run build
# dist/ klasörünü Cloudflare Pages'e yükle
```

### Environment Değişkenleri
Cloudflare Pages'te ayarlayın:
- `NODE_VERSION=22.12.0`

## 🔧 Özellikler

- ✅ Astro.js ile ultra hızlı (0.5s açılış)
- ✅ Tailwind CSS ile tamamen özelleştirilebilir tasarım
- ✅ Decap CMS ile WordPress kadar kolay yönetim
- ✅ Statik hosting (Cloudflare ile DDoS koruması)
- ✅ Tamamen açık kaynak
- ✅ Türkçe arayüz
- ✅ Mobil uyumlu
- ✅ Erişilebilir (WCAG 2.1)

## 🌙 Gece Modu (Meşale/Süpürge)

Sağ üst köşedeki 🔥 ikonuna tıklayarak gece modunu etkinleştir.

## 📱 Sosyal Medya Entegrasyonu

Şunları entegre edebiliriz:
- Instagram Reels otomatik embedi
- Twitter/X başlıkları canlı beslemesi
- Telegram grup davet linki

## ✍️ Katkıda Bulun

Kodlama, yazı yazma, tercüme, tasarım, pazarlama... Her alanda yardım arıyoruz.

```bash
git clone https://github.com/kampuscadilari/dijital-mor-karargah.git
cd dijital-mor-karargah
npm install
npm run dev
```

Değişikliğini yaptıktan sonra PR aç!

## 📞 İletişim

- **E-mail**: contact@dijitalmorkarargah.org
- **Instagram**: @dijitalmorkarargah
- **Twitter**: @morkarargah

## πŸ"ž Kaynaklar

- [Astro Dokümantasyonu](https://docs.astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [Decap CMS](https://decapcms.org)
- [Cloudflare Pages](https://pages.cloudflare.com)

---

*Feminist dayanışması ile inşa edildi.* 💜
