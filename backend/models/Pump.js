// SQLite-backed Pump model
import { getDb } from '../config/db.js';

const Pump = {
  findById: (pump_id) => {
    const db = getDb();
    return db.prepare('SELECT * FROM pumps WHERE pump_id = ?').get(pump_id) || null;
  },

  create: ({ farm_id, pump_name, relay_pin, max_flow_rate_lpm, current_state = 'OFF' }) => {
    const db = getDb();

    // Ensure a mock farm exists if farm_id not present
    let resolvedFarmId = farm_id;
    if (!resolvedFarmId) {
      // Try to get any existing farm
      const existingFarm = db.prepare('SELECT farm_id FROM farms LIMIT 1').get();
      if (existingFarm) {
        resolvedFarmId = existingFarm.farm_id;
      } else {
        // Create a mock farmer and farm
        const farmerRow = db.prepare('SELECT farmer_id FROM farmers LIMIT 1').get();
        let farmerId = farmerRow ? farmerRow.farmer_id : null;
        if (!farmerId) {
          const userRow = db.prepare('SELECT user_id FROM users LIMIT 1').get();
          const userId = userRow ? userRow.user_id : 1;
          const fi = db.prepare(
            'INSERT INTO farmers (user_id, first_name, last_name, phone_number) VALUES (?, ?, ?, ?)'
          ).run(userId, 'Mock', 'Farmer', '0000000000');
          farmerId = fi.lastInsertRowid;
        }
        const fInfo = db.prepare(
          'INSERT INTO farms (farm_name, location_gps, total_area_hectares, farmer_id) VALUES (?, ?, ?, ?)'
        ).run('Mock Farm', '0.0,0.0', 1.0, farmerId);
        resolvedFarmId = fInfo.lastInsertRowid;
      }
    }

    const info = db.prepare(
      'INSERT INTO pumps (farm_id, pump_name, relay_pin, max_flow_rate_lpm, current_state) VALUES (?, ?, ?, ?, ?)'
    ).run(resolvedFarmId, pump_name, relay_pin, max_flow_rate_lpm, current_state);
    return { pump_id: info.lastInsertRowid, farm_id: resolvedFarmId, pump_name, relay_pin, max_flow_rate_lpm, current_state };
  },

  save: (pump) => {
    const db = getDb();
    db.prepare('UPDATE pumps SET current_state = ? WHERE pump_id = ?')
      .run(pump.current_state, pump.pump_id);
    return pump;
  }
};

export default Pump;
