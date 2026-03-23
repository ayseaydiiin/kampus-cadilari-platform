# 🔮 Kampüs Cadıları - Setup & Deployment Guide

## Genel Bakış

**Kampüs Cadıları**, 82 Türk kenti'ndeki kadın aktivistleri birleştiren modern, güvenli ve dayanışmacı bir dijital platformudur.

- **Framework**: Astro.js 5 + Tailwind CSS
- **CMS**: Decap CMS (Git-backed)
- **Auth**: SQLite + JWT
- **Hosting**: Cloudflare Pages / Node.js

## 🚀 Hızlı Başlangıç

### 1. Gerekçi Ortamı Kur

```bash
# Node.js 22+ ve npm gerekli
node --version  # v22.12+
npm --version

# Paketleri yükle
npm install
```

### 2. Admin Kullanıcı Oluştur

```bash
# İlk admin'i ekle
node scripts/add-admin.js email@kampuscadilari.org ElimiziBirleştir "Full Name"
```

### 3. Dev Sunucusu Başlat

```bash
npm run dev
# Açık: http://localhost:4323
```

### 4. İlk Girişi Yap

```
1. http://localhost:4323/admin/login-email
2. Email: email@kampuscadilari.org
3. Password: ElimiziBirleştir
4. Admin paneline yönleneceksin
```

---

## 📁 Proje Yapısı

```
src/
├── pages/
│   ├── index.astro              # TR Ana Sayfa
│   ├── articles.astro           # TR Yazılar
│   ├── events.astro             # TR Etkinlikler
│   ├── map.astro                # TR Bire Katıl
│   ├── admin-login.astro        # TR Admin Giriş
│   ├── admin/
│   │   ├── index.astro          # CMS Paneli
│   │   └── login-email.astro    # Email Giriş
│   ├── en/                      # ENGLISH VERSIONS
│   │   ├── index.astro
│   │   ├── articles.astro
│   │   ├── events.astro
│   │   ├── map.astro
│   │   ├── admin-login.astro
│   │   └── admin/
│   │       └── login-email.astro
│   └── api/auth/
│       ├── login.js             # POST /api/auth/login
│       ├── logout.js            # POST /api/auth/logout
│       ├── register.js          # POST /api/auth/register
│       └── me.js                # GET /api/auth/me
├── components/
│   ├── MainLayout.astro         # Header, Footer, Dark Mode
│   ├── LanguageSwitcher.astro   # TR/EN Toggle
│   └── TurkeyMap.astro          # 82 İl Selector
├── utils/
│   ├── db.js                    # SQLite & Auth Logic
│   └── i18n.ts                  # Translations (TR/EN)
├── styles/
│   └── global.css               # Custom Animations
└── layouts/
    └── MainLayout.astro         # Global Layout

admin/
├── config.yml                   # CMS Configuration
└── index.html                   # CMS Interface Entry

public/
├── images/
└── favicon.svg

kampus_cadilari.db              # SQLite Database (auto-created)
```

---

## 🔐 Kimlik Doğrulama Sistemi

### Veritabanı Şeması

```sql
-- users: Tüm kullanıcılar
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,   -- bcrypt hashed
  full_name TEXT,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'editor',
  is_active INTEGER DEFAULT 1,
  is_verified INTEGER DEFAULT 0,
  created_at DATETIME,
  last_login DATETIME,
  profile_data TEXT
);

-- admin_users: Admin izin listesi
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME
);

-- sessions: Aktif oturumlar
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME
);

-- activity_log: İşlem günlüğü
CREATE TABLE activity_log (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  action TEXT NOT NULL,         -- 'login', 'logout', 'page_edit', etc
  details TEXT,                 -- JSON details
  created_at DATETIME
);
```

### Admin Ekleme

```bash
# Yeni admin ekle
node scripts/add-admin.js yeni@email.com Parola "Ad Soyad"

# Birden fazla admin ekle
node scripts/add-admin.js admin1@kampuscadilari.org Parola "Admin 1"
node scripts/add-admin.js admin2@kampuscadilari.org Parola "Admin 2"
node scripts/add-admin.js admin3@kampuscadilari.org Parola "Admin 3"
```

---

## 🎨 Tasarım & Renk Paleti

```
Primary Purple:    #632F86 (Purple 600)
Accent Red:        #DA291C
Accent Pink:       #ec4899 (Pink 600)
Dark Background:   #1a1a2e (Dark Mode)
Light Background:  #f8fafc (Slate 50)
```

### Tipografi
- **Başlıklar**: Poppins (Bold, 700)
- **Gövde**: Inter (Regular, 400)
- **Vurgular**: Poppins (Semi Bold, 600)

---

## 📱 Multi-Language Support

Sistem otomatik olarak **Türkçe** ve **İngilizce** destekler:

- `/` → Türkçe
- `/en/` → İngilizce

### Çeviriler Ekle

`src/utils/i18n.ts` dosyasında:

```typescript
export const translations = {
  tr: {
    section: {
      key: 'Türkçe Metin'
    }
  },
  en: {
    section: {
      key: 'English Text'
    }
  }
}
```

---

## 🌐 Deployment

### Cloudflare Pages (Recommended)

```bash
# 1. GitHub'a push et
git add .
git commit -m "Add auth system and English routes"
git push origin main

# 2. Cloudflare Pages ile bağlantı kur:
# - Repo seç: dijital-mor-karargah
# - Build command: npm run build
# - Build folder: dist/

# 3. Environment Variables (Cloudflare Panel):
JWT_SECRET=your-super-secret-key-here
NODE_ENV=production
```

### Node.js / Vercel Deployment

```bash
# Vercel CLI (Static)
vercel deploy

# Node.js (Server Mode gerekli)
# astro.config.mjs'ye adapter ekle:
import node from '@astrojs/node';
export default defineConfig({
  adapter: node({ mode: 'standalone' })
});
npm run build
node dist/server/entry.mjs  # Production
```

---

## 🛠️ Kommon Görevler

### CMS İçerik Yönetimi

1. **Yazı Ekle**:
   - http://localhost:4323/admin → Collections → Articles
   - Title, Body, Date, Category, Tags, Image

2. **Etkinlik Ekle**:
   - http://localhost:4323/admin → Collections → Events
   - Title, Date, Location, Description, Poster

3. **Sayfa Düzenle**:
   - http://localhost:4323/admin → Collections → Pages
   - Title, Slug, Body

### Dark Mode Toggle

- Header'daki 🔥 icon'a tıkla
- Tercih `localStorage`'da kaydedilir

### Yeni Komponent Ekle

```astro
---
// src/components/MyComponent.astro
export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<div class="bg-purple-100 p-6 rounded-lg">
  <h3 class="font-bold text-purple-700">{title}</h3>
  <slot />
</div>
```

---

## 🔍 Sorun Giderme

### Port zaten kullanılıyor

```bash
# 4323'i kullanan process'i bul ve durdur
lsof -i :4323                    # macOS/Linux
netstat -ano | findstr :4323    # Windows
# Sonra npm run dev tekrar çalıştır
```

### CMS Paneli ladesmiyor

```bash
# 1. Decap CMS konfigürasyonunu kontrol et:
cat admin/config.yml

# 2. Cache temizle:
npm run build
rm -rf dist node_modules/.vite

# 3. Dev sunucusunu yeniden başlat:
npm run dev
```

### Admin Girişi çalışmıyor

```bash
# 1. Admin kullanıcısının var olduğunu kontrol et
node -e "
import { getDatabase } from './src/utils/db.js';
const db = getDatabase();
console.log('Admin users:', db.prepare('SELECT * FROM admin_users').all());
"

# 2. Yeni admin ekle
node scripts/add-admin.js admin@kampuscadilari.org YeniParola "Admin"
```

### Database reset (DEV only)

```bash
rm kampus_cadilari.db
npm run build
node scripts/add-admin.js admin@kampuscadilari.org Kampus123 "Admin"
npm run dev
```

---

## 📚 Dokumentasyon

- **Astro**: https://docs.astro.build
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Decap CMS**: https://decapcms.org/docs
- **Better-SQLite3**: https://github.com/WiseLibs/better-sqlite3/wiki

---

## 🤝 Katkı

Aktivist ağını güçlendirmek için:

1. Feature branch'i oluştur (`git checkout -b feature/bisiyi-ekle`)
2. Değişiklikleri commit et (`git commit -m 'Bisiye ekle'`)
3. Branch'e push et (`git push origin feature/bisiyi-ekle`)
4. Pull Request aç

---

## ⚖️ Lisans

Feminist Dayanışması ile inşa edildi. Tüm hakları saklıdır.

---

## 🔗 İletişim

- **Web**: https://kampuscadilari.org
- **Instagram**: @kampuscadilari
- **Twitter**: @kampuscadilari
- **Email**: admin@kampuscadilari.org

---

**Oluşturma Tarihi**: 19 Mart 2026
**Sürüm**: 1.0.0
**Platform Durumu**: ✅ BETA (Live)
