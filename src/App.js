import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api'; // Proxy to backend

function App() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/workers`).then(res => {
      setWorkers(res.data);
      setLoading(false);
    });
  }, []);

  const addWorker = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.salary = parseFloat(data.salary);
    await axios.post(`${API_BASE}/workers`, data);
    e.target.reset();
    axios.get(`${API_BASE}/workers`).then(res => setWorkers(res.data));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🏭 Factory Management System</h1>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Add Worker</h2>
        <form onSubmit={addWorker} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input name="name" placeholder="Name *" required style={{ padding: '10px', flex: 1 }} />
          <input name="position" placeholder="Position *" required style={{ padding: '10px', flex: 1 }} />
          <input name="salary" type="number" placeholder="Salary *" step="0.01" required style={{ padding: '10px', width: '120px' }} />
          <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
            Add Worker
          </button>
        </form>
      </div>

      <h2>Workers ({workers.length})</h2>
      <div style={{ display: 'grid', gap: '10px' }}>
        {workers.length === 0 ? (
          <p>No workers yet. Add one above!</p>
        ) : (
          workers.map(worker => (
            <div key={worker._id} style={{ 
              padding: '15px', 
              background: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
              <strong>{worker.name}</strong> - {worker.position} 
              <span style={{ float: 'right', color: '#28a745', fontWeight: 'bold' }}>
                ${worker.salary?.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
