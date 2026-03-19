const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const Worker = mongoose.model('Worker', new mongoose.Schema({
  name: String, position: String, salary: Number
}));

const Income = mongoose.model('Income', new mongoose.Schema({
  description: String, amount: Number
}));

app.get('/api/workers', async (req, res) => res.json(await Worker.find()));
app.post('/api/workers', async (req, res) => {
  const worker = new Worker(req.body);
  await worker.save();
  res.json(worker);
});

app.get('/api/income', async (req, res) => res.json(await Income.find()));
app.post('/api/income', async (req, res) => {
  const income = new Income(req.body);
  await income.save();
  res.json(income);
});

app.listen(process.env.PORT || 10000, () => {
  console.log('🚀 Backend LIVE!');
});
