import nodemailer from 'nodemailer';
import { Server as SocketIOServer } from 'socket.io';
import { Notification, INotification } from '../models/Notification';
import { User } from '../models/User';

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;
  private io: SocketIOServer;

  constructor(io?: SocketIOServer) {
    this.io = io!;
    
    // Configure email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Create and send notification
  async createNotification(notificationData: Partial<INotification>, createdBy: string): Promise<INotification> {
    try {
      const notification = new Notification({
        ...notificationData,
        createdBy
      });

      await notification.save();

      // Send real-time notification via WebSocket
      await this.sendRealtimeNotification(notification);

      // Send email notification for high priority or critical notifications
      if (notification.priority === 'high' || notification.priority === 'critical') {
        await this.sendEmailNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send real-time notification via WebSocket
  private async sendRealtimeNotification(notification: INotification): Promise<void> {
    if (!this.io) return;

    try {
      const recipients = await this.getNotificationRecipients(notification);

      recipients.forEach(recipient => {
        this.io.to(`user_${recipient._id}`).emit('notification', {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          category: notification.category,
          actionRequired: notification.actionRequired,
          actionUrl: notification.actionUrl,
          createdAt: notification.createdAt
        });
      });
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  // Send email notification
  private async sendEmailNotification(notification: INotification): Promise<void> {
    try {
      const recipients = await this.getNotificationRecipients(notification);
      
      for (const recipient of recipients) {
        if (recipient.email) {
          await this.emailTransporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@factory-management.com',
            to: recipient.email,
            subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
            html: this.generateEmailTemplate(notification, recipient)
          });
        }
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Get notification recipients based on target criteria
  private async getNotificationRecipients(notification: INotification): Promise<any[]> {
    let query: any = { isActive: true };

    if (notification.recipient) {
      // Specific recipient
      const user = await User.findById(notification.recipient);
      return user ? [user] : [];
    }

    if (notification.recipients && notification.recipients.length > 0) {
      // Multiple specific recipients
      return await User.find({ _id: { $in: notification.recipients }, isActive: true });
    }

    if (notification.role) {
      // All users with specific role
      query.role = notification.role;
    }

    if (notification.department) {
      // All users in specific department
      query.department = notification.department;
    }

    return await User.find(query);
  }

  // Generate email HTML template
  private generateEmailTemplate(notification: INotification, recipient: any): string {
    const priorityColors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };

    const typeIcons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .priority-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            background: ${priorityColors[notification.priority]};
          }
          .notification-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .action-button {
            display: inline-block;
            padding: 12px 30px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="notification-icon">${typeIcons[notification.type]}</div>
          <h1>${notification.title}</h1>
          <span class="priority-badge">${notification.priority} priority</span>
        </div>
        
        <div class="content">
          <p>Hello ${recipient.firstName || 'User'},</p>
          <p>${notification.message}</p>
          
          ${notification.actionRequired ? `
            <p><strong>Action Required:</strong> Please review this notification and take appropriate action.</p>
            ${notification.actionUrl ? `
              <a href="${notification.actionUrl}" class="action-button">Take Action</a>
            ` : ''}
          ` : ''}
          
          <div style="margin-top: 20px; font-size: 14px; color: #666;">
            <p><strong>Category:</strong> ${notification.category}</p>
            <p><strong>Date:</strong> ${notification.createdAt.toLocaleString()}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This notification was sent from the Factory Management System.</p>
          <p>If you have questions, please contact your system administrator.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Automated production event notifications
  async handleProductionEvent(event: {
    type: 'production_start' | 'production_complete' | 'production_pause' | 'quality_issue' | 'machine_down';
    machineId?: string;
    productId?: string;
    quantity?: number;
    shift?: string;
    metadata?: any;
  }): Promise<void> {
    const notifications = [];

    switch (event.type) {
      case 'production_start':
        notifications.push({
          title: 'Production Started',
          message: `Production has started for shift ${event.shift} on machine ${event.machineId}`,
          type: 'info' as const,
          priority: 'medium' as const,
          category: 'production' as const,
          role: 'manager',
          metadata: event.metadata
        });
        break;

      case 'production_complete':
        notifications.push({
          title: 'Production Completed',
          message: `Production completed successfully. Quantity: ${event.quantity} units`,
          type: 'success' as const,
          priority: 'medium' as const,
          category: 'production' as const,
          role: 'manager',
          metadata: event.metadata
        });
        break;

      case 'quality_issue':
        notifications.push({
          title: 'Quality Issue Detected',
          message: `Quality issue detected in production. Immediate attention required.`,
          type: 'error' as const,
          priority: 'high' as const,
          category: 'quality' as const,
          role: 'manager',
          actionRequired: true,
          metadata: event.metadata
        });
        break;

      case 'machine_down':
        notifications.push({
          title: 'Machine Down',
          message: `Machine ${event.machineId} is down. Maintenance required immediately.`,
          type: 'error' as const,
          priority: 'critical' as const,
          category: 'maintenance' as const,
          role: 'manager',
          actionRequired: true,
          metadata: event.metadata
        });
        break;
    }

    // Create all notifications
    for (const notificationData of notifications) {
      await this.createNotification(notificationData, 'system');
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId: string, options: {
    unread?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ notifications: INotification[]; total: number }> {
    const query: any = {
      $or: [
        { recipient: userId },
        { recipients: userId },
        { role: { $exists: false }, department: { $exists: false } } // Broadcast notifications
      ]
    };

    if (options.unread) {
      query.isRead = false;
    }

    const limit = options.limit || 20;
    const offset = options.offset || 0;

    const notifications = await Notification.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const total = await Notification.countDocuments(query);

    return { notifications, total };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() }
    );
  }
}

// Singleton instance
let notificationService: NotificationService;

export const getNotificationService = (io?: SocketIOServer): NotificationService => {
  if (!notificationService) {
    notificationService = new NotificationService(io);
  }
  return notificationService;
};
