import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api'; // Use environment variable

function App() {
  const [workers, setWorkers] = useState([]);
  const [income, setIncome] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [addingWorker, setAddingWorker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workersRes, incomeRes, dashboardRes] = await Promise.all([
          axios.get(`${API_BASE}/workers`),
          axios.get(`${API_BASE}/income`),
          axios.get(`${API_BASE}/dashboard`)
        ]);
        setWorkers(workersRes.data);
        setIncome(incomeRes.data);
        setDashboard(dashboardRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addWorker = async (e) => {
    e.preventDefault();
    setAddingWorker(true);
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.salary = parseFloat(data.salary);
      data.department = data.department || 'General';
      await axios.post(`${API_BASE}/workers`, data);
      e.target.reset();
      // Refresh data
      const [workersRes, dashboardRes] = await Promise.all([
        axios.get(`${API_BASE}/workers`),
        axios.get(`${API_BASE}/dashboard`)
      ]);
      setWorkers(workersRes.data);
      setDashboard(dashboardRes.data);
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Error adding worker. Please try again.');
    } finally {
      setAddingWorker(false);
    }
  };

  const addIncome = async (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.amount = parseFloat(data.amount);
      data.type = data.type || 'Revenue';
      await axios.post(`${API_BASE}/income`, data);
      e.target.reset();
      // Refresh data
      const [incomeRes, dashboardRes] = await Promise.all([
        axios.get(`${API_BASE}/income`),
        axios.get(`${API_BASE}/dashboard`)
      ]);
      setIncome(incomeRes.data);
      setDashboard(dashboardRes.data);
    } catch (error) {
      console.error('Error adding income:', error);
      alert('Error adding income. Please try again.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>🏭 Loading Factory Management System...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #2563eb', paddingBottom: '20px' }}>
        <h1 style={{ color: '#1e40af', fontSize: '2.5em', margin: '0' }}>🏭 Factory Management System</h1>
        <p style={{ color: '#64748b', fontSize: '1.2em', margin: '10px 0 0 0' }}>Real-time Production & Financial Dashboard</p>
      </header>

      {/* Dashboard Stats for Investors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>👥 Total Workers</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{dashboard.workers || 0}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>💰 Total Income</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>${(dashboard.totalIncome || 0).toLocaleString()}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>💵 Total Salary</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>${(dashboard.totalSalary || 0).toLocaleString()}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>📊 Avg Salary</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>${Math.round(dashboard.avgSalary || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Add Worker Form */}
      <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>👤 Add New Worker</h2>
        <form onSubmit={addWorker} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <input name="name" placeholder="Full Name *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
          <input name="position" placeholder="Position *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
          <input name="department" placeholder="Department" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
          <input name="salary" type="number" placeholder="Salary *" step="1000" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
          <button type="submit" disabled={addingWorker} style={{ 
            padding: '12px 24px', 
            background: addingWorker ? '#64748b' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: addingWorker ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s'
          }}>
            {addingWorker ? 'Adding...' : '➕ Add Worker'}
          </button>
        </form>
      </div>

      {/* Add Income Form */}
      <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>💰 Add Income</h2>
        <form onSubmit={addIncome} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <input name="description" placeholder="Income Source *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
          <input name="amount" type="number" placeholder="Amount *" step="1000" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
          <select name="type" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
            <option value="Revenue">Revenue</option>
            <option value="Service">Service</option>
            <option value="Rental">Rental</option>
            <option value="Other">Other</option>
          </select>
          <button type="submit" style={{ 
            padding: '12px 24px', 
            background: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            💵 Add Income
          </button>
        </form>
      </div>

      {/* Workers List */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>👥 Workers ({workers.length})</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {workers.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No workers yet. Add one above!</p>
          ) : (
            workers.map(worker => (
              <div key={worker._id} style={{ 
                padding: '15px', 
                background: '#f8fafc', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.3s'
              }}>
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '1.1em' }}>{worker.name}</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{worker.position} • {worker.department || 'General'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                    ${worker.salary?.toLocaleString()}
                  </span>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                    {new Date(worker.hireDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Income List */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>💰 Income Records ({income.length})</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {income.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No income records yet. Add one above!</p>
          ) : (
            income.map(item => (
              <div key={item._id} style={{ 
                padding: '15px', 
                background: '#f8fafc', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.3s'
              }}>
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '1.1em' }}>{item.description}</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{item.type || 'Revenue'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                    ${item.amount?.toLocaleString()}
                  </span>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
