import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'production' | 'maintenance' | 'quality' | 'safety' | 'system';
  recipient?: string; // User ID if specific recipient
  recipients?: string[]; // Array of user IDs for multiple recipients
  department?: string; // Department for broadcast
  role?: string; // Role for broadcast
  isRead: boolean;
  readAt?: Date;
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: any; // Additional data related to the notification
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['production', 'maintenance', 'quality', 'safety', 'system'],
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  recipients: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  department: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'worker', 'viewer']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipients: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ department: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ role: 1, isRead: 1, createdAt: -1 });

// TTL index for automatic expiration
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
