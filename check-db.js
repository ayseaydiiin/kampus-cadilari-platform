import Database from 'better-sqlite3';

const db = new Database('data.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.length);
tables.forEach(t => console.log('  -', t.name));
db.close();
