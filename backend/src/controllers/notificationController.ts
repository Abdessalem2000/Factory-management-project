import { Request, Response, NextFunction } from 'express';
import { getNotificationService } from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Notification creation schema
const createNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'warning', 'error', 'success']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['production', 'maintenance', 'quality', 'safety', 'system']),
  recipient: z.string().optional(),
  recipients: z.array(z.string()).optional(),
  department: z.string().optional(),
  role: z.enum(['admin', 'manager', 'worker', 'viewer']).optional(),
  actionRequired: z.boolean().default(false),
  actionUrl: z.string().optional(),
  metadata: z.any().optional(),
  expiresAt: z.string().optional()
});

// Create notification
export const createNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createNotificationSchema.parse(req.body);
    const notificationService = getNotificationService();
    
    const notification = await notificationService.createNotification(
      validatedData,
      req.user!.id
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
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
};

// Get user notifications
export const getUserNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { unread, limit = 20, offset = 0 } = req.query;
    
    const notificationService = getNotificationService();
    const result = await notificationService.getUserNotifications(req.user!.id, {
      unread: unread === 'true',
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const notificationService = getNotificationService();
    await notificationService.markAsRead(id, req.user!.id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Trigger production event notification
export const triggerProductionEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventSchema = z.object({
      type: z.enum(['production_start', 'production_complete', 'production_pause', 'quality_issue', 'machine_down']),
      machineId: z.string().optional(),
      productId: z.string().optional(),
      quantity: z.number().optional(),
      shift: z.string().optional(),
      metadata: z.any().optional()
    });

    const validatedData = eventSchema.parse(req.body);
    const notificationService = getNotificationService();
    
    await notificationService.handleProductionEvent(validatedData);

    res.json({
      success: true,
      message: 'Production event notifications sent'
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
};

// Get notification statistics
export const getNotificationStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { Notification } = await import('../models/Notification');
    
    const stats = await Notification.aggregate([
      {
        $match: {
          $or: [
            { recipient: req.user!.id },
            { recipients: req.user!.id },
            { role: { $exists: false }, department: { $exists: false } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              count: 1
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      unread: 0,
      byType: [],
      byPriority: []
    };

    // Group by type and priority
    const typeStats = result.byType.reduce((acc: any, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    const priorityStats = result.byPriority.reduce((acc: any, item: any) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: result.total,
        unread: result.unread,
        byType: typeStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification (admin only)
export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const { Notification } = await import('../models/Notification');
    await Notification.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
