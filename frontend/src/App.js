/* Algerian FMCG Distribution ERP - Magical Interface */
import { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
  const [showClientForm, setShowClientForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [addingOrder, setAddingOrder] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalClients: 0,
      totalProducts: 0,
      avgOrderValue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      revenueGrowth: 0
    },
    topProducts: [],
    recentOrders: [],
    monthlyRevenue: []
  });

  /* Fetch Data from API */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [w, c, p, o, analytics] = await Promise.all([
          axios.get(`${API_BASE}/workers`),
          axios.get(`${API_BASE}/clients`),
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/orders`),
          axios.get(`${API_BASE}/analytics/dashboard`)
        ]);
        
        setWorkers(w.data || []);
        setClients(c.data || []);
        setProducts(p.data || []);
        setOrders(o.data || []);
        setDashboardData(analytics.data?.data || {
          overview: {
            totalRevenue: 0,
            totalOrders: 0,
            totalClients: 0,
            totalProducts: 0,
            avgOrderValue: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            revenueGrowth: 0
          },
          topProducts: [],
          recentOrders: [],
          monthlyRevenue: []
        });
      } catch (err) {
        console.log("Fetch error:", err);
        // Set empty data if API fails
        setWorkers([]);
        setClients([]);
        setProducts([]);
        setOrders([]);
        setDashboardData({
          overview: {
            totalRevenue: 0,
            totalOrders: 0,
            totalClients: 0,
            totalProducts: 0,
            avgOrderValue: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            revenueGrowth: 0
          },
          topProducts: [],
          recentOrders: [],
          monthlyRevenue: []
        });
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
        description: formData.get('description'),
        category: formData.get('category'),
        brand: formData.get('brand'),
        supplier: formData.get('supplier'),
        price: {
          retail: parseFloat(formData.get('retailPrice')),
          wholesale: parseFloat(formData.get('wholesalePrice')),
          cost: parseFloat(formData.get('cost')),
          currency: formData.get('currency')
        },
        inventory: {
          quantity: parseInt(formData.get('quantity')),
          minStock: parseInt(formData.get('minStock')),
          maxStock: parseInt(formData.get('maxStock')),
          reorderPoint: parseInt(formData.get('reorderPoint')),
          location: formData.get('location')
        },
        dimensions: {
          weight: parseFloat(formData.get('weight')),
          length: parseFloat(formData.get('length')),
          width: parseFloat(formData.get('width')),
          height: parseFloat(formData.get('height')),
          unit: formData.get('unit')
        },
        status: 'Active'
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

  /* Update Stock */
  const updateStock = async (productId, quantity, operation) => {
    try {
      const response = await axios.put(`${API_BASE}/products/${productId}/stock`, {
        quantity,
        operation
      });
      
      if (response.data.success) {
        refresh("products", setProducts);
        const message = operation === 'add' 
          ? `Successfully added ${quantity} units to inventory!`
          : `Successfully removed ${quantity} units from inventory!`;
        alert(message);
      }
    } catch (err) {
      alert("Error updating stock");
    }
  };

  /* Fetch Low Stock Products */
  const fetchLowStockProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products/low-stock`);
      const lowStockProducts = response.data;
      
      if (lowStockProducts.length > 0) {
        const stockList = lowStockProducts.map(p => 
          `${p.name} (${p.inventory?.quantity} units - ${p.inventory?.stockStatus})`
        ).join('\n');
        
        alert(`⚠️ Low Stock Alert!\n\n${stockList}\n\nPlease consider reordering these products.`);
      } else {
        alert("✅ All products are in stock!");
      }
    } catch (err) {
      alert("Error fetching low stock products");
    }
  };

  /* Edit Product */
  const editProduct = (productId) => {
    alert(`Edit product functionality for ID: ${productId}\n\nThis feature would open an edit form with current product data.`);
  };

  /* Add Client */
  const addClient = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    
    try {
      const formData = new FormData(e.target);
      const clientData = {
        name: formData.get('name'),
        company: formData.get('company'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        taxId: formData.get('taxId'),
        creditLimit: parseFloat(formData.get('creditLimit')) || 0,
        paymentTerms: formData.get('paymentTerms'),
        status: formData.get('status'),
        address: formData.get('address'),
        city: formData.get('city'),
        province: formData.get('province'),
        postalCode: formData.get('postalCode'),
        country: formData.get('country'),
        notes: formData.get('notes')
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

  /* View Client Order History */
  const viewClientOrderHistory = async (clientId) => {
    try {
      const response = await axios.get(`${API_BASE}/clients/${clientId}/orders`);
      const orders = response.data;
      
      if (orders.length === 0) {
        alert("No orders found for this client.");
        return;
      }
      
      const orderList = orders.map(order => 
        `#${order.orderNumber} - ${order.status} - ${order.total?.toLocaleString() || 0} DZD (${new Date(order.createdAt).toLocaleDateString()})`
      ).join('\n');
      
      alert(`📋 Order History:\n\n${orderList}`);
    } catch (err) {
      alert("Error fetching order history");
    }
  };

  /* Edit Client */
  const editClient = (clientId) => {
    alert(`Edit client functionality for ID: ${clientId}\n\nThis feature would open an edit form with current client data.`);
  };

  /* Create Order for Client */
  const createOrderForClient = (clientId) => {
    setActiveTab('orders');
    setShowOrderForm(true);
    // Pre-select the client in the order form
    setTimeout(() => {
      const clientSelect = document.querySelector('select[name="clientId"]');
      if (clientSelect) {
        clientSelect.value = clientId;
      }
    }, 100);
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
          {/* Enhanced Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            {/* Total Revenue Card */}
            <div className="dashboard-card" style={{
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--warning) 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200%', height: '200%', background: 'rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>💰 Total Revenue</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
                {dashboardData.overview.totalRevenue.toLocaleString()} {t.currency}
              </p>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                marginTop: '5px'
              }}>
                <span style={{ color: dashboardData.overview.revenueGrowth > 0 ? '#4ade80' : '#ff6b6b' }}>
                  {dashboardData.overview.revenueGrowth > 0 ? '↑' : '↓'}
                </span>
                <span>{Math.abs(dashboardData.overview.revenueGrowth).toFixed(1)}% from last month</span>
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="dashboard-card" style={{
              background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--success) 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200%', height: '200%', background: 'rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>📦 Total Orders</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
                {dashboardData.overview.totalOrders.toLocaleString()}
              </p>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8, 
                marginTop: '5px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>✅ Completed: {dashboardData.overview.completedOrders}</span>
                  <span>⏳ Pending: {dashboardData.overview.pendingOrders}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>❌ Cancelled: {dashboardData.overview.cancelledOrders}</span>
                </div>
              </div>
            </div>

            {/* Average Order Value Card */}
            <div className="dashboard-card" style={{
              background: 'linear-gradient(135deg, var(--info) 0%, var(--primary-blue) 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200%', height: '200%', background: 'rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>📊 Avg Order Value</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
                {Math.round(dashboardData.overview.avgOrderValue).toLocaleString()} {t.currency}
              </p>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8, 
                marginTop: '5px'
              }}>
                Per order across all time
              </div>
            </div>

            {/* Total Clients Card */}
            <div className="dashboard-card" style={{
              background: 'linear-gradient(135deg, var(--primary-red) 0%, var(--danger) 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200%', height: '200%', background: 'rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>👥 Total Clients</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
                {dashboardData.overview.totalClients.toLocaleString()}
              </p>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8, 
                marginTop: '5px'
              }}>
                Active Algerian businesses
              </div>
            </div>
          </div>

          {/* Top Products and Recent Orders */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>
            {/* Top Products */}
            <div className="card">
              <h3 style={{ 
                margin: '0 0 20px 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}>
                🏆 Top 3 Products
                </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {dashboardData.topProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <p>No products data available</p>
                  </div>
                ) : (
                  dashboardData.topProducts.map((product, index) => (
                    <div key={product._id || index} style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)',
                      border: '1px solid rgba(0,102,51,0.1)',
                      borderRadius: '12px',
                      padding: '15px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 5px 0', 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: 'var(--primary-dark)' 
                        }}>
                          {product.name}
                        </h4>
                        <p style={{ 
                          margin: '0 0 3px 0', 
                          fontSize: '12px', 
                          color: 'var(--text-secondary)' 
                        }}>
                          SKU: {product.sku}
                        </p>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
                          <span>📦 Sold: {product.totalSold}</span>
                          <span>💰 Revenue: {product.revenue.toLocaleString()} {t.currency}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          background: product.growth > 0 ? 'var(--success)' : 'var(--danger)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: '10px'
                        }}>
                          {product.growth > 0 ? '↑' : '↓'} {Math.abs(product.growth).toFixed(1)}%
                        </div>
                        <div style={{
                          background: 'var(--gradient-primary)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {Math.round(product.avgPrice).toLocaleString()} {t.currency}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '25px',
                padding: '0 20px',
                borderBottom: '1px solid rgba(0,102,51,0.1)',
                paddingBottom: '15px'
              }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary-dark)' }}>📋 Recent Orders</h3>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="btn"
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '14px',
                    background: 'var(--gradient-primary)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  View All Orders →
                </button>
              </div>
              
              {dashboardData.recentOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>No orders yet</p>
                  <p style={{ fontSize: '14px' }}>Create your first order to see it here!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {dashboardData.recentOrders.map((order, index) => (
                    <div key={order._id} style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,248,255,0.98) 100%)',
                      border: '1px solid rgba(0,102,51,0.1)',
                      borderRadius: '12px',
                      padding: '15px',
                      transition: 'all 0.3s ease',
                      borderLeft: `4px solid ${
                        order.status === 'Delivered' ? 'var(--success)' : 
                        order.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)'
                      }`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <h4 style={{ 
                              margin: '0', 
                              fontSize: '16px', 
                              fontWeight: '600',
                              color: 'var(--primary-dark)' 
                            }}>
                              #{order.orderNumber}
                            </h4>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              background: order.status === 'Delivered' ? 'var(--success)' : 
                                           order.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)',
                              color: 'white'
                            }}>
                              {order.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <p style={{ margin: '0 0 3px 0' }}>👤 {order.client?.name}</p>
                            <p style={{ margin: '0 0 3px 0' }}>📅 {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p style={{ margin: '0 0 3px 0' }}>📦 {order.items} items</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            background: 'var(--accent-gold)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '8px'
                          }}>
                            💰 {order.total.toLocaleString()} {t.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      {activeTab === "products" && (
        <div>
          {/* Enhanced Products Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '25px',
            padding: '0 20px',
            borderBottom: '2px solid rgba(0,102,51,0.1)',
            paddingBottom: '15px'
          }}>
            <h3 style={{ fontSize: '24px', color: 'var(--primary-dark)', margin: '0' }}>
              🛍️ {t.products}
            </h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setShowProductForm(!showProductForm)}
                className="btn"
                style={{
                  background: 'var(--gradient-primary)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                {showProductForm ? '✖ Cancel' : '➕ Add Product'}
              </button>
              <button 
                onClick={() => fetchLowStockProducts()}
                className="btn"
                style={{
                  background: 'var(--gradient-secondary)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 20px',
                  fontSize: '14px',
                  borderRadius: '8px'
                }}
              >
                ⚠️ Low Stock Alert
              </button>
            </div>
          </div>

          {/* Add Product Form */}
          {showProductForm && (
            <div className="card" style={{ marginBottom: '30px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary-dark)' }}>
                📦 Add New Product
              </h2>
              <form onSubmit={addProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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
                  <label>Category</label>
                  <select name="category">
                    <option value="">Select Category</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Food">Food</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Household">Household</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input name="brand" placeholder="Enter brand name" />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input name="supplier" placeholder="Enter supplier" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" placeholder="Enter product description" rows="3"></textarea>
                </div>
              </div>

              {/* Pricing Section */}
              <div style={{ background: 'rgba(0,102,51,0.05)', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary-dark)' }}>💰 Pricing</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label>Retail Price ({t.currency}) *</label>
                    <input name="retailPrice" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div className="form-group">
                    <label>Wholesale Price ({t.currency}) *</label>
                    <input name="wholesalePrice" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div className="form-group">
                    <label>Cost ({t.currency}) *</label>
                    <input name="cost" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select name="currency">
                      <option value="DZD">DZD - Algerian Dinar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stock Section */}
              <div style={{ background: 'rgba(0,102,51,0.05)', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary-dark)' }}>📦 Inventory Management</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label>{t.quantity} *</label>
                    <input name="quantity" type="number" placeholder="0" required />
                  </div>
                  <div className="form-group">
                    <label>Minimum Stock *</label>
                    <input name="minStock" type="number" placeholder="0" required />
                  </div>
                  <div className="form-group">
                    <label>Maximum Stock</label>
                    <input name="maxStock" type="number" placeholder="1000" />
                  </div>
                  <div className="form-group">
                    <label>Reorder Point</label>
                    <input name="reorderPoint" type="number" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Storage Location</label>
                    <input name="location" placeholder="Warehouse A" />
                  </div>
                </div>
              </div>

              {/* Dimensions Section */}
              <div style={{ background: 'rgba(0,102,51,0.05)', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary-dark)' }}>📏 Product Dimensions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input name="weight" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label>Length (cm)</label>
                    <input name="length" type="number" step="0.1" placeholder="0.0" />
                  </div>
                  <div className="form-group">
                    <label>Width (cm)</label>
                    <input name="width" type="number" step="0.1" placeholder="0.0" />
                  </div>
                  <div className="form-group">
                    <label>Height (cm)</label>
                    <input name="height" type="number" step="0.1" placeholder="0.0" />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select name="unit">
                      <option value="kg">Kilograms</option>
                      <option value="g">Grams</option>
                      <option value="cm">Centimeters</option>
                      <option value="m">Meters</option>
                      <option value="l">Liters</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <button type="submit" disabled={loadingAction} className="btn" style={{ 
                  background: 'var(--gradient-success)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '15px 40px', 
                  fontSize: '18px', 
                  borderRadius: '8px',
                  fontWeight: 'bold' 
                }}>
                  {loadingAction ? '⏳ Adding Product...' : '✅ Add Product'}
                </button>
              </div>
            </form>
            </div>
          )}

          {/* Products List */}
          <div className="list">
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>No products yet</p>
                <p style={{ fontSize: '14px' }}>Add your first product to see it here!</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="list-item" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,248,255,0.98) 100%)',
                  border: '1px solid rgba(0,102,51,0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '15px',
                  transition: 'all 0.3s ease',
                  borderLeft: `4px solid ${
                    product.inventory?.stockStatus === 'Out of Stock' ? 'var(--danger)' : 
                    product.inventory?.stockStatus === 'Low Stock' ? 'var(--warning)' : 'var(--success)'
                  }`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Left Column - Product Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <h3 style={{ 
                          margin: '0', 
                          fontSize: '20px', 
                          fontWeight: '700',
                          color: 'var(--primary-dark)' 
                        }}>
                          {product.name}
                        </h3>
                        {product.category && (
                          <span style={{
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            marginLeft: '10px'
                          }}>
                            {product.category}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        {product.brand && <p><strong>Brand:</strong> {product.brand}</p>}
                        {product.supplier && <p><strong>Supplier:</strong> {product.supplier}</p>}
                        {product.sku && <p><strong>SKU:</strong> {product.sku}</p>}
                        {product.barcode && <p><strong>Barcode:</strong> {product.barcode}</p>}
                        {product.description && <p><strong>Description:</strong> {product.description}</p>}
                      </div>
                      
                      {/* Pricing Display */}
                      <div style={{ 
                        background: 'rgba(0,102,51,0.05)', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '10px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '8px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>💰 Retail</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                            {product.price?.retail?.toLocaleString() || 0} {product.price?.currency || 'DZD'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>🏪 Wholesale</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--success)' }}>
                            {product.price?.wholesale?.toLocaleString() || 0} {product.price?.currency || 'DZD'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>💸 Cost</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--info)' }}>
                            {product.price?.cost?.toLocaleString() || 0} {product.price?.currency || 'DZD'}
                          </div>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px', 
                        marginBottom: '10px',
                        fontSize: '14px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            fontSize: '24px', 
                            fontWeight: 'bold',
                            color: product.inventory?.stockStatus === 'Out of Stock' ? 'var(--danger)' : 
                                   product.inventory?.stockStatus === 'Low Stock' ? 'var(--warning)' : 'var(--success)'
                          }}>
                            {product.inventory?.quantity || 0}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Units</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            fontSize: '14px', 
                            color: 'var(--text-secondary)',
                            marginBottom: '5px'
                          }}>
                            Min: {product.inventory?.minStock || 0}
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: 'var(--text-secondary)',
                            marginBottom: '5px'
                          }}>
                            Max: {product.inventory?.maxStock || 1000}
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: 'var(--text-secondary)'
                          }}>
                            Reorder: {product.inventory?.reorderPoint || 0}
                          </div>
                        </div>
                      </div>

                      {/* Location and Dimensions */}
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {product.inventory?.location && <p><strong>📍 Location:</strong> {product.inventory.location}</p>}
                        {product.inventory?.lastRestocked && (
                          <p><strong>📅 Last Restocked:</strong> {new Date(product.inventory.lastRestocked).toLocaleDateString()}</p>
                        )}
                        {product.dimensions && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>📏 Dimensions:</strong> {product.dimensions.weight || 0}{product.dimensions.unit || 'kg'}, {product.dimensions.length || 0}×{product.dimensions.width || 0}×{product.dimensions.height || 0} {product.dimensions.unit || 'cm'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Status & Actions */}
                    <div style={{ textAlign: 'right', minWidth: '200px' }}>
                      {/* Stock Status Badge */}
                      <div style={{
                        background: product.inventory?.stockStatus === 'Out of Stock' ? 'var(--danger)' : 
                                   product.inventory?.stockStatus === 'Low Stock' ? 'var(--warning)' : 'var(--success)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {product.inventory?.stockStatus || 'In Stock'}
                      </div>
                      
                      {/* Status Indicator */}
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        {product.inventory?.stockStatus === 'Out of Stock' && '⚠️ Out of Stock - Order Immediately!'}
                        {product.inventory?.stockStatus === 'Low Stock' && '⚠️ Low Stock - Consider Reordering!'}
                        {product.inventory?.stockStatus === 'In Stock' && '✅ In Stock'}
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          onClick={() => updateStock(product._id, 10, 'add')}
                          className="btn"
                          style={{ fontSize: '12px', padding: '8px 12px' }}
                        >
                          📦 Add Stock
                        </button>
                        <button 
                          onClick={() => updateStock(product._id, 1, 'subtract')}
                          className="btn"
                          style={{ fontSize: '12px', padding: '8px 12px' }}
                        >
                          📤 Remove Stock
                        </button>
                        <button 
                          onClick={() => editProduct(product._id)}
                          className="btn"
                          style={{ fontSize: '12px', padding: '8px 12px' }}
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Clients Section */}
      {activeTab === "clients" && (
        <div>
          {/* Enhanced Clients Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '25px',
            padding: '0 20px',
            borderBottom: '2px solid rgba(0,102,51,0.1)',
            paddingBottom: '15px'
          }}>
            <h3 style={{ fontSize: '24px', color: 'var(--primary-dark)', margin: '0' }}>
              👥 {t.clients}
            </h3>
            <button 
              onClick={() => setShowClientForm(!showClientForm)}
              className="btn"
              style={{
                background: 'var(--gradient-primary)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                fontSize: '16px',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              {showClientForm ? '✖ Cancel' : '➕ Add Client'}
            </button>
          </div>

          {/* Add Client Form */}
          {showClientForm && (
            <div className="card" style={{ marginBottom: '30px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary-dark)' }}>
                👤 Add New Client
              </h2>
              <form onSubmit={addClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label>Client Name *</label>
                  <input name="name" placeholder="Enter client name" required />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input name="company" placeholder="Enter company name" />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input name="phone" type="tel" placeholder="213XXXXXXXXX" required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" placeholder="client@example.com" required />
                </div>
                <div className="form-group">
                  <label>Tax ID</label>
                  <input name="taxId" placeholder="DZXXXXXXXXX" />
                </div>
                <div className="form-group">
                  <label>Credit Limit (DZD)</label>
                  <input name="creditLimit" type="number" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Payment Terms</label>
                  <select name="paymentTerms">
                    <option value="COD">Cash on Delivery</option>
                    <option value="7 Days">7 Days</option>
                    <option value="14 Days">14 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Address Section */}
              <div style={{ background: 'rgba(0,102,51,0.05)', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary-dark)' }}>📍 Address Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label>Address *</label>
                    <input name="address" placeholder="Street address" required />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input name="city" placeholder="City" required />
                  </div>
                  <div className="form-group">
                    <label>Province *</label>
                    <input name="province" placeholder="Province" required />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input name="postalCode" placeholder="XXXXX" />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input name="country" placeholder="Algeria" value="Algeria" readOnly />
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div style={{ background: 'rgba(0,102,51,0.05)', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary-dark)' }}>📝 Additional Information</h4>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea name="notes" placeholder="Enter client notes, preferences, special requirements..." rows="3"></textarea>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <button type="submit" disabled={loadingAction} className="btn" style={{ 
                  background: 'var(--gradient-success)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '15px 40px', 
                  fontSize: '18px', 
                  borderRadius: '8px',
                  fontWeight: 'bold' 
                }}>
                  {loadingAction ? '⏳ Adding Client...' : '✅ Add Client'}
                </button>
              </div>
            </form>
            </div>
          )}

          {/* Clients List */}
          <div className="list">
            {clients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>No clients yet</p>
                <p style={{ fontSize: '14px' }}>Add your first client to see it here!</p>
              </div>
            ) : (
              clients.map((client) => (
                <div key={client._id} className="list-item" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,248,255,0.98) 100%)',
                  border: '1px solid rgba(0,102,51,0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '15px',
                  transition: 'all 0.3s ease',
                  borderLeft: `4px solid ${
                    client.status === 'Active' ? 'var(--success)' : 
                    client.status === 'Inactive' ? 'var(--warning)' : 'var(--danger)'
                  }`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Left Column - Client Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <h3 style={{ 
                          margin: '0', 
                          fontSize: '20px', 
                          fontWeight: '700',
                          color: 'var(--primary-dark)' 
                        }}>
                          {client.name}
                        </h3>
                        {client.company && (
                          <span style={{
                            background: 'var(--gradient-secondary)',
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '10px'
                          }}>
                            {client.company}
                          </span>
                        )}
                        <span style={{
                          background: client.status === 'Active' ? 'var(--success)' : 
                                     client.status === 'Inactive' ? 'var(--warning)' : 'var(--danger)',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '10px'
                        }}>
                          {client.status}
                        </span>
                      </div>
                      
                      {/* Contact Information */}
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        <p><strong>📞 Phone:</strong> {client.phone}</p>
                        <p><strong>📧 Email:</strong> {client.email}</p>
                        {client.taxId && <p><strong>🆔 Tax ID:</strong> {client.taxId}</p>}
                      </div>

                      {/* Address Information */}
                      <div style={{ 
                        background: 'rgba(0,102,51,0.05)', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '10px',
                        fontSize: '13px'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: 'var(--primary-dark)' }}>📍 Address</div>
                        <div>{client.address}</div>
                        <div>{client.city}, {client.province} {client.postalCode || ''}</div>
                        <div>{client.country}</div>
                      </div>

                      {/* Business Information */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '10px', 
                        marginBottom: '10px',
                        fontSize: '13px'
                      }}>
                        <div style={{ textAlign: 'center', background: 'rgba(0,102,51,0.05)', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>💳 Credit Limit</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                            {client.creditLimit?.toLocaleString() || 0} DZD
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(0,102,51,0.05)', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>⏰ Payment Terms</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--info)' }}>
                            {client.paymentTerms || 'COD'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(0,102,51,0.05)', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>📦 Total Orders</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--success)' }}>
                            {client.totalOrders || 0}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(0,102,51,0.05)', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>💰 Total Spent</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                            {client.totalSpent?.toLocaleString() || 0} DZD
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {client.notes && (
                        <div style={{ 
                          background: 'rgba(0,102,51,0.05)', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic'
                        }}>
                          <strong>📝 Notes:</strong> {client.notes}
                        </div>
                      )}
                    </div>

                    {/* Right Column - Actions & Order History */}
                    <div style={{ textAlign: 'right', minWidth: '200px' }}>
                      {/* Last Order Date */}
                      {client.lastOrderDate && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                          <strong>📅 Last Order:</strong><br/>
                          {new Date(client.lastOrderDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          onClick={() => viewClientOrderHistory(client._id)}
                          className="btn"
                          style={{ fontSize: '12px', padding: '8px 12px' }}
                        >
                          📋 Order History
                        </button>
                        <button 
                          onClick={() => editClient(client._id)}
                          className="btn"
                          style={{ fontSize: '12px', padding: '8px 12px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => createOrderForClient(client._id)}
                          className="btn"
                          style={{ fontSize: '12px', padding: '8px 12px' }}
                        >
                          📦 Create Order
                        </button>
                      </div>
                    </div>
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
                <div key={order._id} className="list-item" style={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)',
                  border: '1px solid rgba(0,102,51,0.1)',
                  borderRadius: '15px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 8px 25px rgba(0,102,51,0.15)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: order.status === 'Delivered' ? 'var(--success)' : 
                               order.status === 'Cancelled' ? 'var(--danger)' : 
                               order.status === 'Shipped' ? 'var(--info)' : 'var(--warning)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    {order.status || 'Pending'}
                  </div>

                  {/* Priority Badge */}
                  {order.priority && order.priority !== 'Normal' && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      background: order.priority === 'Urgent' ? 'var(--danger)' : 'var(--warning)',
                      color: 'white'
                    }}>
                      {order.priority}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                    {/* Left Column - Order Info */}
                    <div>
                      <h3 style={{ 
                        margin: '0 0 10px 0', 
                        color: 'var(--primary-dark)',
                        fontSize: '18px',
                        fontWeight: '700'
                      }}>
                        📋 #{order.orderNumber || order._id?.slice(-8)}
                      </h3>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ 
                          margin: '0 0 5px 0', 
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          👤 <strong>{order.client?.name || 'N/A'}</strong>
                        </p>
                        <p style={{ 
                          margin: '0 0 5px 0', 
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📞 {order.client?.phone || 'N/A'}
                        </p>
                        <p style={{ 
                          margin: '0 0 5px 0', 
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📍 {order.client?.city || 'N/A'}, {order.client?.province || 'N/A'}
                        </p>
                        <p style={{ 
                          margin: '0 0 5px 0', 
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📦 {order.items?.length || 0} items • {order.salesAgent ? `👔 ${order.salesAgent.firstName} ${order.salesAgent.lastName}` : 'No agent'}
                        </p>
                        <p style={{ 
                          margin: '0', 
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📅 {new Date(order.createdAt || Date.now()).toLocaleDateString('en-DZ', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Items Summary */}
                      <div style={{ 
                        background: 'rgba(0,102,51,0.05)', 
                        padding: '12px', 
                        borderRadius: '10px',
                        marginBottom: '15px'
                      }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--primary-dark)' }}>
                          🛍️ Order Items
                        </h4>
                        {order.items?.slice(0, 2).map((item, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '4px 0',
                            fontSize: '12px',
                            borderBottom: index < order.items.length - 1 ? '1px solid rgba(0,102,51,0.1)' : 'none'
                          }}>
                            <span>{item.product?.name || 'Product'}</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {item.quantity} × {item.unitPrice} DZD
                              {item.discount > 0 && (
                                <span style={{ color: 'var(--danger)', fontSize: '11px' }}>
                                  {' '}(-{item.discount}%)
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <p style={{ 
                            margin: '4px 0 0 0', 
                            fontSize: '11px', 
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic'
                          }}>
                            +{order.items.length - 2} more items...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Pricing & Status */}
                    <div style={{ textAlign: 'right' }}>
                      {/* Pricing Card */}
                      <div style={{ 
                        background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--warning) 100%)',
                        padding: '15px',
                        borderRadius: '12px',
                        marginBottom: '15px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(245,158,11,0.3)'
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                          💰 {order.pricing?.total?.toLocaleString() || 0} {t.currency}
                        </h4>
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>
                          {order.pricing?.discount > 0 && (
                            <p style={{ margin: '0 0 2px 0' }}>
                              Discount: -{order.pricing.discount.toLocaleString()} DZD
                            </p>
                          )}
                          <p style={{ margin: '0 0 2px 0' }}>
                            Subtotal: {order.pricing?.subtotal?.toLocaleString() || 0} DZD
                          </p>
                          <p style={{ margin: '0 0 2px 0' }}>
                            Tax (19%): {order.pricing?.tax?.toLocaleString() || 0} DZD
                          </p>
                        </div>
                      </div>

                      {/* Payment & Delivery Info */}
                      <div style={{ 
                        background: 'rgba(0,102,51,0.05)', 
                        padding: '12px', 
                        borderRadius: '10px',
                        marginBottom: '15px'
                      }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <p style={{ margin: '0 0 5px 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>💳 Payment:</span>
                            <strong>{order.payment?.method || 'N/A'}</strong>
                          </p>
                          <p style={{ margin: '0 0 5px 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>💵 Status:</span>
                            <strong style={{ 
                              color: order.payment?.status === 'Paid' ? 'var(--success)' : 'var(--warning)'
                            }}>
                              {order.payment?.status || 'Pending'}
                            </strong>
                          </p>
                          <p style={{ margin: '0 0 5px 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>🚚 Delivery:</span>
                            <strong>{order.delivery?.type || 'N/A'}</strong>
                          </p>
                          <p style={{ margin: '0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>📦 Status:</span>
                            <strong style={{ 
                              color: order.delivery?.status === 'Delivered' ? 'var(--success)' : 
                                     order.delivery?.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)'
                            }}>
                              {order.delivery?.status || 'Pending'}
                            </strong>
                          </p>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      {order.trackingNumber && (
                        <div style={{ 
                          background: 'rgba(0,102,51,0.05)', 
                          padding: '8px', 
                          borderRadius: '8px',
                          marginBottom: '10px',
                          fontSize: '11px'
                        }}>
                          <p style={{ margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📍 <strong>Tracking:</strong> {order.trackingNumber}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div style={{ 
                          background: 'rgba(0,102,51,0.05)', 
                          padding: '8px', 
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontStyle: 'italic'
                        }}>
                          <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
                            📝 {order.notes}
                          </p>
                        </div>
                      )}
                    </div>
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
