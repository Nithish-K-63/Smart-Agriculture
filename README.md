# 🌾 Smart Agriculture & Precision Irrigation System

> A full-stack IoT web dashboard for real-time farm monitoring, automated irrigation control, and AI-assisted crop management — built with React, Node.js, SQLite, and MQTT.

---

## 📋 Table of Contents

1. [What is This Project?](#1-what-is-this-project)
2. [How the System Works](#2-how-the-system-works)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Design](#5-database-design)
6. [Backend — API & Server](#6-backend--api--server)
7. [Frontend — React Dashboard](#7-frontend--react-dashboard)
8. [IoT Communication — MQTT](#8-iot-communication--mqtt)
9. [Authentication — JWT](#9-authentication--jwt)
10. [Simulation Engine](#10-simulation-engine)
11. [Irrigation Control Modes](#11-irrigation-control-modes)
12. [Alert System](#12-alert-system)
13. [Environment Configuration](#13-environment-configuration)
14. [How to Run Locally](#14-how-to-run-locally)
15. [API Reference](#15-api-reference)
16. [Default Credentials](#16-default-credentials)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. What is This Project?

The **Smart Agriculture & Precision Irrigation System** is a web-based IoT dashboard designed for small-to-medium farms. It gives farmers a single screen to:

- 📡 **Monitor** soil moisture, temperature, humidity, pH, NPK nutrients, and water flow — in real time
- 💧 **Control** irrigation pumps automatically, manually, or with AI prediction
- 🗺️ **Visualize** farm field zones on an interactive map
- 🚨 **Receive Alerts** when soil dries out, tank runs low, or hardware fails
- 📈 **Analyze Trends** through time-series sensor charts
- 🤖 **Get AI Advice** on crop health, watering schedules, and soil conditions

The system is designed to work with **ESP32 IoT field nodes** connected via the MQTT protocol. It also includes a **built-in simulation engine**, so the full dashboard works even without real hardware.

---

## 2. How the System Works

Here is the complete data flow from field sensor to farmer's screen:

```
┌─────────────────────────────────────────────────────────┐
│                   ESP32 Field Node                       │
│  Reads: Moisture | pH | Temp | NPK | Flow               │
│  Publishes MQTT every 30 seconds                        │
└──────────────────────┬──────────────────────────────────┘
                       │  MQTT (broker.emqx.io)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js + Express Backend                   │
│  - Receives MQTT telemetry                              │
│  - Saves readings to SQLite database                    │
│  - Exposes REST API (JWT-protected)                     │
│  - Sends pump commands back to ESP32 via MQTT           │
└──────────────────────┬──────────────────────────────────┘
                       │  HTTP REST (JWT Token)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              React + Vite Frontend                       │
│  - Overview | Map | AI | Nodes | Alerts                 │
│  - Displays live sensor data                            │
│  - Farmer controls pump from browser                    │
└─────────────────────────────────────────────────────────┘
```

**Step-by-step flow:**
1. ESP32 sensor node reads soil data every 30 seconds
2. Node publishes data to MQTT broker topic `nodes/{id}/telemetry`
3. Backend (mqttService.js) receives message and saves to SQLite
4. React frontend polls `/api/telemetry/latest/:nodeId` via HTTP
5. Dashboard updates charts, cards, and map in real time
6. Farmer clicks "Start Pump" → frontend calls `/api/irrigation/override`
7. Backend publishes `nodes/{id}/control { action: 'START' }` via MQTT
8. ESP32 opens the relay → water flows to the field

---

## 3. Technology Stack

| Layer | Technology | Why It's Used |
|-------|------------|---------------|
| Frontend Framework | React 18 + Vite | Fast component rendering, hot-reload dev server |
| Frontend Styling | Vanilla CSS | Custom dark theme, animations, full control |
| Charts | Recharts | Line charts for sensor history visualization |
| Icons | Lucide React | Clean icon set for the UI |
| Backend Runtime | Node.js | JavaScript on the server side |
| Backend Framework | Express.js | HTTP routing and REST API |
| Database | SQLite (better-sqlite3) | Lightweight, file-based, no server needed |
| Authentication | JWT (JSON Web Token) | Stateless, secure session tokens |
| Password Security | bcryptjs | One-way password hashing |
| IoT Protocol | MQTT (mqtt npm) | Lightweight pub/sub for sensor communication |
| Environment Config | dotenv | Secure environment variable management |

---

## 4. Project Structure

```
Smart Agriculture/
│
├── index.html                  # HTML entry point for Vite
├── vite.config.js              # Vite config (port 3000, auto-open)
├── package.json                # Frontend npm dependencies
│
├── src/                        # React frontend source code
│   ├── main.jsx                # React DOM root entry point
│   ├── App.jsx                 # Root component: auth gate + routing
│   │
│   ├── context/
│   │   └── FarmContext.jsx     # Global state + simulation engine
│   │
│   ├── components/
│   │   └── Sidebar.jsx         # Left navigation sidebar
│   │
│   ├── pages/
│   │   ├── Login.jsx           # Login and registration screen
│   │   ├── Overview.jsx        # Main dashboard: stats + charts
│   │   ├── MapView.jsx         # SVG farm field map
│   │   ├── AIRecommendations.jsx # AI crop advice panel
│   │   ├── NodeManager.jsx     # IoT node management table
│   │   └── AlertsPanel.jsx     # Alerts log with resolve actions
│   │
│   └── styles/
│       └── dashboard.css       # Global CSS design system
│
└── backend/                    # Node.js + Express server
    ├── server.js               # App entry point
    ├── schema.sql              # SQL table definitions
    ├── database.db             # SQLite database file (auto-created)
    ├── .env                    # Environment secrets (private)
    ├── .env.example            # Template for new developers
    ├── package.json            # Backend npm dependencies
    │
    ├── config/
    │   └── db.js               # DB connection + schema init + admin seed
    │
    ├── models/                 # SQLite query helpers (one per table)
    │   ├── User.js
    │   ├── Farmer.js
    │   ├── IoTNode.js
    │   ├── Reading.js
    │   ├── Pump.js
    │   └── PumpLog.js
    │
    ├── controllers/
    │   ├── authController.js       # Register + Login handlers
    │   └── telemetryController.js  # Sensor data + pump override
    │
    ├── routes/
    │   └── api.js              # All Express route definitions
    │
    ├── middleware/
    │   └── auth.js             # JWT verification middleware
    │
    └── services/
        └── mqttService.js      # MQTT subscriber + data ingestion
```

---

## 5. Database Design

The SQLite database (`backend/database.db`) contains **12 tables**:

```
users            → email, password_hash, role
farmers          → first_name, last_name, phone, language  (→ users)
farms            → farm_name, gps_location, area           (→ farmers)
crops            → crop_name, wilting_point, field_capacity, pH_range
iot_nodes        → mac_address, status, last_seen
sensors          → node_id, sensor_type, pin, calibration  (→ iot_nodes)
sensor_readings  → sensor_id, value_read, timestamp        (→ sensors)
pumps            → farm_id, pump_name, relay_pin, state    (→ farms)
pump_logs        → pump_id, new_state, trigger, duration   (→ pumps)
water_tanks      → farm_id, capacity_liters, level_%       (→ farms)
alerts           → node_id, type, severity, status         (→ iot_nodes)
activity_log     → user_id, action_type, description, ip
```

**Relationships:**
```
users → farmers → farms → pumps → pump_logs
                        → water_tanks
iot_nodes → sensors → sensor_readings
iot_nodes → alerts
```

> The database is auto-created on first backend startup. No setup needed.

---

## 6. Backend — API & Server

### Server Startup Sequence (`server.js`)

When you run `node server.js`, this happens in order:

```
1. Load environment variables from .env (dotenv)
2. Create Express app
3. Apply middleware:
   - CORS          → allow requests from frontend (port 3000)
   - JSON parser   → parse request bodies
   - Request logger → log method, URL, IP to console
4. Mount all routes under /api
5. connectDatabase()
   → Open database.db
   → Run schema.sql (CREATE TABLE IF NOT EXISTS for all 12 tables)
   → If users table is empty → seed default admin@farm.com
6. Start HTTP server on port 5000
7. initMqttService()
   → Connect to broker.emqx.io
   → Subscribe to nodes/+/telemetry and nodes/+/status
```

### Request Lifecycle

```
Browser Request
  → CORS middleware
  → JSON body parser
  → Request Logger
  → Router (api.js)
      → Public:    POST /api/auth/login
      → Public:    POST /api/auth/register
      → Protected: GET  /api/telemetry/latest/:nodeId  ← JWT verified first
      → Protected: POST /api/irrigation/override       ← JWT verified first
  → JSON Response sent back to browser
```

---

## 7. Frontend — React Dashboard

### Authentication Gate (`App.jsx`)

When the app loads, it checks `localStorage` for a saved JWT token:

```
App loads
  ├── Token found in localStorage → Show Dashboard
  └── No token → Show Login.jsx

Login success
  → Server returns JWT token
  → Token saved to localStorage
  → Dashboard renders

Logout
  → localStorage.clear()
  → Login screen shown
```

### Component Tree

```
main.jsx
  └── App.jsx
        └── FarmProvider (global state from FarmContext.jsx)
              ├── Login.jsx         (shown if not authenticated)
              └── DashboardContent  (shown if authenticated)
                    ├── Sidebar.jsx (navigation)
                    └── Active Page (one of the 6 pages below)
```

### Dashboard Pages

| Page | What It Shows |
|------|---------------|
| **Overview** | KPI stat cards (moisture, tank, pump), live moisture line chart, pump control buttons, activity log |
| **Map View** | SVG farm layout with field zones, node positions, and moisture color coding |
| **AI Recommendations** | Crop health scores, soil condition analysis, predicted irrigation schedule |
| **Node Manager** | Full table of IoT nodes — MAC address, online/offline status, all sensor readings, battery %, RSSI |
| **Alerts Panel** | Active and resolved alerts with timestamps, severity badges, and resolve buttons |
| **Login** | Email + password form with registration option |

---

## 8. IoT Communication — MQTT

MQTT is a lightweight publish/subscribe protocol built for IoT devices on low-bandwidth networks.

### Key Terms

| Term | Meaning |
|------|---------|
| **Broker** | Central relay server — we use `broker.emqx.io` (free public broker) |
| **Publisher** | ESP32 node — sends sensor data to the broker |
| **Subscriber** | Backend server — listens for messages from the broker |
| **Topic** | Named message channel, e.g. `nodes/1/telemetry` |
| **Wildcard (+)** | Matches any single topic level, e.g. `nodes/+/telemetry` |

### MQTT Topics

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `nodes/{id}/telemetry` | ESP32 → Backend | Sensor readings every 30 seconds |
| `nodes/{id}/status` | ESP32 → Backend | Node online / offline status |
| `nodes/{id}/control` | Backend → ESP32 | Pump START / STOP command |

### Telemetry Payload (from ESP32)

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

### What `mqttService.js` Does on Message

```
Message received on nodes/+/telemetry:
  1. Parse JSON payload
  2. Upsert iot_nodes row (mac_address, status=Online, last_seen=now)
  3. For each sensor in payload:
     a. Find or create sensors row
     b. INSERT new row into sensor_readings
```

---

## 9. Authentication — JWT

### What is JWT?

A **JSON Web Token** is a compact, self-contained token that proves a user's identity.
Structure: `HEADER.PAYLOAD.SIGNATURE`

### Login Flow

```
1. User enters email + password in Login.jsx
2. Frontend sends: POST /api/auth/login
3. authController.loginUser() runs:
   a. Find user by email in SQLite
   b. bcrypt.compare(inputPassword, storedHash)
   c. If match → jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '24h' })
4. Server responds: { token: "eyJ...", role, email }
5. Frontend saves token in localStorage
6. All future API requests include: Authorization: Bearer <token>
```

### JWT Verification (on every protected route)

```
middleware/auth.js:
  → Read Authorization header
  → Extract token (after "Bearer ")
  → jwt.verify(token, JWT_SECRET)
      → Valid   → attach decoded user to req.user → continue
      → Expired → return 403 Forbidden
```

### Password Security

- Passwords are **never stored as plain text**
- `bcrypt.genSalt(10)` → unique random salt generated
- `bcrypt.hash(password, salt)` → one-way irreversible hash stored
- `bcrypt.compare(input, hash)` → verifies login without decrypting

---

## 10. Simulation Engine

The frontend has a **built-in simulation engine** in `FarmContext.jsx`. This means the complete dashboard works without any real ESP32 hardware.

Every **3 seconds**, the simulation loop does:

| Step | Action | Amount |
|------|--------|--------|
| 1 | Each node loses moisture (evaporation) | −0.15% per tick |
| 2 | If rain toggle is ON, moisture increases | +0.8% per tick |
| 3 | If pump is ON, moisture increases | +0.5% per tick |
| 4 | If pump is ON, water tank drains | −0.4% per tick |
| 5 | If tank reaches 10% → pump shuts off automatically | Emergency stop |
| 6 | If moisture < wilting point → alert fires | Warning alert |
| 7 | New data point added to chart history | Chart updates live |

---

## 11. Irrigation Control Modes

Three modes are selectable from the dashboard:

### 🖐 Manual Mode
- Farmer has **full manual control**
- Pump only starts or stops when the user presses the button
- No automatic rules apply

### ⚙️ Automatic Mode
- A **rules engine** checks conditions every 3 seconds
- **Start pump when:** moisture < wilting point AND tank > 10% AND not raining
- **Stop pump when:** moisture ≥ field capacity
- Every decision is logged to the activity log with source = `Rules Engine`

### 🤖 AI-Predictive Mode
- Includes all Automatic rules, **plus:**
- **Rain Delay:** if rain is detected while irrigating → pump pauses, rain delay flag set
- Designed for integration with a live weather API in production

---

## 12. Alert System

Alerts fire automatically when critical farm conditions are detected.

### Alert Triggers

| Severity | Category | Trigger Condition |
|----------|----------|-------------------|
| ⚠️ Warning | Sensor | Soil moisture fell below wilting point |
| 🔴 Critical | Irrigation | Tank ≤ 10% → pump emergency shutdown |
| 🔴 Critical | Irrigation | User tried to start pump with empty tank |
| ⚠️ Warning | Power | Node battery voltage dropping low |

### Alert Lifecycle

```
1. addAlert('Warning', 'Sensor', 'Node 1 moisture below wilting point')
2. Alert added to alerts[] with status: 'Active'
3. addLog() → entry written to activityLogs[]
4. addToast() → popup notification appears for 5 seconds
5. User clicks "Resolve" on the Alerts Panel
6. clearAlert(id) → alert status set to 'Resolved'
7. New log entry: 'ALERT_RESOLVED' written to activityLogs[]
```

---

## 13. Environment Configuration

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
# Database mode (sqlite is active)
DB_TYPE=sqlite

# MongoDB URI (reserved for future cloud migration — not used)
MONGODB_URI=mongodb://localhost:27017/smart_agriculture

# Express server port
PORT=5000

# JWT signing secret — CHANGE THIS before deploying to production!
JWT_SECRET=smart_agri_secure_secret_key_123!

# MQTT broker URL
MQTT_BROKER=mqtt://broker.emqx.io
```

> ⚠️ **Never commit your `.env` file to Git.** Use `.env.example` to share the template.

---

## 14. How to Run Locally

### Prerequisites

- **Node.js v18+** → https://nodejs.org
- Internet connection (only needed for MQTT with real ESP32 hardware)

---

### Step 1 — Install Frontend Dependencies

```bash
cd "Smart Agriculture"
npm install
```

### Step 2 — Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 3 — Configure Environment

```bash
cd backend
copy .env.example .env
```

Edit `.env` and set your `JWT_SECRET` (or leave defaults for local dev).

### Step 4 — Start the Backend Server

Open a terminal and run:

```bash
cd backend
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

### Step 5 — Start the Frontend Dev Server

Open a **second terminal** and run:

```bash
cd "Smart Agriculture"
npm run dev
```

Browser opens automatically at → **http://localhost:3000**

### Step 6 — Log In

```
Email:    admin@farm.com
Password: admin
```

You should see the full dashboard with live simulation data.

---

## 15. API Reference

**Base URL:** `http://localhost:5000/api`

### Public Endpoints (no token needed)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | `{ email, password }` | Login → returns JWT token |
| `POST` | `/auth/register` | `{ email, password, firstName, lastName, phoneNumber, language }` | Register new farmer |
| `GET` | `/health` | — | Server health check |

### Protected Endpoints (send `Authorization: Bearer <token>`)

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| `GET` | `/telemetry/latest/:nodeId` | `nodeId` in URL | Latest reading per sensor on a node |
| `GET` | `/telemetry/history/:nodeId` | `sensorType`, `limit` in query | Historical sensor readings |
| `POST` | `/irrigation/override` | `{ pumpId, action, durationMinutes }` | Pump START or STOP |

### Example: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@farm.com\",\"password\":\"admin\"}"
```

### Example: Get Telemetry (with token)

```bash
curl http://localhost:5000/api/telemetry/latest/1 \
  -H "Authorization: Bearer <your_token_here>"
```

---

## 16. Default Credentials

The backend auto-seeds a default admin on first startup:

| Field | Value |
|-------|-------|
| Email | `admin@farm.com` |
| Password | `admin` |
| Role | Admin |

> 🔐 **Change this password before deploying to any shared or production environment.**

---

## 17. Troubleshooting

### ❌ "Internal server login error" on login page
**Cause:** Backend is not running or database failed to initialize.
```bash
cd backend
node server.js
```

---

### ❌ Backend stuck at "Connecting to SQLite Database..."
**Cause:** `better-sqlite3` package not installed correctly.
```bash
cd backend
npm install better-sqlite3
```

---

### ❌ Frontend shows blank page or "module not found"
**Cause:** Frontend dependencies not installed or dev server not running.
```bash
npm install
npm run dev
```

---

### ❌ "Failed to connect to MongoDB" in backend logs
**Cause:** Old MongoDB config leftover — this is harmless.
**Verify:** Next line should say `Target Database Mode: SQLITE`

---

### ❌ MQTT connection timeout
**Cause:** No internet access to `broker.emqx.io`.
**Fix:** Not needed for the dashboard. The simulation engine works fully without MQTT. MQTT is only required for real ESP32 hardware.

---

## 📝 Developer Notes

- The **simulation engine** in `FarmContext.jsx` makes the entire dashboard work without any real hardware
- All database model calls are **synchronous** (`better-sqlite3` design) — no `async/await` at the model layer
- JWT tokens **expire after 24 hours** — user is automatically logged out
- MQTT wildcard `nodes/+/telemetry` matches any node ID at that level
- To **add a new page**: create in `src/pages/`, import in `App.jsx`, add to `renderPage()` switch, and add to `Sidebar.jsx` nav

---

> 🌱 Built for smart, sustainable, and data-driven farming.
