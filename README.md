# Dijital Mor Karargah

Dijital Mor Karargah; yazi, etkinlik, arsiv ve admin onay akislarini tek platformda toplayan Astro tabanli bir uygulamadir.

## Guncel Durum (23 Mart 2026)

- Event proposal backend akisi aktif (oneri -> admin karar -> yayin)
- Tum aktif admin onayi mantigi event, yazi ve arsiv icin backendde aktif
- Admin submissions paneli aktif (basvuru, etkinlik, yazi, arsiv sekmeleri)
- Admin bildirim UI aktif (+ okunmamis sayaci, secip silme)
- Arşiv kartlari ve detay sayfalarinda PDF indir davranisi aktif (local PDF)
- Etkinliklerde kapasite mantigi sade: sinirsiz kontenjan + joined_count

## Tech Stack

- Astro 5
- Tailwind CSS
- better-sqlite3 (SQLite)
- bcrypt
- jsonwebtoken (JWT)

## Proje Yapisı

- `src/pages` -> route dosyalari
- `src/pages/api` -> API endpointleri
- `src/pages/admin` -> admin sayfalari
- `src/components` -> yeniden kullanilabilir UI bilesenleri
- `src/utils/db.js` -> veritabani ve is kurallari
- `scripts` -> kurulum ve test scriptleri

## Hizli Baslangic

1. Bagimliliklari yukle:

```bash
npm install
```

2. Admin hesaplarini seed et:

```bash
node scripts/create-admin.js
```

3. Dev server baslat:

```bash
npm run dev -- --host 0.0.0.0 --port 4321
```

PowerShell execution policy nedeniyle `npm` komutu engellenirse:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run dev -- --host 0.0.0.0 --port 4321
```

## Local URL'ler

- Ana sayfa: `http://localhost:4321/`
- Yazilar: `http://localhost:4321/articles`
- Etkinlikler: `http://localhost:4321/events`
- Arsiv: `http://localhost:4321/archive`
- Admin panel: `http://localhost:4321/admin/`
- Admin login: `http://localhost:4321/admin/login-email`

## Admin Test Hesaplari

Guvenlik nedeniyle sifreler repoda tutulmaz.

- E-posta hesaplari: `admin@kampuscadilari.org`, `editor@kampuscadilari.org`, `harita@kampuscadilari.org`, `takvim@kampuscadilari.org`, `test@kampuscadilari.org`
- Sifreleri local ortamda `node scripts/create-admin.js` komutunu, gerekli ortam degiskenleri ile calistirarak olusturun.

## Kritik API Endpointleri

### Public
- `POST /api/submit-application`
- `POST /api/events/propose`
- `POST /api/events/check-name`
- `GET /api/events/list`
- `GET /api/events/:id`
- `POST /api/events/:id/join`
- `POST /api/articles/view`
- `GET /api/archive/list`
- `GET /api/archive/:id/export-pdf`

### Admin
- `GET /api/admin/applications`
- `PUT /api/admin/applications`
- `GET /api/admin/event-proposals`
- `POST /api/admin/event-proposals/:id/approve`
- `POST /api/admin/event-proposals/:id/reject`
- `GET /api/admin/articles`
- `POST /api/admin/articles/:id/approve`
- `POST /api/admin/articles/:id/reject`
- `GET /api/admin/archive`
- `POST /api/admin/archive/:id/approve`
- `POST /api/admin/archive/:id/reject`
- `GET /api/admin/notifications`

## Dogrulama Notlari

- Etkinlik response'larinda legacy `capacity` / `remaining_capacity` alanlari kaldirildi.
- Arsiv PDF linkleri local `/archive/*.pdf` formatina sabitlendi.
- `/articles/hukuk` route'u 200 donuyor ve kategori render DB ile uyumlu.

## Faydalı Dokumanlar

- `TEST_GUIDE.md` -> adim adim manuel test plani
- `DATABASE_SCHEMA.sql` -> tablo yapilari
- `KURULUM.md` -> kurulum adimlari

## Not

Bu repo aktif gelistirme asamasindadir. Uretim ortami oncesi adapter/deployment ve guvenlik sertlestirmeleri tamamlanmalidir.
