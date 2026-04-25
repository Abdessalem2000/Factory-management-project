import { useState, useEffect } from "react";
import axios from "axios";

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
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dashboard, setDashboard] = useState({});

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
          b,
          p,
          o,
          d,
          i,
          e,
          dash,
        ] = await Promise.all([
          axios.get(`${API_BASE}/workers`),
          axios.get(`${API_BASE}/clients`),
          axios.get(`${API_BASE}/brands`),
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/orders`),
          axios.get(`${API_BASE}/deliveries`),
          axios.get(`${API_BASE}/income`),
          axios.get(`${API_BASE}/expenses`),
          axios.get(`${API_BASE}/dashboard`),
        ]);

        setWorkers(w.data);
        setClients(c.data);
        setBrands(b.data);
        setProducts(p.data);
        setOrders(o.data);
        setDeliveries(d.data);
        setIncome(i.data);
        setExpenses(e.data);
        setDashboard(dash.data);
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

  const addBrand = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      await axios.post(
        `${API_BASE}/brands`,
        Object.fromEntries(new FormData(e.target))
      );
      e.target.reset();
      refresh("brands", setBrands);
    } catch (err) {
      alert("Error adding brand");
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
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>{t.title}</h2>

        <div>
          <button onClick={() => setLang("en")}>EN</button>
          <button onClick={() => setLang("fr")}>FR</button>
        </div>
      </div>

      <p>{t.subtitle}</p>

      {/* NAV */}
      <div style={{ display: "flex", gap: 10 }}>
        {["dashboard", "clients", "orders", "products"].map((x) => (
          <button key={x} onClick={() => setActiveTab(x)}>
            {t[x]}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div>
          <h3>Clients: {clients.length}</h3>
          <h3>Orders: {orders.length}</h3>
          <h3>Products: {products.length}</h3>
        </div>
      )}

      {/* CLIENTS */}
      {activeTab === "clients" && (
        <div>
          <form onSubmit={addClient}>
            <input name="name" placeholder="Name" required />
            <button disabled={loadingAction}>Add</button>
          </form>

          {clients.map((c) => (
            <div key={c._id}>{c.name}</div>
          ))}
        </div>
      )}

      {/* PRODUCTS */}
      {activeTab === "products" && (
        <div>
          <form onSubmit={addProduct}>
            <input name="name" placeholder="Name" required />
            <input name="sku" placeholder="SKU" required />
            <input name="retailPrice" placeholder="Retail" />
            <input name="wholesalePrice" placeholder="Wholesale" />
            <input name="cost" placeholder="Cost" />
            <input name="quantity" placeholder="Qty" />
            <button>Add</button>
          </form>

          {products.map((p) => (
            <div key={p._id}>
              {p.name} - {p.price?.retail}
            </div>
          ))}
        </div>
      )}

      {/* ORDERS */}
      {activeTab === "orders" && (
        <div>
          {/* CREATE ORDER BUTTON - ALWAYS VISIBLE */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            padding: '20px',
            background: '#f0f9ff',
            border: '2px solid #2563eb',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#1e40af', margin: '0 0 15px 0' }}>Create Your First Order</h3>
            <button 
              onClick={() => setShowOrderForm(true)}
              style={{
                padding: '20px 40px',
                background: '#2563eb',
                color: 'white',
                border: '3px solid #1d4ed8',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.5)',
                transition: 'all 0.3s',
                textTransform: 'uppercase'
              }}
            >
              📋 CREATE NEW ORDER
            </button>
            <p style={{ color: '#64748b', margin: '10px 0 0 0', fontSize: '14px' }}>
              Click the button above to add a new order
            </p>
          </div>

          {/* Create Order Form - Always Visible When Button Clicked */}
          {showOrderForm && (
            <div id="orderForm" style={{ 
              background: '#f8fafc', 
              padding: '25px', 
              borderRadius: '12px', 
              marginBottom: '30px', 
              border: '2px solid #2563eb', 
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)' 
            }}>
              <h2 style={{ color: '#1e293b', margin: '0 0 20px 0', textAlign: 'center' }}>📋 Create Order</h2>
              
              {/* Loading State Check */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ fontSize: '18px', marginBottom: '10px' }}>⏳ Loading data...</div>
                  <div style={{ fontSize: '14px' }}>Please wait while we load clients and products</div>
                </div>
              ) : (
                <form onSubmit={addOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {/* Client Dropdown with Validation */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Client *</label>
                    <select name="clientId" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }}>
                      <option value="">Select Client *</option>
                      {clients.length === 0 ? (
                        <option value="" disabled>No clients available - please add clients first</option>
                      ) : (
                        clients.map(client => <option key={client._id} value={client._id}>{client.name}</option>)
                      )}
                    </select>
                  </div>

                  {/* Sales Agent Dropdown with Validation */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Sales Agent *</label>
                    <select name="salesAgentId" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }}>
                      <option value="">Select Sales Agent *</option>
                      {workers.filter(w => w.role === 'Sales Agent').length === 0 ? (
                        <option value="" disabled>No sales agents available</option>
                      ) : (
                        workers.filter(w => w.role === 'Sales Agent').map(agent => <option key={agent._id} value={agent._id}>{agent.name}</option>)
                      )}
                    </select>
                  </div>

                  {/* Product Dropdown with Validation */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Product *</label>
                    <select name="productId" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }}>
                      <option value="">Select Product *</option>
                      {products.length === 0 ? (
                        <option value="" disabled>No products available - please add products first</option>
                      ) : (
                        products.map(product => <option key={product._id} value={product._id}>{product.name} - {product.price?.wholesale || 0} DZD</option>)
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Quantity *</label>
                    <input name="quantity" type="number" placeholder="Quantity *" min="1" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Unit Price (DZD) *</label>
                    <input name="unitPrice" type="number" placeholder="Unit Price (DZD) *" step="100" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Discount (%)</label>
                    <input name="discount" type="number" placeholder="Discount (%)" step="0.01" min="0" max="100" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Payment Method *</label>
                    <select name="paymentMethod" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }}>
                      <option value="">Payment Method *</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit">Credit</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Delivery Type *</label>
                    <select name="deliveryType" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }}>
                      <option value="">Delivery Type *</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Pickup">Pickup</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Delivery Address *</label>
                    <input name="deliveryAddress" placeholder="Delivery Address *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Scheduled Date *</label>
                    <input name="scheduledDate" type="date" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>Order Notes</label>
                    <textarea name="notes" placeholder="Order Notes" rows="3" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', width: '100%' }}></textarea>
                  </div>

                  <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                    <button 
                      type="submit" 
                      disabled={addingOrder || clients.length === 0 || products.length === 0} 
                      style={{ 
                        padding: '12px 24px', 
                        background: (addingOrder || clients.length === 0 || products.length === 0) ? '#64748b' : '#2563eb', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: (addingOrder || clients.length === 0 || products.length === 0) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      {addingOrder ? 'Creating...' : (clients.length === 0 || products.length === 0 ? '⚠️ Add Clients & Products First' : '📋 Create Order')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Orders List */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1e293b', margin: '0' }}>Orders ({orders.length})</h2>
              <button 
                onClick={() => setShowOrderForm(true)}
                style={{
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ➕ Add Order
              </button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {orders.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No orders yet. Create your first order!</p>
              ) : (
                orders.map(order => (
                  <div key={order._id} style={{ 
                    padding: '15px', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <strong style={{ color: '#1e293b', fontSize: '1.1em' }}>{order.orderNumber}</strong>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
                          🏪 {order.client?.name} • 👤 {order.salesAgent?.name}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          color: order.status === 'Delivered' ? '#10b981' : order.status === 'Cancelled' ? '#ef4444' : '#f59e0b', 
                          fontWeight: 'bold', fontSize: '1.1em' 
                        }}>
                          {order.status}
                        </span>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '5px', marginBottom: '10px' }}>
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
        </div>
      )}
    </div>
  );
}