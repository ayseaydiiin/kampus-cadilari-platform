# 🗄️ DATABASE SETUP & MIGRATION GUIDE

## Current State: SQLite
- **File:** `data.db`
- **Status:** Perfect for development & phase 1-2
- **When to migrate:** When needing concurrent admins + production scale

---

## 📍 QUICK START: Initialize Database

### 1. Run Initialization Script

```bash
node scripts/init-db.js
```

**Output:**
```
🔧 Kampüs Cadıları - Database Initialization

📍 Mode: SQLite
📁 Database: data.db
📖 Reading schema...
✅ Found 45 SQL statements
⚙️  Executing schema statements...
  ✓ 5 statements...
  ✓ 10 statements...
  ✓ 15 statements...
  ✓ ... (continues)
✅ Executed 45 statements successfully

🔍 Verification:
  📊 Tables created: 18
  🗺️  Regions loaded: 81
  👤 Admin users: 1
  ✅ All foreign keys valid

✨ Business Rules Implemented:
  ✅ All articles need approval from ALL admins before publishing
  ✅ All event proposals need approval from ALL admins
  ... (10 critical rules listed)

🎯 Ready for Phases 1-2 Implementation
```

### 2. Access Database

```javascript
// In your Astro API routes:
import Database from 'better-sqlite3';

const db = new Database('data.db');

// Example: Get articles
const articles = db.prepare(`
  SELECT * FROM articles WHERE status = 'published'
`).all();
```

---

## 🔄 FUTURE: PostgreSQL Migration Path

### When to migrate:
- ✅ Production deployment
- ✅ Multiple concurrent admins
- ✅ Scaling to 10,000+ articles
- ✅ Need advanced features (JSONB, arrays, full-text search)

### Migration Steps:

#### 1. Export SQLite Data
```bash
# Create dump file
npm run db:export  # (will create scripts/sqlite_dump.sql)
```

#### 2. Create PostgreSQL Database
```sql
CREATE DATABASE kampus_cadilari;
```

#### 3. Adapt Schema Differences

**SQLite → PostgreSQL Changes:**

| Feature | SQLite | PostgreSQL |
|---------|--------|-----------|
| Primary Key | `INTEGER PRIMARY KEY AUTOINCREMENT` | `BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY` |
| Text Unique | `TEXT UNIQUE` | `VARCHAR(255) UNIQUE` |
| Booleans | `0/1` | `TRUE/FALSE` |
| Timestamps | `CURRENT_TIMESTAMP` | `CURRENT_TIMESTAMP AT TIME ZONE 'UTC'` |
| JSON | `TEXT` | `JSONB` (native support) |
| Auto Increment | `AUTOINCREMENT` | `GENERATED ALWAYS AS IDENTITY` |

#### 4. Run PostgreSQL Schema
```sql
-- Modify DATABASE_SCHEMA.sql for PostgreSQL syntax
-- Then run:
psql -U postgres -d kampus_cadilari -f DATABASE_SCHEMA_PG.sql
```

---

## 📋 SCHEMA STRUCTURE

### ✅ Implemented Tiers:

```
TIER 0: Users & Admin Management
  ├── users (email, role, password_hash)
  └── admin_profiles (approve permissions)

TIER 1: Core Content (Articles)
  ├── articles (title, slug, status, view_count)
  └── regions (İstanbul, Ankara, etc. - 81 total)

TIER 2: Article Approval System (CRITICAL)
  └── article_approvals (ALL ADMINS must approve)
      ├── status: pending|approved|rejected|requested_changes
      └── reason: MANDATORY field

TIER 3: Events & Proposals
  ├── events (title, capacity, current_participants)
  ├── event_proposals (submitted by users, needs admin approval)
  └── event_participations (tracks who joined which events)

TIER 4: Notifications (Central Hub)
  └── notifications (type, related_id, related_table, is_read)
      ├── Triggers: new proposals, article submissions, post-it edits
      └── Admin can: mark read, navigate to detail

TIER 5: Post-it System (Internal Communication)
  ├── postits (created_by, last_edited_by, status)
  ├── postit_comments (admin comments on posts)
  └── postit_edit_history (change_reason, timestamp)

TIER 6: Archive (Flexible Media)
  └── archive (category: newspaper|image|document|other)

TIER 7: Audit Log (Everything Logged)
  └── audit_log (action, table_name, previous_data, new_data, ip_address)
```

---

## 🔐 CRITICAL BUSINESS RULES (Schema-Level)

### 1. All Articles Need ALL Admin Approval
```sql
-- View: Check approval status
SELECT 
  a.id, a.title,
  COUNT(DISTINCT aa.admin_id) as admins_voted,
  (SELECT COUNT(*) FROM users WHERE role='admin') as total_admins
FROM articles a
LEFT JOIN article_approvals aa ON a.id = aa.article_id
WHERE a.status = 'awaiting_approval'
GROUP BY a.id;

-- Article publishes only when ALL admins approve
IF all_admins_approved THEN
  UPDATE articles SET status = 'published'
```

### 2. Event Proposals Need ALL Admin Approval
```sql
-- Same pattern as articles
-- No proposal goes live until ALL admins vote
```

### 3. Approval Requires Mandatory Reason
```sql
-- Schema enforces NOT NULL on 'reason' field
ALTER TABLE article_approvals 
  ADD CONSTRAINT reason_not_null CHECK (reason IS NOT NULL);

-- Application must prevent form submission without reason
```

### 4. Post-it Edits Tracked with Reason
```sql
INSERT INTO postit_edit_history 
(postit_id, edited_by, previous_content, new_content, change_reason)
VALUES (?, ?, ?, ?, ?);
-- change_reason is MANDATORY
```

### 5. Capacity Management
```sql
-- Event with capacity:
UPDATE events SET capacity = 50 WHERE id = 1;

-- Check if full:
IF current_participants >= capacity THEN
  -- Show "Kontenjan dolmuştur"
END IF;

-- Event without capacity:
UPDATE events SET capacity = NULL WHERE id = 2;
-- No limit applied
```

### 6. All operations audit-logged
```sql
INSERT INTO audit_log 
(user_id, action, table_name, record_id, previous_data, new_data)
VALUES (?, ?, ?, ?, ?, ?);
-- Every create/update/delete tracked + IP address
```

---

## 🎯 USING THE SCHEMA IN FAZ 1-2

### Example 1: Create Article (with slug)
```javascript
// src/pages/api/articles/create.js
import Database from 'better-sqlite3';
import { slugify } from '../utils/slugify';

const db = new Database('data.db');

export async function POST({ request }) {
  const { title, category, short_content, long_content } = await request.json();
  
  const slug = slugify(title);
  
  const result = db.prepare(`
    INSERT INTO articles 
    (title, category, slug, short_content, long_content, status)
    VALUES (?, ?, ?, ?, ?, 'draft')
  `).run(title, category, slug, short_content, long_content);
  
  // Audit log
  db.prepare(`
    INSERT INTO audit_log (action, table_name, record_id, new_data)
    VALUES ('create', 'articles', ?, ?)
  `).run(result.lastID, JSON.stringify({ title, slug }));
  
  return new Response(JSON.stringify({ success: true, id: result.lastID }));
}
```

### Example 2: Check Event Name (Unique)
```javascript
// src/pages/api/events/check-name.js
export async function POST({ request }) {
  const { title } = await request.json();
  
  const existing = db.prepare(`
    SELECT id FROM events WHERE LOWER(title) = LOWER(?)
  `).get(title);
  
  return new Response(JSON.stringify({
    exists: !!existing,
    message: existing ? 'Bu etkinlik adı daha önce kullanılmıştır.' : null
  }));
}
```

### Example 3: Join Event (with capacity check)
```javascript
// src/pages/api/events/[id]/join.js
import Database from 'better-sqlite3';

export async function POST({ params, request }) {
  const { email, name } = await request.json();
  const db = new Database('data.db');
  
  // Fetch event
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(params.id);
  
  // Check capacity
  if (event.capacity && event.current_participants >= event.capacity) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Kontenjan dolmuştur.' 
    }), { status: 400 });
  }
  
  // Check duplicate
  const existing = db.prepare(`
    SELECT id FROM event_participations 
    WHERE event_id = ? AND user_email = ?
  `).get(params.id, email);
  
  if (existing) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Zaten bu etkinliğe katıldınız.' 
    }), { status: 400 });
  }
  
  // Join
  db.prepare(`
    INSERT INTO event_participations (event_id, user_email, user_name)
    VALUES (?, ?, ?)
  `).run(params.id, email, name);
  
  // Update counter
  db.prepare('UPDATE events SET current_participants = current_participants + 1 WHERE id = ?')
    .run(params.id);
  
  // Audit
  db.prepare(`
    INSERT INTO audit_log (action, table_name, record_id, new_data)
    VALUES ('join', 'event_participations', ?, ?)
  `).run(params.id, JSON.stringify({ email, name }));
  
  // Notify admins
  const admins = db.prepare('SELECT id FROM users WHERE role = "admin"').all();
  admins.forEach(admin => {
    db.prepare(`
      INSERT INTO notifications 
      (admin_id, type, title, message, related_table, related_id)
      VALUES (?, 'participation', ?, ?, 'events', ?)
    `).run(admin.id, `Etkinliğe Katılım: ${event.title}`, 
           `${email} etkinliğe katıldı.`, params.id);
  });
  
  return new Response(JSON.stringify({ success: true }));
}
```

---

## 📊 DATABASE STATISTICS (After Init)

```
✅ Tables: 18
✅ Indexes: 25+
✅ Views: 3
✅ Regions: 81
✅ Users: 1 (sample admin)
✅ Foreign Key Constraints: 12
✅ Unique Constraints: 8
```

---

## 🧪 TESTING DATABASE

```javascript
// Test connection
import Database from 'better-sqlite3';
const db = new Database('data.db');

// Check tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table'
`).all();
console.log('Tables:', tables.length);

// Check regions populated
const regions = db.prepare('SELECT COUNT(*) as count FROM regions').get();
console.log('Regions:', regions.count); // Should be 81

// Close
db.close();
```

---

## 🚀 NEXT STEPS

1. **Run init script:** `node scripts/init-db.js`
2. **Verify database:** Check `data.db` file exists
3. **Start Phase 1:** Implement article filtering & detail pages
4. **Start Phase 2:** Implement event proposals & approvals
5. **Monitor audit logs:** See all operations tracking

---

## 📝 NOTES

- **Foreign Keys:** Enabled by default (critical for data integrity)
- **Indexes:** Optimized for common queries (articles by category, events by region)
- **JSON Storage:** Using TEXT for compatibility; upgrade to native JSON in PostgreSQL
- **Timestamps:** Using CURRENT_TIMESTAMP; supports both SQLite and PostgreSQL
- **Migration:** All syntax differences documented for easy PostgreSQL transition

---

**Database Schema Version:** 1.0  
**Last Updated:** 2026-03-23  
**Status:** ✅ Ready for Implementation
