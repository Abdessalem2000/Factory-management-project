import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [workers, setWorkers] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workers');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersRes, incomeRes] = await Promise.all([
        axios.get(`${API_BASE}/workers`),
        axios.get(`${API_BASE}/income`)
      ]);
      setWorkers(workersRes.data);
      setIncome(incomeRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      if (endpoint === 'workers') {
        data.salary = parseFloat(data.salary);
        await axios.post(`${API_BASE}/workers`, data);
        fetchData();
        alert('✅ Worker added successfully!');
      } else {
        data.amount = parseFloat(data.amount);
        await axios.post(`${API_BASE}/income`, data);
        fetchData();
        alert('✅ Income added successfully!');
      }
      
      e.target.reset();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const Tab = ({ label, onClick, active }) => (
    <button 
      className={`tab ${active ? 'active' : ''}`}
      onClick={() => setActiveTab(label)}
    >
      {label}
    </button>
  );

  return (
    <div className="App">
      <header>
        <h1>🏭 Factory Management System</h1>
        <div className="tabs">
          <Tab label="workers" active={activeTab === 'workers'} onClick={() => {}} />
          <Tab label="income" active={activeTab === 'income'} onClick={() => {}} />
        </div>
      </header>

      {activeTab === 'workers' && (
        <>
          <form className="form-card" onSubmit={(e) => handleSubmit(e, 'workers')}>
            <h2>Add New Worker</h2>
            <input name="name" placeholder="Full Name *" required />
            <input name="position" placeholder="Position *" required />
            <input name="salary" type="number" step="0.01" placeholder="Salary *" required />
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Worker'}
            </button>
          </form>

          <div className="data-card">
            <h2>Workers ({workers.length})</h2>
            {workers.map((worker) => (
              <div key={worker._id} className="item">
                <strong>{worker.name}</strong> - {worker.position} 
                <span>${worker.salary?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'income' && (
        <>
          <form className="form-card" onSubmit={(e) => handleSubmit(e, 'income')}>
            <h2>Add Income</h2>
            <input name="description" placeholder="Income Source *" required />
            <input name="amount" type="number" step="0.01" placeholder="Amount *" required />
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Income'}
            </button>
          </form>

          <div className="data-card">
            <h2>Total Income: ${income.reduce((sum, i) => sum + (i.amount || 0), 0).toLocaleString()}</h2>
            {income.map((item) => (
              <div key={item._id} className="item">
                {item.description} - <strong>${item.amount?.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
