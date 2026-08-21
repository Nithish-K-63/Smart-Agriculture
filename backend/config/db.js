import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'database.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'schema.sql');

let db = null;

export const getDb = () => {
  if (!db) throw new Error('Database not initialized. Call connectDatabase() first.');
  return db;
};

export const connectDatabase = async () => {
  try {
    console.log('Connecting to SQLite Database...');
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    console.log('Successfully connected to SQLite and schema initialized.');

    // Seed default admin
    await seedDefaultAdmin();
  } catch (err) {
    console.error('Failed to connect to SQLite:', err.message);
    throw err;
  }
};

const seedDefaultAdmin = async () => {
  try {
    const count = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
    if (count.cnt === 0) {
      console.log('Seeding default administrator account...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin', salt);
      db.prepare(
        `INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`
      ).run('admin@farm.com', passwordHash, 'Admin');
      console.log('Successfully seeded default credentials: admin@farm.com / admin');
    }
  } catch (err) {
    console.error('Failed to seed default admin:', err.message);
  }
};

export default connectDatabase;
