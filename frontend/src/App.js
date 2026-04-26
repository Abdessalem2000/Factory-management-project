/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://factory-management-project.onrender.com/api";

/* ===================== TRANSLATIONS ===================== */

const tData = {
  en: {
    title: "🚚 FMCG Distribution ERP",
    subtitle: "Pre-sales & Distribution Management System",
    dashboard: "Dashboard",
    clients: "Clients",
    orders: "Orders",
    products: "Products",
    delivery: "Delivery",
    workers: "Team",
    income: "Income",
    expenses: "Expenses",
    currency: "DZD",
    loading: "Loading...",
    noClients: "No clients yet",
    noOrders: "No orders yet",
    noProducts: "No products yet",
    noBrands: "No brands yet",
  },
  fr: {
    title: "🚚 ERP FMCG",
    subtitle: "Gestion Distribution",
    dashboard: "Tableau de bord",
    clients: "Clients",
    orders: "Commandes",
    products: "Produits",
    delivery: "Livraison",
    workers: "Équipe",
    income: "Revenus",
    expenses: "Dépenses",
    currency: "DZD",
    loading: "Chargement...",
    noClients: "Aucun client",
    noOrders: "Aucune commande",
    noProducts: "Aucun produit",
    noBrands: "Aucune marque",
  },
};

/* ===================== APP ===================== */

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
  const [addingOrder, setAddingOrder] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  /* ===================== FETCH DATA ===================== */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          w,
          c,
          p,
          o,
        ] = await Promise.all([
          axios.get(`${API_BASE}/workers`),
          axios.get(`${API_BASE}/clients`),
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/orders`),
        ]);

        setWorkers(w.data);
        setClients(c.data);
        setProducts(p.data);
        setOrders(o.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===================== HELPERS ===================== */

  const refresh = async (url, setter) => {
    const res = await axios.get(`${API_BASE}/${url}`);
    setter(res.data);
  };

  /* ===================== ACTIONS ===================== */

  const addClient = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      await axios.post(
        `${API_BASE}/clients`,
        Object.fromEntries(new FormData(e.target))
      );
      e.target.reset();
      refresh("clients", setClients);
    } catch (err) {
      alert("Error adding client");
    }
    setLoadingAction(false);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setLoadingAction(true);

    try {
      const f = Object.fromEntries(new FormData(e.target));

      const data = {
        name: f.name,
        sku: f.sku,
        barcode: f.barcode,
        brand: f.brandId,
        price: {
          retail: +f.retailPrice,
          wholesale: +f.wholesalePrice,
          cost: +f.cost,
        },
        inventory: {
          quantity: +f.quantity,
          minStock: +f.minStock,
          available: +f.quantity,
          reserved: 0,
        },
      };

      await axios.post(`${API_BASE}/products`, data);
      e.target.reset();
      refresh("products", setProducts);
    } catch (err) {
      alert("Error adding product");
    }

    setLoadingAction(false);
  };

  const addOrder = async (e) => {
    e.preventDefault();
    setAddingOrder(true);

    try {
      const f = Object.fromEntries(new FormData(e.target));

      const data = {
        client: f.clientId,
        salesAgent: f.salesAgentId,
        items: [
          {
            product: f.productId,
            quantity: +f.quantity,
            unitPrice: +f.unitPrice,
            totalPrice: +f.quantity * +f.unitPrice,
          },
        ],
        payment: { method: f.paymentMethod, status: "Pending" },
        delivery: {
          type: f.deliveryType,
          address: f.deliveryAddress,
          scheduledDate: f.scheduledDate,
        },
        notes: f.notes,
      };

      await axios.post(`${API_BASE}/orders`, data);
      e.target.reset();
      refresh("orders", setOrders);
      alert("✅ Order created successfully!");
    } catch (err) {
      alert("❌ Error creating order");
    }

    setAddingOrder(false);
  };

  /* ===================== UI ===================== */

  if (loading)
    return <div style={{ textAlign: "center" }}>{t.loading}</div>;

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <h2>{t.title}</h2>
        <div>
          <button onClick={() => setLang("en")}>EN</button>
          <button onClick={() => setLang("fr")}>FR</button>
        </div>
      </div>

      <p>{t.subtitle}</p>

      {/* NAV */}
      <div className="nav">
        {["dashboard", "clients", "orders", "products"].map((x) => (
          <button 
            key={x} 
            onClick={() => setActiveTab(x)}
            className={activeTab === x ? "active" : ""}
          >
            {t[x]}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="dashboard">
          <div className="dashboard-card">
            <h3>Clients</h3>
            <p>{clients.length}</p>
          </div>
          <div className="dashboard-card">
            <h3>Orders</h3>
            <p>{orders.length}</p>
          </div>
          <div className="dashboard-card">
            <h3>Products</h3>
            <p>{products.length}</p>
          </div>
        </div>
      )}

      {/* CLIENTS */}
      {activeTab === "clients" && (
        <div className="card">
          <h3>Clients</h3>
          <form onSubmit={addClient} className="form">
            <div className="form-group">
              <input name="name" placeholder="Name" required />
            </div>
            <button type="submit" disabled={loadingAction} className="btn">
              {loadingAction ? 'Adding...' : 'Add Client'}
            </button>
          </form>

          <div className="list">
            {clients.length === 0 ? (
              <p>No clients yet</p>
            ) : (
              clients.map((c) => (
                <div key={c._id} className="list-item">
                  <h4>{c.name}</h4>
                  <p>Client</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {activeTab === "products" && (
        <div className="card">
          <h3>Products</h3>
          <form onSubmit={addProduct} className="form">
            <div className="form-group">
              <input name="name" placeholder="Name" required />
            </div>
            <div className="form-group">
              <input name="sku" placeholder="SKU" required />
            </div>
            <div className="form-group">
              <input name="retailPrice" placeholder="Retail Price" />
            </div>
            <div className="form-group">
              <input name="wholesalePrice" placeholder="Wholesale Price" />
            </div>
            <div className="form-group">
              <input name="cost" placeholder="Cost" />
            </div>
            <div className="form-group">
              <input name="quantity" placeholder="Quantity" />
            </div>
            <button type="submit" disabled={loadingAction} className="btn">
              {loadingAction ? 'Adding...' : 'Add Product'}
            </button>
          </form>

          <div className="list">
            {products.length === 0 ? (
              <p>No products yet</p>
            ) : (
              products.map((p) => (
                <div key={p._id} className="list-item">
                  <h4>{p.name}</h4>
                  <p>{p.price?.retail || 0} DZD</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ORDERS */}
      {activeTab === "orders" && (
        <div className="card">
          <h3>Orders</h3>
          
          {/* CREATE ORDER BUTTON - ALWAYS VISIBLE */}
          <div className="alert alert-info">
            <h2>Create Order</h2>
            <button 
              onClick={() => setShowOrderForm(true)}
              className="btn btn-success"
              style={{ fontSize: '20px', padding: '20px 40px' }}
            >
              📋 CREATE NEW ORDER
            </button>
          </div>

          {/* Create Order Form - Always Visible When Button Clicked */}
          {showOrderForm && (
            <div className="card" style={{ marginBottom: '30px' }}>
              <h2 style={{ textAlign: 'center' }}>📋 Create Order</h2>
              
              {/* Loading State Check */}
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading data...</p>
                </div>
              ) : (
                <form onSubmit={addOrder} className="form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {/* Client Dropdown with Validation */}
                  <div className="form-group">
                    <label>Client *</label>
                    <select name="clientId" required>
                      <option value="">Select Client *</option>
                      {clients.length === 0 ? (
                        <option value="" disabled>No clients available - please add clients first</option>
                      ) : (
                        clients.map(client => <option key={client._id} value={client._id}>{client.name}</option>)
                      )}
                    </select>
                  </div>

                  {/* Sales Agent Dropdown with Validation */}
                  <div className="form-group">
                    <label>Sales Agent *</label>
                    <select name="salesAgentId" required>
                      <option value="">Select Sales Agent *</option>
                      {workers.filter(w => w.role === 'Sales Agent').length === 0 ? (
                        <option value="" disabled>No sales agents available</option>
                      ) : (
                        workers.filter(w => w.role === 'Sales Agent').map(agent => <option key={agent._id} value={agent._id}>{agent.name}</option>)
                      )}
                    </select>
                  </div>

                  {/* Product Dropdown with Validation */}
                  <div className="form-group">
                    <label>Product *</label>
                    <select name="productId" required>
                      <option value="">Select Product *</option>
                      {products.length === 0 ? (
                        <option value="" disabled>No products available - please add products first</option>
                      ) : (
                        products.map(product => <option key={product._id} value={product._id}>{product.name} - {product.price?.wholesale || 0} DZD</option>)
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity *</label>
                    <input name="quantity" type="number" placeholder="Quantity *" min="1" required />
                  </div>

                  <div className="form-group">
                    <label>Unit Price (DZD) *</label>
                    <input name="unitPrice" type="number" placeholder="Unit Price (DZD) *" step="100" required />
                  </div>

                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input name="discount" type="number" placeholder="Discount (%)" step="0.01" min="0" max="100" />
                  </div>

                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select name="paymentMethod" required>
                      <option value="">Payment Method *</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit">Credit</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Delivery Type *</label>
                    <select name="deliveryType" required>
                      <option value="">Delivery Type *</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Pickup">Pickup</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Delivery Address *</label>
                    <input name="deliveryAddress" placeholder="Delivery Address *" required />
                  </div>

                  <div className="form-group">
                    <label>Scheduled Date *</label>
                    <input name="scheduledDate" type="date" required />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Order Notes</label>
                    <textarea name="notes" placeholder="Order Notes" rows="3"></textarea>
                  </div>

                  <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                    <button 
                      type="submit" 
                      disabled={addingOrder || clients.length === 0 || products.length === 0} 
                      className="btn"
                    >
                      {addingOrder ? 'Creating...' : (clients.length === 0 || products.length === 0 ? '⚠️ Add Clients & Products First' : '📋 Create Order')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Orders List */}
          <div className="list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Orders ({orders.length})</h2>
              <button 
                onClick={() => setShowOrderForm(true)}
                className="btn"
              >
                ➕ Add Order
              </button>
            </div>
            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>No orders yet. Create your first order!</p>
            ) : (
              orders.map(order => (
                <div key={order._id} className="list-item">
                  <div>
                    <h4>{order.orderNumber}</h4>
                    <p>🏪 {order.client?.name} • 👤 {order.salesAgent?.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      color: order.status === 'Delivered' ? '#10b981' : order.status === 'Cancelled' ? '#ef4444' : '#f59e0b', 
                      fontWeight: 'bold', fontSize: '1.1em' 
                    }}>
                      {order.status}
                    </span>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    {order.items?.map((item, index) => (
                      <div key={index} style={{ fontSize: '0.9em', color: '#64748b' }}>
                        • {item.product?.name} x {item.quantity} = {item.totalPrice?.toLocaleString()} DZD
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>
                      Total: {order.pricing?.total?.toLocaleString()} DZD
                    </span>
                    <span style={{ fontSize: '0.9em', color: '#64748b' }}>
                      💳 {order.payment?.method} • {order.payment?.status}
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