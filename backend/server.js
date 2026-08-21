import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { initMqttService } from './services/mqttService.js';
import connectDatabase from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client dashboard origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log incoming REST API calls
app.use((req, res, next) => {
  console.log(`[REST] ${req.method} ${req.url} - Client IP: ${req.ip}`);
  next();
});

// Mount routes
app.use('/api', apiRouter);

// Express Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong inside the server'
  });
});

// Bootstrapping Server
const bootServer = async () => {
  // 1. Establish Cloud MongoDB connection
  await connectDatabase();

  // 2. Start server listener
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  Smart Agriculture Backend active on port: ${PORT}  `);
    console.log(`  REST Endpoints: http://localhost:${PORT}/api      `);
    console.log(`  Target Database Mode: SQLITE                      `);
    console.log(`==================================================`);
    
    // 3. Initialize background MQTT telemetry ingestion
    try {
      initMqttService();
    } catch (err) {
      console.error('[WARN] Failed to start MQTT subscriber service:', err.message);
    }
  });
};

// Graceful Shutdown Handler
const handleGracefulShutdown = () => {
  console.log('\nShutting down backend services gracefully...');
  setTimeout(() => process.exit(0), 3000);
};

process.on('SIGINT', handleGracefulShutdown);
process.on('SIGTERM', handleGracefulShutdown);

// Start
bootServer();
