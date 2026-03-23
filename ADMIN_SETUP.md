# Admin Kurulum Rehberi

Bu dosya sadece local ortam admin kurulum adimlari icindir.

## 1) Guvenlik Notu

- Sifreler repoda tutulmaz.
- Admin sifrelerini local ortam degiskeni ile olusturun.

## 2) Admin Hesaplarini Olusturma

```bash
ADMIN_DEFAULT_PASSWORD='GucluBirSifre' TEST_ADMIN_PASSWORD='DahaGucluBirSifre' node scripts/create-admin.js
```

Isterseniz hesap bazli sifre de verebilirsiniz:

```bash
ADMIN_PASSWORD_ADMIN='...' ADMIN_PASSWORD_EDITOR='...' ADMIN_PASSWORD_HARITA='...' ADMIN_PASSWORD_TAKVIM='...' TEST_ADMIN_PASSWORD='...' node scripts/create-admin.js
```

## 3) Admin Sayfalari

- `/admin/` -> dashboard
- `/admin/submissions` -> basvuru/etkinlik/yazi/arsiv akislar
- `/admin/login-email` -> giris

## 4) Guvenlik

- Uretimde ayni sifreyi birden fazla hesapta kullanmayin.
- `JWT_SECRET` ortam degiskenini mutlaka ayarlayin.
- Admin endpointlerine sadece yetkili token ile erisim verin.
