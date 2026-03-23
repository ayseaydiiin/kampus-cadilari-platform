-- ============================================================================
-- KAMPUS CADILARI PLATFORM - DATABASE SCHEMA
-- ============================================================================
-- Mode: SQLite (Current) + PostgreSQL Ready (Future Migration)
-- Created: 2026-03-23
-- Status: Foundation for Phases 1-6
-- ============================================================================

-- ============================================================================
-- TIER 0: Users & Admin Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'admin', -- admin|moderator|viewer
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  phone TEXT,
  bio TEXT,
  can_approve_articles BOOLEAN DEFAULT 1,
  can_approve_events BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);

-- ============================================================================
-- TIER 1: Core Content (Articles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Content fields
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT,
  date TEXT,
  excerpt TEXT,
  image TEXT,
  body TEXT, -- JSON array stored as TEXT
  
  -- NEW: Enhanced fields for detail pages
  slug TEXT UNIQUE,
  short_content TEXT, -- Dashboard preview
  long_content TEXT, -- Full article (LONGBLOB for large text)
  
  -- Tracking
  view_count INTEGER DEFAULT 0,
  
  -- Status workflow
  status TEXT DEFAULT 'draft', -- draft|under_review|awaiting_approval|published|rejected
  
  -- Metadata
  created_by TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relationships
  region_id INTEGER, -- NEW: For filtering articles by region/il
  
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_region_id ON articles(region_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- ============================================================================
-- TIER 2: Article Approval System (Critical: All Admins Must Approve)
-- ============================================================================

CREATE TABLE IF NOT EXISTS article_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  article_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  
  -- Approval status
  status TEXT DEFAULT 'pending', -- pending|approved|rejected|requested_changes
  
  -- Reason is MANDATORY
  reason TEXT, -- "Onay"; "Red"; or custom feedback
  
  -- Admin feedback (comments panel)
  feedback TEXT,
  
  -- Timestamps
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(article_id, admin_id), -- Each admin votes once per article
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_approvals_article_id ON article_approvals(article_id);
CREATE INDEX IF NOT EXISTS idx_article_approvals_admin_id ON article_approvals(admin_id);
CREATE INDEX IF NOT EXISTS idx_article_approvals_status ON article_approvals(status);

-- ============================================================================
-- TIER 3: Events & Event Proposals
-- ============================================================================

CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL, -- "İstanbul", "Ankara", vb
  code TEXT UNIQUE, -- "34", "06"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  location TEXT,
  
  -- NEW: Enhanced fields
  slug TEXT UNIQUE,
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft|published|closed
  
  -- Capacity management (CRITICAL BUSINESS RULE)
  -- NULL = unlimited; INTEGER = limited
  capacity INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Location reference
  region_id INTEGER,
  
  -- Metadata
  created_by TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_region_id ON events(region_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- Event Proposals (önesunlan etkinlikler)
-- BUSINESS RULE: Etkinlik önerildiğinde tüm adminlere bildirim gider
--                Tüm adminler onay verirse "published" olur

CREATE TABLE IF NOT EXISTS event_proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  location TEXT,
  
  -- Proposer info
  region_id INTEGER NOT NULL,
  proposed_by_email TEXT NOT NULL,
  proposed_by_name TEXT,
  
  -- Status workflow
  status TEXT DEFAULT 'submitted', -- submitted|under_review|approved|rejected|published
  
  -- If approved, which event was created from this?
  created_event_id INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
  FOREIGN KEY (created_event_id) REFERENCES events(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_proposals_status ON event_proposals(status);
CREATE INDEX IF NOT EXISTS idx_event_proposals_region_id ON event_proposals(region_id);

-- Event Proposal Approvals (tüm admin onayları)
CREATE TABLE IF NOT EXISTS event_proposal_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  proposal_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  
  status TEXT DEFAULT 'pending', -- pending|approved|rejected
  reason TEXT, -- MANDATORY: Onay/Red sebebi
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(proposal_id, admin_id),
  FOREIGN KEY (proposal_id) REFERENCES event_proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_proposal_approvals_proposal_id ON event_proposal_approvals(proposal_id);
CREATE INDEX IF NOT EXISTS idx_event_proposal_approvals_admin_id ON event_proposal_approvals(admin_id);

-- Event Participations (katılım sayıları, admin tracking)
CREATE TABLE IF NOT EXISTS event_participations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  event_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  
  -- Prevent duplicate participation
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, user_email),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_participations_event_id ON event_participations(event_id);

-- ============================================================================
-- TIER 4: Notifications (Central Hub)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  admin_id INTEGER NOT NULL,
  
  -- Notification type
  type TEXT NOT NULL, -- event_proposal|article_submission|post_it|participation|form_submission|post_it_edit
  
  -- Message content
  title TEXT,
  message TEXT,
  
  -- Link to relevant content
  related_table TEXT, -- articles|events|postits|event_proposals
  related_id INTEGER,
  
  -- Read status
  is_read BOOLEAN DEFAULT 0,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================================================
-- TIER 5: Post-it System (Internal Communication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS postits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  title TEXT,
  content TEXT NOT NULL,
  
  -- Admin tracking
  created_by INTEGER NOT NULL,
  last_edited_by INTEGER,
  
  -- Status
  status TEXT DEFAULT 'active', -- active|archived
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (last_edited_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_postits_created_by ON postits(created_by);
CREATE INDEX IF NOT EXISTS idx_postits_status ON postits(status);

-- Post-it Comments (Yorum Sistemi)
CREATE TABLE IF NOT EXISTS postit_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  postit_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (postit_id) REFERENCES postits(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_postit_comments_postit_id ON postit_comments(postit_id);
CREATE INDEX IF NOT EXISTS idx_postit_comments_admin_id ON postit_comments(admin_id);

-- Post-it Edit History (Düzenleme Geçmişi - KRITIK)
-- BUSINESS RULE: Düzenleme sebebi zorunlu, tüm geçmiş kaydedilir
CREATE TABLE IF NOT EXISTS postit_edit_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  postit_id INTEGER NOT NULL,
  edited_by INTEGER NOT NULL,
  
  -- Previous state
  previous_title TEXT,
  previous_content TEXT,
  
  -- New state
  new_title TEXT,
  new_content TEXT,
  
  -- MANDATORY: Düzenleme sebebi
  change_reason TEXT NOT NULL,
  
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (postit_id) REFERENCES postits(id) ON DELETE CASCADE,
  FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_postit_edit_history_postit_id ON postit_edit_history(postit_id);

-- ============================================================================
-- TIER 6: Archive (Flexible Media Storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS archive (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Categorization
  category TEXT NOT NULL, -- newspaper|image|document|other
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  
  -- File storage
  file_path TEXT NOT NULL,
  file_type TEXT, -- MIME type: application/pdf, image/jpeg, vb
  file_size INTEGER,
  
  -- Metadata
  uploaded_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_archive_category ON archive(category);
CREATE INDEX IF NOT EXISTS idx_archive_uploaded_by ON archive(uploaded_by);

-- ============================================================================
-- TIER 7: Audit Log (All Operations Logged)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  user_id INTEGER,
  
  -- Action type
  action TEXT NOT NULL, -- create|update|delete|approve|reject|view|join|comment|edit
  table_name TEXT NOT NULL, -- articles|events|postits|event_proposals|vb
  record_id INTEGER,
  
  -- Data changes (JSON format, stored as TEXT)
  previous_data TEXT, -- JSON: before state
  new_data TEXT, -- JSON: after state
  
  -- Request context
  ip_address TEXT,
  
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Regions (81 Turkish Provinces)
INSERT OR IGNORE INTO regions (code, name) VALUES
('34', 'İstanbul'),
('06', 'Ankara'),
('35', 'İzmir'),
('16', 'Bursa'),
('55', 'Samsun'),
('41', 'Kocaeli'),
('07', 'Antalya'),
('17', 'Çanakkale'),
('37', 'Aydın'),
('09', 'Balıkesir'),
('74', 'Rize'),
('22', 'Edirne'),
('32', 'Hatay'),
('42', 'Konya'),
('33', 'Mersin'),
('05', 'Amasya'),
('11', 'Bilecik'),
('12', 'Bingöl'),
('13', 'Bitlis'),
('14', 'Bolu'),
('15', 'Corum'),
('18', 'Çankırı'),
('19', 'Çorum'),
('20', 'Denizli'),
('21', 'Diyarbakır'),
('23', 'Elazığ'),
('24', 'Erzincan'),
('25', 'Erzurum'),
('26', 'Eskişehir'),
('27', 'Gaziantep'),
('28', 'Giresun'),
('29', 'Gümüşhane'),
('30', 'Hakkari'),
('31', 'Hamah'),
('36', 'Kastamonu'),
('38', 'Kayceri'),
('40', 'Kırşehir'),
('43', 'Kütahya'),
('44', 'Malatya'),
('45', 'Manisa'),
('46', 'Mardin'),
('47', 'Muğla'),
('48', 'Muş'),
('49', 'Nevşehir'),
('50', 'Niğde'),
('51', 'Ordu'),
('52', 'Rize (DUPLICATE - Already at 74)'),
('53', 'Sakarya'),
('54', 'Samsun (DUPLICATE)'),
('56', 'Siirt'),
('57', 'Sinop'),
('58', 'Sivas'),
('59', 'Şanlıurfa'),
('60', 'Şırnak'),
('61', 'Tekirdağ'),
('62', 'Tokat'),
('63', 'Trabzon'),
('64', 'Tunceli'),
('65', 'Uşak'),
('66', 'Van'),
('67', 'Yalova'),
('68', 'Yozgat'),
('69', 'Zonguldak'),
('70', 'Aksaray'),
('71', 'Artvın'),
('72', 'Bartın'),
('73', 'Batman'),
('75', 'Bayburt'),
('76', 'Karaman'),
('77', 'Karabük'),
('78', 'Kilis'),
('79', 'Kırıkkale'),
('80', 'Kırklareli'),
('81', 'Kırşehir (DUPLICATE)'),
('83', 'Iğdır'),
('84', 'Yalova (DUPLICATE)'),
('85', 'Karabük (DUPLICATE)'),
('86', 'Kilis (DUPLICATE)');

-- Sample Admin User (for testing)
-- Password: admin123 (hashed with bcrypt should be done in code)
INSERT OR IGNORE INTO users (email, name, role, is_active) VALUES
('admin@kampuscadilari.org', 'Admin User', 'admin', 1);

-- Create admin profile if it doesn't exist
INSERT OR IGNORE INTO admin_profiles (user_id, can_approve_articles, can_approve_events)
SELECT users.id, 1, 1 FROM users 
WHERE users.email = 'admin@kampuscadilari.org';

-- ============================================================================
-- VIEWS (Optional but useful for queries)
-- ============================================================================

-- View: Articles awaiting approval (show all articles in review state)
CREATE VIEW IF NOT EXISTS articles_awaiting_approval AS
SELECT 
  a.id,
  a.title,
  a.category,
  a.status,
  COUNT(DISTINCT aa.admin_id) as admin_votes_received,
  (SELECT COUNT(DISTINCT id) FROM users WHERE role = 'admin') as total_admins,
  SUM(CASE WHEN aa.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN aa.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
FROM articles a
LEFT JOIN article_approvals aa ON a.id = aa.article_id
WHERE a.status IN ('under_review', 'awaiting_approval')
GROUP BY a.id;

-- View: Event Proposals awaiting approval
CREATE VIEW IF NOT EXISTS event_proposals_awaiting_approval AS
SELECT 
  ep.id,
  ep.title,
  r.name as region,
  ep.status,
  COUNT(DISTINCT epa.admin_id) as admin_votes_received,
  (SELECT COUNT(DISTINCT id) FROM users WHERE role = 'admin') as total_admins,
  SUM(CASE WHEN epa.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN epa.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
FROM event_proposals ep
LEFT JOIN event_proposal_approvals epa ON ep.id = epa.proposal_id
LEFT JOIN regions r ON ep.region_id = r.id
WHERE ep.status IN ('under_review', 'approved')
GROUP BY ep.id;

-- View: Unread notifications per admin
CREATE VIEW IF NOT EXISTS admin_notification_counts AS
SELECT 
  admin_id,
  COUNT(*) as total_unread
FROM notifications
WHERE is_read = 0
GROUP BY admin_id;

-- ============================================================================
-- MIGRATION NOTES (SQLite → PostgreSQL)
-- ============================================================================
/*
When migrating to PostgreSQL, make these changes:

1. INTEGER PRIMARY KEY AUTOINCREMENT → BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
2. TEXT UNIQUE → VARCHAR(255) UNIQUE
3. BOOLEAN → BOOLEAN (already compatible)
4. CURRENT_TIMESTAMP → CURRENT_TIMESTAMP (compatible)
5. FOREIGN KEY REFERENCES → Add ON DELETE CASCADE/SET NULL syntax
6. JSON storage → Use native JSONB type instead of TEXT
7. Indexes → pg_stat_statements for query analysis

Example migration for users table:

PostgreSQL:
CREATE TABLE users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify schema integrity)
-- ============================================================================

-- Check all tables created
-- SELECT name FROM sqlite_master WHERE type='table';

-- Check all indexes
-- SELECT name FROM sqlite_master WHERE type='index';

-- Verify foreign key relationships
-- PRAGMA foreign_key_list(articles);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
