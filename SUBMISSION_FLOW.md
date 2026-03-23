# 🔄 Başvuru & Etkinlik Önerisi Sistemi Açıklaması

## 1️⃣ Başvuru Süreci (Join Applications)

### Kullanıcı Tarafı:
1. Harita sayfasına (`/map` veya `/en/map`) git
2. "Bize Katıl" formunu doldur:
   - Ad Soyad
   - E-mail
   - İl seçimi
   - Üniversite/Kurum
   - Katkı alanları (Organizing, Writing, Education, Support)
   - Sosyal medya handle

### Başvuru Alındıktan Sonra:
- ✅ Kullanıcı "Başvuru başarıyla gönderildi" mesajı alır
- 📱 Başvuru **Admin Paneli** → **Başvurular & Etkinlik Önerileri** sekmesinde görüntülenir
- 📊 Admin paneline "Bize Katıl Başvuruları" kartında başvuru sayısı artacak

### Admin Tarafı:
- Admin, `/admin/submissions` sayfasında tüm başvuruları görebilir
- Başvuruları duruma göre filtreleyebilir:
  - **Yeni** (New): Henüz incelenmemiş
  - **İncelenmiş** (Reviewed): Görülüp incelendi
  - **Onaylanmış** (Approved): Onaylanarak kabul edildi
- Her başvuruya tıklayarak detayları görebilir
- "Onayla" veya "Reddet" butonlarıyla işlem yapabilir

---

## 2️⃣ Etkinlik Önerisi Süreci (Event Proposals)

### Kullanıcı Tarafı:
1. Etkinlikler sayfasına (`/events` veya `/en/events`) git
2. "Etkinlik Öneriniz Başarıyla Gönderildi" bölümünde "Etkinlik Başlat" butonuna tıkla
3. Etkinlik önerisi detaylarını gir:
   - Etkinlik başlığı
   - İl
   - Açıklama
   - Önerilen tarih (opsiyonel)

### Etkinlik Önerisi Alındıktan Sonra:
- ✅ Kullanıcı "Etkinlik önerisi başarıyla gönderildi" mesajı alır
- 📱 Önerisi **Admin Paneli** → **Başvurular & Etkinlik Önerileri** sekmesinde görüntülenir

### Admin Tarafı:
- Admin, `/admin/submissions` sayfasında "Etkinlik Önerileri" sekmesinde tüm önerileri görebilir
- Etkinlik önerilerini duruma göre filtreleyebilir
- Her etkinlik önerisini değerlendirebilir ve onaylayıp platformda yayınlayabilir

---

## 3️⃣ Admin Bildirim Sistemi

### Mevcut State:
- ✅ Admin Panel'de sayılar güncellenir
- ✅ Başvuru/Etkinlik önerileri ayrı bir sayfada (`/admin/submissions`) düzenlenebilir
- ✅ Her başvuru durumu (Yeni, İncelenmiş, Onaylanmış) takip edilir

### İleride Geliştirilecek:
- Email bildirimleri (yeni başvuru geldi)
- Real-time notifications (site üzerinde popup)
- Webhook entegrasyonu (Slack, Discord)

---

## 4️⃣ Veri Akışı (Özet)

```
┌─────────────────────┐
│   KULLANICI         │
│  Form Doldur        │
│  (Başvuru/Etkinlik) │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   TARAYICI          │
│  localStorage'de    │
│  veriler tutulur    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   ADMIN PANELI      │
│  /admin/submissions │
│  Tüm başvuruları    │
│  görebilir          │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   KARAR             │
│  ✅ Onayla          │
│  ❌ Reddet          │
└─────────────────────┘
```

---

## 5️⃣ Dashboard Kartları Güncellemeleri

### Admin Paneli Dashboard'unda:
- **Bize Katıl Başvuruları**: Yeni başvuru sayısı
- **Etkinlik Önerileri**: (Geliştirilecek - şu an etkinlikler kartında)

---

## Kurumsal Web Site Tasarımı Notu

Bu sistem **kurumsal, sağlam ve profesyonel** olacak şekilde tasarlanmıştır:
- ✅ Açık ve anlaşılır UX
- ✅ Admin kontrol merkezi
- ✅ Veri yönetimi
- ✅ Durum takibi
- ✅ Ölçeklenebilir mimari
