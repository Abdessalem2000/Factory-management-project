import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  reference: string;
  description: string;
  amount: number;
  category: 'raw_materials' | 'salaries' | 'utilities' | 'maintenance' | 'transport' | 'other';
  subcategory?: string;
  date: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
  status: 'pending' | 'paid' | 'cancelled';
  supplier?: mongoose.Types.ObjectId;
  invoiceNumber?: string;
  dueDate?: Date;
  tags: string[];
  approvedBy?: mongoose.Types.ObjectId;
  department: string;
  project?: string;
  recurring?: {
    isRecurring: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDate?: Date;
    endDate?: Date;
  };
}

const ExpenseSchema = new Schema<IExpense>({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['raw_materials', 'salaries', 'utilities', 'maintenance', 'transport', 'other']
  },
  subcategory: String,
  date: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'bank_transfer', 'check', 'credit_card']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  invoiceNumber: String,
  dueDate: Date,
  tags: [String],
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String,
    required: true
  },
  project: String,
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    nextDate: Date,
    endDate: Date
  }
}, {
  timestamps: true
});

// Indexes
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ amount: -1 });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
