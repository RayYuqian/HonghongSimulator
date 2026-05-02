import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(import.meta.dirname, '..', 'honghong.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    character_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    character_personality TEXT NOT NULL,
    user_gender TEXT NOT NULL,
    scenario TEXT NOT NULL,
    final_mood INTEGER NOT NULL,
    eq_score INTEGER,
    eq_summary TEXT,
    chat_history TEXT NOT NULL,
    played_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export default db;
