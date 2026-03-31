# Musteri Canliya Alma Rehberi

Bu belge, teknik detaya girmeden projeyi canliya almak isteyen kisi veya ekip icin hazirlanmistir.

## Bu Proje Neye Ihtiyac Duyar

Bu proje:

- `Node.js` ile calisir
- statik hosting degildir
- `SQLite` veritabani kullanir
- domain ve SSL baglantisi ister

Bu nedenle sadece klasik HTML hosting yeterli olmayabilir. Node.js destekleyen bir ortam gerekir.

## Gerekli Uygulamalar

Asagidaki araclar gereklidir:

- `Node.js`
- `npm`
- `Git`

Opsiyonel ama tavsiye edilen araclar:

- `PM2`
- `Nginx`

Database notu:

- Ayrica `MySQL` veya `PostgreSQL` kurmak zorunlu degildir.
- Proje kendi `.db` dosyasi ile calisir.

## En Kolay 3 Yontem

### 1. Hostinger VPS

En guvenli ve en esnek secenektir.

Yapilacaklar:

1. VPS satin alinir.
2. Sunucuya `Node.js`, `npm` ve `Git` kurulur.
3. Repo GitHub'dan cekilir.
4. `.env` bilgileri girilir.
5. `npm install` calistirilir.
6. `npm run build` calistirilir.
7. `node dist/server/entry.mjs` veya `pm2` ile uygulama baslatilir.
8. Domain VPS'e baglanir.
9. SSL aktif edilir.

### 2. Hostinger Business / Cloud

Node.js uygulamasi destekleyen bir paket varsa kullanilabilir.

Yapilacaklar:

1. Hostinger panelden Node.js app alani acilir.
2. Repo baglanir veya dosyalar yuklenir.
3. Environment variables girilir.
4. Build komutu `npm run build` olarak tanimlanir.
5. Start komutu `node dist/server/entry.mjs` olarak tanimlanir.
6. Domain baglanir ve SSL aktif edilir.

Not:

- `SQLite` dosyasinin kalici klasorde tutuldugundan emin olunmalidir.
- Maliyet dusuk olabilir ama VPS kadar esnek degildir.

### 3. Railway / Render

Daha kolay deploy isteyenler icin uygundur.

Yapilacaklar:

1. GitHub repo platforma baglanir.
2. Environment variables eklenir.
3. Build komutu `npm run build` girilir.
4. Start komutu `node dist/server/entry.mjs` girilir.
5. Domain baglanir.
6. Kalici storage varsa aktif edilir.

Not:

- `SQLite` kullanan projelerde kalici disk/storage ayari onemlidir.

## Terminale Yazilacak Temel Komutlar

Sunucuda genelde su komutlar yeterlidir:

```bash
git clone <repo-url>
cd dijital-mor-karargah
npm install
npm run build
node dist/server/entry.mjs
```

Eger `pm2` kullanilacaksa:

```bash
pm2 start dist/server/entry.mjs --name dijital-mor-karargah
pm2 save
```

## Doldurulmasi Gereken Bilgiler

`.env.example` dosyasina bakilarak su alanlar doldurulmalidir:

- `JWT_SECRET`
- `DATABASE_URL`
- `NODE_ENV=production`
- `BASE_URL`
- `PUBLIC_BASE_URL`
- gerekiyorsa `SMTP_*` alanlari

## Database Hakkinda Basit Bilgi

Bu proje `SQLite` kullanir.

Yani:

- ayri bir database paneli kurmak zorunlu degildir
- veritabani tek bir `.db` dosyasi olarak calisir
- bu dosya silinirse veriler kaybolabilir
- bu yuzden kalici klasorde tutulmali ve yedeklenmelidir

## Domain ve SSL

Canliya alma sirasinda:

- domain DNS ayarlari yeni sunucuya yonlendirilir
- SSL sertifikasi aktif edilir
- site `https://` ile test edilir

## Son Kontrol Listesi

Canliya almadan once bunlar kontrol edilmelidir:

- ana sayfa aciliyor mu
- yazilar, etkinlikler ve arsiv sayfalari aciliyor mu
- admin girisi calisiyor mu
- admin panel yonleniyor mu
- sifre degistirme calisiyor mu
- veritabani dosyasi kalici klasorde mi
- domain ve SSL aktif mi

## Ozet

Teknik bir kisi icin bu proje GitHub'dan alinip calistirilabilir ve canliya alinabilir.

En rahat secenek:

- `Hostinger VPS`

En hizli secenek:

- `Railway` veya `Render`

En dusuk eforlu ama kontrolu daha sinirli secenek:

- `Hostinger Business / Cloud`

Detayli teknik kurulum icin:

- `KURULUM.md`
