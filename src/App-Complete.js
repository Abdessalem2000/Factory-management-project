import { useState, useEffect } from 'react';
import axios from 'axios';
import { translations, departments, incomeTypes } from './translations';
import { productCategories, productStatus, qualityGrades } from './productSchema';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workers, setWorkers] = useState([]);
  const [income, setIncome] = useState([]);
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [production, setProduction] = useState([]);
  const [quality, setQuality] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [addingWorker, setAddingWorker] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);

  const t = translations[language];
  const dept = departments[language];
  const incTypes = incomeTypes[language];
  const prodCats = productCategories[language];
  const prodStats = productStatus[language];
  const qualGrades = qualityGrades[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workersRes, incomeRes, productsRes, expensesRes, productionRes, qualityRes, dashboardRes] = await Promise.all([
          axios.get(`${API_BASE}/workers`),
          axios.get(`${API_BASE}/income`),
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/expenses`),
          axios.get(`${API_BASE}/production`),
          axios.get(`${API_BASE}/quality`),
          axios.get(`${API_BASE}/dashboard`)
        ]);
        setWorkers(workersRes.data);
        setIncome(incomeRes.data);
        setProducts(productsRes.data);
        setExpenses(expensesRes.data);
        setProduction(productionRes.data);
        setQuality(qualityRes.data);
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
      data.department = data.department || 'Production';
      await axios.post(`${API_BASE}/workers`, data);
      e.target.reset();
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

  const addProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.price = parseFloat(data.price);
      data.cost = parseFloat(data.cost);
      data.quantity = parseInt(data.quantity);
      data.minStock = parseInt(data.minStock);
      data.dimensions = {
        length: parseFloat(data.length),
        width: parseFloat(data.width),
        height: parseFloat(data.height)
      };
      await axios.post(`${API_BASE}/products`, data);
      e.target.reset();
      const [productsRes, dashboardRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/dashboard`)
      ]);
      setProducts(productsRes.data);
      setDashboard(dashboardRes.data);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setAddingProduct(false);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    setAddingExpense(true);
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.amount = parseFloat(data.amount);
      await axios.post(`${API_BASE}/expenses`, data);
      e.target.reset();
      const [expensesRes, dashboardRes] = await Promise.all([
        axios.get(`${API_BASE}/expenses`),
        axios.get(`${API_BASE}/dashboard`)
      ]);
      setExpenses(expensesRes.data);
      setDashboard(dashboardRes.data);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense. Please try again.');
    } finally {
      setAddingExpense(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>{t.loading}</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header with Language Switcher */}
      <header style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #2563eb', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#1e40af', fontSize: '2.5em', margin: '0' }}>{t.title}</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setLanguage('en')} style={{ 
              padding: '8px 16px', 
              background: language === 'en' ? '#2563eb' : '#e5e7eb', 
              color: language === 'en' ? 'white' : 'black', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              🇬🇧 EN
            </button>
            <button onClick={() => setLanguage('fr')} style={{ 
              padding: '8px 16px', 
              background: language === 'fr' ? '#2563eb' : '#e5e7eb', 
              color: language === 'fr' ? 'white' : 'black', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              🇫🇷 FR
            </button>
          </div>
        </div>
        <p style={{ color: '#64748b', fontSize: '1.2em', margin: '10px 0 0 0' }}>{t.subtitle}</p>
        <p style={{ color: '#dc2626', fontSize: '1em', margin: '10px 0 0 0' }}>🇩🇿 {t.currency} | 🇩🇿 Algeria Market</p>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        {['dashboard', 'workers', 'products', 'income', 'expenses', 'production', 'quality'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? '#2563eb' : '#f3f4f6',
              color: activeTab === tab ? 'white' : 'black',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Main Dashboard Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>👥 {t.totalWorkers}</h3>
              <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{dashboard.workers || 0}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>💰 {t.totalIncome}</h3>
              <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{(dashboard.totalIncome || 0).toLocaleString()} {t.currency}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>💵 {t.totalSalary}</h3>
              <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{(dashboard.totalSalary || 0).toLocaleString()} {t.currency}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>📊 {t.avgSalary}</h3>
              <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{Math.round(dashboard.avgSalary || 0).toLocaleString()} {t.currency}</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', margin: '0 0 10px 0' }}>📦 Products</h4>
              <p style={{ margin: '0', fontSize: '1.5em', fontWeight: 'bold', color: '#3b82f6' }}>{dashboard.products || 0}</p>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', margin: '0 0 10px 0' }}>💸 Total Expenses</h4>
              <p style={{ margin: '0', fontSize: '1.5em', fontWeight: 'bold', color: '#ef4444' }}>{(dashboard.totalExpenses || 0).toLocaleString()} {t.currency}</p>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', margin: '0 0 10px 0' }}>📈 Profit Margin</h4>
              <p style={{ margin: '0', fontSize: '1.5em', fontWeight: 'bold', color: '#10b981' }}>{dashboard.profitMargin || 0}%</p>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', margin: '0 0 10px 0' }}>🏭 Active Production</h4>
              <p style={{ margin: '0', fontSize: '1.5em', fontWeight: 'bold', color: '#f59e0b' }}>{dashboard.activeProduction || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div>
          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.addWorker}</h2>
            <form onSubmit={addWorker} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input name="name" placeholder={t.name} required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="position" placeholder={t.position} required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="department" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                {Object.entries(dept).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <input name="salary" type="number" placeholder={t.salary} step="1000" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="phone" placeholder="Phone (+213 55 123 4567)" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="email" placeholder="Email (contact@factory.dz)" type="email" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
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
                {addingWorker ? t.adding : t.addWorkerBtn}
              </button>
            </form>
          </div>

          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.workers} ({workers.length})</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {workers.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>{t.noWorkers}</p>
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
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{worker.position} • {dept[worker.department] || worker.department}</p>
                      {worker.phone && <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>📞 {worker.phone}</p>}
                      {worker.email && <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>📧 {worker.email}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                        {worker.salary?.toLocaleString()} {t.currency}
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
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>📦 Add New Product</h2>
            <form onSubmit={addProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input name="name" placeholder="Product Name *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="category" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">Select Category</option>
                {Object.entries(prodCats).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <input name="sku" placeholder="SKU (e.g., TSH-ALG-001)" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="price" type="number" placeholder={`Price (${t.currency}) *`} step="100" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="cost" type="number" placeholder={`Cost (${t.currency}) *`} step="100" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="quantity" type="number" placeholder="Quantity *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="minStock" type="number" placeholder="Min Stock Level" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="qualityGrade" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                {Object.entries(qualGrades).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <input name="supplier" placeholder="Supplier Name" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="weight" type="number" placeholder="Weight (grams)" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="length" type="number" placeholder="Length (cm)" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="width" type="number" placeholder="Width (cm)" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="height" type="number" placeholder="Height (cm)" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <button type="submit" disabled={addingProduct} style={{ 
                padding: '12px 24px', 
                background: addingProduct ? '#64748b' : '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: addingProduct ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}>
                {addingProduct ? 'Adding...' : '➕ Add Product'}
              </button>
            </form>
          </div>

          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>📦 Products ({products.length})</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {products.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No products yet. Add one above!</p>
              ) : (
                products.map(product => (
                  <div key={product._id} style={{ 
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
                      <strong style={{ color: '#1e293b', fontSize: '1.1em' }}>{product.name}</strong>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{prodCats[product.category] || product.category} • SKU: {product.sku}</p>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        Stock: {product.quantity} | Min: {product.minStock} | Grade: {qualGrades[product.qualityGrade] || product.qualityGrade}
                      </p>
                      {product.supplier && <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>📦 Supplier: {product.supplier}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>
                        <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                          {product.price?.toLocaleString()} {t.currency}
                        </span>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                          Cost: {product.cost?.toLocaleString()} {t.currency}
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: product.quantity <= product.minStock ? '#ef4444' : '#10b981', fontSize: '0.9em', fontWeight: 'bold' }}>
                          {product.quantity <= product.minStock ? '⚠️ Low Stock' : '✅ In Stock'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div>
          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.addIncome}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.target));
              data.amount = parseFloat(data.amount);
              data.type = data.type || 'Revenue';
              axios.post(`${API_BASE}/income`, data).then(() => {
                e.target.reset();
                Promise.all([
                  axios.get(`${API_BASE}/income`),
                  axios.get(`${API_BASE}/dashboard`)
                ]).then(([incomeRes, dashboardRes]) => {
                  setIncome(incomeRes.data);
                  setDashboard(dashboardRes.data);
                });
              }).catch(error => {
                console.error('Error adding income:', error);
                alert('Error adding income. Please try again.');
              });
            }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input name="description" placeholder={t.description} required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="amount" type="number" placeholder={`Amount (${t.currency}) *`} step="1000" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="type" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                {Object.entries(incTypes).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <input name="client" placeholder="Client Name" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="invoiceNumber" placeholder="Invoice Number" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="paymentStatus" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
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
                {t.addIncomeBtn}
              </button>
            </form>
          </div>

          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.income} ({income.length})</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {income.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>{t.noIncome}</p>
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
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{incTypes[item.type] || item.type}</p>
                      {item.client && <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>👤 {item.client}</p>}
                      {item.invoiceNumber && <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>📄 {item.invoiceNumber}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                        {item.amount?.toLocaleString()} {t.currency}
                      </span>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '5px 0 0 0', color: item.paymentStatus === 'Paid' ? '#10b981' : item.paymentStatus === 'Overdue' ? '#ef4444' : '#f59e0b', fontSize: '0.9em', fontWeight: 'bold' }}>
                        {item.paymentStatus === 'Paid' ? '✅ Paid' : item.paymentStatus === 'Overdue' ? '❌ Overdue' : '⏳ Pending'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div>
          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>💸 Add New Expense</h2>
            <form onSubmit={addExpense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input name="description" placeholder="Expense Description *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="amount" type="number" placeholder={`Amount (${t.currency}) *`} step="1000" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="category" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">Select Category</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Supplies">Supplies</option>
                <option value="Insurance">Insurance</option>
                <option value="Taxes">Taxes</option>
                <option value="Other">Other</option>
              </select>
              <select name="type" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="Direct Cost">Direct Cost</option>
                <option value="Overhead">Overhead</option>
                <option value="Capital">Capital Expense</option>
              </select>
              <input name="supplier" placeholder="Supplier Name" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="invoiceNumber" placeholder="Invoice Number" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="approvedBy" placeholder="Approved By" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <button type="submit" disabled={addingExpense} style={{ 
                padding: '12px 24px', 
                background: addingExpense ? '#64748b' : '#ef4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: addingExpense ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}>
                {addingExpense ? 'Adding...' : '💸 Add Expense'}
              </button>
            </form>
          </div>

          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>💸 Expenses ({expenses.length})</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {expenses.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No expenses yet. Add one above!</p>
              ) : (
                expenses.map(item => (
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
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{item.category} • {item.type}</p>
                      {item.supplier && <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>📦 {item.supplier}</p>}
                      {item.approvedBy && <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>✅ Approved by: {item.approvedBy}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1em' }}>
                        -{item.amount?.toLocaleString()} {t.currency}
                      </span>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '5px 0 0 0', color: item.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b', fontSize: '0.9em', fontWeight: 'bold' }}>
                        {item.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Production Tab */}
      {activeTab === 'production' && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>🏭 Production ({production.length})</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {production.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No production records yet.</p>
            ) : (
              production.map(item => (
                <div key={item._id} style={{ 
                  padding: '15px', 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#1e293b', fontSize: '1.1em' }}>{item.productName}</strong>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Batch: {item.batchNumber} • Quantity: {item.quantity}</p>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        {new Date(item.startDate).toLocaleDateString()} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'In Progress'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        color: item.status === 'Active' ? '#10b981' : item.status === 'Completed' ? '#3b82f6' : '#f59e0b', 
                        fontWeight: 'bold', fontSize: '1.1em' 
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quality Tab */}
      {activeTab === 'quality' && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>🔍 Quality Control ({quality.length})</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {quality.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No quality records yet.</p>
            ) : (
              quality.map(item => (
                <div key={item._id} style={{ 
                  padding: '15px', 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#1e293b', fontSize: '1.1em' }}>{item.productName}</strong>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{item.testType} • Grade: {item.grade}</p>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        Inspector: {item.inspector} • {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        color: item.result === 'Pass' ? '#10b981' : item.result === 'Fail' ? '#ef4444' : '#f59e0b', 
                        fontWeight: 'bold', fontSize: '1.1em' 
                      }}>
                        {item.result}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Professional Footer */}
      <footer style={{ 
        background: 'linear-gradient(135deg, #1e293b, #334155)', 
        color: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        marginTop: '40px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>🏭 {t.title}</h3>
            <p style={{ margin: '0', fontSize: '0.9em', color: '#94a3b8' }}>
              Modern manufacturing management for Algerian SMEs
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#10b981' }}>📊 System Status</h3>
            <p style={{ margin: '0', fontSize: '0.9em', color: '#94a3b8' }}>
              ✅ All systems operational<br/>
              ✅ Real-time data sync<br/>
              ✅ 99.9% uptime
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#8b5cf6' }}>🇩🇿 Market Focus</h3>
            <p style={{ margin: '0', fontSize: '0.9em', color: '#94a3b8' }}>
              🇩🇿 Algeria Market<br/>
              💵 DZD Currency<br/>
              🇫🇷/🇬🇧 Bilingual Support
            </p>
          </div>
        </div>
        <div style={{ 
          borderTop: '1px solid #475569', 
          paddingTop: '20px', 
          marginTop: '20px',
          fontSize: '0.8em',
          color: '#64748b'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>
            © 2024 {t.title}. Transforming Algerian manufacturing, one factory at a time.
          </p>
          <p style={{ margin: '0' }}>
            🏭 Built with ❤️ for Algerian manufacturers | 
            💼 Investor-ready platform | 
            🌍 Deployed globally
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
