import mongoose, { Schema, Document } from 'mongoose';
import { ProductionOrder as IProductionOrder, ProductionStage } from '../types';

interface ProductionStageDocument extends Omit<ProductionStage, 'id'> {
  _id: string;
}

export interface ProductionOrderDocument extends Omit<IProductionOrder, '_id' | 'stages'>, Document {
  stages: ProductionStageDocument[];
}

const ProductionStageSchema = new Schema<ProductionStageDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'blocked'],
    default: 'pending',
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0,
  },
  actualDuration: {
    type: Number,
    min: 0,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  assignedWorker: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  _id: true,
});

const ProductionOrderSchema = new Schema<ProductionOrderDocument>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  product: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitOfMeasure: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  stages: [ProductionStageSchema],
  assignedWorkers: [{
    type: Schema.Types.ObjectId,
    ref: 'Worker',
  }],
  estimatedCompletionDate: {
    type: Date,
  },
  actualCompletionDate: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for better query performance
ProductionOrderSchema.index({ orderNumber: 1 });
ProductionOrderSchema.index({ status: 1 });
ProductionOrderSchema.index({ priority: 1 });
ProductionOrderSchema.index({ 'assignedWorkers': 1 });
ProductionOrderSchema.index({ createdAt: -1 });
ProductionOrderSchema.index({ estimatedCompletionDate: 1 });

// Pre-save middleware to generate order number if not provided
ProductionOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `PO-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for calculating completion percentage
ProductionOrderSchema.virtual('completionPercentage').get(function() {
  if (!this.stages || this.stages.length === 0) return 0;
  const completedStages = this.stages.filter(stage => stage.status === 'completed').length;
  return Math.round((completedStages / this.stages.length) * 100);
});

// Virtual for checking if order is overdue
ProductionOrderSchema.virtual('isOverdue').get(function() {
  if (!this.estimatedCompletionDate || this.status === 'completed') return false;
  return new Date() > this.estimatedCompletionDate;
});

export const ProductionOrder = mongoose.model<ProductionOrderDocument>('ProductionOrder', ProductionOrderSchema);
