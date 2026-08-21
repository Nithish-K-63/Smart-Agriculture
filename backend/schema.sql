-- SQL Schema for Smart Agriculture and Precision Irrigation System

-- 1. Users Profile Table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('Admin', 'Farmer', 'Researcher')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmer Profiles Table
CREATE TABLE IF NOT EXISTS farmers (
    farmer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    preferred_language TEXT DEFAULT 'EN',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Farms Table
CREATE TABLE IF NOT EXISTS farms (
    farm_id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_name TEXT NOT NULL,
    location_gps TEXT NOT NULL,
    total_area_hectares REAL NOT NULL,
    farmer_id INTEGER NOT NULL,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE
);

-- 4. Crop Configuration Table
CREATE TABLE IF NOT EXISTS crops (
    crop_id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_name TEXT NOT NULL UNIQUE,
    wilting_point REAL NOT NULL,
    field_capacity REAL NOT NULL,
    optimal_ph_min REAL NOT NULL,
    optimal_ph_max REAL NOT NULL
);

-- 5. IoT Nodes Table
CREATE TABLE IF NOT EXISTS iot_nodes (
    node_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mac_address TEXT NOT NULL UNIQUE,
    status TEXT CHECK(status IN ('Online', 'Offline', 'Fault')) DEFAULT 'Offline',
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sensors Register Table
CREATE TABLE IF NOT EXISTS sensors (
    sensor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    sensor_type TEXT CHECK(sensor_type IN ('Moisture', 'pH', 'NPK', 'Temp', 'Flow')) NOT NULL,
    pin_configuration TEXT NOT NULL,
    calibration_offset REAL DEFAULT 0.0,
    calibration_slope REAL DEFAULT 1.0,
    FOREIGN KEY (node_id) REFERENCES iot_nodes(node_id) ON DELETE CASCADE,
    UNIQUE(node_id, sensor_type)
);

-- 7. Sensor Readings (Telemetry Log) Table
CREATE TABLE IF NOT EXISTS sensor_readings (
    reading_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER NOT NULL,
    value_read REAL NOT NULL,
    reading_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE
);

-- 8. Pumps Actuator Table
CREATE TABLE IF NOT EXISTS pumps (
    pump_id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER NOT NULL,
    pump_name TEXT NOT NULL,
    relay_pin TEXT NOT NULL,
    max_flow_rate_lpm REAL NOT NULL,
    current_state TEXT CHECK(current_state IN ('ON', 'OFF', 'FAULT')) DEFAULT 'OFF',
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE
);

-- 9. Pump State Transition Logs Table
CREATE TABLE IF NOT EXISTS pump_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pump_id INTEGER NOT NULL,
    new_state TEXT NOT NULL,
    trigger_source TEXT NOT NULL, -- Manual, Auto, AI
    duration_minutes INTEGER DEFAULT 0,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pump_id) REFERENCES pumps(pump_id) ON DELETE CASCADE
);

-- 10. Water Storage Tanks Table
CREATE TABLE IF NOT EXISTS water_tanks (
    tank_id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER NOT NULL,
    capacity_liters REAL NOT NULL,
    current_level_percent REAL NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE
);

-- 11. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL, -- Dry Run, Low battery, Low Water Tank
    severity TEXT CHECK(severity IN ('Info', 'Warning', 'Critical')) NOT NULL,
    status TEXT CHECK(status IN ('Active', 'Resolved')) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (node_id) REFERENCES iot_nodes(node_id) ON DELETE CASCADE
);

-- 12. Activity Log Table (Audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action_type TEXT NOT NULL,
    action_description TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
