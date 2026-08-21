import Reading from '../models/Reading.js';
import Pump from '../models/Pump.js';
import PumpLog from '../models/PumpLog.js';
import { publishPumpCommand } from '../services/mqttService.js';

// Retrieve the latest sensor readings for a node
export const getLatestTelemetry = async (req, res) => {
  const { nodeId } = req.params;
  const numNodeId = parseInt(nodeId);

  try {
    const sensorTypes = ['Moisture', 'pH', 'NPK', 'Temp', 'Flow'];
    const readings = [];

    for (const type of sensorTypes) {
      const latest = Reading.findOne({ node_id: numNodeId, sensor_type: type });
      if (latest) {
        readings.push({
          sensor_type: latest.sensor_type,
          value_read: latest.value_read,
          reading_timestamp: latest.reading_timestamp
        });
      }
    }
    
    if (readings.length === 0) {
      return res.status(204).json({ status: 'success', message: `No telemetry found for Node ID ${nodeId}`, data: [] });
    }

    res.status(200).json({
      status: 'success',
      data: {
        node_id: nodeId,
        readings: readings
      }
    });
  } catch (err) {
    console.error('Failed to query telemetry logs:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve latest telemetry readings' });
  }
};

// Retrieve historical time-series logs for charts
export const getHistoricalTelemetry = async (req, res) => {
  const { nodeId } = req.params;
  const { sensorType, limit = 50 } = req.query;
  const numNodeId = parseInt(nodeId);

  if (!sensorType) {
    return res.status(400).json({ status: 'error', message: 'Query parameter [sensorType] is required' });
  }

  try {
    const readings = Reading.find({ 
      node_id: numNodeId, 
      sensor_type: sensorType 
    }, { limit: parseInt(limit) });

    const formatted = readings.map(r => ({
      value_read: r.value_read,
      reading_timestamp: r.reading_timestamp
    })).reverse();

    res.status(200).json({
      status: 'success',
      data: formatted
    });
  } catch (err) {
    console.error('Failed to query historical logs:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve historical telemetry logs' });
  }
};

// Manually actuate pump relays
export const triggerManualOverride = async (req, res) => {
  const { pumpId, action, durationMinutes = 0 } = req.body;

  if (!pumpId || !action || !['START', 'STOP'].includes(action)) {
    return res.status(400).json({ status: 'error', message: 'Fields [pumpId] and [action = START/STOP] are required' });
  }

  try {
    // 1. Find or create pump
    let pump = Pump.findById(pumpId);

    if (!pump) {
      console.log(`Pump ID ${pumpId} not found. Creating a default mock pump...`);
      pump = Pump.create({
        pump_name: 'Primary Well Pump',
        relay_pin: 'GPIO_25',
        max_flow_rate_lpm: 120.0,
        current_state: 'OFF'
      });
    }

    const targetState = action === 'START' ? 'ON' : 'OFF';

    // 2. Publish MQTT control command
    const mockNodeId = 1;
    const isMqttSent = publishPumpCommand(mockNodeId, action, durationMinutes);

    if (!isMqttSent) {
      return res.status(503).json({ status: 'error', message: 'MQTT Broker not available. Command cancelled.' });
    }

    // 3. Update pump state
    pump.current_state = targetState;
    Pump.save(pump);

    // 4. Log the action
    PumpLog.create({
      pump_id: pump.pump_id,
      new_state: targetState,
      trigger_source: 'Manual_Override',
      duration_minutes: durationMinutes
    });

    res.status(200).json({
      status: 'success',
      message: `Successfully sent ${action} command to pump ${pump.pump_id}`,
      data: { pumpId: pump.pump_id, currentState: targetState }
    });
  } catch (err) {
    console.error('Pump override failed:', err);
    res.status(500).json({ status: 'error', message: 'Failed to process manual override request' });
  }
};
