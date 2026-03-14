import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

// Apply authentication middleware to all mobile routes
router.use(authenticate);

// Mobile device registration schema
const deviceRegistrationSchema = z.object({
  deviceId: z.string(),
  deviceType: z.enum(['ios', 'android']),
  deviceModel: z.string(),
  appVersion: z.string(),
  pushToken: z.string().optional()
});

// Register mobile device
router.post('/register-device', async (req: AuthRequest, res, next) => {
  try {
    const validatedData = deviceRegistrationSchema.parse(req.body);
    
    // In a real implementation, you would store this in a Device model
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Device registered successfully',
      data: {
        deviceId: validatedData.deviceId,
        registeredAt: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    next(error);
  }
});

// Get mobile dashboard data
router.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    // Mock dashboard data - in real implementation, fetch from database
    const dashboardData = {
      user: {
        id: req.user!.id,
        role: req.user!.role
      },
      productionStats: {
        todayProduction: 1250,
        weeklyTarget: 8000,
        weeklyProgress: 65,
        efficiency: 87.5
      },
      alerts: [
        {
          id: 1,
          type: 'warning',
          message: 'Machine #3 requires maintenance',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'info',
          message: 'Production target achieved for shift A',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      quickActions: [
        { action: 'start-production', label: 'Start Production' },
        { action: 'log-maintenance', label: 'Log Maintenance' },
        { action: 'view-reports', label: 'View Reports' }
      ]
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
});

// Get production data for mobile
router.get('/production', authorize('worker', 'manager', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { date, shift } = req.query;
    
    // Mock production data
    const productionData = {
      date: date || new Date().toISOString().split('T')[0],
      shift: shift || 'A',
      metrics: {
        target: 1000,
        actual: 875,
        efficiency: 87.5,
        downtime: 45,
        quality: 98.2
      },
      timeline: [
        { time: '08:00', production: 100, status: 'normal' },
        { time: '09:00', production: 125, status: 'normal' },
        { time: '10:00', production: 95, status: 'warning' },
        { time: '11:00', production: 130, status: 'normal' },
        { time: '12:00', production: 110, status: 'normal' }
      ]
    };

    res.json({
      success: true,
      data: productionData
    });
  } catch (error) {
    next(error);
  }
});

// Submit production data from mobile
router.post('/production/submit', authorize('worker', 'manager', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const submissionSchema = z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      qualityScore: z.number().min(0).max(100),
      shift: z.enum(['A', 'B', 'C']),
      notes: z.string().optional()
    });

    const validatedData = submissionSchema.parse(req.body);

    // In real implementation, save to database
    res.status(201).json({
      success: true,
      message: 'Production data submitted successfully',
      data: {
        id: `prod_${Date.now()}`,
        ...validatedData,
        submittedBy: req.user!.id,
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    next(error);
  }
});

// Get notifications for mobile
router.get('/notifications', async (req: AuthRequest, res, next) => {
  try {
    const { unread = false, limit = 20 } = req.query;
    
    // Mock notifications
    const notifications = [
      {
        id: 1,
        title: 'Production Alert',
        message: 'Machine #2 efficiency below threshold',
        type: 'warning',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false
      },
      {
        id: 2,
        title: 'Shift Change',
        message: 'Shift B starting in 30 minutes',
        type: 'info',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true
      },
      {
        id: 3,
        title: 'Quality Alert',
        message: 'Quality inspection required for batch #1234',
        type: 'error',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false
      }
    ].filter(n => unread === 'true' ? !n.read : true).slice(0, Number(limit));

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // In real implementation, update in database
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { id, readAt: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
});

// Get user profile for mobile
router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    // Mock user profile data
    const profile = {
      id: req.user!.id,
      email: req.user!.email,
      role: req.user!.role,
      firstName: 'John',
      lastName: 'Doe',
      department: 'Production',
      phone: '+1234567890',
      permissions: req.user!.role === 'admin' ? ['all'] : ['view_production', 'submit_data']
    };

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// Mobile health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
