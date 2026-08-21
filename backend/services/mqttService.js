import mqtt from 'mqtt';
import IoTNode from '../models/IoTNode.js';
import Reading from '../models/Reading.js';
import dotenv from 'dotenv';

dotenv.config();

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const TELEMETRY_TOPIC = 'nodes/+/telemetry';
const STATUS_TOPIC = 'nodes/+/status';

let client = null;

export const initMqttService = () => {
  console.log(`Connecting to MQTT Broker at: ${MQTT_BROKER}...`);
  
  client = mqtt.connect(MQTT_BROKER, {
    reconnectPeriod: 5000,
    connectTimeout: 30000
  });

  client.on('connect', () => {
    console.log('Successfully connected to MQTT Broker.');
    
    client.subscribe(TELEMETRY_TOPIC, (err) => {
      if (!err) console.log(`Subscribed to topic: ${TELEMETRY_TOPIC}`);
    });
    
    client.subscribe(STATUS_TOPIC, (err) => {
      if (!err) console.log(`Subscribed to topic: ${STATUS_TOPIC}`);
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payloadString = message.toString();
      const data = JSON.parse(payloadString);
      
      const telemetryMatch = topic.match(/^nodes\/(\d+)\/telemetry$/);
      const statusMatch = topic.match(/^nodes\/(\d+)\/status$/);
      
      if (telemetryMatch) {
        const nodeId = parseInt(telemetryMatch[1]);
        handleTelemetry(nodeId, data);
      } else if (statusMatch) {
        const nodeId = parseInt(statusMatch[1]);
        handleStatus(nodeId, data);
      }
    } catch (err) {
      console.warn(`Failed to process incoming MQTT payload on topic: ${topic}. Error: ${err.message}`);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT Client Error:', err);
  });
  
  client.on('close', () => {
    console.warn('MQTT Connection closed. Reconnecting...');
  });
};

const handleTelemetry = (nodeId, data) => {
  const timestamp = data.timestamp ? new Date(data.timestamp * 1000) : new Date();
  const mac = data.mac || `MAC_MOCK_${nodeId}`;
  
  // 1. Verify or create IoT node record
  IoTNode.findOneAndUpdate(
    { mac_address: mac },
    { status: 'Online', last_seen: timestamp },
    { upsert: true, new: true }
  );

  // 2. Insert sensor readings
  const sensors = data.sensors || {};
  for (const [sensorType, val] of Object.entries(sensors)) {
    if (val === null || val === undefined) continue;
    Reading.create({
      node_id: nodeId,
      sensor_type: sensorType,
      value_read: val,
      reading_timestamp: timestamp
    });
  }

  console.log(`[MQTT] Ingested telemetry to SQLite from Node ${nodeId} at ${timestamp.toISOString()}`);
};

const handleStatus = (nodeId, data) => {
  const status = data.status || 'Offline';
  const mac = `MAC_MOCK_${nodeId}`;
  
  IoTNode.findOneAndUpdate(
    { mac_address: mac },
    { status: status, last_seen: new Date() },
    { upsert: true }
  );
  
  console.log(`[MQTT] Node ${nodeId} changed status to: ${status}`);
};

export const publishPumpCommand = (nodeId, action, durationMinutes = 0) => {
  if (!client || !client.connected) {
    console.error('MQTT publish command cancelled: broker not connected.');
    return false;
  }
  
  const topic = `nodes/${nodeId}/control`;
  const payload = JSON.stringify({
    action,
    duration_minutes: durationMinutes,
    timestamp: Math.floor(Date.now() / 1000)
  });
  
  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) console.error(`Failed to publish MQTT control command to Node ${nodeId}:`, err);
    else console.log(`[MQTT] Dispatched pump command to ${topic}: ${payload}`);
  });
  
  return true;
};
