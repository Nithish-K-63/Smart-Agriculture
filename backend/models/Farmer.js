// SQLite-backed Farmer model
import { getDb } from '../config/db.js';

const Farmer = {
  findOne: ({ phone_number }) => {
    const db = getDb();
    return db.prepare('SELECT * FROM farmers WHERE phone_number = ?').get(phone_number) || null;
  },

  create: ({ user_id, first_name, last_name, phone_number, preferred_language = 'EN' }) => {
    const db = getDb();
    const info = db.prepare(
      'INSERT INTO farmers (user_id, first_name, last_name, phone_number, preferred_language) VALUES (?, ?, ?, ?, ?)'
    ).run(user_id, first_name, last_name, phone_number, preferred_language);
    return { farmer_id: info.lastInsertRowid, user_id, first_name, last_name, phone_number };
  }
};

export default Farmer;
