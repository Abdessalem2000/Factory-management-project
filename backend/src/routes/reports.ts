import express from 'express';
import {
  generateProductionReport,
  getReportTypes,
  getReportHistory
} from '../controllers/reportController';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all report routes
router.use(authenticate);

// Get available report types
router.get('/types', getReportTypes);

// Generate reports
router.post('/generate/production', authorize('admin', 'manager'), generateProductionReport);

// Get report history
router.get('/history', getReportHistory);

export default router;
