// SQLite-backed IoTNode model
import { getDb } from '../config/db.js';

const IoTNode = {
  findOneAndUpdate: ({ mac_address }, update, { upsert = false } = {}) => {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM iot_nodes WHERE mac_address = ?').get(mac_address);
    if (existing) {
      db.prepare(
        'UPDATE iot_nodes SET status = ?, last_seen = ? WHERE mac_address = ?'
      ).run(update.status || existing.status, update.last_seen ? update.last_seen.toISOString() : existing.last_seen, mac_address);
      return db.prepare('SELECT * FROM iot_nodes WHERE mac_address = ?').get(mac_address);
    } else if (upsert) {
      const info = db.prepare(
        'INSERT INTO iot_nodes (mac_address, status, last_seen) VALUES (?, ?, ?)'
      ).run(mac_address, update.status || 'Offline', update.last_seen ? update.last_seen.toISOString() : new Date().toISOString());
      return db.prepare('SELECT * FROM iot_nodes WHERE node_id = ?').get(info.lastInsertRowid);
    }
    return null;
  }
};

export default IoTNode;
