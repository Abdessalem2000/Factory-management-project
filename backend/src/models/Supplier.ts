import mongoose, { Schema, Document } from 'mongoose';
import { Supplier as ISupplier } from '../types';

export interface SupplierDocument extends Omit<ISupplier, '_id'>, Document {}

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

const SupplierSchema = new Schema<SupplierDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
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
  address: {
    type: AddressSchema,
    required: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  paymentTerms: {
    type: String,
    required: true,
    trim: true,
  },
  categories: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
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
SupplierSchema.index({ name: 1 });
SupplierSchema.index({ email: 1 });
SupplierSchema.index({ status: 1 });
SupplierSchema.index({ categories: 1 });
SupplierSchema.index({ rating: -1 });
SupplierSchema.index({ createdAt: -1 });

// Unique index on email
SupplierSchema.index({ email: 1 }, { unique: true });

// Pre-save middleware to validate rating
SupplierSchema.pre('save', function(next) {
  if (this.rating < 1 || this.rating > 5) {
    next(new Error('Rating must be between 1 and 5'));
  } else {
    next();
  }
});

// Static method to get active suppliers
SupplierSchema.statics.getActiveSuppliers = function() {
  return this.find({ status: 'active' }).sort({ name: 1 });
};

// Static method to get suppliers by category
SupplierSchema.statics.getSuppliersByCategory = function(category: string) {
  return this.find({ 
    status: 'active',
    categories: { $in: [category] }
  }).sort({ rating: -1, name: 1 });
};

// Instance method to update rating
SupplierSchema.methods.updateRating = async function(newRating: number) {
  this.rating = newRating;
  return await this.save();
};

// Virtual for getting total order value (would need to populate from orders)
SupplierSchema.virtual('totalOrderValue', {
  ref: 'SupplierOrder',
  localField: '_id',
  foreignField: 'supplierId',
  justOne: false,
});

// Virtual for getting outstanding balance
SupplierSchema.virtual('outstandingBalance', {
  ref: 'SupplierPayment',
  localField: '_id',
  foreignField: 'supplierId',
  justOne: false,
  match: { status: 'pending' }
});

export const Supplier = mongoose.model<SupplierDocument>('Supplier', SupplierSchema);
