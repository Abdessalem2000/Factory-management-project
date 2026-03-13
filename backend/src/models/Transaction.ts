import mongoose, { Schema, Document } from 'mongoose';
import { Transaction as ITransaction } from '../types';

export interface TransactionDocument extends Omit<ITransaction, '_id'>, Document {}

const TransactionSchema = new Schema<TransactionDocument>({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  category: {
    type: String,
    enum: ['materials', 'labor', 'overhead', 'sales', 'other'],
    required: true,
  },
  amount: {
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
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reference: {
    type: String,
    trim: true,
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  productionOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductionOrder',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'check'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  attachments: [{
    type: String,
    trim: true,
  }],
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
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ supplierId: 1 });
TransactionSchema.index({ productionOrderId: 1 });
TransactionSchema.index({ amount: 1 });

// Compound index for common queries
TransactionSchema.index({ type: 1, category: 1, date: -1 });

// Pre-save middleware to validate amount
TransactionSchema.pre('save', function(next: any) {
  if (this.amount <= 0) {
    next(new Error('Transaction amount must be greater than 0'));
  } else {
    next();
  }
});

// Static method to get financial summary
TransactionSchema.statics.getFinancialSummary = async function(startDate: Date, endDate: Date) {
  const matchCondition = {
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    status: 'completed',
  };

  const pipeline = [
    { $match: matchCondition },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        income: {
          $sum: {
            $cond: [{ $eq: ['$_id', 'income'] }, '$total', 0],
          },
        },
        expenses: {
          $sum: {
            $cond: [{ $eq: ['$_id', 'expense'] }, '$total', 0],
          },
        },
        incomeCount: {
          $sum: {
            $cond: [{ $eq: ['$_id', 'income'] }, '$count', 0],
          },
        },
        expenseCount: {
          $sum: {
            $cond: [{ $eq: ['$_id', 'expense'] }, '$count', 0],
          },
        },
      },
    },
    {
      $addFields: {
        netProfit: { $subtract: ['$income', '$expenses'] },
      },
    },
  ];

  const summary = await this.aggregate(pipeline);
  return summary[0] || {
    income: 0,
    expenses: 0,
    netProfit: 0,
    incomeCount: 0,
    expenseCount: 0,
  };
};

// Static method to get category breakdown
TransactionSchema.statics.getCategoryBreakdown = async function(startDate: Date, endDate: Date, type: 'income' | 'expense') {
  const matchCondition = {
    type,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    status: 'completed',
  };

  const pipeline = [
    { $match: matchCondition },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ];

  return await this.aggregate(pipeline);
};

export const Transaction = mongoose.model<TransactionDocument>('Transaction', TransactionSchema);
