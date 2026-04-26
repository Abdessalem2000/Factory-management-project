/* Algerian FMCG Distribution ERP - Magical Interface */
import { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || "https://factory-management-project.onrender.com/api";

/* Algerian Market Translations */
const tData = {
  en: {
    title: "Algerian FMCG Distribution ERP",
    subtitle: "Complete Distribution Management System for Algerian Markets",
    dashboard: "Dashboard",
    clients: "Clients",
    orders: "Orders", 
    products: "Products",
    loading: "Loading...",
    noClients: "No clients yet",
    noOrders: "No orders yet", 
    noProducts: "No products yet",
    currency: "DZD",
    createOrder: "Create New Order",
    addClient: "Add Client",
    addProduct: "Add Product",
    clientName: "Client Name",
    productName: "Product Name",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    status: "Status",
    date: "Date",
    actions: "Actions"
  },
  fr: {
    title: "ERP Distribution FMCG Algérie",
    subtitle: "Système Complet de Gestion de Distribution pour les Marchés Algériens",
    dashboard: "Tableau de bord",
    clients: "Clients",
    orders: "Commandes",
    products: "Produits", 
    loading: "Chargement...",
    noClients: "Aucun client",
    noOrders: "Aucune commande",
    noProducts: "Aucun produit",
    currency: "DZD",
    createOrder: "Créer une commande",
    addClient: "Ajouter un client",
    addProduct: "Ajouter un produit",
    clientName: "Nom du client",
    productName: "Nom du produit",
    quantity: "Quantité",
    price: "Prix",
    total: "Total",
    status: "Statut",
    date: "Date",
    actions: "Actions"
  }
};

/* Main Application Component */
export default function App() {
  const [lang, setLang] = useState("en");
  const t = tData[lang];
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [addingOrder, setAddingOrder] = useState(false);

  /* Fetch Data from API */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [w, c, p, o] = await Promise.all([
          axios.get(`${API_BASE}/workers`),
          axios.get(`${API_BASE}/clients`),
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/orders`)
        ]);
        
        setWorkers(w.data || []);
        setClients(c.data || []);
        setProducts(p.data || []);
        setOrders(o.data || []);
      } catch (err) {
        console.log("API Error:", err);
        // Set empty data if API fails
        setWorkers([]);
        setClients([]);
        setProducts([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  /* Refresh Data Helper */
  const refresh = async (url, setter) => {
    try {
      const res = await axios.get(`${API_BASE}/${url}`);
      setter(res.data || []);
    } catch (err) {
      console.log(`Refresh ${url} error:`, err);
    }
  };

  /* Add Product */
  const addProduct = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    
    try {
      const formData = new FormData(e.target);
      const productData = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        barcode: formData.get('barcode'),
        price: {
          retail: parseFloat(formData.get('retailPrice')) || 0,
          wholesale: parseFloat(formData.get('wholesalePrice')) || 0,
          cost: parseFloat(formData.get('cost')) || 0
        },
        inventory: {
          quantity: parseInt(formData.get('quantity')) || 0,
          minStock: parseInt(formData.get('minStock')) || 0
        }
      };
      
      await axios.post(`${API_BASE}/products`, productData);
      e.target.reset();
      refresh("products", setProducts);
      setShowProductForm(false);
      alert("Product added successfully!");
    } catch (err) {
      alert("Error adding product");
    }
    
    setLoadingAction(false);
  };

  /* Add Order */
  const addOrder = async (e) => {
    e.preventDefault();
    setAddingOrder(true);
    
    try {
      const formData = new FormData(e.target);
      const orderData = {
        client: formData.get('clientId'),
        salesAgent: formData.get('salesAgentId'),
        items: [{
          product: formData.get('productId'),
          quantity: parseInt(formData.get('quantity')),
          unitPrice: parseFloat(formData.get('unitPrice')),
          totalPrice: parseInt(formData.get('quantity')) * parseFloat(formData.get('unitPrice'))
        }],
        payment: {
          method: formData.get('paymentMethod'),
          status: "Pending"
        },
        delivery: {
          type: formData.get('deliveryType'),
          address: formData.get('deliveryAddress'),
          scheduledDate: formData.get('scheduledDate')
        },
        notes: formData.get('notes')
      };
      
      await axios.post(`${API_BASE}/orders`, orderData);
      e.target.reset();
      refresh("orders", setOrders);
      setShowOrderForm(false);
      alert("Order created successfully!");
    } catch (err) {
      alert("Error creating order");
    }
    
    setAddingOrder(false);
  };

  /* Loading State */
  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Magical Header */}
      <div className="header">
        <h2>{t.title}</h2>
        <div>
          <button onClick={() => setLang("en")}>English</button>
          <button onClick={() => setLang("fr")}>Français</button>
        </div>
      </div>
      
      <p>{t.subtitle}</p>

      {/* Professional Navigation */}
      <div className="nav">
        {["dashboard", "clients", "orders", "products"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "active" : ""}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {activeTab === "dashboard" && (
        <div>
          {/* Stats Cards */}
          <div className="dashboard">
            <div className="dashboard-card">
              <h3>👥 {t.clients}</h3>
              <p>{clients.length}</p>
            </div>
            <div className="dashboard-card">
              <h3>📦 {t.orders}</h3>
              <p>{orders.length}</p>
            </div>
            <div className="dashboard-card">
              <h3>🛍️ {t.products}</h3>
              <p>{products.length}</p>
            </div>
            <div className="dashboard-card">
              <h3>💰 Revenue</h3>
              <p>
                {orders.reduce((total, order) => total + (order.pricing?.total || 0), 0).toLocaleString()} {t.currency}
              </p>
            </div>
          </div>

          {/* Charts and Recent Orders */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>
            {/* Simple Chart */}
            <div className="card">
              <h3>📊 Orders & Revenue Overview</h3>
              <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px' }}>
                {/* Simple Bar Chart */}
                {(() => {
                  const last7Days = Array.from({length: 7}, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    return date;
                  });
                  
                  const ordersByDay = last7Days.map(date => {
                    const dayOrders = orders.filter(order => {
                      const orderDate = new Date(order.createdAt || Date.now());
                      return orderDate.toDateString() === date.toDateString();
                    });
                    return {
                      date: date.toLocaleDateString('en', { weekday: 'short' }),
                      count: dayOrders.length,
                      revenue: dayOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0)
                    };
                  });

                  const maxValue = Math.max(...ordersByDay.map(d => Math.max(d.count, d.revenue / 1000)), 1);

                  return (
                    <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '250px' }}>
                      {ordersByDay.map((day, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '5px',
                            height: '200px',
                            justifyContent: 'flex-end'
                          }}>
                            <div style={{
                              width: '30px',
                              background: 'var(--gradient-primary)',
                              height: `${(day.revenue / 1000 / maxValue) * 150}px`,
                              borderRadius: '4px 4px 0 0',
                              position: 'relative'
                            }}>
                              <span style={{ 
                                position: 'absolute', 
                                top: '-20px', 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                fontSize: '10px',
                                color: 'var(--text-secondary)',
                                fontWeight: 'bold'
                              }}>
                                {(day.revenue / 1000).toFixed(1)}k
                              </span>
                            </div>
                            <div style={{
                              width: '30px',
                              background: 'var(--gradient-secondary)',
                              height: `${(day.count / maxValue) * 50}px`,
                              borderRadius: '4px 4px 0 0',
                              position: 'relative'
                            }}>
                              <span style={{ 
                                position: 'absolute', 
                                top: '-20px', 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                fontSize: '10px',
                                color: 'var(--text-secondary)',
                                fontWeight: 'bold'
                              }}>
                                {day.count}
                              </span>
                            </div>
                          </div>
                          <span style={{ 
                            fontSize: '11px', 
                            color: 'var(--text-secondary)',
                            marginTop: '10px'
                          }}>
                            {day.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '12px', background: 'var(--gradient-primary)', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Revenue (k DZD)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '12px', background: 'var(--gradient-secondary)', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Orders</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3>📈 Quick Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(0, 102, 51, 0.1)', borderRadius: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Avg Order Value</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                    {orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0) / orders.length).toLocaleString() : 0} {t.currency}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(200, 16, 46, 0.1)', borderRadius: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pending Orders</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-red)' }}>
                    {orders.filter(order => order.status === 'Pending').length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Delivered Orders</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)' }}>
                    {orders.filter(order => order.status === 'Delivered').length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Products</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--warning)' }}>
                    {products.reduce((sum, product) => sum + (product.inventory?.quantity || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3>📋 Recent Orders</h3>
              <button 
                onClick={() => setActiveTab('orders')}
                className="btn"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                View All
              </button>
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '16px' }}>No orders yet</p>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>Create your first order to see it here!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="list-item" style={{ padding: '15px', marginBottom: '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', marginBottom: '5px' }}>
                          📋 #{order.orderNumber || order._id?.slice(-8)}
                        </h4>
                        <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          👤 {order.client?.name || 'Unknown Client'}
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                          📅 {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h4 style={{ fontSize: '16px', color: 'var(--accent-gold)', marginBottom: '5px' }}>
                          {order.pricing?.total?.toLocaleString() || 0} {t.currency}
                        </h4>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' : 
                                       order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: order.status === 'Delivered' ? 'var(--success)' : 
                                 order.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)'
                        }}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      {activeTab === "products" && (
        <div className="card">
          <h3>{t.products}</h3>
          
          {/* Add Product Button */}
          <button 
            onClick={() => setShowProductForm(!showProductForm)}
            className="btn btn-success"
            style={{ marginBottom: '20px' }}
          >
            {showProductForm ? 'Cancel' : '➕ ' + t.addProduct}
          </button>

          {/* Add Product Form */}
          {showProductForm && (
            <div className="form">
              <form onSubmit={addProduct}>
                <div className="form-group">
                  <label>{t.productName} *</label>
                  <input name="name" placeholder="Enter product name" required />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input name="sku" placeholder="Enter SKU" required />
                </div>
                <div className="form-group">
                  <label>Barcode</label>
                  <input name="barcode" placeholder="Enter barcode" />
                </div>
                <div className="form-group">
                  <label>Retail Price ({t.currency})</label>
                  <input name="retailPrice" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Wholesale Price ({t.currency})</label>
                  <input name="wholesalePrice" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Cost ({t.currency})</label>
                  <input name="cost" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>{t.quantity} *</label>
                  <input name="quantity" type="number" placeholder="0" required />
                </div>
                <div className="form-group">
                  <label>Minimum Stock</label>
                  <input name="minStock" type="number" placeholder="0" />
                </div>
                <button type="submit" disabled={loadingAction} className="btn">
                  {loadingAction ? 'Adding...' : '✅ ' + t.addProduct}
                </button>
              </form>
            </div>
          )}

          {/* Products List */}
          <div className="list">
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px' }}>{t.noProducts}</p>
            ) : (
              products.map((product) => (
                <div key={product._id} className="list-item">
                  <div>
                    <h4>{product.name}</h4>
                    <p>SKU: {product.sku || 'N/A'}</p>
                    <p>Retail: {product.price?.retail || 0} {t.currency}</p>
                    <p>Stock: {product.inventory?.quantity || 0}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Orders Section */}
      {activeTab === "orders" && (
        <div className="card">
          <h3>{t.orders}</h3>
          
          {/* Create Order Button */}
          <button 
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="btn btn-success"
            style={{ marginBottom: '20px', fontSize: '18px', padding: '15px 30px' }}
          >
            {showOrderForm ? 'Cancel' : '📋 ' + t.createOrder}
          </button>

          {/* Create Order Form */}
          {showOrderForm && (
            <div className="form">
              <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{t.createOrder}</h2>
              
              {clients.length === 0 || products.length === 0 ? (
                <div className="alert alert-warning">
                  <p>Please add clients and products first before creating orders!</p>
                </div>
              ) : (
                <form onSubmit={addOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div className="form-group">
                    <label>Client *</label>
                    <select name="clientId" required>
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Sales Agent</label>
                    <select name="salesAgentId">
                      <option value="">Select Sales Agent</option>
                      {workers.filter(w => w.role === 'Sales Agent').map(agent => (
                        <option key={agent._id} value={agent._id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Product *</label>
                    <select name="productId" required>
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - {product.price?.wholesale || 0} {t.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>{t.quantity} *</label>
                    <input name="quantity" type="number" min="1" placeholder="1" required />
                  </div>
                  
                  <div className="form-group">
                    <label>Unit Price ({t.currency}) *</label>
                    <input name="unitPrice" type="number" step="0.01" min="0" placeholder="0.00" required />
                  </div>
                  
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select name="paymentMethod" required>
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit">Credit</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Delivery Type *</label>
                    <select name="deliveryType" required>
                      <option value="">Select Delivery Type</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Pickup">Pickup</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Delivery Address *</label>
                    <input name="deliveryAddress" placeholder="Enter delivery address" required />
                  </div>
                  
                  <div className="form-group">
                    <label>Scheduled Date *</label>
                    <input name="scheduledDate" type="date" required />
                  </div>
                  
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Order Notes</label>
                    <textarea name="notes" placeholder="Enter any special notes..." rows="3"></textarea>
                  </div>
                  
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                    <button type="submit" disabled={addingOrder} className="btn">
                      {addingOrder ? 'Creating Order...' : 'Create Order'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Orders List */}
          <div className="list">
            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px' }}>{t.noOrders}</p>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="list-item">
                  <div>
                    <h4>Order #{order.orderNumber || order._id?.slice(-8)}</h4>
                    <p>Client: {order.client?.name || 'N/A'}</p>
                    <p>{order.items?.length || 0} items</p>
                    <p>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h4 style={{ color: 'var(--accent-gold)' }}>
                      {order.pricing?.total?.toLocaleString() || 0} {t.currency}
                    </h4>
                    <p>{order.payment?.method || 'N/A'}</p>
                    <p>{order.delivery?.type || 'N/A'}</p>
                    <span style={{
                      color: order.status === 'Delivered' ? 'var(--success)' : 
                             order.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)',
                      fontWeight: 'bold'
                    }}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
