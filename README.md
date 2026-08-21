# Smart Agriculture and Precision Irrigation System

A full-stack IoT dashboard for real-time farm monitoring, automated irrigation control, and AI-assisted crop management.

---

## Table of Contents

1. Project Overview
2. System Architecture
3. Technology Stack
4. Project Structure
5. Core Concepts Explained
   - 5.1 Frontend - React + Vite
   - 5.2 Backend - Node.js + Express
   - 5.3 Database - SQLite
   - 5.4 Authentication - JWT
   - 5.5 MQTT Protocol - IoT Communication
   - 5.6 State Management - React Context API
   - 5.7 Simulation Engine
   - 5.8 Control Modes
   - 5.9 Alert System
6. Database Schema
7. REST API Reference
8. Frontend Pages
9. Environment Configuration
10. How to Run Locally
11. Data Flow - End to End
12. Default Credentials
13. Troubleshooting

---

## 1. Project Overview

The Smart Agriculture and Precision Irrigation System is a web-based IoT dashboard that:

- Monitors soil moisture, temperature, humidity, pH, NPK nutrients, and water flow in real time
- Controls irrigation pumps automatically, manually, or via AI prediction
- Communicates with physical ESP32 field nodes using the MQTT protocol
- Alerts farmers when critical thresholds (wilting point, tank level, battery) are breached
- Visualizes time-series telemetry data as line charts for trend analysis

The system is designed for small-to-medium farms with multiple field zones, each equipped with an ESP32 IoT node and soil sensors.

---

## 2. System Architecture

```
+--------------------------------------------------------------------------+
|                          FARMER'S BROWSER                                |
|   React + Vite Frontend   (http://localhost:3000)                        |
|   [ Overview ] [ Map View ] [ AI ] [ Nodes ] [ Alerts ]                 |
+-------------------------------|------------------------------------------+
                                | HTTP REST (JWT)
+-------------------------------v------------------------------------------+
|              Node.js + Express Backend  (http://localhost:5000)           |
|   [ Auth Routes ] [ Telemetry Routes ] [ Pump Override Routes ]           |
|   [ SQLite Database - database.db ]                                       |
|   [ MQTT Subscriber Service ] <---- IoT Nodes (ESP32) via broker.emqx.io |
+--------------------------------------------------------------------------+
                    MQTT Publish
              [ ESP32 Field Nodes ]
              [ Node 1 | Node 2 | Node 3 ]
              [ Sensors: Moisture, pH, NPK, Temp, Flow ]
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 + Vite | UI component rendering, fast dev server |
| Frontend Styling | Vanilla CSS | Custom design system, dark theme, animations |
| Charts | Recharts | Time-series line charts for sensor history |
| Icons | Lucide React | Icon components throughout UI |
| Backend Runtime | Node.js | JavaScript server-side runtime |
| Backend Framework | Express.js | HTTP routing, middleware, REST API |
| Database | SQLite (better-sqlite3) | Embedded, file-based relational database |
| Authentication | JWT (JSON Web Tokens) | Stateless session tokens |
| Password Hashing | bcryptjs | Secure one-way password storage |
| IoT Protocol | MQTT (mqtt npm package) | Lightweight pub/sub for sensor data |
| Environment Config | dotenv | Secure environment variable loading |

---

## 4. Project Structure

```
Smart Agriculture/
|
+-- index.html              # HTML entry point (Vite)
+-- vite.config.js          # Vite config (port 3000, auto-open)
+-- package.json            # Frontend dependencies
|
+-- src/                    # React frontend source
|   +-- main.jsx            # React DOM entry point
|   +-- App.jsx             # Root component (auth gate + routing)
|   |
|   +-- context/
|   |   +-- FarmContext.jsx # Global state + simulation engine
|   |
|   +-- components/
|   |   +-- Sidebar.jsx     # Navigation sidebar
|   |
|   +-- pages/
|   |   +-- Login.jsx             # Login / Register screen
|   |   +-- Overview.jsx          # Main dashboard: stats + charts
|   |   +-- MapView.jsx           # Farm field map visualization
|   |   +-- AIRecommendations.jsx # AI crop advice panel
|   |   +-- NodeManager.jsx       # IoT node management table
|   |   +-- AlertsPanel.jsx       # Alerts log and management
|   |
|   +-- styles/
|       +-- dashboard.css   # Global CSS design system
|
+-- backend/                # Node.js/Express backend
    +-- server.js           # Express app entry point
    +-- database.db         # SQLite database file
    +-- schema.sql          # SQL table definitions
    +-- .env                # Environment variables (private)
    +-- .env.example        # Template for new developers
    +-- package.json        # Backend dependencies
    |
    +-- config/
    |   +-- db.js           # SQLite connection + schema init + admin seed
    |
    +-- models/             # SQLite query helper objects
    |   +-- User.js         # users table queries
    |   +-- Farmer.js       # farmers table queries
    |   +-- IoTNode.js      # iot_nodes table queries
    |   +-- Reading.js      # sensor_readings table queries
    |   +-- Pump.js         # pumps table queries
    |   +-- PumpLog.js      # pump_logs table queries
    |
    +-- controllers/
    |   +-- authController.js     # register + login handlers
    |   +-- telemetryController.js# telemetry read + pump override
    |
    +-- routes/
    |   +-- api.js          # Express route definitions
    |
    +-- middleware/
    |   +-- auth.js         # JWT verification middleware
    |
    +-- services/
        +-- mqttService.js  # MQTT subscriber + telemetry ingestion
```

---

## 5. Core Concepts Explained

### 5.1 Frontend - React + Vite

React is a JavaScript library for building user interfaces from reusable components.
Vite is an ultra-fast build tool and dev server. It compiles files on-demand instead of bundling everything upfront.

Component tree:
```
main.jsx
  App.jsx (Root component)
    FarmProvider    <-- wraps everything in global state
    Login.jsx       <-- shown if NOT authenticated
    DashboardContent <-- shown if authenticated
      Sidebar       <-- navigation menu
      [Active Page] <-- Overview / MapView / AI / Nodes / Alerts
```

How the authentication gate works:
- App.jsx checks localStorage for a saved JWT token on load
- If token found -> show the dashboard
- If no token -> show Login.jsx
- On login success -> token saved to localStorage, dashboard renders
- On logout -> localStorage.clear() called, login screen shown

---

### 5.2 Backend - Node.js + Express

The backend is a REST API server built with Express.js.

Request lifecycle:
```
Browser Request
  -> CORS middleware        (allow cross-origin requests)
  -> JSON body parser       (parse request body)
  -> Request Logger         (log method, URL, IP)
  -> Router (api.js)
      -> [Public]    POST /api/auth/login
      -> [Public]    POST /api/auth/register
      -> [Protected] GET  /api/telemetry/latest/:nodeId
      -> [Protected] POST /api/irrigation/override
  -> JSON Response sent to browser
```

server.js boot sequence:
```
Step 1. Load .env with dotenv
Step 2. Set up Express middleware (CORS, JSON, Logger)
Step 3. Mount /api routes
Step 4. connectDatabase()
         -> Open database.db
         -> Run schema.sql (CREATE TABLE IF NOT EXISTS)
         -> Seed admin@farm.com if users table is empty
Step 5. Start HTTP listener on PORT 5000
Step 6. initMqttService()
         -> Connect to broker.emqx.io
         -> Subscribe to telemetry and status topics
```

---

### 5.3 Database - SQLite

SQLite is a lightweight, file-based relational database.
No separate database server is needed. The entire database lives in one file: database.db.

This project uses better-sqlite3 - the fastest synchronous SQLite driver for Node.js.
Since it is synchronous, no async/await is needed for database calls.

config/db.js startup steps:
```
1. Open database.db with better-sqlite3
2. Enable foreign keys: PRAGMA foreign_keys = ON
3. Enable WAL mode: PRAGMA journal_mode = WAL
4. Execute schema.sql -> creates all 12 tables if they dont exist
5. Check if users table is empty
   -> If empty: hash 'admin' with bcrypt
   -> Insert default admin@farm.com record
```

Model files (models/*.js) are plain JavaScript objects wrapping SQL statements:
```js
// Example: User.findOne({ email })  runs:
//   SELECT * FROM users WHERE email = ?
//   Returns one row object, or null
```

---

### 5.4 Authentication - JWT

JWT (JSON Web Token) is a compact token that proves a user's identity.
Structure: HEADER.PAYLOAD.SIGNATURE

Login flow step by step:
```
1. User enters email + password in Login.jsx
2. Frontend sends POST /api/auth/login
3. authController.loginUser() runs:
   a. User.findOne({ email }) -- queries SQLite
   b. bcrypt.compare(password, user.password_hash)
   c. If match -> jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '24h' })
4. Server returns: { token: "Bearer eyJ...", role, email }
5. Frontend stores token in localStorage
6. All future API calls include header: Authorization: Bearer <token>
```

JWT verification (middleware/auth.js) on every protected route:
```
-> Read Authorization header
-> Extract token (everything after "Bearer ")
-> jwt.verify(token, JWT_SECRET)
   -> Valid: attach decoded user to req.user, call next()
   -> Invalid/Expired: return 403 Forbidden
```

bcrypt password security:
- Passwords are NEVER stored as plain text
- bcrypt.genSalt(10) generates a unique random salt
- bcrypt.hash(password, salt) creates an irreversible one-way hash
- bcrypt.compare(input, storedHash) verifies login without decrypting

---

### 5.5 MQTT Protocol - IoT Communication

MQTT (Message Queuing Telemetry Transport) is a lightweight pub/sub protocol designed for IoT devices on low-bandwidth networks.

Key terms:
| Term | Meaning |
|------|---------|
| Broker | Central relay server (we use broker.emqx.io - free public broker) |
| Publisher | ESP32 node - sends sensor data to broker |
| Subscriber | Backend server - listens for messages from broker |
| Topic | Named message channel e.g. nodes/1/telemetry |
| Wildcard (+) | Matches any single topic level |
| QoS 1 | "At least once" delivery guarantee |

Topic structure:
| Topic | Direction | Purpose |
|-------|-----------|---------|
| nodes/{id}/telemetry | ESP32 -> Backend | Sensor readings every 30s |
| nodes/{id}/status | ESP32 -> Backend | Online / Offline status |
| nodes/{id}/control | Backend -> ESP32 | Pump START / STOP command |

Telemetry payload published by ESP32:
```json
{
  "mac": "AA:BB:CC:DD:EE:FF",
  "timestamp": 1720000000,
  "sensors": {
    "Moisture": 24.5,
    "pH": 6.3,
    "Temp": 32.5,
    "NPK": 45,
    "Flow": 15.4
  }
}
```

mqttService.js message handling:
```
On message received:
1. Parse JSON payload
2. Check topic pattern
3. If telemetry match:
   a. Upsert iot_nodes row (mac_address, status=Online, last_seen)
   b. For each sensor: find/create sensors row
   c. INSERT into sensor_readings
4. If status match:
   a. Upsert iot_nodes with new status value
```

---

### 5.6 State Management - React Context API

React Context API shares state across the entire component tree without prop-drilling.

FarmContext.jsx is the central brain of the frontend:

```
FarmProvider (wraps the entire app)
|
+-- State Variables
|   +-- controlMode      'Manual' | 'Automatic' | 'AI-Predictive'
|   +-- waterTankLevel   Current tank % (0 to 100)
|   +-- pumpState        'ON' | 'OFF' | 'FAULT'
|   +-- flowRate         Water flow in L/min
|   +-- isRaining        Boolean rain simulation toggle
|   +-- nodes[]          Array of 3 IoT nodes with all sensor readings
|   +-- alerts[]         Active + resolved farm alerts
|   +-- activityLogs[]   Full audit trail of all system events
|   +-- historyData[]    Last 5 moisture data points for line chart
|   +-- toasts[]         Temporary popup notifications (5 seconds)
|
+-- Action Functions
|   +-- togglePump(state)  Start or stop irrigation pump (with safety checks)
|   +-- refillTank()       Reset water tank to 100%
|   +-- addAlert()         Create a new alert entry
|   +-- clearAlert(id)     Mark an alert as Resolved
|   +-- addLog()           Append record to activity audit log
|   +-- addToast()         Show a 5-second popup notification
|
+-- Simulation Loop (useEffect + setInterval every 3 seconds)
    +-- Decrease soil moisture (evaporation simulation)
    +-- Increase moisture if pump ON or rain detected
    +-- Drain tank when pump is ON
    +-- Fire alerts at threshold boundaries
    +-- Append moisture data point to chart history
```

Usage in any component:
```js
const { pumpState, togglePump, waterTankLevel } = useFarm();
```

---

### 5.7 Simulation Engine

The frontend has a built-in simulation engine in FarmContext.jsx.
Every 3 seconds, the setInterval loop does:

| Step | Action | Amount |
|------|--------|--------|
| 1 | Each node loses moisture (evaporation) | -0.15% per tick |
| 2 | If raining, moisture increases | +0.8% per tick |
| 3 | If pump is ON, moisture increases | +0.5% per tick |
| 4 | If pump is ON, tank level decreases | -0.4% per tick |
| 5 | If tank reaches 10%, pump shuts off automatically | Emergency stop |
| 6 | If moisture < wiltingPoint, Warning alert fires | Alert triggered |
| 7 | New data point added to historyData[] for chart | Chart updates live |

This means the full dashboard works without any real ESP32 hardware.

---

### 5.8 Control Modes

Three irrigation control modes selectable from the dashboard:

MANUAL MODE:
- Farmer has full control
- Pump only starts/stops when user explicitly presses the button
- No automatic rules run

AUTOMATIC MODE:
- Rules Engine checks conditions every 3 seconds
- Start pump when: moisture < wiltingPoint AND tank > 10% AND not raining
- Stop pump when: moisture >= fieldCapacity
- Every decision logged to activityLogs[] with source = 'Rules Engine'

AI-PREDICTIVE MODE:
- Includes all Automatic rules, PLUS:
- Rain Delay: if rain detected while irrigating, pump pauses, rainDelayActive = true
- Designed for integration with a live weather API in production

---

### 5.9 Alert System

Alerts fire automatically when critical farm conditions occur.

| Severity | Module | Trigger |
|----------|--------|---------|
| Warning | Sensor | Soil moisture fell below Wilting Point |
| Critical | Irrigation | Tank reached <=10%, pump emergency shutdown |
| Critical | Irrigation | User tried to start pump with tank too low |
| Warning | Power | Node battery voltage dropping |

Alert lifecycle:
```
1. addAlert('Warning', 'Sensor', 'Node 1 moisture below wilting point')
2. Alert added to alerts[] with status: 'Active'
3. addLog() called -> entry in activityLogs[]
4. addToast() called -> popup appears on screen for 5 seconds
5. User clicks "Resolve" on AlertsPanel
6. clearAlert(id) -> alert status set to 'Resolved'
7. New log: 'ALERT_RESOLVED' written to activityLogs[]
```

---

## 6. Database Schema

The SQLite database (database.db) has 12 tables:

```
users            email, password_hash, role
farmers          first_name, last_name, phone_number, preferred_language -> users
farms            farm_name, location_gps, total_area_hectares -> farmers
crops            crop_name, wilting_point, field_capacity, pH range
iot_nodes        mac_address, status, last_seen
sensors          node_id, sensor_type, pin, calibration -> iot_nodes
sensor_readings  sensor_id, value_read, reading_timestamp -> sensors
pumps            farm_id, pump_name, relay_pin, flow_rate, current_state -> farms
pump_logs        pump_id, new_state, trigger_source, duration -> pumps
water_tanks      farm_id, capacity_liters, current_level_percent -> farms
alerts           node_id, alert_type, severity, status -> iot_nodes
activity_log     user_id, action_type, action_description, ip_address
```

Relationships:
```
users -> farmers -> farms -> pumps -> pump_logs
                          -> water_tanks
iot_nodes -> sensors -> sensor_readings
iot_nodes -> alerts
```

---

## 7. REST API Reference

Base URL: http://localhost:5000/api

### Public Endpoints (no token required)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | /auth/login | { email, password } | Log in, receive JWT token |
| POST | /auth/register | { email, password, firstName, lastName, phoneNumber, language } | Register farmer |
| GET | /health | none | Server health check |

### Protected Endpoints (JWT required in Authorization header)

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | /telemetry/latest/:nodeId | nodeId in path | Latest reading per sensor on a node |
| GET | /telemetry/history/:nodeId | sensorType, limit (query) | Historical time-series readings |
| POST | /irrigation/override | { pumpId, action, durationMinutes } | Pump START or STOP |

Login example:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@farm.com\",\"password\":\"admin\"}"
```

Protected request example:
```bash
curl http://localhost:5000/api/telemetry/latest/1 \
  -H "Authorization: Bearer <your_token_here>"
```

---

## 8. Frontend Pages

| Page | Nav Key | What It Shows |
|------|---------|---------------|
| Login | (pre-auth) | Email + password form. Link to registration |
| Overview | overview | KPI stat cards, moisture line chart, pump control panel, activity log |
| Map View | map | SVG farm field layout with node positions and moisture color coding |
| AI Recommendations | ai | Crop health scores, soil analysis, predicted irrigation schedule |
| Node Manager | nodes | Full table of IoT nodes: MAC, status, all sensor readings, battery, RSSI |
| Alerts Panel | alerts | Active + resolved alerts with resolve buttons and audit trail |

---

## 9. Environment Configuration

File: backend/.env

```
# Database mode (sqlite is the active one)
DB_TYPE=sqlite

# MongoDB URI (not used currently - for future cloud migration)
MONGODB_URI=mongodb://localhost:27017/smart_agriculture

# Express server port
PORT=5000

# JWT signing secret - CHANGE THIS in production!
JWT_SECRET=smart_agri_secure_secret_key_123!

# MQTT broker
MQTT_BROKER=mqtt://broker.emqx.io
```

IMPORTANT: Never commit your .env file to git. Share .env.example instead.

---

## 10. How to Run Locally

### Prerequisites
- Node.js v18 or newer (includes npm): https://nodejs.org
- Internet connection (optional - only needed for MQTT with real hardware)

---

### Step 1 - Open the project folder
```
cd "c:\Users\Nithish\OneDrive\Documents\Smart Agriculture"
```

### Step 2 - Install frontend dependencies
```
npm install
```

### Step 3 - Install backend dependencies
```
cd backend
npm install
cd ..
```

### Step 4 - Start the backend server (new terminal)
```
cd "c:\Users\Nithish\OneDrive\Documents\Smart Agriculture\backend"
node server.js
```

Expected output:
```
Connecting to SQLite Database...
Successfully connected to SQLite and schema initialized.
==================================================
  Smart Agriculture Backend active on port: 5000
  REST Endpoints: http://localhost:5000/api
  Target Database Mode: SQLITE
==================================================
Connecting to MQTT Broker at: mqtt://broker.emqx.io...
Successfully connected to MQTT Broker.
```

### Step 5 - Start the frontend dev server (another terminal)
```
cd "c:\Users\Nithish\OneDrive\Documents\Smart Agriculture"
npm run dev
```

Browser opens at: http://localhost:3000

### Step 6 - Log in
Email:    admin@farm.com
Password: admin

---

## 11. Data Flow - End to End

```
[ESP32 Hardware]
  1. ESP32 reads sensors every 30 seconds
     Moisture=24.5%, pH=6.3, Temp=32.5C
  
  2. ESP32 publishes MQTT message
     Topic:   nodes/1/telemetry
     Payload: { mac, timestamp, sensors: { Moisture, pH, Temp } }
              |
              | (via broker.emqx.io)
              v
[Backend - Node.js]
  3. mqttService.js receives message
     -> Upsert iot_nodes (mac_address, status=Online, last_seen)
     -> For each sensor: find/create sensors row
     -> INSERT into sensor_readings
  
  4. React polls GET /api/telemetry/latest/1
     -> Query sensor_readings JOIN sensors WHERE node_id=1
     -> Return latest value per sensor type
              |
              | (HTTP with JWT)
              v
[Frontend - React]
  5. FarmContext updates nodes[] state
     -> Overview.jsx re-renders stat cards + line chart
  
  6. Simulation engine runs every 3s (demo mode without hardware)
     -> Adjusts moisture, tank, triggers alerts
  
  7. User presses "Start Pump"
     -> togglePump('ON') in FarmContext
     -> POST /api/irrigation/override { pumpId:1, action:'START' }
     -> Backend publishes: nodes/1/control { action:'START' }
     -> ESP32 opens relay -> water flows to field
```

---

## 12. Default Credentials

The backend seeds a default admin account on first startup with empty database:

| Field | Value |
|-------|-------|
| Email | admin@farm.com |
| Password | admin |
| Role | Admin |

Change this password before deploying to any shared or production environment.

---

## 13. Troubleshooting

### "Internal server login error" on the login page
Cause: Backend not running or database failed to initialize.
Fix:
```
cd "c:\Users\Nithish\OneDrive\Documents\Smart Agriculture\backend"
node server.js
```

---

### Backend stuck at "Connecting to SQLite Database..."
Cause: better-sqlite3 package not installed.
Fix:
```
cd backend
npm install better-sqlite3
```

---

### Frontend shows blank page or module not found
Cause: Vite dev server not running.
Fix:
```
cd "c:\Users\Nithish\OneDrive\Documents\Smart Agriculture"
npm install
npm run dev
```

---

### "Failed to connect to MongoDB" in backend logs
Cause: Old MongoDB config leftover. This is harmless.
Verify: Check the next line shows "Target Database Mode: SQLITE"

---

### MQTT connection timeout
Cause: No internet access to broker.emqx.io.
Fix: Not needed for dashboard. The simulation engine works without MQTT.
     MQTT is only needed for real ESP32 hardware.

---

## Developer Notes

- The simulation engine in FarmContext.jsx makes the entire dashboard work without hardware
- All DB model calls are synchronous (better-sqlite3 design) - no async/await at model layer
- JWT tokens expire after 24 hours - user is automatically logged out
- MQTT wildcard nodes/+/telemetry matches any node ID at that level
- To add a new page: create in src/pages/, import in App.jsx, add to renderPage() switch and Sidebar.jsx nav

---

Built for smart, sustainable, and data-driven farming.
