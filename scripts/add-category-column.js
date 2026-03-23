#!/usr/bin/env node
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../kampus_cadilari.db');

const db = new Database(DB_PATH);

try {
  // Check if column exists
  const columns = db.prepare(`PRAGMA table_info(event_proposals)`).all();
  const hasCategory = columns.some(col => col.name === 'category');

  if (!hasCategory) {
    console.log('🔧 Adding category column...');
    db.exec(`ALTER TABLE event_proposals ADD COLUMN category TEXT DEFAULT 'Etkinlik';`);
    console.log('✅ category column added successfully');
  } else {
    console.log('ℹ️  category column already exists');
  }

  // Verify
  const updated = db.prepare(`PRAGMA table_info(event_proposals)`).all();
  console.log('\n📋 Current columns:');
  updated.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
