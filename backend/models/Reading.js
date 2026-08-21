// SQLite-backed Reading model
import { getDb } from '../config/db.js';

const Reading = {
  // Find readings for a node/sensor, sorted newest first, optionally limited
  find: ({ node_id, sensor_type }, { sort, limit } = {}) => {
    const db = getDb();
    // For SQLite we need the node_id from iot_nodes first
    // node_id in MQTT context is the numeric node ID used to find sensor_id via sensors table
    // We store readings by sensor_id linked to node_id in iot_nodes
    // For simplicity, readings are stored with a virtual sensor lookup
    let sql = `
      SELECT sr.reading_id, sr.value_read, sr.reading_timestamp, s.sensor_type
      FROM sensor_readings sr
      JOIN sensors s ON sr.sensor_id = s.sensor_id
      WHERE s.node_id = ? AND s.sensor_type = ?
      ORDER BY sr.reading_timestamp DESC
    `;
    const params = [node_id, sensor_type];
    if (limit) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }
    return db.prepare(sql).all(...params);
  },

  findOne: ({ node_id, sensor_type }) => {
    const db = getDb();
    const result = db.prepare(`
      SELECT sr.reading_id, sr.value_read, sr.reading_timestamp, s.sensor_type
      FROM sensor_readings sr
      JOIN sensors s ON sr.sensor_id = s.sensor_id
      WHERE s.node_id = ? AND s.sensor_type = ?
      ORDER BY sr.reading_timestamp DESC
      LIMIT 1
    `).get(node_id, sensor_type);
    return result || null;
  },

  create: ({ node_id, sensor_type, value_read, reading_timestamp }) => {
    const db = getDb();
    const ts = reading_timestamp ? (reading_timestamp instanceof Date ? reading_timestamp.toISOString() : reading_timestamp) : new Date().toISOString();
    
    // Ensure IoT node exists
    let node = db.prepare('SELECT * FROM iot_nodes WHERE node_id = ?').get(node_id);
    if (!node) {
      const info = db.prepare(
        'INSERT INTO iot_nodes (mac_address, status, last_seen) VALUES (?, ?, ?)'
      ).run(`MAC_MOCK_${node_id}`, 'Online', ts);
      node = { node_id: info.lastInsertRowid };
    }

    // Ensure sensor exists for this node/type
    let sensor = db.prepare('SELECT * FROM sensors WHERE node_id = ? AND sensor_type = ?').get(node.node_id || node_id, sensor_type);
    if (!sensor) {
      const info = db.prepare(
        'INSERT INTO sensors (node_id, sensor_type, pin_configuration) VALUES (?, ?, ?)'
      ).run(node.node_id || node_id, sensor_type, 'AUTO');
      sensor = { sensor_id: info.lastInsertRowid };
    }

    const info = db.prepare(
      'INSERT INTO sensor_readings (sensor_id, value_read, reading_timestamp) VALUES (?, ?, ?)'
    ).run(sensor.sensor_id, value_read, ts);
    return { reading_id: info.lastInsertRowid, sensor_type, value_read, reading_timestamp: ts };
  }
};

export default Reading;
