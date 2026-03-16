import mongoose, { Schema, Document } from 'mongoose';

export interface IRawMaterial extends Document {
  name: string;
  reference: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockAlert: number;
  unitCost: number;
  supplier: mongoose.Types.ObjectId | string;
  lastRestocked: Date;
  description?: string;
  location: string;
  status: 'active' | 'discontinued' | 'out_of_stock';
}

const RawMaterialSchema = new Schema<IRawMaterial>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  reference: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['fabric', 'thread', 'buttons', 'zippers', 'labels', 'packaging', 'other']
  },
  unit: {
    type: String,
    required: true,
    enum: ['meters', 'kilograms', 'pieces', 'boxes', 'rolls']
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  minStockAlert: {
    type: Number,
    required: true,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: Schema.Types.Mixed, // Allow both ObjectId and string
    required: false
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  description: String,
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'discontinued', 'out_of_stock'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
RawMaterialSchema.index({ currentStock: 1 });
RawMaterialSchema.index({ category: 1 });
RawMaterialSchema.index({ supplier: 1 });

export const RawMaterial = mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);
