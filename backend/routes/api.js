import express from 'express';
import { registerFarmer, loginUser } from '../controllers/authController.js';
import { getLatestTelemetry, getHistoricalTelemetry, triggerManualOverride } from '../controllers/telemetryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public Authentication Routes
router.post('/auth/register', registerFarmer);
router.post('/auth/login', loginUser);

// Secure Telemetry Ingestion Routes
router.get('/telemetry/latest/:nodeId', authenticateToken, getLatestTelemetry);
router.get('/telemetry/history/:nodeId', authenticateToken, getHistoricalTelemetry);

// Secure Actuator Manual Overrides
router.post('/irrigation/override', authenticateToken, triggerManualOverride);

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

export default router;
