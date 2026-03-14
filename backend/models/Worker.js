const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  position: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'DZD'
  },
  paymentType: {
    type: String,
    enum: ['hourly', 'salary', 'contract'],
    default: 'hourly'
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  skills: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Worker', workerSchema);
