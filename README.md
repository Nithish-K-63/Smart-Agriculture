# 🌾 Smart Agriculture & Precision Irrigation System

A full-stack IoT dashboard for real-time farm monitoring and automated irrigation control.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| IoT Protocol | MQTT |

---

## 📁 Project Structure

```
Smart Agriculture/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── context/FarmContext.jsx   # Global state + simulation
│   ├── components/Sidebar.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Overview.jsx
│   │   ├── MapView.jsx
│   │   ├── AIRecommendations.jsx
│   │   ├── NodeManager.jsx
│   │   └── AlertsPanel.jsx
│   └── styles/dashboard.css
└── backend/
    ├── server.js
    ├── schema.sql
    ├── database.db
    ├── .env.example
    ├── config/db.js
    ├── models/
    ├── controllers/
    ├── routes/api.js
    ├── middleware/auth.js
    └── services/mqttService.js
```

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js v18+ → https://nodejs.org

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Start Backend
```bash
cd backend
node server.js
```
> Runs on: http://localhost:5000

### 4. Start Frontend
```bash
npm run dev
```
> Opens at: http://localhost:3000

---

## 🔑 Default Login

| Field | Value |
|-------|-------|
| Email | admin@farm.com |
| Password | admin |

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login, returns JWT |
| POST | `/auth/register` | ❌ | Register new farmer |
| GET | `/health` | ❌ | Server health check |
| GET | `/telemetry/latest/:nodeId` | ✅ | Latest sensor readings |
| GET | `/telemetry/history/:nodeId` | ✅ | Sensor history |
| POST | `/irrigation/override` | ✅ | Pump START / STOP |

---

## 📊 Dashboard Pages

| Page | Description |
|------|-------------|
| Overview | KPI cards, moisture chart, pump control |
| Map View | Farm field layout with node positions |
| AI Recommendations | Crop health scores & irrigation schedule |
| Node Manager | IoT node status, sensors, battery, RSSI |
| Alerts Panel | Active & resolved alerts log |

---

## 🔧 Environment Setup

Copy `backend/.env.example` to `backend/.env`:

```env
DB_TYPE=sqlite
PORT=5000
JWT_SECRET=your_secret_key_here
MQTT_BROKER=mqtt://broker.emqx.io
```

> ⚠️ Never commit `.env` to Git.

---

## ❗ Troubleshooting

| Problem | Fix |
|---------|-----|
| Login error | Start the backend: `node server.js` |
| Blank frontend | Run `npm install` then `npm run dev` |
| SQLite error | Run `cd backend && npm install better-sqlite3` |
| MQTT timeout | Not needed — simulation works without hardware |

---

> Built for smart, sustainable, and data-driven farming. 🌱
