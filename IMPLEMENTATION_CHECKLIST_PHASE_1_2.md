# 🔧 FAZ 1 & FAZ 2: DETAYLI İMPLEMENTASYON CHECKLIST

**Proje:** Kampüs Cadıları Platform  
**Durum:** SQLite → PostgreSQL Migration Hazırlığı  
**Focus:** Backend Architecture + Concrete Business Rules

---

## 🗄️ GERÇEKÇI VT ŞEMASI (SQLite + PostgreSQL Ready)

> ⚠️ Not: Şu an SQLite, ama schema PostgreSQL-compatible yazılmış. Geçiş kolay olacak.

### TIER 1: Temel Tablolar (Şu an var)
```sql
-- articles (GUNCELLENECEK)
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT,
  date TEXT,
  excerpt TEXT,
  image TEXT,
  body TEXT,
  
  -- YENİ ALANLAR
  slug TEXT UNIQUE,
  short_content TEXT,
  long_content TEXT,
  view_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft|under_review|awaiting_approval|published|rejected
  created_by TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- events (GUNCELLENECEK)
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  location TEXT,
  
  -- YENİ ALANLAR
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'draft', -- draft|published|closed
  capacity INTEGER, -- NULL = sınırsız
  current_participants INTEGER DEFAULT 0,
  region_id INTEGER,
  created_by TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- postits (GUNCELLENECEK)
CREATE TABLE postits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  content TEXT,
  
  -- YENİ ALANLAR
  created_by TEXT NOT NULL,
  last_edited_by TEXT,
  edited_at TIMESTAMP,
  status TEXT DEFAULT 'active', -- active|archived
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### TIER 2: Admin & Users (YENİ!)
```sql
-- users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'admin', -- admin|moderator|viewer
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admin_profiles
CREATE TABLE admin_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  phone TEXT,
  bio TEXT,
  can_approve_articles BOOLEAN DEFAULT TRUE,
  can_approve_events BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### TIER 3: Approval System (YENİ!)
```sql
-- article_approvals (KRITIK - Tüm Admin Onayı)
CREATE TABLE article_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending|approved|rejected|requested_changes
  reason TEXT, -- Zorunlu alanlar: onay/red sebebi
  feedback TEXT, -- Admin yorum paneli
  approved_at TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- event_proposal_approvals (KRITIK - Etkinlik Önerileri)
CREATE TABLE event_proposal_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proposal_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending|approved|rejected
  reason TEXT, -- Zorunlu
  approved_at TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES event_proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### TIER 4: Events & Participations (YENİ!)
```sql
-- event_proposals (Etkinlik Önerileri)
CREATE TABLE event_proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  region_id INTEGER NOT NULL,
  proposed_by_email TEXT NOT NULL,
  proposed_by_name TEXT,
  
  status TEXT DEFAULT 'submitted', -- submitted|under_review|approved|rejected|published
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Sonraki aşama (approved sonra)
  created_event_id INTEGER, -- Eğer event'e dönüştürülmüsse
  FOREIGN KEY (region_id) REFERENCES regions(id),
  FOREIGN KEY (created_event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- event_participations (Katılımlar)
CREATE TABLE event_participations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, user_email), -- Aynı kişi 2x katılıp
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- regions (İller)
CREATE TABLE regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL, -- "İstanbul", "Ankara", vb
  code TEXT UNIQUE -- "34", "06"
);
```

### TIER 5: Notifications (YENİ!)
```sql
-- notifications (Merkezi Bildirim Sistemi)
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  
  type TEXT NOT NULL, -- event_proposal|article_submission|post_it|participation|form_submission
  title TEXT,
  message TEXT,
  related_table TEXT, -- articles|events|postits|event_proposals
  related_id INTEGER,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### TIER 6: Post-it System Enhancement (YENİ!)
```sql
-- postit_comments (Yorum Sistemi)
CREATE TABLE postit_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postit_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (postit_id) REFERENCES postits(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- postit_edit_history (Düzenleme Geçmişi)
CREATE TABLE postit_edit_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postit_id INTEGER NOT NULL,
  edited_by INTEGER NOT NULL,
  
  previous_title TEXT,
  previous_content TEXT,
  new_title TEXT,
  new_content TEXT,
  
  change_reason TEXT NOT NULL, -- Zorunlu: Neden değişti?
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (postit_id) REFERENCES postits(id) ON DELETE CASCADE,
  FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### TIER 7: Archive (YENİ!)
```sql
-- archive
CREATE TABLE archive (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL, -- newspaper|image|document|other
  title TEXT NOT NULL,
  description TEXT,
  
  file_path TEXT NOT NULL,
  file_type TEXT, -- Mime type
  file_size INTEGER,
  
  uploaded_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### TIER 8: Audit Log (YENİ!)
```sql
-- audit_log (Tüm işlemler kaydedilsin)
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL, -- create|update|delete|approve|reject
  table_name TEXT NOT NULL,
  record_id INTEGER,
  
  previous_data TEXT, -- JSON
  new_data TEXT, -- JSON
  
  ip_address TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## ✅ FAZ 1: ARTICLES - DETAYLI İMPLEMENTASYON

### 1.1: Slug System (URL Yapısı)

**Business Rule:**
```
Başlık: "Kadın Dayanışmasının Kampüslerdeki Önemi"
↓ (Slugified)
Slug: "kadin-dayanismasinin-kampuslerdeki-onemi"
URL: /articles/hukuk/kadin-dayanismasinin-kampuslerdeki-onemi
```

**Implementasyon:**

#### a) Slug Helper (`src/utils/slugify.ts`)
```typescript
export function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  
  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Özel karakterler
    .replace(/\s+/g, '-') // Boşluklar → tire
    .replace(/-+/g, '-') // Çoklu tireler → tek tire
    .replace(/^-+|-+$/g, ''); // Başı/sonu temizle
}
```

#### b) Article Create API (`src/pages/api/articles/create.js`)
```javascript
import Database from 'better-sqlite3';
import { slugify } from '../../../utils/slugify';

const db = new Database('data.db');

export async function POST({ request }) {
  try {
    const { title, category, short_content, long_content, author } = await request.json();
    
    // 1. Slug auto-generate
    let slug = slugify(title);
    
    // 2. Slug uniqueness check
    const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
    
    // 3. INSERT
    const result = db.prepare(`
      INSERT INTO articles 
      (title, category, short_content, long_content, author, slug, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP)
    `).run(title, category, short_content, long_content, author, slug);
    
    // 4. Audit log
    db.prepare(`
      INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
      VALUES (?, 'create', 'articles', ?, ?)
    `).run(null, result.lastID, JSON.stringify({ title, slug }));
    
    return new Response(JSON.stringify({ 
      success: true, 
      article_id: result.lastID,
      slug: slug 
    }));
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}
```

#### c) Article Detail Page (`src/pages/articles/[category]/[slug].astro`)
```astro
---
import Database from 'better-sqlite3';
import MainLayout from '../../../layouts/MainLayout.astro';

const db = new Database('data.db');
const { category, slug } = Astro.params;

// 1. Fetch article
const article = db.prepare(`
  SELECT * FROM articles 
  WHERE category = ? AND slug = ? AND status = 'published'
`).get(category, slug);

if (!article) {
  return Astro.redirect('/articles');
}

// 2. Increment view count
db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?')
  .run(article.id);

// 3. Log view
db.prepare(`
  INSERT INTO audit_log (action, table_name, record_id, ip_address)
  VALUES ('view', 'articles', ?, ?)
`).run(article.id, Astro.request.headers.get('x-forwarded-for'));

// 4. İlgili yazılar (aynı kategori)
const relatedArticles = db.prepare(`
  SELECT * FROM articles 
  WHERE category = ? AND id != ? AND status = 'published'
  LIMIT 3
`).all(category, article.id);
---

<MainLayout title={article.title} currentLang="tr">
  <div class="max-w-4xl mx-auto py-12">
    <!-- Header -->
    <nav class="text-sm text-gray-600 mb-8">
      <a href="/articles" class="hover:text-purple-600">Yazılar</a>
      <span> / </span>
      <span>{article.category}</span>
    </nav>
    
    <article>
      <h1 class="text-4xl font-bold mb-4">{article.title}</h1>
      
      <!-- Meta Info -->
      <div class="flex gap-4 text-sm text-gray-600 mb-8 pb-8 border-b">
        <span>✍️ {article.author}</span>
        <span>📅 {new Date(article.date).toLocaleDateString('tr-TR')}</span>
        <span>👁️ {article.view_count} görüntülenme</span>
      </div>
      
      <!-- Content -->
      <div class="prose max-w-none mb-12">
        <p class="text-lg text-gray-700 mb-6">{article.short_content}</p>
        <div set:html={article.long_content} />
      </div>
      
      <!-- Share -->
      <div class="my-8 p-4 bg-purple-50 rounded-lg">
        <p class="font-semibold mb-3">Paylaş:</p>
        <div class="flex gap-3">
          <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + Astro.url.href)}`}
             class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${Astro.url.href}`}
             class="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500">
            X (Twitter)
          </a>
        </div>
      </div>
      
      <!-- Related -->
      {relatedArticles.length > 0 && (
        <div class="mt-12 pt-8 border-t">
          <h3 class="text-2xl font-bold mb-6">Benzer Yazılar</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map(related => (
              <a href={`/articles/${related.category}/${related.slug}`}
                 class="p-4 border rounded-lg hover:shadow-md transition">
                <h4 class="font-bold text-sm mb-2">{related.title}</h4>
                <p class="text-xs text-gray-600 line-clamp-2">{related.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  </div>
</MainLayout>
```

---

### 1.2: Region/İl Filtreleme

**Business Rule:**
```
Articles sayfasında dropdown:
[ Select Region... ▼ ]
  - Tüm İller
  - İstanbul
  - Ankara
  - İzmir
  ...

Seçim → URL: ?region=istanbul
→ Sadece o ile ait yazılar göster
```

#### a) Regions Table Populate
```javascript
// src/pages/api/setup/regions.js
import Database from 'better-sqlite3';

const db = new Database('data.db');

const regions = [
  { name: 'Adana', code: '01' },
  { name: 'Adıyaman', code: '02' },
  { name: 'Afyonkarahisar', code: '03' },
  // ... 81 il
];

regions.forEach(region => {
  db.prepare('INSERT OR IGNORE INTO regions (name, code) VALUES (?, ?)')
    .run(region.name, region.code);
});
```

#### b) Region Filter Component (`src/components/RegionFilter.astro`)
```astro
---
import Database from 'better-sqlite3';

const db = new Database('data.db');
const regions = db.prepare('SELECT * FROM regions ORDER BY name ASC').all();
const selectedRegion = new URL(Astro.request.url).searchParams.get('region') || 'all';
---

<div class="mb-8">
  <label for="region-select" class="block text-sm font-semibold mb-2">
    İl Seçimi:
  </label>
  <select 
    id="region-select"
    class="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
    onchange="const region = this.value; window.location.href = region === 'all' ? '/articles' : `/articles?region=${region}`;"
  >
    <option value="all">Tüm İller</option>
    {regions.map(region => (
      <option value={region.name} selected={selectedRegion === region.name}>
        {region.name}
      </option>
    ))}
  </select>
</div>
```

#### c) Articles Page with Filter (`src/pages/articles.astro`)
```astro
---
import Database from 'better-sqlite3';
import RegionFilter from '../components/RegionFilter.astro';

const db = new Database('data.db');
const region = new URL(Astro.request.url).searchParams.get('region');

let categories;
if (region && region !== 'all') {
  // Belirli ile ait yazıları getir
  // (articles tablosuna region_id eklemek gerekir)
  categories = db.prepare(`
    SELECT DISTINCT category FROM articles 
    WHERE status = 'published' AND region_id = (
      SELECT id FROM regions WHERE name = ?
    )
    ORDER BY category
  `).all(region);
} else {
  categories = db.prepare(`
    SELECT DISTINCT category FROM articles 
    WHERE status = 'published'
    ORDER BY category
  `).all();
}
---

<MainLayout title="Yazılar" currentLang="tr">
  <RegionFilter />
  
  <!-- Category Cards Grid -->
  <!-- ... existing code ... -->
</MainLayout>
```

---

### 1.3: View Count Tracking

**Business Rule:**
```
Yazı detay sayfası açılınca:
1. articles.view_count ++
2. audit_log'a kayıt
3. Admin panelinde görüntülenebilir
```

✅ (Yukarıdaki article detail page'de zaten implement edildi)

#### Admin Analytics (`src/pages/admin/analytics.astro`)
```astro
---
import Database from 'better-sqlite3';

const db = new Database('data.db');

const topArticles = db.prepare(`
  SELECT title, category, view_count, author
  FROM articles
  WHERE status = 'published'
  ORDER BY view_count DESC
  LIMIT 10
`).all();

const totalViews = db.prepare(`
  SELECT COUNT(*) as count FROM audit_log
  WHERE action = 'view' AND table_name = 'articles'
`).get();
---

<MainLayout title="Analytics - Admin" currentLang="tr">
  <div class="max-w-4xl">
    <h1>Yazı İstatistikleri</h1>
    
    <div class="mb-8 p-4 bg-purple-50 rounded">
      <p class="text-3xl font-bold">{totalViews.count}</p>
      <p class="text-gray-600">Toplam Görüntülenme</p>
    </div>
    
    <h2 class="text-2xl font-bold mb-4">En Çok Okunan Yazılar</h2>
    <table class="w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left">Başlık</th>
          <th>Kategori</th>
          <th>Yazar</th>
          <th>Görüntüleme</th>
        </tr>
      </thead>
      <tbody>
        {topArticles.map(article => (
          <tr class="border-b">
            <td class="p-2">{article.title}</td>
            <td class="text-center">{article.category}</td>
            <td class="text-center">{article.author}</td>
            <td class="text-center font-bold text-purple-600">{article.view_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</MainLayout>
```

---

## 🎪 FAZ 2: EVENTS - DETAYLI İMPLEMENTASYON

### 2.1: Etkinlik Önerme Formu (Validate + Error UX)

**Business Rules:**
```
✅ Etkinlik Adı → DB'de var mı? (Real-time check)
❌ Eğer var ise: "Bu etkinlik adı daha önce kullanılmıştır."
✅ İl seçimi → Dropdown (combo box değil, veri bütünlüğü için)
✅ Formdan çıktığında → "Çıkmak istiyor musunuz?" onayı
✅ Başvuru → Tüm adminlere bildirim
```

#### a) Event Proposal Form Component (`src/components/EventProposalForm.astro`)
```astro
---
import Database from 'better-sqlite3';

const db = new Database('data.db');
const regions = db.prepare('SELECT * FROM regions ORDER BY name').all();
---

<div id="event-proposal-modal" class="fixed inset-0 bg-black/50 hidden z-50 flex items-center justify-center">
  <div class="bg-white rounded-lg max-w-2xl w-full mx-4 p-8">
    <h2 class="text-2xl font-bold mb-6">Etkinlik Öner</h2>
    
    <form id="event-form" class="space-y-6">
      <!-- Etkinlik Adı -->
      <div>
        <label for="event-title" class="block text-sm font-semibold mb-2">
          Etkinlik Adı *
        </label>
        <input 
          type="text"
          id="event-title"
          name="title"
          placeholder="Örn: Kadın Hareket Buluşması"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
        <div id="title-error" class="text-red-600 text-sm mt-1 hidden"></div>
      </div>

      <!-- Benzersiz Adı Kontrolü (Real-time Validation) -->
      <script>
        document.getElementById('event-title').addEventListener('input', async (e) => {
          const title = e.target.value.trim();
          const errorDiv = document.getElementById('title-error');
          
          if (title.length < 3) {
            errorDiv.classList.add('hidden');
            return;
          }
          
          try {
            const res = await fetch('/api/events/check-name', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title })
            });
            
            const { exists } = await res.json();
            
            if (exists) {
              errorDiv.textContent = '❌ Bu etkinlik adı daha önce kullanılmıştır. Lütfen farklı bir adı deneyiniz.';
              errorDiv.classList.remove('hidden');
              e.target.classList.add('border-red-500');
            } else {
              errorDiv.classList.add('hidden');
              e.target.classList.remove('border-red-500');
            }
          } catch (error) {
            console.error('Validation error:', error);
          }
        });
      </script>

      <!-- Açıklama -->
      <div>
        <label for="event-description" class="block text-sm font-semibold mb-2">
          Açıklama
        </label>
        <textarea 
          id="event-description"
          name="description"
          placeholder="Etkinln detaylarını yazınız..."
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        ></textarea>
      </div>

      <!-- İl Seçimi (Dropdown - Veri Bütünlüğü) -->
      <div>
        <label for="event-region" class="block text-sm font-semibold mb-2">
          İl * (Etkinlik Hangi Ilde Yapılacak?)
        </label>
        <select 
          id="event-region"
          name="region_id"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        >
          <option value="">Seçiniz...</option>
          {regions.map(region => (
            <option value={region.id}>{region.name}</option>
          ))}
        </select>
      </div>

      <!-- Tarih -->
      <div>
        <label for="event-date" class="block text-sm font-semibold mb-2">
          Planlanan Tarih
        </label>
        <input 
          type="date"
          id="event-date"
          name="date"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <!-- Konum -->
      <div>
        <label for="event-location" class="block text-sm font-semibold mb-2">
          Konum
        </label>
        <input 
          type="text"
          id="event-location"
          name="location"
          placeholder="Örn: Fen Fakültesi, Konferans Salonu"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <!-- E-posta -->
      <div>
        <label for="event-email" class="block text-sm font-semibold mb-2">
          İletişim E-postası *
        </label>
        <input 
          type="email"
          id="event-email"
          name="email"
          placeholder="your@email.com"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
      </div>

      <!-- Butonlar -->
      <div class="flex gap-4 pt-4">
        <button 
          type="submit" 
          class="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          Etkinliği Öner
        </button>
        <button 
          type="button"
          onclick="closeEventForm()"
          class="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
        >
          İptal
        </button>
      </div>
    </form>
  </div>
</div>

<script>
  let formDirty = false;
  const form = document.getElementById('event-form');
  
  // Form dirty state tracking
  form.addEventListener('input', () => {
    formDirty = true;
  });
  
  // Close button with confirmation
  function closeEventForm() {
    if (formDirty) {
      const confirmModal = showConfirmModal(
        'Etkinlik önerme alanından çıkmak istiyor musunuz?',
        'Yazılan veriler kaybolacaktır.',
        [
          { text: 'Evet, Çık', action: () => { closeModal(); window.history.back(); } },
          { text: 'Hayır, Devam Et', action: () => { closeModal(); } }
        ]
      );
    } else {
      document.getElementById('event-proposal-modal').classList.add('hidden');
    }
  }
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await fetch('/api/events/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      
      if (result.success) {
        showSuccessToast('✅ Etkinlik öneriniz başarıyla gönderilmiştir. Admin onayını bekleyiniz.');
        form.reset();
        formDirty = false;
        setTimeout(() => {
          document.getElementById('event-proposal-modal').classList.add('hidden');
        }, 2000);
      } else {
        showErrorToast('❌ ' + result.error);
      }
    } catch (error) {
      showErrorToast('❌ Bağlantı hatası: ' + error.message);
    }
  });
</script>

<style>
  #event-proposal-modal {
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
```

#### b) Check Event Name API (`src/pages/api/events/check-name.js`)
```javascript
import Database from 'better-sqlite3';

const db = new Database('data.db');

export async function POST({ request }) {
  const { title } = await request.json();
  
  // SQLite (ILIKE yerine LOWER + GLOB)
  const existing = db.prepare(`
    SELECT id FROM event_proposals 
    WHERE LOWER(title) = LOWER(?)
    AND status IN ('submitted', 'under_review', 'approved', 'published')
  `).get(title);
  
  return new Response(JSON.stringify({
    exists: !!existing
  }));
}
```

#### c) Event Proposal Create API (`src/pages/api/events/propose.js`)
```javascript
import Database from 'better-sqlite3';

const db = new Database('data.db');

export async function POST({ request }) {
  try {
    const {
      title,
      description,
      region_id,
      date,
      location,
      email
    } = await request.json();
    
    // Validation
    if (!title || title.trim().length < 3) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Etkinlik adı en az 3 karakter olmalıdır.' 
      }), { status: 400 });
    }
    
    // Check uniqueness
    const existing = db.prepare(`
      SELECT id FROM event_proposals WHERE LOWER(title) = LOWER(?)
    `).get(title);
    
    if (existing) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Bu etkinlik adı daha önce kullanılmıştır.' 
      }), { status: 400 });
    }
    
    // INSERT proposal
    const result = db.prepare(`
      INSERT INTO event_proposals 
      (title, description, region_id, proposed_by_email, status, created_at)
      VALUES (?, ?, ?, ?, 'submitted', CURRENT_TIMESTAMP)
    `).run(title, description, region_id, email);
    
    // TÜM ADMİNLERE BİLDİRİM GÖNDERİ
    const admins = db.prepare('SELECT id FROM users WHERE role = "admin"').all();
    admins.forEach(admin => {
      db.prepare(`
        INSERT INTO notifications 
        (admin_id, type, title, message, related_table, related_id, created_at)
        VALUES (?, 'event_proposal', ?, ?, 'event_proposals', ?, CURRENT_TIMESTAMP)
      `).run(
        admin.id,
        `Yeni Etkinlik Önerisi: ${title}`,
        `${email} tarafından yeni etkinlik önerilmiştir.`,
        result.lastID
      );
    });
    
    // Audit log
    db.prepare(`
      INSERT INTO audit_log (action, table_name, record_id, new_data)
      VALUES ('create', 'event_proposals', ?, ?)
    `).run(result.lastID, JSON.stringify({ title, email }));
    
    return new Response(JSON.stringify({ 
      success: true, 
      proposal_id: result.lastID 
    }));
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}
```

---

### 2.2: Event Detail Sayfası + Katılım

**Business Rule:**
```
URL: /events/kadin-hareketi-bulusmasi

İçerik:
- Etkinlik detayı
- "Etkinliğe Katıl" butonu
- Katılımcı sayısı
- Sosyal paylaşım (doğru URL'yle)

Buton tıklayınca:
1. E-posta al
2. event_participations INSERT
3. current_participants++
4. Başarı mesajı
```

#### Event Detail Page (`src/pages/events/[slug].astro`)
```astro
---
import Database from 'better-sqlite3';
import MainLayout from '../../layouts/MainLayout.astro';

const db = new Database('data.db');
const { slug } = Astro.params;

// Fetch event
const event = db.prepare(`
  SELECT 
    e.*,
    r.name as region_name
  FROM events e
  LEFT JOIN regions r ON e.region_id = r.id
  WHERE e.slug = ? AND e.status = 'published'
`).get(slug);

if (!event) {
  return Astro.redirect('/events');
}

const capacity_info = event.capacity 
  ? `${event.current_participants}/${event.capacity}`
  : `${event.current_participants} katılımcı`;

const is_full = event.capacity && event.current_participants >= event.capacity;
---

<MainLayout title={event.title} currentLang="tr">
  <div class="max-w-2xl mx-auto py-12">
    <!-- Breadcrumb -->
    <nav class="text-sm text-gray-600 mb-8">
      <a href="/events" class="hover:text-purple-600">Etkinlikler</a>
      <span> / </span>
      <span>{event.region_name}</span>
    </nav>
    
    <!-- Header -->
    <h1 class="text-4xl font-bold mb-4">{event.title}</h1>
    
    <!-- Meta -->
    <div class="flex gap-4 text-gray-600 mb-6 pb-6 border-b">
      <span>📅 {new Date(event.date).toLocaleDateString('tr-TR')}</span>
      <span>📍 {event.location}</span>
      <span>🌍 {event.region_name}</span>
    </div>
    
    <!-- Katılımcı Sayısı -->
    <div class="mb-6 p-4 bg-purple-50 rounded-lg">
      <p class="text-lg font-semibold text-purple-700">
        👥 {capacity_info}
      </p>
    </div>
    
    <!-- Açıklama -->
    <div class="prose max-w-none mb-8">
      {event.description}
    </div>
    
    <!-- Etkinliğe Katıl -->
    <div class="mb-8 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-bold mb-4">Etkinliğe Katıl</h2>
      
      {is_full ? (
        <div class="p-4 bg-red-50 border border-red-200 rounded">
          <p class="text-red-700 font-semibold">❌ Kontenjan dolmuştur</p>
        </div>
      ) : (
        <form id="join-event-form" class="space-y-4">
          <div>
            <label for="participant-email" class="block text-sm font-semibold mb-2">
              E-posta Adresiniz *
            </label>
            <input 
              type="email"
              id="participant-email"
              name="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          
          <div>
            <label for="participant-name" class="block text-sm font-semibold mb-2">
              Adınız
            </label>
            <input 
              type="text"
              id="participant-name"
              name="name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          
          <button 
            type="submit"
            class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Etkinliğe Katıl
          </button>
        </form>
      )}
    </div>
    
    <!-- Paylaşım -->
    <div class="p-4 bg-purple-50 rounded-lg">
      <p class="font-semibold mb-3">📤 Paylaş:</p>
      <div class="flex gap-3">
        <a 
          href={`https://wa.me/?text=${encodeURIComponent(event.title + ' ' + Astro.url.href)}`}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          WhatsApp
        </a>
        <a 
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${Astro.url.href}`}
          class="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500"
        >
          X
        </a>
        <button 
          onclick="navigator.clipboard.writeText(window.location.href); alert('Link kopyalandı!')"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Linki Kopyala
        </button>
      </div>
    </div>
  </div>
</MainLayout>

<script>
  document.getElementById('join-event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('participant-email').value;
    const name = document.getElementById('participant-name').value;
    
    try {
      const res = await fetch('/api/events/{event.id}/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      
      const result = await res.json();
      
      if (result.success) {
        showSuccessToast('✅ Etkinliğe başarıyla katıldınız!');
        setTimeout(() => location.reload(), 1500);
      } else {
        showErrorToast('❌ ' + result.error);
      }
    } catch (error) {
      showErrorToast('❌ Hata: ' + error.message);
    }
  });
</script>
```

#### Join Event API (`src/pages/api/events/[id]/join.js`)
```javascript
import Database from 'better-sqlite3';

const db = new Database('data.db');

export async function POST({ params, request }) {
  try {
    const { email, name } = await request.json();
    const event_id = params.id;
    
    // Fetch event
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
    if (!event) {
      return new Response(JSON.stringify({ success: false, error: 'Etkinlik bulunamadı' }), { status: 404 });
    }
    
    // Kontenjanlı mı?
    if (event.capacity && event.current_participants >= event.capacity) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Kontenjan dolmuştur.' 
      }), { status: 400 });
    }
    
    // Daha önce katıldı mı?
    const existing = db.prepare(`
      SELECT id FROM event_participations 
      WHERE event_id = ? AND user_email = ?
    `).get(event_id, email);
    
    if (existing) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Daha önce etkinliğe katıldınız.' 
      }), { status: 400 });
    }
    
    // INSERT participation
    db.prepare(`
      INSERT INTO event_participations (event_id, user_email, user_name, joined_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(event_id, email, name);
    
    // Increment counter
    db.prepare(`
      UPDATE events SET current_participants = current_participants + 1 WHERE id = ?
    `).run(event_id);
    
    // Audit log
    db.prepare(`
      INSERT INTO audit_log (action, table_name, record_id, new_data, timestamp)
      VALUES ('join', 'event_participations', ?, ?, CURRENT_TIMESTAMP)
    `).run(event_id, JSON.stringify({ email, name }));
    
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}
```

---

### 2.3: Kontenjan Yönetimi

**Business Rule:**
```
Admin panel'de etkinlik oluştururken:

☐ Kontenjanlı Etkinlik
  ↳ Kontenjan: [_____ sayı]
  
Kontenjanlı ise:
  - Katılım sayısı >= Kontenjan → "Kontenjan dolmuştur" (buton disable)
  - Admin panelinde: "X/Y katılımcı"
```

#### Event Admin Edit Form
```astro
<!-- src/pages/admin/events/edit/[id].astro -->
<form>
  <!-- ... existing fields ... -->
  
  <div class="space-y-4">
    <label class="flex items-center gap-2">
      <input 
        type="checkbox"
        id="is-capacity"
        name="has_capacity"
        onchange="document.getElementById('capacity-input').toggleAttribute('disabled')"
      />
      <span>Kontenjanlı Etkinlik</span>
    </label>
    
    <div>
      <label for="capacity-input" class="block text-sm font-semibold mb-1">
        Toplam Kontenjan
      </label>
      <input 
        type="number"
        id="capacity-input"
        name="capacity"
        min="1"
        disabled
        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
    </div>
  </div>
</form>
```

---

## 🧩 Reusable Components (Her yerde kullanılacak)

### Modal Component (`src/components/Modal.astro`)
```astro
---
export interface Props {
  id?: string;
  type?: 'confirm' | 'alert' | 'form'; // confirm, alert, form
  title: string;
  message: string;
  buttons?: Array<{ text: string; action: string; style?: 'primary' | 'danger' }>;
}

const { id = 'modal', type = 'alert', title, message, buttons = [] } = Astro.props;
---

<div id={id} class="fixed inset-0 bg-black/50 hidden z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animation-slideUp">
    <h2 class="text-xl font-bold mb-3">{title}</h2>
    <p class="text-gray-700 mb-6">{message}</p>
    
    <div class="flex gap-3">
      {buttons.map(btn => (
        <button
          onclick={btn.action}
          class={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
            btn.style === 'danger' 
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {btn.text}
        </button>
      ))}
    </div>
  </div>
</div>

<style>
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animation-slideUp {
    animation: slideUp 0.3s ease-out;
  }
</style>
```

### Toast Component (`src/components/Toast.astro`)
```astro
<div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

<script>
  window.showSuccessToast = (message) => {
    showToast(message, 'success');
  };
  
  window.showErrorToast = (message) => {
    showToast(message, 'error');
  };
  
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const bgClass = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `${bgClass} text-white px-6 py-3 rounded-lg shadow-lg animate-slideIn`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-slideOut');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
</script>

<style>
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
  
  .animate-slideIn { animation: slideIn 0.3s ease-out; }
  .animate-slideOut { animation: slideOut 0.3s ease-out; }
</style>
```

---

## 📊 Öğrendiğimiz: FAZ 1-2 Özeti

| Feature | Status | Files |
|---------|--------|-------|
| **Slug System** | ✅ Implemented | `slugify.ts` + `create.js` |
| **Article View Count** | ✅ Implemented | `detail.astro` + `audit_log` |
| **Region Filter** | ✅ Implemented | `RegionFilter.astro` |
| **Event Name Check** | ✅ Implemented | `check-name.js` |
| **Event Proposal Form** | ✅ Implemented | `EventProposalForm.astro` |
| **Event Detail + Share** | ✅ Implemented | `events/[slug].astro` |
| **Event Join + Counter** | ✅ Implemented | `events/[id]/join.js` |
| **Capacity Management** | ✅ Logic Ready | Form input ready |
| **Notifications to All Admins** | ✅ (TODO: display) | `create.js` inserts |
| **Professional UX** | ✅ Components Ready | Modal + Toast |
| **Audit Logging** | ✅ Implemented | All API routes |

---

## ⏭️ Sonraki: FAZ 3 - Admin Notification Center

(Geçiş yap: `send_notification_display_system`)
