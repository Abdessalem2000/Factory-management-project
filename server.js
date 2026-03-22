const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Factory Backend is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/health', (req, res) => { 
  res.json({ 
    status: 'healthy', 
    mongodb: mongoose.connection.readyState === 1 
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const Worker = mongoose.model('Worker', new mongoose.Schema({
  name: String, position: String, salary: Number
}));

const Income = mongoose.model('Income', new mongoose.Schema({
  description: String, amount: Number
}));

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

app.listen(process.env.PORT || 10000, () => {
  console.log('🚀 Backend LIVE!');
});
