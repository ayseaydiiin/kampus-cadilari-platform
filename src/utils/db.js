import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../kampus_cadilari.db');

function ensureColumn(db, table, name, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const hasColumn = columns.some((col) => col.name === name);
  if (!hasColumn) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
}

// Initialize Database
export function initDatabase() {
  const db = new Database(dbPath);
  
  // Create users table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'editor',
      is_active INTEGER DEFAULT 1,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      profile_data TEXT
    )
  `);

  // Create admin_users whitelist table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'admin',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create activity_log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create applications table (Bize Katıl applications)
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      province TEXT NOT NULL,
      organization TEXT,
      skills TEXT,
      social_media TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      reviewed_at DATETIME,
      reviewed_by TEXT,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create event_proposals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      proposed_by TEXT NOT NULL,
      email TEXT NOT NULL,
      province TEXT,
      category TEXT,
      date_suggested TEXT,
      capacity INTEGER,
      organizer_phone TEXT,
      status TEXT DEFAULT 'new',
      reviewed_at DATETIME,
      reviewed_by TEXT,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure new columns exist when migrating old DBs
  try {
    ensureColumn(db, 'event_proposals', 'capacity', 'capacity INTEGER');
  } catch {}
  try {
    ensureColumn(db, 'event_proposals', 'organizer_phone', 'organizer_phone TEXT');
  } catch {}

  // Track per-admin approvals for proposals
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_proposal_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proposal_id INTEGER NOT NULL,
      admin_email TEXT NOT NULL,
      decision TEXT NOT NULL, -- approved | rejected
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(proposal_id, admin_email),
      FOREIGN KEY (proposal_id) REFERENCES event_proposals(id)
    )
  `);

  // Newspaper archive proposals and approval workflow
  db.exec(`
    CREATE TABLE IF NOT EXISTS newspaper_archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      publication_name TEXT NOT NULL,
      title TEXT NOT NULL,
      publication_year INTEGER NOT NULL,
      decade TEXT NOT NULL,
      focus_topic TEXT,
      summary TEXT,
      quote_text TEXT,
      cover_image_url TEXT,
      pdf_url TEXT,
      source_url TEXT,
      submitted_by TEXT,
      submitted_email TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_at DATETIME,
      reviewed_by TEXT,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS newspaper_archive_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_id INTEGER NOT NULL,
      admin_email TEXT NOT NULL,
      decision TEXT NOT NULL, -- approved | rejected
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(archive_id, admin_email),
      FOREIGN KEY (archive_id) REFERENCES newspaper_archives(id)
    )
  `);

  // Event participations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS participations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT,
      event_title TEXT NOT NULL,
      participant_name TEXT DEFAULT 'Anonim',
      email TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Articles for admin CMS
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      body TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS article_view_stats (
      slug TEXT PRIMARY KEY,
      view_count INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS article_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      admin_email TEXT NOT NULL,
      decision TEXT NOT NULL, -- approved | rejected
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(article_id, admin_email),
      FOREIGN KEY (article_id) REFERENCES articles(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS article_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      admin_email TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id)
    )
  `);

  // Post-it wall notes
  db.exec(`
    CREATE TABLE IF NOT EXISTS postits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'Duyuru',
      text TEXT NOT NULL,
      color TEXT DEFAULT 'yellow',
      author TEXT,
      created_by TEXT,
      status TEXT DEFAULT 'active',
      is_edited INTEGER DEFAULT 0,
      edit_reason TEXT,
      edited_at DATETIME,
      edited_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS postit_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postit_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      author TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (postit_id) REFERENCES postits(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS postit_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postit_id INTEGER NOT NULL,
      previous_title TEXT,
      previous_text TEXT,
      new_title TEXT,
      new_text TEXT,
      reason TEXT,
      edited_by TEXT,
      edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (postit_id) REFERENCES postits(id)
    )
  `);

  // Admin notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_email TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT,
      message TEXT,
      related_table TEXT,
      related_id INTEGER,
      is_read INTEGER DEFAULT 0,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    ensureColumn(db, 'notifications', 'is_read', 'is_read INTEGER DEFAULT 0');
  } catch {}
  try {
    ensureColumn(db, 'notifications', 'read_at', 'read_at DATETIME');
  } catch {}
  try {
    ensureColumn(db, 'articles', 'view_count', 'view_count INTEGER DEFAULT 0');
  } catch {}
  try {
    ensureColumn(db, 'articles', 'excerpt', 'excerpt TEXT');
  } catch {}
  try {
    ensureColumn(db, 'articles', 'image_url', 'image_url TEXT');
  } catch {}
  try {
    ensureColumn(db, 'articles', 'created_by', 'created_by TEXT');
  } catch {}
  try {
    ensureColumn(db, 'articles', 'approved_at', 'approved_at DATETIME');
  } catch {}
  try {
    ensureColumn(db, 'postits', 'title', "title TEXT NOT NULL DEFAULT 'Duyuru'");
  } catch {}
  try {
    ensureColumn(db, 'postits', 'created_by', 'created_by TEXT');
  } catch {}
  try {
    ensureColumn(db, 'postits', 'is_edited', 'is_edited INTEGER DEFAULT 0');
  } catch {}
  try {
    ensureColumn(db, 'postits', 'edit_reason', 'edit_reason TEXT');
  } catch {}
  try {
    ensureColumn(db, 'postits', 'edited_at', 'edited_at DATETIME');
  } catch {}
  try {
    ensureColumn(db, 'postits', 'edited_by', 'edited_by TEXT');
  } catch {}
  try {
    ensureColumn(db, 'postits', 'updated_at', 'updated_at DATETIME');
  } catch {}

  return db;
}

// Get database connection
export function getDatabase() {
  return new Database(dbPath);
}

// User Management Functions
export async function createUser(email, password, fullName, username) {
  const db = getDatabase();
  
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, username)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, passwordHash, fullName, username);
    
    // Log activity
    logActivity(result.lastInsertRowid, 'user_created', { email, username });
    
    return { success: true, userId: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

// Verify user credentials
export async function verifyUserCredentials(email, password) {
  const db = getDatabase();
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.is_active) {
      return { success: false, error: 'Account disabled' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return { success: false, error: 'Invalid password' };
    }

    // Update last login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    
    // Log activity
    logActivity(user.id, 'login_successful', { email });

    return { success: true, user: { id: user.id, email: user.email, username: user.username, fullName: user.full_name, role: user.role } };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

// Check if user is admin
export function isUserAdmin(email) {
  const db = getDatabase();
  
  try {
    const admin = db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').get(email);
    return admin !== undefined;
  } finally {
    db.close();
  }
}

export function getAdminUser(email) {
  const db = getDatabase();

  try {
    return db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').get(email);
  } finally {
    db.close();
  }
}

export function getActiveAdmins() {
  const db = getDatabase();
  try {
    return db.prepare('SELECT email FROM admin_users WHERE is_active = 1').all();
  } finally {
    db.close();
  }
}

export function createNotificationForAllAdmins({
  type,
  title,
  message,
  related_table = null,
  related_id = null,
}) {
  const db = getDatabase();
  try {
    const admins = db.prepare('SELECT email FROM admin_users WHERE is_active = 1').all();
    const insert = db.prepare(`
      INSERT INTO notifications (admin_email, type, title, message, related_table, related_id, is_read)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
    const tx = db.transaction(() => {
      admins.forEach((admin) => {
        insert.run(
          admin.email,
          type,
          title || null,
          message || null,
          related_table,
          related_id
        );
      });
    });
    tx();
    return { success: true, count: admins.length };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getNotifications(adminEmail, { onlyUnread = false, limit = 50 } = {}) {
  const db = getDatabase();
  try {
    const maxRows = Math.max(1, Math.min(Number(limit) || 50, 200));
    const query = onlyUnread
      ? `SELECT * FROM notifications WHERE admin_email = ? AND is_read = 0 ORDER BY created_at DESC LIMIT ?`
      : `SELECT * FROM notifications WHERE admin_email = ? ORDER BY created_at DESC LIMIT ?`;
    return db.prepare(query).all(adminEmail, maxRows);
  } finally {
    db.close();
  }
}

export function getUnreadNotificationCount(adminEmail) {
  const db = getDatabase();
  try {
    return db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE admin_email = ? AND is_read = 0')
      .get(adminEmail).count;
  } finally {
    db.close();
  }
}

export function markNotificationRead(notificationId, adminEmail) {
  const db = getDatabase();
  try {
    db.prepare(`
      UPDATE notifications
      SET is_read = 1, read_at = CURRENT_TIMESTAMP
      WHERE id = ? AND admin_email = ?
    `).run(notificationId, adminEmail);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function markAllNotificationsRead(adminEmail) {
  const db = getDatabase();
  try {
    db.prepare(`
      UPDATE notifications
      SET is_read = 1, read_at = CURRENT_TIMESTAMP
      WHERE admin_email = ? AND is_read = 0
    `).run(adminEmail);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function deleteNotifications(adminEmail, notificationIds = []) {
  const db = getDatabase();
  try {
    const ids = Array.isArray(notificationIds)
      ? notificationIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
      : [];

    if (!ids.length) {
      return { success: false, error: 'Silinecek bildirim secilmedi' };
    }

    const placeholders = ids.map(() => '?').join(', ');
    db.prepare(`
      DELETE FROM notifications
      WHERE admin_email = ? AND id IN (${placeholders})
    `).run(adminEmail, ...ids);
    return { success: true, deleted: ids.length };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

// Add admin user to whitelist
export function addAdminUser(email, fullName = '', role = 'admin') {
  const db = getDatabase();
  
  try {
    const stmt = db.prepare(`
      INSERT INTO admin_users (email, full_name, role)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(email, fullName, role);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

// Create session token
export function createSession(userId, expiresInHours = 24) {
  const db = getDatabase();
  
  try {
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    
    db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(userId, token, expiresAt);
    
    return { success: true, token };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

// Verify session token
export function verifySession(token) {
  const db = getDatabase();
  
  try {
    const session = db.prepare(`
      SELECT sessions.*, users.id, users.email, users.username, users.role, users.full_name
      FROM sessions
      JOIN users ON sessions.user_id = users.id
      WHERE sessions.token = ? AND sessions.expires_at > CURRENT_TIMESTAMP
    `).get(token);
    
    if (!session) {
      return { success: false, error: 'Session expired or invalid' };
    }

    return { success: true, user: { id: session.id, email: session.email, username: session.username, role: session.role, fullName: session.full_name } };
  } finally {
    db.close();
  }
}

// Invalidate session
export function invalidateSession(token) {
  const db = getDatabase();
  
  try {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return { success: true };
  } finally {
    db.close();
  }
}

// Log activity
export function logActivity(userId, action, details = {}) {
  const db = getDatabase();
  
  try {
    db.prepare(`
      INSERT INTO activity_log (user_id, action, details)
      VALUES (?, ?, ?)
    `).run(userId || null, action, JSON.stringify(details));
  } finally {
    db.close();
  }
}

// Initialize admin users (run once)
export function seedAdminUsers() {
  const adminEmails = [
    { email: 'admin@kampuscadilari.org', fullName: 'Aysel Durukan', role: 'Genel Koordinator' },
    { email: 'editor@kampuscadilari.org', fullName: 'Selin Aras', role: 'Icerik Editoru' },
    { email: 'harita@kampuscadilari.org', fullName: 'Deniz Kalkan', role: 'Ag Koordinatoru' },
    { email: 'takvim@kampuscadilari.org', fullName: 'Ece Aksoy', role: 'Etkinlik Sorumlusu' },
  ];

  adminEmails.forEach(admin => {
    const result = isUserAdmin(admin.email);
    if (!result) {
      addAdminUser(admin.email, admin.fullName, admin.role);
    }
  });
}

export function seedDefaultAdminAccounts() {
  const db = getDatabase();
  const sharedPassword = process.env.ADMIN_DEFAULT_PASSWORD
    ? String(process.env.ADMIN_DEFAULT_PASSWORD).trim()
    : null;
  const accounts = [
    {
      email: 'admin@kampuscadilari.org',
      username: 'genelkoordinator',
      fullName: 'Aysel Durukan',
      role: 'Genel Koordinator',
      password:
        process.env.ADMIN_PASSWORD_ADMIN && String(process.env.ADMIN_PASSWORD_ADMIN).trim()
          ? String(process.env.ADMIN_PASSWORD_ADMIN).trim()
          : sharedPassword,
    },
    {
      email: 'editor@kampuscadilari.org',
      username: 'icerikeditoru',
      fullName: 'Selin Aras',
      role: 'Icerik Editoru',
      password:
        process.env.ADMIN_PASSWORD_EDITOR && String(process.env.ADMIN_PASSWORD_EDITOR).trim()
          ? String(process.env.ADMIN_PASSWORD_EDITOR).trim()
          : sharedPassword,
    },
    {
      email: 'harita@kampuscadilari.org',
      username: 'agkoordinatoru',
      fullName: 'Deniz Kalkan',
      role: 'Ag Koordinatoru',
      password:
        process.env.ADMIN_PASSWORD_HARITA && String(process.env.ADMIN_PASSWORD_HARITA).trim()
          ? String(process.env.ADMIN_PASSWORD_HARITA).trim()
          : sharedPassword,
    },
    {
      email: 'takvim@kampuscadilari.org',
      username: 'etkinliksorumlusu',
      fullName: 'Ece Aksoy',
      role: 'Etkinlik Sorumlusu',
      password:
        process.env.ADMIN_PASSWORD_TAKVIM && String(process.env.ADMIN_PASSWORD_TAKVIM).trim()
          ? String(process.env.ADMIN_PASSWORD_TAKVIM).trim()
          : sharedPassword,
    },
    {
      email: 'test@kampuscadilari.org',
      username: 'testadmin',
      fullName: 'Test Admin',
      role: 'Test Admin',
      password:
        process.env.TEST_ADMIN_PASSWORD && String(process.env.TEST_ADMIN_PASSWORD).trim()
          ? String(process.env.TEST_ADMIN_PASSWORD).trim()
          : sharedPassword,
    },
  ];
  const accountsWithPassword = accounts.filter((account) => account.password && account.password.length >= 8);
  if (!accountsWithPassword.length) {
    db.close();
    return;
  }

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (email, username, password_hash, full_name, role, is_active, is_verified)
      VALUES (?, ?, ?, ?, ?, 1, 1)
    `);
    const updateUser = db.prepare(`
      UPDATE users
      SET username = ?, full_name = ?, role = ?, is_active = 1, password_hash = ?
      WHERE email = ?
    `);
    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (email, full_name, role, is_active)
      VALUES (?, ?, ?, 1)
    `);
    const updateAdmin = db.prepare(`
      UPDATE admin_users
      SET full_name = ?, role = ?, is_active = 1
      WHERE email = ?
    `);

    accountsWithPassword.forEach((account) => {
      const passwordHash = bcrypt.hashSync(account.password, 12);
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(account.email);
      if (existingUser) {
        updateUser.run(account.username, account.fullName, account.role, passwordHash, account.email);
      } else {
        insertUser.run(account.email, account.username, passwordHash, account.fullName, account.role);
      }

      const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(account.email);
      if (existingAdmin) {
        updateAdmin.run(account.fullName, account.role, account.email);
      } else {
        insertAdmin.run(account.email, account.fullName, account.role);
      }
    });
  } finally {
    db.close();
  }
}

// ============================================
// APPLICATION MANAGEMENT (Bize Katıl)
// ============================================

export function seedArchiveEntries() {
  const db = getDatabase();
  try {
    const seedRows = [
      {
        publication_name: 'Kadinlar Dunyasi',
        title: 'Kadinlar Dunyasi - Esit Yurttaslik Ozel Sayisi',
        publication_year: 1913,
        decade: "1910'lar",
        focus_topic: 'Secme ve secilme hakki',
        summary:
          'Kadinlarin kamusal alanda temsiline odaklanan, hak taleplerini sistematik bicimde kayda geciren erken donem bir yayin.',
        quote_text:
          'Egitim, emek ve temsil hakki bir arada dusunulmedikce esitlik tam anlamiyla kurulamaz.',
        cover_image_url: '/archive/kadinlar-dunyasi-1913.svg',
        pdf_url: '/archive/kadinlar-dunyasi-1913.pdf',
        source_url: null,
      },
      {
        publication_name: 'Feminist',
        title: 'Feminist - Dayanisma ve Isci Haklari Dosyasi',
        publication_year: 1988,
        decade: "1980'ler",
        focus_topic: 'Isci haklari ve sendikal orgutlenme',
        summary:
          'Kadin emeginin gorunurlugunu artiran ve kampus ile isci mahalleleri arasinda ortak bir siyasal dil kuran dosya.',
        quote_text:
          'Dayanisma sadece slogan degil, emek sureclerinde kurulan somut bir guvenlik agidir.',
        cover_image_url: '/archive/feminist-1988.svg',
        pdf_url: '/archive/feminist-1988.pdf',
        source_url: null,
      },
      {
        publication_name: 'Amargi',
        title: 'Amargi - Kampus, Kent ve Medya Analizleri',
        publication_year: 2009,
        decade: "2000'ler",
        focus_topic: 'Medyada cinsiyetci dil',
        summary:
          'Haber dilini ve temsil politikalarini analiz ederek kolektif feminist medya okuryazarligi icin kaynak sunan bir secki.',
        quote_text:
          'Haber metni kadar, hangi sesin eksik birakildigi da feminist elestirinin bir parcasi olmalidir.',
        cover_image_url: '/archive/amargi-2009.svg',
        pdf_url: '/archive/amargi-2009.pdf',
        source_url: null,
      },
    ];

    const insert = db.prepare(`
      INSERT INTO newspaper_archives (
        publication_name,
        title,
        publication_year,
        decade,
        focus_topic,
        summary,
        quote_text,
        cover_image_url,
        pdf_url,
        source_url,
        status,
        reviewed_by,
        reviewed_at,
        approved_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const existingCount = db.prepare('SELECT COUNT(*) as count FROM newspaper_archives').get().count;
    const upsertPdf = db.prepare(`
      UPDATE newspaper_archives
      SET pdf_url = ?, cover_image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE title = ?
    `);

    const tx = db.transaction(() => {
      if (existingCount === 0) {
        for (const row of seedRows) {
          insert.run(
            row.publication_name,
            row.title,
            row.publication_year,
            row.decade,
            row.focus_topic,
            row.summary,
            row.quote_text,
            row.cover_image_url,
            row.pdf_url,
            row.source_url
          );
        }
      }

      for (const row of seedRows) {
        upsertPdf.run(row.pdf_url, row.cover_image_url, row.title);
      }

      db.prepare(`
        UPDATE newspaper_archives
        SET pdf_url = REPLACE(pdf_url, 'https://example.org/archive/', '/archive/'),
            updated_at = CURRENT_TIMESTAMP
        WHERE pdf_url LIKE 'https://example.org/archive/%'
      `).run();
      db.prepare(`
        UPDATE newspaper_archives
        SET pdf_url = REPLACE(pdf_url, 'https://example.com/', '/archive/'),
            updated_at = CURRENT_TIMESTAMP
        WHERE pdf_url LIKE 'https://example.com/%'
      `).run();
      db.prepare(`
        UPDATE newspaper_archives
        SET source_url = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE source_url LIKE 'https://example.%'
      `).run();
    });

    tx();
  } finally {
    db.close();
  }
}

export function createApplication(data) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      INSERT INTO applications (full_name, email, phone, province, organization, skills, social_media, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.full_name,
      data.email,
      data.phone || null,
      data.province,
      data.organization || null,
      data.skills ? JSON.stringify(data.skills) : null,
      data.social_media || null,
      data.message || null,
      'new'
    );

    createNotificationForAllAdmins({
      type: 'application',
      title: `Yeni basvuru: ${data.full_name}`,
      message: `${data.full_name} tarafindan yeni "Bize Katil" basvurusu gonderildi.`,
      related_table: 'applications',
      related_id: Number(result.lastInsertRowid),
    });

    logActivity(null, 'application_submitted', { email: data.email, province: data.province });
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getApplications(filters = {}) {
  const db = getDatabase();
  try {
    let query = 'SELECT * FROM applications WHERE 1=1';
    const params = [];

    if (filters.province) {
      query += ' AND province = ?';
      params.push(filters.province);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';
    const stmt = db.prepare(query);
    const applications = stmt.all(...params);

    return applications.map(app => ({
      ...app,
      skills: app.skills ? JSON.parse(app.skills) : [],
    }));
  } finally {
    db.close();
  }
}

export function getApplicationById(id) {
  const db = getDatabase();
  try {
    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    if (app && app.skills) {
      app.skills = JSON.parse(app.skills);
    }
    return app;
  } finally {
    db.close();
  }
}

export function updateApplicationStatus(id, status, reviewedBy = null, notes = null) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      UPDATE applications
      SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, admin_notes = ?
      WHERE id = ?
    `);
    stmt.run(status, reviewedBy || null, notes || null, id);
    logActivity(null, 'application_updated', { applicationId: id, status });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getApplicationStats() {
  const db = getDatabase();
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM applications').get().count;
    const newCount = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'new'").get().count;
    const reviewed = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status IN ('reviewed', 'approved', 'rejected')").get().count;

    return { total, new: newCount, reviewed };
  } finally {
    db.close();
  }
}

// ============================================
// EVENT PROPOSAL MANAGEMENT
// ============================================

export function createEventProposal(data) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      INSERT INTO event_proposals (title, description, proposed_by, email, province, category, date_suggested, organizer_phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.title,
      data.description || null,
      data.proposed_by,
      data.email,
      data.province || null,
      data.category || null,
      data.date_suggested || null,
      data.organizer_phone || null,
      'new'
    );

    createNotificationForAllAdmins({
      type: 'event_proposal',
      title: `Yeni etkinlik onerisi: ${data.title}`,
      message: `${data.proposed_by} tarafindan yeni bir etkinlik onerisi gonderildi.`,
      related_table: 'event_proposals',
      related_id: Number(result.lastInsertRowid),
    });

    logActivity(null, 'event_proposal_submitted', { email: data.email, title: data.title });
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getEventProposals(filters = {}) {
  const db = getDatabase();
  try {
    let query = 'SELECT * FROM event_proposals WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.province) {
      query += ' AND province = ?';
      params.push(filters.province);
    }
    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';
    const stmt = db.prepare(query);
    return stmt.all(...params);
  } finally {
    db.close();
  }
}

export function getEventProposalById(id) {
  const db = getDatabase();
  try {
    return db.prepare('SELECT * FROM event_proposals WHERE id = ?').get(id);
  } finally {
    db.close();
  }
}

function normalizeApprovedEvent(event, joinedCount) {
  const { capacity: _legacyCapacity, ...eventWithoutCapacity } = event;
  const slug = String(event.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    ...eventWithoutCapacity,
    joined_count: joinedCount,
    capacity_label: 'Sinirsiz kontenjan',
    slug,
  };
}

export function isEventProposalNameTaken(title) {
  const db = getDatabase();
  try {
    const row = db
      .prepare(`SELECT id FROM event_proposals WHERE LOWER(title) = LOWER(?) AND status != 'rejected' LIMIT 1`)
      .get(title.trim());
    return !!row;
  } finally {
    db.close();
  }
}

export function getApprovedEvents(filters = {}) {
  const db = getDatabase();
  try {
    let query = `
      SELECT ep.*
      FROM event_proposals ep
      WHERE ep.status = 'approved'
    `;
    const params = [];

    if (filters.category) {
      query += ' AND ep.category = ?';
      params.push(filters.category);
    }
    if (filters.province) {
      query += ' AND ep.province = ?';
      params.push(filters.province);
    }
    if (filters.search) {
      query += ' AND (ep.title LIKE ? OR ep.description LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term);
    }

    query += ' ORDER BY ep.created_at DESC';
    const events = db.prepare(query).all(...params);

    const countStmt = db.prepare(
      `SELECT COUNT(*) as count FROM participations WHERE event_id = ?`
    );

    return events.map((event) => normalizeApprovedEvent(event, countStmt.get(String(event.id)).count));
  } finally {
    db.close();
  }
}

export function getApprovedEventById(eventId) {
  const db = getDatabase();
  try {
    const event = db
      .prepare(`SELECT * FROM event_proposals WHERE id = ? AND status = 'approved'`)
      .get(eventId);
    if (!event) return null;

    const joined = db
      .prepare(`SELECT COUNT(*) as count FROM participations WHERE event_id = ?`)
      .get(String(event.id)).count;
    const participants = db
      .prepare(
        `SELECT participant_name, email, created_at
         FROM participations
         WHERE event_id = ?
         ORDER BY created_at DESC`
      )
      .all(String(event.id));

    return {
      ...normalizeApprovedEvent(event, joined),
      participants,
    };
  } finally {
    db.close();
  }
}

export function joinApprovedEvent({ eventId, name, email, message = null }) {
  const db = getDatabase();
  try {
    const tx = db.transaction(() => {
      const event = db
        .prepare(`SELECT * FROM event_proposals WHERE id = ? AND status = 'approved'`)
        .get(eventId);
      if (!event) return { success: false, error: 'Etkinlik bulunamadi veya onayli degil' };

      const existing = db
        .prepare(
          `SELECT id FROM participations WHERE event_id = ? AND LOWER(COALESCE(email, '')) = LOWER(?) LIMIT 1`
        )
        .get(String(eventId), email || '');
      if (existing) return { success: false, error: 'Bu etkinlige zaten katildiniz' };

      const joined = db
        .prepare(`SELECT COUNT(*) as count FROM participations WHERE event_id = ?`)
        .get(String(eventId)).count;

      const result = db.prepare(`
        INSERT INTO participations (event_id, event_title, participant_name, email, message)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        String(eventId),
        event.title,
        name || 'Anonim',
        email || null,
        message || null
      );

      return {
        success: true,
        id: result.lastInsertRowid,
        joined_count: joined + 1,
        title: event.title,
      };
    });

    const result = tx();
    if (result.success) {
      createNotificationForAllAdmins({
        type: 'participation',
        title: `Etkinlige yeni katilim: ${result.title}`,
        message: `${name || 'Bir kullanici'} etkinlige katildi.`,
        related_table: 'event_proposals',
        related_id: Number(eventId),
      });
      logActivity(null, 'participation_submitted', { eventId, email, name });
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function updateEventProposalStatus(id, status, reviewedBy = null, notes = null) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      UPDATE event_proposals
      SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, admin_notes = ?
      WHERE id = ?
    `);
    stmt.run(status, reviewedBy || null, notes || null, id);
    logActivity(null, 'event_proposal_updated', { proposalId: id, status });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getEventProposalStats() {
  const db = getDatabase();
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM event_proposals').get().count;
    const newCount = db.prepare("SELECT COUNT(*) as count FROM event_proposals WHERE status = 'new'").get().count;
    const reviewed = db.prepare("SELECT COUNT(*) as count FROM event_proposals WHERE status IN ('reviewed', 'approved', 'rejected')").get().count;

    return { total, new: newCount, reviewed };
  } finally {
    db.close();
  }
}

// Per-admin approval tracking
export function recordProposalDecision({ proposalId, adminEmail, decision, comment = null }) {
  const db = getDatabase();
  try {
    const admin = db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').get(adminEmail);
    if (!admin) {
      return { success: false, error: 'Yetkisiz admin' };
    }

    const tx = db.transaction(() => {
      const existing = db
        .prepare('SELECT id FROM event_proposal_approvals WHERE proposal_id = ? AND admin_email = ?')
        .get(proposalId, adminEmail);

      if (existing) {
        db.prepare(`
          UPDATE event_proposal_approvals
          SET decision = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(decision, comment || null, existing.id);
      } else {
        db.prepare(`
          INSERT INTO event_proposal_approvals (proposal_id, admin_email, decision, comment)
          VALUES (?, ?, ?, ?)
        `).run(proposalId, adminEmail, decision, comment || null);
      }

      // Determine new status
      const hasReject = db
        .prepare(`SELECT 1 FROM event_proposal_approvals WHERE proposal_id = ? AND decision = 'rejected' LIMIT 1`)
        .get(proposalId);
      const approvals = db
        .prepare(`SELECT COUNT(*) as count FROM event_proposal_approvals WHERE proposal_id = ? AND decision = 'approved'`)
        .get(proposalId).count;
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1').get().count;

      let status = 'reviewed';
      if (hasReject) status = 'rejected';
      else if (adminCount > 0 && approvals >= adminCount) status = 'approved';

      db.prepare(`
        UPDATE event_proposals
        SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, admin_notes = ?
        WHERE id = ?
      `).run(status, adminEmail, comment || null, proposalId);

      const proposal = db.prepare('SELECT title FROM event_proposals WHERE id = ?').get(proposalId);
      return {
        status,
        approvals,
        adminCount,
        proposalTitle: proposal?.title || null,
      };
    });

    const result = tx();
    if (result.proposalTitle) {
      createNotificationForAllAdmins({
        type: 'event_review',
        title: `Etkinlik karari: ${result.proposalTitle}`,
        message: `${adminEmail} etkinlik onerisi icin ${decision} karari verdi. Guncel durum: ${result.status}.`,
        related_table: 'event_proposals',
        related_id: Number(proposalId),
      });
    }
    logActivity(null, 'event_proposal_decision', { proposalId, adminEmail, decision, status: result.status });
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getProposalApprovals(proposalId) {
  const db = getDatabase();
  try {
    return db
      .prepare(
        `SELECT admin_email, decision, comment, created_at, updated_at
         FROM event_proposal_approvals
         WHERE proposal_id = ?
         ORDER BY updated_at DESC`
      )
      .all(proposalId);
  } finally {
    db.close();
  }
}

function resolveDecade(publicationYear) {
  const year = Number(publicationYear);
  if (!Number.isFinite(year)) return null;
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}'ler`;
}

// ============================================
// NEWSPAPER ARCHIVE MANAGEMENT
// ============================================
export function createArchiveEntry(data) {
  const db = getDatabase();
  try {
    const year = Number(data.publication_year);
    if (!Number.isFinite(year) || year < 1800 || year > 2100) {
      return { success: false, error: 'Gecerli bir yayin yili gerekli' };
    }

    const allowedStatuses = new Set(['pending', 'reviewed', 'approved', 'rejected']);
    const status = allowedStatuses.has(data.status) ? data.status : 'pending';
    const decade = data.decade || resolveDecade(year);

    const result = db.prepare(`
      INSERT INTO newspaper_archives (
        publication_name,
        title,
        publication_year,
        decade,
        focus_topic,
        summary,
        quote_text,
        cover_image_url,
        pdf_url,
        source_url,
        submitted_by,
        submitted_email,
        status,
        reviewed_by,
        reviewed_at,
        approved_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.publication_name,
      data.title,
      year,
      decade || 'Bilinmeyen',
      data.focus_topic || null,
      data.summary || null,
      data.quote_text || null,
      data.cover_image_url || null,
      data.pdf_url || null,
      data.source_url || null,
      data.submitted_by || null,
      data.submitted_email || null,
      status,
      status === 'approved' ? (data.reviewed_by || 'system') : null,
      status === 'approved' ? new Date().toISOString() : null,
      status === 'approved' ? new Date().toISOString() : null
    );

    if (status !== 'approved') {
      createNotificationForAllAdmins({
        type: 'archive_submission',
        title: `Yeni gazete arsiv kaydi: ${data.publication_name}`,
        message: `${data.submitted_by || 'Bir kullanici'} yeni bir gazete arsiv kaydi ekledi.`,
        related_table: 'newspaper_archives',
        related_id: Number(result.lastInsertRowid),
      });
    }

    logActivity(null, 'archive_entry_created', {
      archiveId: result.lastInsertRowid,
      title: data.title,
      status,
    });

    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

function sanitizeArchivePdfUrl(rawValue) {
  const pdf = String(rawValue || '').trim();
  if (!pdf) return null;
  const isExampleDomain = /^https?:\/\/(www\.)?example\.(com|org)/i.test(pdf);
  if (isExampleDomain) return null;
  const isLocalPdf = pdf.startsWith('/archive/') && pdf.toLowerCase().endsWith('.pdf');
  return isLocalPdf ? pdf : null;
}

export function getArchiveEntries(filters = {}) {
  const db = getDatabase();
  try {
    const sanitizeArchiveRow = (row) => {
      if (!row) return row;
      return {
        ...row,
        pdf_url: sanitizeArchivePdfUrl(row.pdf_url),
      };
    };

    let query = 'SELECT * FROM newspaper_archives WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.decade && filters.decade !== 'all') {
      query += ' AND decade = ?';
      params.push(filters.decade);
    }

    if (filters.search) {
      query += ' AND (publication_name LIKE ? OR title LIKE ? OR focus_topic LIKE ? OR summary LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
    }

    if (filters.focus) {
      query += ' AND focus_topic = ?';
      params.push(filters.focus);
    }

    query += ' ORDER BY publication_year DESC, created_at DESC';

    if (filters.limit) {
      const safeLimit = Math.max(1, Math.min(Number(filters.limit) || 12, 200));
      query += ` LIMIT ${safeLimit}`;
    }

    return db.prepare(query).all(...params).map(sanitizeArchiveRow);
  } finally {
    db.close();
  }
}

export function getApprovedArchiveEntries(filters = {}) {
  return getArchiveEntries({ ...filters, status: 'approved' });
}

export function getArchiveById(id) {
  const db = getDatabase();
  try {
    const row = db.prepare('SELECT * FROM newspaper_archives WHERE id = ?').get(id);
    if (!row) return row;
    return {
      ...row,
      pdf_url: sanitizeArchivePdfUrl(row.pdf_url),
    };
  } finally {
    db.close();
  }
}

export function getArchiveApprovals(archiveId) {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT admin_email, decision, comment, created_at, updated_at
      FROM newspaper_archive_approvals
      WHERE archive_id = ?
      ORDER BY updated_at DESC
    `).all(archiveId);
  } finally {
    db.close();
  }
}

export function recordArchiveDecision({ archiveId, adminEmail, decision, comment = null }) {
  const db = getDatabase();
  try {
    if (!['approved', 'rejected'].includes(decision)) {
      return { success: false, error: 'Gecersiz karar' };
    }

    const admin = db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').get(adminEmail);
    if (!admin) {
      return { success: false, error: 'Yetkisiz admin' };
    }

    const archive = db.prepare('SELECT * FROM newspaper_archives WHERE id = ?').get(archiveId);
    if (!archive) {
      return { success: false, error: 'Arsiv kaydi bulunamadi' };
    }

    const tx = db.transaction(() => {
      const existing = db
        .prepare('SELECT id FROM newspaper_archive_approvals WHERE archive_id = ? AND admin_email = ?')
        .get(archiveId, adminEmail);

      if (existing) {
        db.prepare(`
          UPDATE newspaper_archive_approvals
          SET decision = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(decision, comment || null, existing.id);
      } else {
        db.prepare(`
          INSERT INTO newspaper_archive_approvals (archive_id, admin_email, decision, comment)
          VALUES (?, ?, ?, ?)
        `).run(archiveId, adminEmail, decision, comment || null);
      }

      const hasReject = db
        .prepare(`SELECT 1 FROM newspaper_archive_approvals WHERE archive_id = ? AND decision = 'rejected' LIMIT 1`)
        .get(archiveId);
      const approvals = db
        .prepare(`SELECT COUNT(*) as count FROM newspaper_archive_approvals WHERE archive_id = ? AND decision = 'approved'`)
        .get(archiveId).count;
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1').get().count;

      let status = 'reviewed';
      if (hasReject) status = 'rejected';
      else if (adminCount > 0 && approvals >= adminCount) status = 'approved';

      db.prepare(`
        UPDATE newspaper_archives
        SET status = ?,
            reviewed_at = CURRENT_TIMESTAMP,
            reviewed_by = ?,
            approved_at = CASE WHEN ? = 'approved' THEN CURRENT_TIMESTAMP ELSE NULL END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, adminEmail, status, archiveId);

      return { status, approvals, adminCount };
    });

    const result = tx();
    createNotificationForAllAdmins({
      type: 'archive_review',
      title: `Gazete arsiv karari: ${archive.title}`,
      message: `${adminEmail} arsiv kaydi icin ${decision} karari verdi. Guncel durum: ${result.status}.`,
      related_table: 'newspaper_archives',
      related_id: Number(archiveId),
    });

    logActivity(null, 'archive_entry_decision', {
      archiveId,
      adminEmail,
      decision,
      status: result.status,
    });

    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getArchiveStats() {
  const db = getDatabase();
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM newspaper_archives').get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM newspaper_archives WHERE status IN ('pending', 'reviewed')").get().count;
    const approved = db.prepare("SELECT COUNT(*) as count FROM newspaper_archives WHERE status = 'approved'").get().count;
    return { total, pending, approved };
  } finally {
    db.close();
  }
}

export function getArticleCount() {
  const db = getDatabase();
  try {
    return db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
  } finally {
    db.close();
  }
}

// ============================================
// PARTICIPATION MANAGEMENT
// ============================================
export function createParticipation(data) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      INSERT INTO participations (event_id, event_title, participant_name, email, message)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.event_id || null, data.event_title, data.participant_name || 'Anonim', data.email || null, data.message || null);
    logActivity(null, 'participation_submitted', { event: data.event_title, email: data.email });
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getParticipations() {
  const db = getDatabase();
  try {
    return db.prepare('SELECT * FROM participations ORDER BY created_at DESC').all();
  } finally {
    db.close();
  }
}

export function getParticipationStats() {
  const db = getDatabase();
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM participations').get().count;
    return { total };
  } finally {
    db.close();
  }
}

// ============================================
// ARTICLES MANAGEMENT
// ============================================

export function getArticles(filters = {}) {
  const db = getDatabase();
  try {
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params = [];

    if (filters.status && filters.status !== 'all') {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.search) {
      const term = `%${filters.search}%`;
      query += ' AND (title LIKE ? OR excerpt LIKE ? OR body LIKE ?)';
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1').get().count;
    const approvedStmt = db.prepare(
      `SELECT COUNT(*) as count FROM article_approvals WHERE article_id = ? AND decision = 'approved'`
    );
    const rejectedStmt = db.prepare(
      `SELECT COUNT(*) as count FROM article_approvals WHERE article_id = ? AND decision = 'rejected'`
    );

    return rows.map((row) => {
      const approvedCount = approvedStmt.get(row.id).count;
      const rejectedCount = rejectedStmt.get(row.id).count;
      return {
        ...row,
        approval_summary: {
          adminCount,
          approvedCount,
          rejectedCount,
          pendingCount: Math.max(adminCount - approvedCount - rejectedCount, 0),
        },
      };
    });
  } finally {
    db.close();
  }
}

export function getPublishedArticles({ category = null, search = null } = {}) {
  const db = getDatabase();
  try {
    let query = `
      SELECT
        a.*,
        COALESCE(v.view_count, 0) as tracked_view_count
      FROM articles a
      LEFT JOIN article_view_stats v ON v.slug = a.slug
      WHERE a.status = 'published'
    `;
    const params = [];

    if (category) {
      query += ' AND a.category = ?';
      params.push(category);
    }
    if (search) {
      const term = `%${search}%`;
      query += ' AND (a.title LIKE ? OR a.excerpt LIKE ? OR a.body LIKE ?)';
      params.push(term, term, term);
    }

    query += ' ORDER BY a.created_at DESC';
    return db.prepare(query).all(...params);
  } finally {
    db.close();
  }
}

export function getArticleBySlug(slug, { publishedOnly = false } = {}) {
  const db = getDatabase();
  try {
    let query = `
      SELECT
        a.*,
        COALESCE(v.view_count, 0) as tracked_view_count
      FROM articles a
      LEFT JOIN article_view_stats v ON v.slug = a.slug
      WHERE a.slug = ?
    `;
    if (publishedOnly) {
      query += ` AND a.status = 'published'`;
    }
    return db.prepare(query).get(slug);
  } finally {
    db.close();
  }
}

export function getArticleById(id) {
  const db = getDatabase();
  try {
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    if (!article) return null;

    const approvals = db.prepare(`
      SELECT admin_email, decision, comment, created_at, updated_at
      FROM article_approvals
      WHERE article_id = ?
      ORDER BY updated_at DESC
    `).all(id);

    const comments = db.prepare(`
      SELECT id, article_id, admin_email, comment, created_at
      FROM article_comments
      WHERE article_id = ?
      ORDER BY created_at DESC
    `).all(id);

    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1').get().count;
    const approvedCount = approvals.filter((entry) => entry.decision === 'approved').length;
    const rejectedCount = approvals.filter((entry) => entry.decision === 'rejected').length;

    return {
      ...article,
      approvals,
      comments,
      approval_summary: {
        adminCount,
        approvedCount,
        rejectedCount,
        pendingCount: Math.max(adminCount - approvedCount - rejectedCount, 0),
      },
    };
  } finally {
    db.close();
  }
}

export function getArticleApprovals(articleId) {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT admin_email, decision, comment, created_at, updated_at
      FROM article_approvals
      WHERE article_id = ?
      ORDER BY updated_at DESC
    `).all(articleId);
  } finally {
    db.close();
  }
}

export function getArticleComments(articleId) {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT id, article_id, admin_email, comment, created_at
      FROM article_comments
      WHERE article_id = ?
      ORDER BY created_at DESC
    `).all(articleId);
  } finally {
    db.close();
  }
}

function normalizeArticleStatus(status) {
  if (status === 'draft') return 'draft';
  if (status === 'rejected') return 'rejected';
  return 'pending_approval';
}

export function createArticle({
  title,
  slug,
  body,
  category = null,
  status = 'pending_approval',
  excerpt = null,
  image_url = null,
  created_by = null,
}) {
  const db = getDatabase();
  try {
    const nextStatus = normalizeArticleStatus(status);
    const stmt = db.prepare(`
      INSERT INTO articles (title, slug, body, category, status, excerpt, image_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, slug, body, category, nextStatus, excerpt, image_url, created_by || null);

    if (nextStatus === 'pending_approval') {
      createNotificationForAllAdmins({
        type: 'article_submission',
        title: `Yeni yazi inceleme bekliyor: ${title}`,
        message: `${created_by || 'Bir admin'} yeni bir yazi gonderdi.`,
        related_table: 'articles',
        related_id: Number(result.lastInsertRowid),
      });
    }

    logActivity(null, 'article_created', { slug, title });
    return { success: true, id: result.lastInsertRowid, status: nextStatus };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function updateArticle({
  id,
  title,
  slug,
  body,
  category = null,
  status = 'pending_approval',
  excerpt = null,
  image_url = null,
  updated_by = null,
}) {
  const db = getDatabase();
  try {
    const current = db.prepare('SELECT id, status FROM articles WHERE id = ?').get(id);
    if (!current) {
      return { success: false, error: 'Yazi bulunamadi' };
    }

    const nextStatus = normalizeArticleStatus(status);
    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE articles
        SET title = ?,
            slug = ?,
            body = ?,
            category = ?,
            status = ?,
            excerpt = ?,
            image_url = ?,
            approved_at = CASE WHEN ? = 'published' THEN approved_at ELSE NULL END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, slug, body, category, nextStatus, excerpt, image_url, nextStatus, id);

      if (nextStatus === 'pending_approval') {
        db.prepare('DELETE FROM article_approvals WHERE article_id = ?').run(id);
      }
    });

    tx();

    if (nextStatus === 'pending_approval') {
      createNotificationForAllAdmins({
        type: 'article_resubmission',
        title: `Yazi yeniden onaya gonderildi: ${title}`,
        message: `${updated_by || 'Bir admin'} yaziyi guncelledi ve tekrar onaya gonderdi.`,
        related_table: 'articles',
        related_id: Number(id),
      });
    }

    logActivity(null, 'article_updated', { id, slug });
    return { success: true, status: nextStatus };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function deleteArticle(id) {
  const db = getDatabase();
  try {
    const article = db.prepare('SELECT slug FROM articles WHERE id = ?').get(id);
    db.prepare('DELETE FROM article_approvals WHERE article_id = ?').run(id);
    db.prepare('DELETE FROM article_comments WHERE article_id = ?').run(id);
    if (article?.slug) {
      db.prepare('DELETE FROM article_view_stats WHERE slug = ?').run(article.slug);
    }
    db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    logActivity(null, 'article_deleted', { id });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function addArticleComment({ articleId, adminEmail, comment }) {
  const db = getDatabase();
  try {
    const article = db.prepare('SELECT id, title FROM articles WHERE id = ?').get(articleId);
    if (!article) return { success: false, error: 'Yazi bulunamadi' };

    const admin = db.prepare('SELECT email FROM admin_users WHERE email = ? AND is_active = 1').get(adminEmail);
    if (!admin) return { success: false, error: 'Yetkisiz admin' };

    const result = db.prepare(`
      INSERT INTO article_comments (article_id, admin_email, comment)
      VALUES (?, ?, ?)
    `).run(articleId, adminEmail, comment);

    createNotificationForAllAdmins({
      type: 'article_comment',
      title: `Yazi ic yorumu: ${article.title}`,
      message: `${adminEmail} yazinin altina yorum ekledi.`,
      related_table: 'articles',
      related_id: Number(articleId),
    });

    logActivity(null, 'article_comment_added', { articleId, commentId: result.lastInsertRowid });
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function recordArticleDecision({ articleId, adminEmail, decision, comment = null }) {
  const db = getDatabase();
  try {
    if (!['approved', 'rejected'].includes(decision)) {
      return { success: false, error: 'Gecersiz karar' };
    }

    const admin = db.prepare('SELECT email FROM admin_users WHERE email = ? AND is_active = 1').get(adminEmail);
    if (!admin) {
      return { success: false, error: 'Yetkisiz admin' };
    }

    const article = db.prepare('SELECT id, title FROM articles WHERE id = ?').get(articleId);
    if (!article) {
      return { success: false, error: 'Yazi bulunamadi' };
    }

    const tx = db.transaction(() => {
      const existing = db
        .prepare('SELECT id FROM article_approvals WHERE article_id = ? AND admin_email = ?')
        .get(articleId, adminEmail);

      if (existing) {
        db.prepare(`
          UPDATE article_approvals
          SET decision = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(decision, comment || null, existing.id);
      } else {
        db.prepare(`
          INSERT INTO article_approvals (article_id, admin_email, decision, comment)
          VALUES (?, ?, ?, ?)
        `).run(articleId, adminEmail, decision, comment || null);
      }

      const hasReject = db
        .prepare(`SELECT 1 FROM article_approvals WHERE article_id = ? AND decision = 'rejected' LIMIT 1`)
        .get(articleId);
      const approvals = db
        .prepare(`SELECT COUNT(*) as count FROM article_approvals WHERE article_id = ? AND decision = 'approved'`)
        .get(articleId).count;
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1').get().count;

      let status = 'pending_approval';
      if (hasReject) status = 'rejected';
      else if (adminCount > 0 && approvals >= adminCount) status = 'published';

      db.prepare(`
        UPDATE articles
        SET status = ?,
            approved_at = CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE NULL END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, status, articleId);

      return { status, approvals, adminCount };
    });

    const result = tx();
    createNotificationForAllAdmins({
      type: 'article_review',
      title: `Yazi karari: ${article.title}`,
      message: `${adminEmail} yazi icin ${decision} karari verdi. Guncel durum: ${result.status}.`,
      related_table: 'articles',
      related_id: Number(articleId),
    });

    logActivity(null, 'article_decision', {
      articleId,
      adminEmail,
      decision,
      status: result.status,
    });

    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

// ============================================
// POST-IT MANAGEMENT
// ============================================

export function getPostits() {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT
        p.*,
        COUNT(pc.id) as comment_count
      FROM postits p
      LEFT JOIN postit_comments pc ON pc.postit_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();
  } finally {
    db.close();
  }
}

export function getPostitById(id) {
  const db = getDatabase();
  try {
    const postit = db.prepare('SELECT * FROM postits WHERE id = ?').get(id);
    if (!postit) return null;

    const comments = db.prepare(`
      SELECT id, postit_id, comment, author, created_at
      FROM postit_comments
      WHERE postit_id = ?
      ORDER BY created_at DESC
    `).all(id);

    const revisions = db.prepare(`
      SELECT id, postit_id, previous_title, previous_text, new_title, new_text, reason, edited_by, edited_at
      FROM postit_revisions
      WHERE postit_id = ?
      ORDER BY edited_at DESC
    `).all(id);

    return {
      ...postit,
      comments,
      revisions,
    };
  } finally {
    db.close();
  }
}

export function createPostit({ title = 'Duyuru', text, color = 'yellow', author = null, status = 'active' }) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      INSERT INTO postits (title, text, color, author, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, text, color, author, author, status);

    createNotificationForAllAdmins({
      type: 'postit_new',
      title: `Post it duvarina yeni not: ${title}`,
      message: `${author || 'Bir admin'} yeni bir not paylasti.`,
      related_table: 'postits',
      related_id: Number(result.lastInsertRowid),
    });

    logActivity(null, 'postit_created', { id: result.lastInsertRowid });
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function updatePostit({ id, title, text, color = 'yellow', status = 'active', editor = null, reason = null }) {
  const db = getDatabase();
  try {
    const current = db.prepare('SELECT * FROM postits WHERE id = ?').get(id);
    if (!current) return { success: false, error: 'Not bulunamadi' };
    if (current.created_by && editor && current.created_by !== editor) {
      return { success: false, error: 'Bu notu sadece olusturan admin duzenleyebilir' };
    }
    if (!reason || !String(reason).trim()) {
      return { success: false, error: 'Duzenleme sebebi zorunlu' };
    }

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO postit_revisions (
          postit_id,
          previous_title,
          previous_text,
          new_title,
          new_text,
          reason,
          edited_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        current.title,
        current.text,
        title || current.title,
        text || current.text,
        String(reason).trim(),
        editor || null
      );

      db.prepare(`
        UPDATE postits
        SET title = ?,
            text = ?,
            color = ?,
            status = ?,
            is_edited = 1,
            edit_reason = ?,
            edited_at = CURRENT_TIMESTAMP,
            edited_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        title || current.title,
        text || current.text,
        color,
        status,
        String(reason).trim(),
        editor || null,
        id
      );
    });

    tx();

    createNotificationForAllAdmins({
      type: 'postit_update',
      title: `Post it notu guncellendi: ${title || current.title}`,
      message: `${editor || 'Bir admin'} notu guncelledi.`,
      related_table: 'postits',
      related_id: Number(id),
    });

    logActivity(null, 'postit_updated', { id });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function addPostitComment({ postitId, comment, author = null }) {
  const db = getDatabase();
  try {
    const postit = db.prepare('SELECT id, title FROM postits WHERE id = ?').get(postitId);
    if (!postit) return { success: false, error: 'Not bulunamadi' };

    const result = db.prepare(`
      INSERT INTO postit_comments (postit_id, comment, author)
      VALUES (?, ?, ?)
    `).run(postitId, comment, author || null);

    createNotificationForAllAdmins({
      type: 'postit_comment',
      title: `Post it yorumu: ${postit.title}`,
      message: `${author || 'Bir admin'} nota yorum ekledi.`,
      related_table: 'postits',
      related_id: Number(postitId),
    });

    logActivity(null, 'postit_comment_added', { postitId, commentId: result.lastInsertRowid });
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function getPostitComments(postitId) {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT id, postit_id, comment, author, created_at
      FROM postit_comments
      WHERE postit_id = ?
      ORDER BY created_at DESC
    `).all(postitId);
  } finally {
    db.close();
  }
}

export function getPostitRevisions(postitId) {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT id, postit_id, previous_title, previous_text, new_title, new_text, reason, edited_by, edited_at
      FROM postit_revisions
      WHERE postit_id = ?
      ORDER BY edited_at DESC
    `).all(postitId);
  } finally {
    db.close();
  }
}

export function deletePostit(id) {
  const db = getDatabase();
  try {
    db.prepare('DELETE FROM postit_comments WHERE postit_id = ?').run(id);
    db.prepare('DELETE FROM postit_revisions WHERE postit_id = ?').run(id);
    db.prepare('DELETE FROM postits WHERE id = ?').run(id);
    logActivity(null, 'postit_deleted', { id });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

// Initialize database on import
initDatabase();
seedAdminUsers();
if (process.env.SEED_DEFAULT_ADMIN_ACCOUNTS === 'true') {
  seedDefaultAdminAccounts();
}
seedArchiveEntries();
