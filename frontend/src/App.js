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
  const [showClientForm, setShowClientForm] = useState(false);
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

  /* Add Client */
  const addClient = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    
    try {
      const formData = new FormData(e.target);
      const clientData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        province: formData.get('province')
      };
      
      await axios.post(`${API_BASE}/clients`, clientData);
      e.target.reset();
      refresh("clients", setClients);
      setShowClientForm(false);
      alert("Client added successfully!");
    } catch (err) {
      alert("Error adding client");
    }
    
    setLoadingAction(false);
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
        <div className="dashboard">
          <div className="dashboard-card">
            <h3>{t.clients}</h3>
            <p>{clients.length}</p>
          </div>
          <div className="dashboard-card">
            <h3>{t.orders}</h3>
            <p>{orders.length}</p>
          </div>
          <div className="dashboard-card">
            <h3>{t.products}</h3>
            <p>{products.length}</p>
          </div>
          <div className="dashboard-card">
            <h3>Revenue</h3>
            <p>
              {orders.reduce((total, order) => total + (order.pricing?.total || 0), 0).toLocaleString()} {t.currency}
            </p>
          </div>
        </div>
      )}

      {/* Clients Section */}
      {activeTab === "clients" && (
        <div className="card">
          <h3>{t.clients}</h3>
          
          {/* Add Client Button */}
          <button 
            onClick={() => setShowClientForm(!showClientForm)}
            className="btn btn-success"
            style={{ marginBottom: '20px' }}
          >
            {showClientForm ? 'Cancel' : ' ' + t.addClient}
          </button>

          {/* Add Client Form */}
          {showClientForm && (
            <div className="form">
              <form onSubmit={addClient}>
                <div className="form-group">
                  <label>{t.clientName} *</label>
                  <input name="name" placeholder="Enter client name" required />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input name="phone" placeholder="Enter phone number" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" placeholder="Enter email address" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input name="address" placeholder="Enter address" />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input name="city" placeholder="Enter city" />
                </div>
                <div className="form-group">
                  <label>Province</label>
                  <select name="province">
                    <option value="">Select Province</option>
                    <option value="Alger">Alger</option>
                    <option value="Oran">Oran</option>
                    <option value="Constantine">Constantine</option>
                    <option value="Annaba">Annaba</option>
                    <option value="Blida">Blida</option>
                    <option value="Batna">Batna</option>
                  </select>
                </div>
                <button type="submit" disabled={loadingAction} className="btn">
                  {loadingAction ? 'Adding...' : ' ' + t.addClient}
                </button>
              </form>
            </div>
          )}

          {/* Clients List */}
          <div className="list">
            {clients.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px' }}>{t.noClients}</p>
            ) : (
              clients.map((client) => (
                <div key={client._id} className="list-item">
                  <div>
                    <h4>{client.name}</h4>
                    <p>{client.phone || 'N/A'}</p>
                    <p>{client.email || 'N/A'}</p>
                    <p>{client.city || 'N/A'}, {client.province || 'N/A'}</p>
                  </div>
                </div>
              ))
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
            {showProductForm ? 'Cancel' : ' ' + t.addProduct}
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
                  {loadingAction ? 'Adding...' : ' ' + t.addProduct}
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
            {showOrderForm ? 'Cancel' : ' ' + t.createOrder}
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