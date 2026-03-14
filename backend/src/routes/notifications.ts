import express from 'express';
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  triggerProductionEvent,
  getNotificationStats,
  deleteNotification
} from '../controllers/notificationController';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authenticate);

// Get user notifications
router.get('/', getUserNotifications);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Create notification (admin/manager only)
router.post('/', authorize('admin', 'manager'), createNotification);

// Trigger production event notification
router.post('/production-event', triggerProductionEvent);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Delete notification (admin only)
router.delete('/:id', authorize('admin'), deleteNotification);

export default router;
