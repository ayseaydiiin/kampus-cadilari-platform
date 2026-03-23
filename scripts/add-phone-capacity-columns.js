#!/usr/bin/env node
/**
 * Migration: Add missing columns to event_proposals
 * - capacity (event capacity)
 * - phone (organizer phone)
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../kampus_cadilari.db');

console.log('🔧 Migration: Add capacity & phone columns\n');

try {
  const db = new Database(DB_PATH);
  
  // Check current columns
  const before = db.prepare('PRAGMA table_info(event_proposals)').all();
  console.log('📋 Columns BEFORE:');
  before.forEach(c => console.log('  -', c.name, `(${c.type})`));
  
  // Add columns if not exist
  db.exec(`
    ALTER TABLE event_proposals ADD COLUMN capacity INTEGER DEFAULT NULL;
    ALTER TABLE event_proposals ADD COLUMN organizer_phone TEXT DEFAULT NULL;
  `);
  
  // Verify
  const after = db.prepare('PRAGMA table_info(event_proposals)').all();
  console.log('\n📋 Columns AFTER:');
  after.forEach(c => console.log('  -', c.name, `(${c.type})`));
  
  console.log('\n✅ Migration successful');
  db.close();
} catch (error) {
  if (error.message.includes('duplicate column')) {
    console.log('⚠️ Columns already exist, skipping');
    process.exit(0);
  } else {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
