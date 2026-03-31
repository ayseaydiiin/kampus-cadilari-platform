# Kurulum Bilgileri

Merhaba,

Projenin kurulumu icin asagidaki adimlari takip etmeniz yeterlidir.

## Gereksinimler

- Node.js `22.12.0` veya uzeri
- Node.js destekleyen bir hosting veya sunucu
- Git erisimi
- SSL destekli bir domain yonlendirmesi

Bu proje Astro `server output` ile calisir. Yani statik hosting degil, Node.js calistirabilen bir ortam gerekir.

Uygun ortam ornekleri:

- VPS
- Hostinger Business / Cloud / VPS
- Render
- Railway

## Kurulum Adimlari

1. Once Node.js destekleyen bir hosting veya sunucu olusturulmalidir.
2. Paylasilan GitHub reposu sunucuya cekilmelidir.
3. Proje klasorunde bagimliliklar yuklenmelidir:

```bash
npm install
```

4. Ortam degiskenleri `.env.example` dosyasina gore doldurulmalidir.
5. Proje build edilmelidir:

```bash
npm run build
```

6. Uygulama su komutla baslatilmalidir:

```bash
node dist/server/entry.mjs
```

7. Domain, sunucuya yonlendirilerek aktif hale getirilmelidir.
8. SSL (`https`) aktif edilmelidir.

## Terminale Yazilacak Komutlar

Sunucuda ya da hosting terminalinde sirasiyla su komutlar calistirilabilir:

```bash
git clone <repo-url>
cd dijital-mor-karargah
npm install
npm run build
node dist/server/entry.mjs
```

Eger repo zaten sunucuda varsa:

```bash
cd dijital-mor-karargah
git pull
npm install
npm run build
node dist/server/entry.mjs
```

## Localde Web Siteyi Calistirma

Projeyi kendi bilgisayarinizda calistirmak icin:

```bash
git clone <repo-url>
cd dijital-mor-karargah
npm install
npm run dev -- --host 0.0.0.0 --port 4321
```

Ardindan tarayicidan su adres acilir:

```text
http://localhost:4321
```

Windows PowerShell kullaniyorsaniz ve `npm` dogrudan calismiyorsa:

```powershell
cd C:\path\to\dijital-mor-karargah
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev -- --host 0.0.0.0 --port 4321
```

Canli ortama yakin sekilde production build ile calistirmak icin:

```bash
cd dijital-mor-karargah
npm install
npm run build
node dist/server/entry.mjs
```

## Ornek Ortam Degiskenleri

`.env.example` dosyasini referans alip `.env` veya platformun destekledigi environment variables alanina su degerleri girilmelidir:

```env
JWT_SECRET=guclu-ve-en-az-32-karakterlik-bir-gizli-anahtar
DATABASE_URL=./kampus_cadilari.db
NODE_ENV=production
ADMIN_EMAILS=admin@kampuscadilari.org
ADMIN_DEFAULT_PASSWORD=
TEST_ADMIN_PASSWORD=
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@example.com
BASE_URL=https://alanadiniz.com
PUBLIC_BASE_URL=https://alanadiniz.com
```

Kritik notlar:

- `JWT_SECRET` uretim ortaminda zorunludur ve en az 32 karakter olmalidir.
- `DATABASE_URL` goreli veya mutlak bir dosya yolu olabilir.
- `BASE_URL` ve `PUBLIC_BASE_URL` canli domain ile ayni olmalidir.
- SMTP alanlari mail ozellikleri kullanilacaksa doldurulmalidir.

## Sunucuda Calistirma

Repo cekildikten sonra tipik kurulum akisi su sekildedir:

```bash
git clone <repo-url>
cd dijital-mor-karargah
npm install
npm run build
node dist/server/entry.mjs
```

## Kalicilik ve Veritabani Notu

Not: Proje SQLite kullandigi icin veritabani dosyasinin bulundugu dizinin kalici (`persistent`) olmasi onemlidir.

Bu nedenle:

- Gecici dosya sistemi kullanan ortamlarda SQLite dosyasi kaybolabilir.
- `DATABASE_URL` icin kalici bir klasor tercih edilmelidir.
- Duzenli yedek alinmasi onerilir.

## Domain ve SSL

Canliya alma sirasinda:

- Domain DNS kayitlari sunucu IP'sine veya platformun verdigi hedefe yonlendirilmelidir.
- SSL sertifikasi aktif edilmelidir.
- Site `https://` ile test edilmelidir.

## Onerilen Kontroller

Kurulum tamamlandiktan sonra su kontroller yapilmalidir:

- Ana sayfa aciliyor mu
- `articles`, `events`, `archive` sayfalari aciliyor mu
- Admin login calisiyor mu
- Admin panel yonlendirmesi dogru mu
- Icerik olusturma ve sifre degistirme islemleri calisiyor mu
- Veritabani dosyasi kalici klasorde olusuyor mu

## Destek

Kurulum sirasinda takildiginiz bir nokta olursa destek saglayabilirim.
