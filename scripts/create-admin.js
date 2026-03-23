#!/usr/bin/env node

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../kampus_cadilari.db');
const db = new Database(dbPath);

function resolvePassword(envKeys) {
  for (const key of envKeys) {
    const value = process.env[key];
    if (value && String(value).trim().length >= 8) {
      return String(value).trim();
    }
  }
  return null;
}

// Basic tables used by auth/admin flow
// Keep this minimal and idempotent for local setup.
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
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('Veritabani tablolari hazirlandi.');

const adminAccounts = [
  {
    email: 'admin@kampuscadilari.org',
    password: resolvePassword(['ADMIN_PASSWORD_ADMIN', 'ADMIN_DEFAULT_PASSWORD']),
    username: 'genelkoordinator',
    fullName: 'Aysel Durukan',
    role: 'Genel Koordinator',
  },
  {
    email: 'editor@kampuscadilari.org',
    password: resolvePassword(['ADMIN_PASSWORD_EDITOR', 'ADMIN_DEFAULT_PASSWORD']),
    username: 'icerikeditoru',
    fullName: 'Selin Aras',
    role: 'Icerik Editoru',
  },
  {
    email: 'harita@kampuscadilari.org',
    password: resolvePassword(['ADMIN_PASSWORD_HARITA', 'ADMIN_DEFAULT_PASSWORD']),
    username: 'agkoordinatoru',
    fullName: 'Deniz Kalkan',
    role: 'Ag Koordinatoru',
  },
  {
    email: 'takvim@kampuscadilari.org',
    password: resolvePassword(['ADMIN_PASSWORD_TAKVIM', 'ADMIN_DEFAULT_PASSWORD']),
    username: 'etkinliksorumlusu',
    fullName: 'Ece Aksoy',
    role: 'Etkinlik Sorumlusu',
  },
  {
    email: 'test@kampuscadilari.org',
    password: resolvePassword(['TEST_ADMIN_PASSWORD', 'ADMIN_PASSWORD_TEST', 'ADMIN_DEFAULT_PASSWORD']),
    username: 'testadmin',
    fullName: 'Test Admin',
    role: 'Test Admin',
  },
];

const missingPasswordAccounts = adminAccounts.filter((account) => !account.password).map((account) => account.email);
if (missingPasswordAccounts.length > 0) {
  console.error('\nEksik parola ortam degiskeni. Islem durduruldu.');
  console.error('Eksik hesaplar: ' + missingPasswordAccounts.join(', '));
  console.error("Ornek: ADMIN_DEFAULT_PASSWORD='GucluBirSifre' TEST_ADMIN_PASSWORD='DahaGucluBirSifre' node scripts/create-admin.js");
  db.close();
  process.exit(1);
}

let created = 0;
let updated = 0;

for (const account of adminAccounts) {
  try {
    const passwordHash = bcrypt.hashSync(account.password, 12);
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(account.email);

    if (existingUser) {
      db.prepare(`
        UPDATE users
        SET username = ?, full_name = ?, role = ?, is_active = 1, is_verified = 1, password_hash = ?
        WHERE email = ?
      `).run(account.username, account.fullName, account.role, passwordHash, account.email);
      updated += 1;
      console.log(`Guncellendi: ${account.email}`);
    } else {
      db.prepare(`
        INSERT INTO users (email, username, password_hash, full_name, role, is_active, is_verified)
        VALUES (?, ?, ?, ?, ?, 1, 1)
      `).run(account.email, account.username, passwordHash, account.fullName, account.role);
      created += 1;
      console.log(`Olusturuldu: ${account.email}`);
    }

    const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(account.email);
    if (existingAdmin) {
      db.prepare(`
        UPDATE admin_users
        SET full_name = ?, role = ?, is_active = 1
        WHERE email = ?
      `).run(account.fullName, account.role, account.email);
    } else {
      db.prepare(`
        INSERT INTO admin_users (email, full_name, role, is_active)
        VALUES (?, ?, ?, 1)
      `).run(account.email, account.fullName, account.role);
    }
  } catch (error) {
    console.error(`Hata (${account.email}): ${error.message}`);
  }
}

db.close();

console.log('\n========================================');
console.log('Seedleme tamamlandi!');
console.log('========================================');
console.log(`Olusturulan: ${created}`);
console.log(`Guncellenen: ${updated}`);
console.log('Admin Paneli: http://localhost:4321/admin/');
