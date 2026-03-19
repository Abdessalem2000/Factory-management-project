const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/factorydb')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// SCHEMAS
const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: String,
  salary: Number,
  hireDate: { type: Date, default: Date.now }
});
const Worker = mongoose.model('Worker', WorkerSchema);

const IncomeSchema = new mongoose.Schema({
  description: String,
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});
const Income = mongoose.model('Income', IncomeSchema);

// API ROUTES
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await Worker.find();
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workers', async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/income', async (req, res) => {
  try {
    const income = await Income.find();
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/income', async (req, res) => {
  try {
    const income = new Income(req.body);
    await income.save();
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
