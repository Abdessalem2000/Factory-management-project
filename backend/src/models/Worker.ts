import mongoose, { Schema, Document } from 'mongoose';
import { Worker as IWorker } from '../types';

export interface WorkerDocument extends Omit<IWorker, '_id'>, Document {}

const AddressSchema = new Schema({
  street: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: String,
    trim: true,
  },
}, { _id: false });

const EmergencyContactSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  relationship: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
}, { _id: false });

const WorkerSchema = new Schema<WorkerDocument>({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  hireDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  hourlyRate: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
  },
  paymentType: {
    type: String,
    enum: ['hourly', 'piece_rate', 'salary'],
    default: 'hourly',
  },
  address: AddressSchema,
  emergencyContact: EmergencyContactSchema,
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for better query performance
WorkerSchema.index({ employeeId: 1 });
WorkerSchema.index({ email: 1 });
WorkerSchema.index({ status: 1 });
WorkerSchema.index({ department: 1 });
WorkerSchema.index({ position: 1 });
WorkerSchema.index({ skills: 1 });
WorkerSchema.index({ createdAt: -1 });

// Unique indexes
WorkerSchema.index({ employeeId: 1 }, { unique: true });
WorkerSchema.index({ email: 1 }, { unique: true });

// Pre-save middleware to generate employee ID if not provided
WorkerSchema.pre('save', async function(next: any) {
  if (!this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for full name
WorkerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for years of service
WorkerSchema.virtual('yearsOfService').get(function() {
  const now = new Date();
  const hireDate = new Date(this.hireDate);
  const diffTime = Math.abs(now.getTime() - hireDate.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  return Math.floor(diffYears);
});

// Static method to get active workers
WorkerSchema.statics.getActiveWorkers = function() {
  return this.find({ status: 'active' }).sort({ lastName: 1, firstName: 1 });
};

// Static method to get workers by department
WorkerSchema.statics.getWorkersByDepartment = function(department: string) {
  return this.find({ 
    status: 'active',
    department 
  }).sort({ lastName: 1, firstName: 1 });
};

// Static method to get workers by skill
WorkerSchema.statics.getWorkersBySkill = function(skill: string) {
  return this.find({ 
    status: 'active',
    skills: { $in: [skill] }
  }).sort({ lastName: 1, firstName: 1 });
};

export const Worker = mongoose.model<WorkerDocument>('Worker', WorkerSchema);
