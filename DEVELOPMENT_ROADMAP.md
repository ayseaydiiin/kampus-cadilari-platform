# 📋 Kampüs Cadıları - Kapsamlı Geliştirme Planı (Faz 1-6)

**Proje Tarihi:** 23 Mart 2026  
**Toplam Faz:** 6  
**Tahmini Efekt:** 4-6 hafta  
**Kritik Mantık:** Tüm işlemler DB-odaklı + Tam Admin Onay Akışı

---

## 🎯 Temel Prensipler

### 1️⃣ Veritabanı-Odaklı Mimarisi
- ❌ Hiçbir alan statik/görsel kalmamalı
- ✅ Tüm sayılar (bildirim, katılım, okunma) dinamik ve DB'den çekişmeli
- ✅ Tüm işlemler audit log'a kaydedilmeli

### 2️⃣ Tam Admin Onayı (All-Approve Model)
- ❌ Tek bir admin onayı **yeterli olmaz**
- ✅ **Tüm adminler** onay vermek **zorunda**
- ✅ "Beklemede" → "Tüm Onaylı" → "Yayında" akışı

### 3️⃣ Profesyonel UX
- ❌ Tarayıcı varsayılan uyarıları (alert/confirm)
- ✅ Tasarımla uyumlu modal/toast/inline validation
- ✅ Tüm form alanlarında seçim kutusu (veri bütünlüğü)

---

## 📊 Veritabanı Şema Güncellemeleri

### Gerekli Yeni Tablolar:

```sql
-- 1. Articles (Enhanced)
ALTER TABLE articles ADD COLUMN (
  view_count INT DEFAULT 0,
  short_content TEXT,
  long_content LONGTEXT,
  slug VARCHAR(255) UNIQUE,
  status ENUM('draft', 'under_review', 'awaiting_approval', 'published', 'rejected'),
  created_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Article Approvals (Tüm Admin Onayları)
CREATE TABLE article_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT,
  admin_id INT,
  status ENUM('pending', 'approved', 'rejected'),
  reason TEXT,
  approved_at TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 3. Events (Enhanced)
ALTER TABLE events ADD COLUMN (
  status ENUM('draft', 'published', 'closed'),
  capacity INT DEFAULT NULL,
  current_participants INT DEFAULT 0,
  created_by INT,
  slug VARCHAR(255) UNIQUE
);

-- 4. Event Proposals (Etkinlik Önerileri)
CREATE TABLE event_proposals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  region_id INT,
  proposed_by_email VARCHAR(255),
  status ENUM('submitted', 'under_review', 'approved', 'rejected', 'published'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- 5. Event Proposal Approvals
CREATE TABLE event_proposal_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  proposal_id INT,
  admin_id INT,
  status ENUM('pending', 'approved', 'rejected'),
  reason TEXT,
  approved_at TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES event_proposals(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 6. Event Participations
CREATE TABLE event_participations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT,
  user_email VARCHAR(255),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 7. Notifications (Merkezi Bildirim Sistemi)
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT,
  type ENUM('event_proposal', 'article_submission', 'post_it_created', 'participation', 'form_submission'),
  related_id INT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 8. Post-its (Geliştirilmiş)
ALTER TABLE postits ADD COLUMN (
  created_by INT,
  last_edited_by INT,
  edited_at TIMESTAMP NULL,
  status ENUM('active', 'archived')
);

-- 9. Post-it Comments
CREATE TABLE postit_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  postit_id INT,
  admin_id INT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postit_id) REFERENCES postits(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 10. Post-it Edit History
CREATE TABLE postit_edit_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  postit_id INT,
  edited_by INT,
  previous_content TEXT,
  new_content TEXT,
  change_reason TEXT,
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postit_id) REFERENCES postits(id),
  FOREIGN KEY (edited_by) REFERENCES users(id)
);

-- 11. Archive
CREATE TABLE archive (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  file_path VARCHAR(255),
  file_type ENUM('newspaper', 'image', 'document', 'other'),
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 12. Regions (İlleri)
CREATE TABLE regions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE,
  code VARCHAR(2)
);

-- 13. Audit Log
CREATE TABLE audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255),
  table_name VARCHAR(100),
  record_id INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔄 FAZ 1: Articles Filtreleme ve Detay Yapısı (1.5 hafta)

### 1.1️⃣ Articles Sayfasında Filtreleme
- [ ] **Region/İl Dropdown** ekle
  - DB'den `regions` tablosundan çek
  - Filter logic: articles sayfası `?region=ID` parametresiyle sorgu yap
  - Selected state'ini URL'ye yaz
  
- [ ] **Filtreleme Butonu Tasarımı**
  - Mor tema uyumlu
  - Mobile responsive
  - Real-time filter (JavaScript ile)

**Dosya:**
- [ ] `src/pages/articles.astro` - Filter UI ekleme
- [ ] `src/pages/api/articles/filter.js` - Filter API
- [ ] `src/components/RegionFilter.astro` - Reusable filter component

---

### 1.2️⃣ Boş Kategori Yönetimi ✅ (ZATEN YAPILDI)
✅ Kategori yok ise: "Bu bölüme henüz yazı eklenmemiştir."

---

### 1.3️⃣ Yazı Detay Sayfası
- [ ] Yeni route: `/articles/[category]/[slug]`
  - Parametreler: kategori + slug
  - Dinamik veri çekişi DB'den
  
- [ ] Detay sayfasında gösterilecek:
  - Kısa özet (article.short_content)
  - Uzun içerik (article.long_content)
  - Yazar, tarih, okunma sayısı
  - "Benzer Yazılar" bölümü (aynı kategori)
  - Sosyal paylaşım butonları

**Dosya:**
- [ ] `src/pages/articles/[category]/[slug].astro`
- [ ] `src/components/ArticleDetail.astro`

---

### 1.4️⃣ Okunma Sayıları
- [ ] Yazı detay sayfası yüklendiğinde:
  - `view_count++` (articles tablosunda)
  - Audit log'a kaydet
  
- [ ] Admin panelinde:
  - Her yazının view_count'u göster
  - "En Çok Okunan" raporu

**Dosya:**
- [ ] `src/pages/api/articles/[id]/view.js` - View counter API

---

## 🎪 FAZ 2: Events Önerme ve Onay Akışı (2 hafta)

### 2.1️⃣ Etkinlik Önerme Formu (İyileştirilmiş)

**Form Alanları:**
- [ ] **Etkinlik Adı** (text input)
- [ ] **Açıklama** (textarea)
- [ ] **İl Seçimi** (dropdown - regions tablosundan)
- [ ] **E-posta** (email input)
- [ ] **Tarih** (date picker)
- [ ] **Konum** (text input)

**Dosya:**
- [ ] `src/components/EventProposalForm.astro`
- [ ] `src/styles/forms.css` - Form styling

---

### 2.2️⃣ Benzersiz Etkinlik Adı Kontrolü
- [ ] Real-time validation:
  - Input değiştiğinde API'ye POST
  - `POST /api/events/check-name`
  - DB'de var mı kontrol et
  - Input altında hata mesajı göster
  
**Hata Mesajı:**
```
"Bu etkinlik adı daha önce kullanılmıştır. Lütfen farklı bir etkinlik adı deneyiniz."
```

**Dosya:**
- [ ] `src/pages/api/events/check-name.js`

---

### 2.3️⃣ İl Seçimi Filtresi
- [ ] `RegionSelect` component oluştur
- [ ] Dropdown, filtrelenebilir arama
- [ ] Veri: `regions` tablosundan

---

### 2.4️⃣ Hata ve Uyarı Mesajları
- [ ] ❌ Browser default alert/confirm çıkar
- [ ] ✅ Custom modal/toast ekle:
  - Tailwind CSS ile tasarlanmış
  - Hata tipi + Mesaj
  - CTA butonları

**Dosya:**
- [ ] `src/components/Modal.astro` - Reusable modal
- [ ] `src/components/Toast.astro` - Toast notification

---

### 2.5️⃣ İptal Etme Akışı
- [ ] Form kapatılmadan önce onay modal'ı:
```
"Etkinlik önerme alanından çıkmak istiyor musunuz?"
```

**Dosya:**
- [ ] Modal componentine `type="confirm"` opsiyonu

---

### 2.6️⃣ Etkinlik Detay Sayfası
- [ ] Route: `/events/[slug]`
- [ ] Gösterilecek:
  - Etkinlik adı, açıklama
  - Tarih, konum, il
  - Katılım sayısı
  - "Etkinliğe Katıl" butonu
  - Paylaşım seçenekleri

**Dosya:**
- [ ] `src/pages/events/[slug].astro`

---

### 2.7️⃣ Etkinliğe Katıl ve Katılım Sayısı
- [ ] "Etkinliğe Katıl" butonuna tıklanınca:
  - E-posta al
  - `event_participations` tablosuna INSERT
  - `event.current_participants++`
  - Başarı mesajı göster
  
- [ ] Admin panelinde:
  - Etkinlik başına katılım sayısı
  - Katılımcı listesi
  - Tarihsel veri

**Dosya:**
- [ ] `src/pages/api/events/[id]/join.js`

---

### 2.8️⃣ Kontenjan Yönetimi
- [ ] Admin form'unda:
  - [ ] "Kontenjanlı" / "Kontenjansız" checkbox
  - [ ] Kontenjanlıysa: "Toplam Kontenjan" input
  
- [ ] Logic:
  - `current_participants` >= `capacity` ise:
    - "Etkinliğe Katıl" butonunu disable et
    - Mesaj: "Kontenjan dolmuştur"

**Dosya:**
- [ ] Admin yazı güncellemelerinde ekle

---

### 2.9️⃣ Sosyal Medya Paylaşımı
- [ ] Detay sayfasında paylaşım butonları:
  - WhatsApp: `https://wa.me/?text={encode(title+url)}`
  - X (Twitter): `https://twitter.com/intent/tweet?text={encode(title+url)}`
  - Instagram: (URL copy + manual share)
  - Facebook: Share dialog

**URL Template:**
```
siteadi.com/events/{slug}
```

---

## 🔔 FAZ 3: Admin Bildirim Merkezi (1 hafta)

### 3.1️⃣ Merkezi Bildirim Alanı
- [ ] Admin dashboard'da "🔔 Bildirimler" alanı
- [ ] Bildirim sayaçı: `notifications` tablosundan `COUNT(...)`
- [ ] Badge: `+5` şeklinde göster

**Bildirim Tipleri:**
- ✅ Yeni etkinlik önerisi
- ✅ Yeni yazı isteği
- ✅ Yeni post-it notu
- ✅ Post-it düzenlemesi
- ✅ Yeni başvuru / form iletimi

**Dosya:**
- [ ] `src/components/NotificationCenter.astro`
- [ ] `src/pages/api/notifications/new.js`

---

### 3.2️⃣ Bildirimden Detay Sayfasına
- [ ] Bildirim alanına tıklama:
  - Bildirim listesi göster
  - Her bildirimde: Mesaj + Zaman + "Detay Aç" linki
  
- [ ] Linkleme:
  - `related_id` ve `type` kullanarak doğru sayfaya yönlendir
  - Örn: Event proposal ID 42 → `/admin/event-proposals/42`

**Dosya:**
- [ ] `src/components/NotificationDropdown.astro`
- [ ] Routing logic

---

## 📝 FAZ 4: Yazı Onay Mekanizması (2 hafta)

### 4.1️⃣ Yeni Yazı Oluşturma Formu
- [ ] Admin panelinde "Yeni Yazı" sayfası
- [ ] Alanlar:
  - [ ] Başlık
  - [ ] Slug (auto-generated, editable)
  - [ ] Kategori (dropdown)
  - [ ] Durum (draft/under_review/awaiting_approval/published/rejected)
  - [ ] Kısa İçerik (textarea)
  - [ ] Uzun İçerik (rich text editor - şöyle: Quill/TinyMCE)
  - [ ] Resim (upload)

**Dosya:**
- [ ] `src/pages/admin/articles/new.astro`
- [ ] `src/components/ArticleForm.astro`
- [ ] `src/pages/api/articles/create.js`

---

### 4.2️⃣ Slug Alanı
- [ ] Auto-generate from başlık:
  - Türkçe karakterler → ASCII (ç→c, ö→o, etc.)
  - Boşluk → `-`
  - Örn: "Kadın Dayanışması" → `kadin-dayanismasi`

- [ ] Editability: Admin, slug'ı değiştirebilir
- [ ] Uniqueness: Slug varchar(255) UNIQUE constraint

**Dosya:**
- [ ] Slug helper function: `src/utils/slugify.ts`

---

### 4.3️⃣ Durum Alanı (Status Workflow)
```
draft → under_review → awaiting_approval → published
                   ↘ rejected
```

- [✅] **Draft**: Admin kendi başına yazabilir
- [✅] **Under Review**: Admin, "İncelemeye Al" dedikten sonra
- [✅] **Awaiting Approval**: Tüm adminlere bildirim gider
- [✅] **Published**: Tüm adminler onay verirse
- [✅] **Rejected**: Herhangi bir admin "Red" derse

---

### 4.4️⃣ Tüm Admin Onayıyla Yayın (KRITIK!)
- [ ] Yazı "Awaiting Approval" durumuna geçtiğinde:
  - Tüm adminlere bildirim
  - Admin panelinde "Beklemede Yazılar" listesi
  
- [ ] Her adminIn yapması gereken:
  - [ ] Yazıyı oku
  - [ ] Onay / Red seç
  - [ ] **Gerekçe** yazı (zorunlu)
  - [ ] Gönder

- [ ] Tüm adminler "Approved" vermerse:
  - Status → "Published"
  - Yazı Dashboard'da görünür
  - Bildirim: "Yazınız yayınlandı"

**Logic (Pseudocode):**
```javascript
// Article approval durumu kontrol et
const allApprovals = await db.query(
  "SELECT * FROM article_approvals WHERE article_id = ?"
);
const allApproved = allApprovals.every(a => a.status === 'approved');
if (allApproved && allAdminsVoted(article_id)) {
  article.status = 'published';
}
```

**Dosya:**
- [ ] `src/pages/api/articles/approve.js`
- [ ] `src/pages/api/articles/reject.js`
- [ ] Approval status check logic

---

### 4.5️⃣ Yorum ve Değerlendirme Alanı
- [ ] Yazı inceleme sayfasında:
  - Yazı içeriği sol taraf
  - Admin yorumları sağ taraf (comment thread)
  
- [ ] Adminler yorum yapabilir:
  - Text input
  - "@admin_name" mentions
  - Yorum tarihi ve yazarı

**Dosya:**
- [ ] `src/components/ArticleReviewPanel.astro`
- [ ] `src/pages/api/articles/[id]/comments.js`

---

### 4.6️⃣ Onay/Red Sürecinde Zorunlu Açıklama
- [ ] "Onayla" / "Reddet" butonlarına:
  - Tıklanınca modal açılır
  - "Onay Gerekçesi" / "Red Gerekçesi" text input
  - Bot yazı tarafından form gönderilmene kadar input'a focus
  
- [ ] Validasyon:
  ```javascript
  if (!reasonText || reasonText.trim().length < 5) {
    showError("Lütfen en az 5 karakter uzunluğunda bir gerekçe giriniz.");
  }
  ```

**Dosya:**
- [ ] Modal component'ine validation ekle

---

## 📌 FAZ 5: Post-it Duvarı ve İç İletişim (1.5 hafta)

### 5.1️⃣ Yeni Not Oluşturma
- [ ] "Yeni Not" butonuna tıklama:
  - Modal/panel açılır
  - Alanlar:
    - [ ] Not Başlığı (max 100 char)
    - [ ] Not İçeriği (textarea)

- [ ] Butonlar:
  - [ ] Paylaş (INSERT + Tüm adminlere bildirim)
  - [ ] İptal (Uyarı modal)

**Dosya:**
- [ ] `src/components/PostitCreateModal.astro`
- [ ] `src/pages/api/postits/create.js`

---

### 5.2️⃣ İptal Uyarısı
- [ ] Form değiştirilmişse:
  ```
  "Not eklemek istemediğinizden emin misiniz?"
  ```
  - Evet / Hayır butonları

**Dosya:**
- [ ] Modal componentinde `onBeforeClose` hook

---

### 5.3️⃣ Admin Bildirimleri
- [ ] Not oluşturulduğunda:
  - İlgili admin'e: "Notification type = 'post_it_created'"
  - Diğer adminlere: Bildirim alanında görünür
  - Email (opsiyonel)

---

### 5.4️⃣ Detaylı Okuma ve Yorum
- [ ] Not detay sayfası: `/admin/postits/[id]`
- [ ] Gösterilecek:
  - Not başlığı, içeriği
  - Oluşturan admin, tarih
  - Yorum bölümü (thread)

- [ ] Yorum yapma:
  - Input field
  - "Gönder" butonu
  - Yorum tarihi ve yazarı otomatik

**Dosya:**
- [ ] `src/pages/admin/postits/[id].astro`
- [ ] `src/pages/api/postits/[id]/comments.js`

---

### 5.5️⃣ Not Düzenleme Geçmişi
- [ ] Admin, notu düzenleyebilir:
  - Başlık ve içerik değişebilir
  - `change_reason` (açıklama) zorunlu
  - Yeni `edited_at` ve `last_edited_by`

- [ ] Not kartında:
  - "Güncellenmiş: [tarih] - [admin adı]" gösterilir

- [ ] Düzenleme geçmişi:
  - `/admin/postits/[id]/history`
  - Her değişiklik: Önceki → Yeni [Kimin tarafından] [Sebebi]

**Dosya:**
- [ ] `src/components/PostitEditModal.astro`
- [ ] `src/pages/api/postits/[id]/edit.js`
- [ ] `src/pages/admin/postits/[id]/history.astro`

---

### 5.6️⃣ Ortak Görünürlük
- [ ] Tüm adminler aynı postları görür
- [ ] Post-it duvarı: `/admin/postits`
- [ ] Filter: "Aktif" / "Arşivlenmiş"
- [ ] Sıralama: "En Yeni" / "En Eski"

---

## 📚 FAZ 6: Arşiv Alanı (1 hafta)

### 6.1️⃣ Arşiv Yapısı
- [ ] Route: `/archive`
- [ ] Kategori filtreleme:
  - Gazeteler
  - Görseller
  - Dokümanlar
  - Diğer

- [ ] Grid view:
  - Her öğe: Başlık + Görsel/İkon + Tarih
  - Tıklanınca: Download/Detay

**Dosya:**
- [ ] `src/pages/archive.astro`
- [ ] `src/components/ArchiveGrid.astro`

---

### 6.2️⃣ Admin Upload Alanı
- [ ] `/admin/archive/upload`
- [ ] Form alanları:
  - [ ] Başlık (text)
  - [ ] Açıklama (textarea)
  - [ ] Kategori (dropdown)
  - [ ] Dosya Upload (file input)
  - [ ] Dosya Türü (newspaper/image/document/other)

- [ ] Upload işlemi:
  - Dosya `public/archive/` klasörüne kaydedilir
  - DB'de kayıt oluşturulur
  - `uploaded_by` admin ID kaydedilir

**Dosya:**
- [ ] `src/pages/admin/archive/upload.astro`
- [ ] `src/pages/api/archive/upload.js`

---

### 6.3️⃣ Silme ve Düzenleme
- [ ] Admin, arşiv öğesi silmek için:
  - Dosya silinir
  - DB kaydı silinir
  - Audit log kaydı yapılır

- [ ] Düzenleme:
  - Başlık / Açıklama güncellenebilir
  - Dosya yenisi upload edilebilir

**Dosya:**
- [ ] `src/pages/api/archive/[id]/delete.js`
- [ ] `src/pages/api/archive/[id]/update.js`

---

## 🎬 ANA SAYFA - "Cadı Ol" Butonu (1 gün)

### Görev
- [ ] Ana sayfada "Cadı Ol" butonuna tıklama:
  - Google Form linki modal'da açılır
  - Tasarıma uyumlu iframe/redirect

**Google Form:**
```
https://docs.google.com/forms/d/e/1FAIpQLSc4YtEELBG3XF3VuH0t37alzBNFGwteBTS1Fn6IbBqghFtYeA/viewform
```

- [ ] Başvuruları admin'e bildirim olarak gönder
  - Bildirim: "Yeni Cadı Başvurusu"
  - Link: Form response görmek için

**Dosya:**
- [ ] `src/components/CadiOlModal.astro`
- [ ] `src/pages/index.astro` - Button ekle

---

## 📋 Implementasyon Öncelikleri

### 🔴 ACIL (Bu Haftaya Başla)
1. FAZ 1 - Articles filtreleme (region dropdown)
2. FAZ 2 - Events önerme formu (benzersiz adı kontrolü)
3. Modal/Toast component'leri

### 🟡 ÖNEMLİ (2. Hafta)
4. FAZ 3 - Bildirim merkezi
5. FAZ 4 - Admin onay akışı (articles)
6. DB şema güncellemeleri

### 🟢 SONRA (3. Hafta+)
7. FAZ 5 - Post-it duvarı
8. FAZ 6 - Arşiv
9. Tests ve QA

---

## 🗄️ Teknik Stack Gereksinimleri

| Bileşen | Teknoloji |
|-------|-----------|
| **Frontend** | Astro + React/Islands |
| **CSS** | Tailwind CSS |
| **Rich Editor** | Quill.js / TinyMCE |
| **DB** | MySQL / PostgreSQL |
| **API** | Node.js (Astro API routes) |
| **Upload** | Multer.js |
| **Email** | NodeMailer (optional) |
| **Charts** | Chart.js (admin analytics) |

---

## ⚠️ Kritik Noktalar (Unutmayın!)

1. ✅ **Tüm Admin Onayı**: Tek admin onayı yeterli DEĞİL
2. ✅ **DB-Odaklı**: Hiçbir işlem statik kalmamalı
3. ✅ **Audit Log**: Her işlem kaydedilmeli
4. ✅ **Profesyonel UX**: Tarayıcı uyarıları çıkar
5. ✅ **Seçim Kutuları**: Veri bütünlüğü için
6. ✅ **Bildirim Sayaçları**: Dinamik, DB'den çekişmeli

---

**Başlama Tarihi:** 23 Mart 2026  
**Durum:** Planlama Aşaması → FAZ 1'e Hazır ✅
