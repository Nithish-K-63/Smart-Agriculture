// SQLite-backed PumpLog model
import { getDb } from '../config/db.js';

const PumpLog = {
  create: ({ pump_id, new_state, trigger_source, duration_minutes = 0 }) => {
    const db = getDb();
    const info = db.prepare(
      'INSERT INTO pump_logs (pump_id, new_state, trigger_source, duration_minutes) VALUES (?, ?, ?, ?)'
    ).run(pump_id, new_state, trigger_source, duration_minutes);
    return { log_id: info.lastInsertRowid, pump_id, new_state, trigger_source, duration_minutes };
  }
};

export default PumpLog;
