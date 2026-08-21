// SQLite-backed User model
import { getDb } from '../config/db.js';

const User = {
  findOne: ({ email }) => {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) || null;
  },

  countDocuments: () => {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
  },

  create: ({ email, password_hash, role }) => {
    const db = getDb();
    const info = db.prepare(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
    ).run(email.toLowerCase(), password_hash, role || 'Farmer');
    return { _id: info.lastInsertRowid, email, role };
  }
};

export default User;
