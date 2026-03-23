# ⚡ QUICK START GUIDE

## 🎯 Your Next 2 Steps (5 minutes)

### Step 1: Initialize Database
```bash
node scripts/init-db.js
```
✅ Creates `data.db` with schema + 81 regions  
✅ Ready for development  

### Step 2: Test Connection
```bash
node -e "const db=require('better-sqlite3')('data.db'); console.log('✅ DB OK:', db.prepare('SELECT COUNT(*) as c FROM regions').get());"
```
Should output: `✅ DB OK: { c: 81 }`

---

## 📁 What Gets Created

```
📦 After init-db.js runs:
├── data.db (SQLite file)
└── Tables:
    ├── users (1 sample admin)
    ├── articles
    ├── article_approvals
    ├── events
    ├── event_proposals
    ├── event_participations
    ├── notifications
    ├── postits
    ├── postit_comments
    ├── postit_edit_history
    ├── archive
    ├── regions (81 Turkish cities)
    └── audit_log (100% operation tracking)
```

---

## 🔥 Key Facts for Next Phase

### For Articles (FAZ 1):
- **Database:** `articles` table with `slug`, `view_count`, `status`
- **Approval:** ALL ADMINS must approve before publishing
- **Tracking:** Every view logged to `audit_log` + `view_count` incremented
- **Detail Page:** `src/pages/articles/[category]/[slug].astro`

### For Events (FAZ 2):
- **Submission:** User proposes → goes to `event_proposals` (status: pending)
- **Admin Vote:** Each admin votes (stored in `event_proposal_approvals`)
- **Publishing:** When ALL admins approve → event goes live
- **Capacity:** `events.capacity` - NULL = unlimited, INTEGER = capped
- **Join:** Check `IF current_participants >= capacity THEN show error`

### For Admins:
- **Notifications:** Central hub at `notifications` table
- **Audit Trail:** Every operation logged (create/update/delete + user who did it)
- **Approval Reason:** MANDATORY field in all approval tables (enforced by schema)

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `DATABASE_SCHEMA.sql` | Complete schema (read-only reference) |
| `scripts/init-db.js` | Run this to create database |
| `DATABASE_SETUP_GUIDE.md` | Detailed documentation |
| `data.db` | ✨ Your actual database (created by init) |

---

## ✋ Common Tasks in Code

### Get all articles in a category:
```javascript
const db = new Database('data.db');
const articles = db.prepare(`
  SELECT * FROM articles 
  WHERE category = ? AND status = 'published'
  ORDER BY created_at DESC
`).all('feminizm_bilimi');
```

### Track article view:
```javascript
const db = new Database('data.db');

// Increment view counter
db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?')
  .run(articleId);

// Log operation
db.prepare(`
  INSERT INTO audit_log (action, table_name, record_id, new_data)
  VALUES ('view', 'articles', ?, ?)
`).run(articleId, JSON.stringify({ view_count: newCount }));
```

### Check event name is unique:
```javascript
const exists = db.prepare(`
  SELECT id FROM events WHERE LOWER(title) = LOWER(?)
`).get('Hemşirelik Paneli');

if (exists) {
  return { error: 'Bu etkinlik daha var' };
}
```

### Join event (with capacity check):
```javascript
const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);

if (event.capacity && event.current_participants >= event.capacity) {
  return { error: 'Kontenjan dolmuş' };
}

db.prepare(`
  INSERT INTO event_participations (event_id, user_email, user_name)
  VALUES (?, ?, ?)
`).run(eventId, email, name);

db.prepare('UPDATE events SET current_participants = current_participants + 1 WHERE id = ?')
  .run(eventId);
```

---

## ✅ Verification Checklist

- [ ] Ran `node scripts/init-db.js`
- [ ] `data.db` file exists in workspace root
- [ ] Can read from `articles` table
- [ ] Can read 81 regions
- [ ] Admin user visible in `users` table
- [ ] Foreign keys enabled (can insert without errors)

---

## ⚠️ Common Issues

**Q: "Database is locked" error**  
A: Close any other process using `data.db` (VS Code SQLite explorer, etc.)

**Q: "Table users already exists" error**  
A: Delete `data.db` and run init script again

**Q: Script won't run**  
A: Make sure `better-sqlite3` is installed: `npm install better-sqlite3`

---

## 🚀 You're Ready!

Database is initialized. Move to **FAZ 1 Implementation:**

1. Create `src/utils/slugify.ts` (Turkish character handling)
2. Create article detail page with view tracking
3. Add region filter dropdown
4. Implement social share buttons

Then **FAZ 2:**
1. Event proposal form
2. Real-time name validation
3. Approval workflow
4. Join/capacity logic

**Start:** [See IMPLEMENTATION_CHECKLIST_PHASE_1_2.md](IMPLEMENTATION_CHECKLIST_PHASE_1_2.md)

---

Generated: 2026-03-23  
Status: ✅ Ready  
