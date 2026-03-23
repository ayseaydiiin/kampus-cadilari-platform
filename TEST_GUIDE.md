# Dijital Mor Karargah - Test Guide

Bu dokuman, local ortamda kritik akislarin adim adim dogrulanmasi icin hazirlandi.

## 1) On Kosullar

- Node.js 22+
- Proje klasoru: `c:\workspace\dijital-mor-karargah`
- Veritabani dosyasi: `kampus_cadilari.db`

Bagimliliklar:

```bash
npm install
```

Admin hesaplari:

```bash
ADMIN_DEFAULT_PASSWORD='GucluBirSifre' TEST_ADMIN_PASSWORD='DahaGucluBirSifre' node scripts/create-admin.js
```

Dev server:

```bash
npm run dev -- --host 0.0.0.0 --port 4321
```

PowerShell engeli olursa:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run dev -- --host 0.0.0.0 --port 4321
```

## 2) Admin Login Bilgileri

| Email | Sifre | Rol |
|---|---|---|
| `admin@kampuscadilari.org` | localde olusturulur | Genel Koordinator |
| `editor@kampuscadilari.org` | localde olusturulur | Icerik Editoru |
| `harita@kampuscadilari.org` | localde olusturulur | Ag Koordinatoru |
| `takvim@kampuscadilari.org` | localde olusturulur | Etkinlik Sorumlusu |
| `test@kampuscadilari.org` | localde olusturulur | Test Admin |

Giris URL'leri:

- `http://localhost:4321/admin/`
- `http://localhost:4321/admin/login-email`

## 3) Hızlı Smoke Test (5-10 dk)

### 3.1 Route ve temel sayfalar

- `GET /` -> 200
- `GET /articles` -> 200
- `GET /articles/hukuk` -> 200
- `GET /events` -> 200
- `GET /archive` -> 200
- `GET /admin/` -> 200

Beklenen: beyaz ekran veya transform hatasi olmamali.

### 3.2 Auth

- Admin login ekranindan 5 hesabin da girisi test edilir.
- Beklenen: token uretilir, admin panel acilir.

### 3.3 Archive PDF

- `http://localhost:4321/archive/1` detayina gir.
- `PDF Indir` tikla.
- Beklenen: local PDF dosyasi iner (`/archive/*.pdf`), Example Domain acilmaz.

### 3.4 Event list response kontrolu

- `GET /api/events/list`
- Beklenen:
  - `joined_count` var
  - `capacity_label` var (`Sinirsiz kontenjan`)
  - `capacity` yok
  - `remaining_capacity` yok

## 4) Bize Katil Akisi

### Adimlar

1. `http://localhost:4321/map`
2. Il secip basvuru formunu doldur.
3. Formu gonder.

### Beklenen

- Basari mesaji gorunur.
- `applications` tablosuna kayit duser.
- Admin panel `Bize Katil Basvurulari` sekmesinde kayit listelenir.
- Modal detay + onay/red aksiyonu calisir.

## 5) Etkinlik Oneri -> Onay -> Yayin -> Katilim

### 5.1 Oneri gonderimi

1. `http://localhost:4321/events`
2. "Etkinlik Onerisinde Bulun" formunu doldur.
3. Gonder.

Beklenen:
- Yeni kayit `event_proposals` tablosuna duser.
- Duplicate title kontrolu calisir.
- Admin bildirim kaydi olusur.

### 5.2 Admin karar

1. `http://localhost:4321/admin/submissions`
2. "Etkinlik Onerileri" sekmesinde kaydi ac.
3. Onay veya red ver.

Beklenen:
- Karar `event_proposal_approvals` tablosuna yazilir.
- Tum admin onayi tamamlaninca status `approved` olur.
- Bir red varsa status `rejected` olur.

### 5.3 Yayin ve katilim

1. `http://localhost:4321/events` sayfasinda onayli etkinligi gor.
2. Detaya gir: `/events/:id`
3. Katilim formunu doldur.

Beklenen:
- Katilim `participations` tablosuna yazilir.
- Ayni email ile tekrar katilim duplicate hatasi verir.
- UI'da "Katilim saglayan kisi" artar.
- Metin: "Sinirsiz kontenjan".

## 6) Yazilar Akisi (Kategori + Detay + Okunma)

### 6.1 Kategori sayfasi

- `http://localhost:4321/articles/hukuk`

Beklenen:
- 200 status
- Kategori basligi ve yazi listesi render edilir.
- Liste kartlarinda slug bazli detay linki vardir:
  - `/articles/:category/:slug`

### 6.2 Bos kategori uyarisi

- Icerik olmayan bir kategoriye git.

Beklenen:
- "Bu bolume henuz yazi eklenmemistir." uyari mesaji gorunur.

### 6.3 Detay

- Bir karttan detay sayfasina git.

Beklenen:
- Yazi acilir
- Okunma sayaci artis endpointi calisir

## 7) Admin Submissions ve Bildirim UI

- `http://localhost:4321/admin/submissions`

Kontrol listesi:
- Sekmeler: Basvurular, Etkinlik Onerileri, Yazi Onaylari, Gazete Arsivi
- Bildirim paneli aciliyor
- Okunmamis sayac dogru
- Bildirim secip silme calisiyor
- Bildirime tiklayinca ilgili kayda yonlenme/odak davranisi var

## 8) Veritabani Dogrulama Komutlari

```sql
sqlite3 kampus_cadilari.db "SELECT id,email,role,is_active FROM users ORDER BY id;"
sqlite3 kampus_cadilari.db "SELECT email,role,is_active FROM admin_users ORDER BY id;"
sqlite3 kampus_cadilari.db "SELECT id,title,status,created_at FROM event_proposals ORDER BY id DESC LIMIT 10;"
sqlite3 kampus_cadilari.db "SELECT id,event_id,email,created_at FROM participations ORDER BY id DESC LIMIT 10;"
sqlite3 kampus_cadilari.db "SELECT id,title,status,publication_year,pdf_url FROM newspaper_archives ORDER BY id DESC LIMIT 10;"
sqlite3 kampus_cadilari.db "SELECT id,admin_email,type,is_read,created_at FROM notifications ORDER BY id DESC LIMIT 20;"
```

## 9) Sik Karsilasilan Sorunlar

### Admin login olmuyor

- `node scripts/create-admin.js` tekrar calistir.
- Dogru portta calistigini kontrol et: `4321`.

### PowerShell `npm.ps1` engeli

- `npm.cmd` ile calistir:
  - `& 'C:\Program Files\nodejs\npm.cmd' run dev -- --host 0.0.0.0 --port 4321`

### PDF indirirken farkli sayfa aciliyor

- Arsiv kaydindaki `pdf_url` alaninin `/archive/*.pdf` oldugunu kontrol et.

### Kategori sayfasi eski tasarim gibi geliyor

- Hard refresh (`Ctrl + F5`) yap.
- Dev server'i yeniden baslat.

---

Guncelleme tarihi: **23 Mart 2026**
