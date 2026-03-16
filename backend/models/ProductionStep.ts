import mongoose, { Schema, Document } from 'mongoose';

export interface IProductionStep extends Document {
  name: string;
  code: string;
  description: string;
  category: 'cutting' | 'assembly' | 'finishing' | 'quality_control' | 'packaging';
  estimatedTime: number; // in minutes
  actualTime?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedWorkers: mongoose.Types.ObjectId[];
  requiredMaterials: Array<{
    material: mongoose.Types.ObjectId;
    quantity: number;
    unit: string;
  }>;
  qualityChecks: Array<{
    name: string;
    passed: boolean;
    checkedBy?: mongoose.Types.ObjectId;
    checkedAt?: Date;
    notes?: string;
  }>;
  orderId: mongoose.Types.ObjectId;
  modelId: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  blockedReason?: string;
  efficiency?: number; // percentage
  defects?: number;
  reworkTime?: number; // in minutes
}

const ProductionStepSchema = new Schema<IProductionStep>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cutting', 'assembly', 'finishing', 'quality_control', 'packaging']
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 1
  },
  actualTime: Number,
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'blocked'],
    default: 'pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedWorkers: [{
    type: Schema.Types.ObjectId,
    ref: 'Worker'
  }],
  requiredMaterials: [{
    material: {
      type: Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true
    }
  }],
  qualityChecks: [{
    name: {
      type: String,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    checkedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: Date,
    notes: String
  }],
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  modelId: {
    type: Schema.Types.ObjectId,
    ref: 'Model',
    required: true
  },
  startDate: Date,
  endDate: Date,
  blockedReason: String,
  efficiency: {
    type: Number,
    min: 0,
    max: 100
  },
  defects: {
    type: Number,
    min: 0
  },
  reworkTime: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
ProductionStepSchema.index({ orderId: 1 });
ProductionStepSchema.index({ status: 1 });
ProductionStepSchema.index({ category: 1 });
ProductionStepSchema.index({ priority: 1 });

export const ProductionStep = mongoose.model<IProductionStep>('ProductionStep', ProductionStepSchema);
