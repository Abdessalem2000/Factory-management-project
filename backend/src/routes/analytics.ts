import express from 'express';
import {
  generateForecast,
  detectAnomalies,
  analyzeEfficiency,
  analyzeCapacity,
  getAnalyticsDashboard
} from '../controllers/analyticsController';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all analytics routes
router.use(authenticate);

// Get comprehensive analytics dashboard
router.get('/dashboard', getAnalyticsDashboard);

// Generate production forecast
router.post('/forecast', generateForecast);

// Detect production anomalies
router.get('/anomalies', detectAnomalies);

// Analyze efficiency trends
router.get('/efficiency', analyzeEfficiency);

// Analyze capacity utilization
router.get('/capacity', analyzeCapacity);

export default router;
