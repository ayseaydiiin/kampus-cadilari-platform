# Dijital Mor Karargah
## Canliya Alma, Guvenlik ve Surdurulebilirlik Teklifi (Tam Kapsam)

## 1) Hedef

Bu teklifin amaci, projeyi "gecici demo" mantigindan cikarip uzun yillar sorunsuz calisacak bir uretim sistemine donusturmektir.

Odak alanlar:
- Yuksek erisilebilirlik (site kapanmamasi)
- Saldirilara karsi dayaniklilik
- Duzenli ve testli yedekleme
- Veri guvenligi ve form guvenligi
- Kontrol edilebilir aylik maliyet

## 2) Onerilen Mimari

Onerilen kurgu:
- Cloudflare (DNS, DDoS koruma, WAF, rate limit, cache)
- Uygulama sunucusu (Node + Astro server output)
- Managed PostgreSQL (SQLite yerine uretim DB)
- Yedekleme deposu (object storage)
- Monitoring + alarm yapisi

Neden bu mimari:
- Mevcut kod API agirlikli oldugu icin server mode dogru secim.
- SQLite tek dosya oldugu icin uzun vadede eszamanli yazma ve operasyonel risk artar.
- Managed PostgreSQL ile hem performans hem yedekleme hem geri donus guvencesi artar.

## 3) Platform Onerisi

Birinci onerim:
- DigitalOcean (App/VPS + Managed PostgreSQL) + Cloudflare

Alternatif:
- Hetzner Cloud + PostgreSQL (self-managed veya managed servisle)

Karar notu:
- "Yillarca kullanacagiz" hedefinde Managed PostgreSQL olan kurgu operasyonel riski ciddi azaltir.

## 4) Maliyet (Aylik Tahmini)

Fiyatlar saglayiciya gore degisebilir; asagidaki tablo uretim planlamasi icin pratik referanstir.

### Paket A - Baslangic Guvenli Uretim
- App sunucu (2 GB): ~12 USD
- Sunucu backup (haftalik): ~2.4 USD
- Managed PostgreSQL (1 GB): ~15.15 USD
- Cloudflare: Free plan ile baslangic (0 USD)
- Tahmini toplam: ~29.55 USD / ay (+ domain)

### Paket B - Onerilen (Daha Guvenli ve Rahat)
- App sunucu (4 GB): ~24 USD
- Sunucu backup (gunluk): ~7.2 USD
- Managed PostgreSQL (2 GB): ~30.45 USD
- Cloudflare: Free veya ihtiyaca gore ust plan
- Tahmini toplam: ~61.65 USD / ay (+ domain)

### Paket C - Kurumsal Hazirlik (Staging dahil)
- Paket B + ek staging sunucusu (2 GB): +12 USD
- Tahmini toplam: ~73.65 USD / ay (+ domain)

Opsiyonel ekler:
- Uptime/monitoring araci (ucretsiz veya ucretli)
- Log toplama servisi
- Harici object storage backup

## 5) Tek Seferlik Kurulum Kapsami (Proje Is Kalemi)

Bu kapsam "kurulum + guvenlik sertlestirme + canliya alma + devir" paketidir.

### 5.1 Altyapi Kurulumu
- Production sunucu kurulumu
- Reverse proxy (Nginx/Caddy)
- SSL/TLS (HTTPS) ve otomatik yenileme
- Process manager (pm2/systemd)
- Domain yonlendirme

### 5.2 Uygulama Hazirligi
- Production env degiskenleri
- `JWT_SECRET` guvenli anahtar yonetimi
- SMTP entegrasyonu
- Build/release pipeline temel kurgusu

### 5.3 Veritabani Gecisi
- SQLite -> PostgreSQL migration plani
- Tablo/sutun uyumlulugu
- Veri tasima ve dogrulama
- Rollback plani

### 5.4 Guvenlik Sertlestirme (Kritik)
- Tum `/api/admin/*` endpointlerine zorunlu auth/role guard
- CORS kisitlama (yalnizca izinli origin)
- Input schema validation (server-side)
- Rate limit + bot koruma (Cloudflare + uygulama seviyesi)
- CSRF korumasi (admin mutasyon endpointleri)
- Security headers (CSP, HSTS, X-Frame-Options, vb.)
- Login denemesi brute-force korumasi

### 5.5 Yedekleme ve Felaket Kurtarma
- Otomatik gunluk DB backup
- Haftalik full snapshot
- Harici depoya kopya (3-2-1 mantigi)
- Aylik restore testi

### 5.6 Go-Live ve Hypercare
- Canliya gecis checklisti
- Ilk 7-14 gun yakin takip
- Hata/performans duzeltmeleri

## 6) Müşterinin Sorularina Net Yanitlar

### "Cloudflare gibi koruma aktif mi?"
- Aktif hale getirilebilir ve onerilir.
- Domain Cloudflare'a alindiginda DDoS, WAF, rate-limit, bot azaltma katmanlari devreye alinir.
- Ilk asamada Free plan ile baslanir, trafik ve risk artisina gore ust plana gecilir.

### "Duzenli yedekleme yapilacak mi?"
- Evet, zorunlu.
- Gunluk veritabani dump + haftalik snapshot + harici kopya + restore testi.
- Hedef: veri kaybi riskini olculebilir seviyeye dusurmek.

### "Formlardan DB sizmasi nasil engellenecek?"
- Kod tarafinda prepared statement kullanimi var, bu iyi bir temel.
- Buna ek olarak:
- zorunlu schema validation,
- rate limit,
- captcha/turnstile,
- bot ve anomali engelleme,
- admin API'lerde tam kimlik denetimi
uygulanacak.

### "Hangi platformu oneriyorsun?"
- Bu proje ve hedef icin: DigitalOcean + Managed PostgreSQL + Cloudflare.
- Sebep: maliyet/operasyon dengesi, yedekleme ve uzun vadeli buyume kolayligi.

## 7) Guvenlik ve Sureklilik SLA Hedefi (Oneri)

Ihtiyaca gore asagidaki operasyon hedefleri uygulanir:
- Uptime hedefi: %99.9 (altyapi bagimli)
- Kritik hata ilk yanit suresi: 15-60 dk
- RPO hedefi: 24 saatten dusuk (gunluk backup + logik yedek)
- RTO hedefi: 1-4 saat (senaryoya bagli)

## 8) Uygulama Takvimi (Gercekci Plan)

### Faz 1 - Hazirlik ve Guvenlik (2-3 gun)
- Production env
- Cloudflare temel ayarlar
- Admin API auth hardening
- CORS + header sertlestirme

### Faz 2 - Veritabani ve Yedekleme (2-3 gun)
- PostgreSQL gecis
- Migration testleri
- Backup otomasyonu
- Restore provasi

### Faz 3 - Go-Live (1 gun)
- Son kabul testleri
- DNS cutover
- Canli acilis

### Faz 4 - Stabilizasyon (7-14 gun)
- Izleme
- Hata iyilestirmeleri
- Performans tuning

Toplam: 1.5 - 3 hafta (kapsam ve onay hizina gore)

## 9) Proje Ici Teknik Riskler (Canli Oncesi Kapatilmasi Gerekenler)

- Admin endpointlerinde merkezi auth kontrolunu zorunlu hale getirme
- `Access-Control-Allow-Origin: *` kullanimlarini kisitlama
- SQLite bagimliligini production disina alma
- Guvenlik olay loglarini merkezilestrme

## 10) Kapsam Disi / Opsiyonel Isler

- SIEM/SOC seviyesinde ileri guvenlik gozlemi
- Otomatik penetration test pipeline
- Multi-region aktif-aktif mimari
- CDN edge worker ile ileri bot siniflandirma

## 11) Sonuc ve Onerilen Karar

Bu proje, dogru canli mimariyla uzun omurlu ve dayanikli hale gelir.
En dengeli karar:
- Paket B (onerilen) ile canliya cikis
- Cloudflare koruma katmanlarinin aktif edilmesi
- PostgreSQL gecisi + yedekleme otomasyonu
- Ilk fazda kritik guvenlik sertlestirmelerinin tamamlanmasi

Bu yapiyla, musteriye su guvence net verilebilir:
"Sistem sadece yayina alinmis olmayacak; guvenlik, yedekleme ve sureklilik prensipleriyle isletilebilir bir urun haline getirilecek."

