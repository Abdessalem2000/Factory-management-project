import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://factory-management-project.onrender.com/api';

// FMCG Distribution Translations
const fmcgTranslations = {
  en: {
    title: "🚚 FMCG Distribution ERP",
    subtitle: "Pre-sales & Distribution Management System",
    dashboard: "Sales Dashboard",
    clients: "Clients",
    orders: "Orders (Pre-sales)",
    products: "Products & Brands",
    delivery: "Delivery",
    workers: "Sales Team",
    income: "Revenue",
    expenses: "Expenses",
    
    // Dashboard metrics
    totalClients: "Total Clients",
    totalOrders: "Total Orders",
    totalRevenue: "Total Revenue",
    pendingOrders: "Pending Orders",
    deliveredOrders: "Delivered Orders",
    topProducts: "Top Products",
    topAgents: "Top Sales Agents",
    salesByBrand: "Sales by Brand",
    
    // Client fields
    clientName: "Client Name",
    clientType: "Client Type",
    address: "Address",
    city: "City",
    province: "Province",
    phone: "Phone",
    email: "Email",
    contactPerson: "Contact Person",
    registrationNumber: "Registration Number",
    taxId: "Tax ID",
    creditLimit: "Credit Limit",
    paymentTerms: "Payment Terms",
    
    // Order fields
    orderNumber: "Order Number",
    salesAgent: "Sales Agent",
    orderStatus: "Status",
    paymentMethod: "Payment Method",
    paymentStatus: "Payment Status",
    deliveryType: "Delivery Type",
    scheduledDate: "Scheduled Date",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    
    // Product fields
    brand: "Brand",
    retailPrice: "Retail Price",
    wholesalePrice: "Wholesale Price",
    cost: "Cost",
    barcode: "Barcode",
    sku: "SKU",
    inventory: "Inventory",
    available: "Available",
    reserved: "Reserved",
    
    // Delivery fields
    deliveryNumber: "Delivery Number",
    driver: "Driver",
    vehicle: "Vehicle",
    route: "Route",
    tracking: "Tracking",
    
    // Actions
    addClient: "Add New Client",
    addOrder: "Create Order",
    addProduct: "Add Product",
    addBrand: "Add Brand",
    assignDelivery: "Assign Delivery",
    
    // Status options
    orderStatuses: ['Pending', 'Validated', 'Processing', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'],
    paymentMethods: ['Cash', 'Credit', 'Bank Transfer', 'Mobile Money'],
    paymentStatuses: ['Pending', 'Paid', 'Partial', 'Overdue'],
    deliveryStatuses: ['Preparing', 'Ready', 'In Transit', 'Delivering', 'Completed', 'Failed'],
    
    clientTypes: ['Retailer', 'Wholesaler', 'Supermarket', 'Restaurant', 'Hotel'],
    visitFrequencies: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
    
    currency: "DZD",
    loading: "🚚 Loading FMCG Distribution System...",
    noClients: "No clients yet. Add your first client!",
    noOrders: "No orders yet. Create your first order!",
    noProducts: "No products yet. Add your first product!",
    noBrands: "No brands yet. Add your first brand!"
  },
  fr: {
    title: "🚚 ERP Distribution FMCG",
    subtitle: "Système de Gestion de Prévente et Distribution",
    dashboard: "Tableau de Bord Ventes",
    clients: "Clients",
    orders: "Commandes (Prévente)",
    products: "Produits et Marques",
    delivery: "Livraison",
    workers: "Équipe de Ventes",
    income: "Revenus",
    expenses: "Dépenses",
    
    // Dashboard metrics
    totalClients: "Total Clients",
    totalOrders: "Total Commandes",
    totalRevenue: "Revenus Totaux",
    pendingOrders: "Commandes en Attente",
    deliveredOrders: "Commandes Livrées",
    topProducts: "Meilleurs Produits",
    topAgents: "Meilleurs Agents Commerciaux",
    salesByBrand: "Ventes par Marque",
    
    // Client fields
    clientName: "Nom du Client",
    clientType: "Type de Client",
    address: "Adresse",
    city: "Ville",
    province: "Province",
    phone: "Téléphone",
    email: "Email",
    contactPerson: "Personne à Contacter",
    registrationNumber: "Numéro d'Enregistrement",
    taxId: "ID Fiscal",
    creditLimit: "Limite de Crédit",
    paymentTerms: "Conditions de Paiement",
    
    // Order fields
    orderNumber: "Numéro de Commande",
    salesAgent: "Agent Commercial",
    orderStatus: "Statut",
    paymentMethod: "Méthode de Paiement",
    paymentStatus: "Statut de Paiement",
    deliveryType: "Type de Livraison",
    scheduledDate: "Date Prévue",
    subtotal: "Sous-total",
    discount: "Remise",
    total: "Total",
    
    // Product fields
    brand: "Marque",
    retailPrice: "Prix de Détail",
    wholesalePrice: "Prix de Gros",
    cost: "Coût",
    barcode: "Code Barres",
    sku: "SKU",
    inventory: "Inventaire",
    available: "Disponible",
    reserved: "Réservé",
    
    // Delivery fields
    deliveryNumber: "Numéro de Livraison",
    driver: "Chauffeur",
    vehicle: "Véhicule",
    route: "Route",
    tracking: "Suivi",
    
    // Actions
    addClient: "Ajouter un Nouveau Client",
    addOrder: "Créer une Commande",
    addProduct: "Ajouter un Produit",
    addBrand: "Ajouter une Marque",
    assignDelivery: "Assigner une Livraison",
    
    // Status options
    orderStatuses: ['En Attente', 'Validé', 'En Traitement', 'Prêt pour Livraison', 'En Livraison', 'Livré', 'Annulé'],
    paymentMethods: ['Espèces', 'Crédit', 'Virement Bancaire', 'Mobile Money'],
    paymentStatuses: ['En Attente', 'Payé', 'Partiel', 'En Retard'],
    deliveryStatuses: ['Préparation', 'Prêt', 'En Transit', 'Livraison', 'Terminé', 'Échec'],
    
    clientTypes: ['Détaillant', 'Grossiste', 'Supermarché', 'Restaurant', 'Hôtel'],
    visitFrequencies: ['Quotidien', 'Hebdomadaire', 'Bi-hebdomadaire', 'Mensuel'],
    
    currency: "DZD",
    loading: "🚚 Chargement du Système de Distribution FMCG...",
    noClients: "Aucun client encore. Ajoutez votre premier client!",
    noOrders: "Aucune commande encore. Créez votre première commande!",
    noProducts: "Aucun produit encore. Ajoutez votre premier produit!",
    noBrands: "Aucune marque encore. Ajoutez votre première marque!"
  }
};

function App() {
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [addingClient, setAddingClient] = useState(false);
  const [addingOrder, setAddingOrder] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [addingBrand, setAddingBrand] = useState(false);

  const t = fmcgTranslations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workersRes, clientsRes, brandsRes, productsRes, ordersRes, deliveriesRes, incomeRes, expensesRes, dashboardRes] = await Promise.all([
          axios.get(`${API_BASE}/workers`),
          axios.get(`${API_BASE}/clients`),
          axios.get(`${API_BASE}/brands`),
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/orders`),
          axios.get(`${API_BASE}/deliveries`),
          axios.get(`${API_BASE}/income`),
          axios.get(`${API_BASE}/expenses`),
          axios.get(`${API_BASE}/dashboard`)
        ]);
        setWorkers(workersRes.data);
        setClients(clientsRes.data);
        setBrands(brandsRes.data);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setDeliveries(deliveriesRes.data);
        setIncome(incomeRes.data);
        setExpenses(expensesRes.data);
        setDashboard(dashboardRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addClient = async (e) => {
    e.preventDefault();
    setAddingClient(true);
    try {
      const data = Object.fromEntries(new FormData(e.target));
      await axios.post(`${API_BASE}/clients`, data);
      e.target.reset();
      const clientsRes = await axios.get(`${API_BASE}/clients`);
      setClients(clientsRes.data);
      alert('✅ Client added successfully!');
    } catch (error) {
      console.error('Error adding client:', error);
      alert(`❌ Error adding client: ${error.response?.data?.error || error.message}`);
    } finally {
      setAddingClient(false);
    }
  };

  const addBrand = async (e) => {
    e.preventDefault();
    setAddingBrand(true);
    try {
      const data = Object.fromEntries(new FormData(e.target));
      await axios.post(`${API_BASE}/brands`, data);
      e.target.reset();
      const brandsRes = await axios.get(`${API_BASE}/brands`);
      setBrands(brandsRes.data);
      alert('✅ Brand added successfully!');
    } catch (error) {
      console.error('Error adding brand:', error);
      alert(`❌ Error adding brand: ${error.response?.data?.error || error.message}`);
    } finally {
      setAddingBrand(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.price = {
        retail: parseFloat(data.retailPrice),
        wholesale: parseFloat(data.wholesalePrice),
        cost: parseFloat(data.cost)
      };
      data.inventory = {
        quantity: parseInt(data.quantity),
        minStock: parseInt(data.minStock),
        reserved: 0,
        available: parseInt(data.quantity)
      };
      data.brand = data.brandId;
      delete data.brandId;
      delete data.retailPrice;
      delete data.wholesalePrice;
      delete data.cost;
      delete data.minStock;
      
      await axios.post(`${API_BASE}/products`, data);
      e.target.reset();
      const productsRes = await axios.get(`${API_BASE}/products`);
      setProducts(productsRes.data);
      alert('✅ Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`❌ Error adding product: ${error.response?.data?.error || error.message}`);
    } finally {
      setAddingProduct(false);
    }
  };

  const addOrder = async (e) => {
    e.preventDefault();
    setAddingOrder(true);
    try {
      const formData = Object.fromEntries(new FormData(e.target));
      const orderData = {
        client: formData.clientId,
        salesAgent: formData.salesAgentId,
        items: [{
          product: formData.productId,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          totalPrice: parseFloat(formData.quantity) * parseFloat(formData.unitPrice),
          discount: 0,
          tax: 0
        }],
        pricing: {
          discount: parseFloat(formData.discount) || 0,
          tax: parseFloat(formData.tax) || 0
        },
        payment: {
          method: formData.paymentMethod,
          status: 'Pending'
        },
        delivery: {
          type: formData.deliveryType,
          address: formData.deliveryAddress,
          scheduledDate: formData.scheduledDate
        },
        notes: formData.notes
      };
      
      await axios.post(`${API_BASE}/orders`, orderData);
      e.target.reset();
      const ordersRes = await axios.get(`${API_BASE}/orders`);
      setOrders(ordersRes.data);
      alert('✅ Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`❌ Error creating order: ${error.response?.data?.error || error.message}`);
    } finally {
      setAddingOrder(false);
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
        <p style={{ color: '#dc2626', fontSize: '1em', margin: '10px 0 0 0' }}>🇩🇿 {t.currency} | 🇩🇿 Algeria Market | 🚚 FMCG Distribution</p>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {['dashboard', 'clients', 'orders', 'products', 'delivery', 'workers', 'income', 'expenses'].map(tab => (
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
            {t[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Main Dashboard Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>🏪 {t.totalClients}</h3>
              <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{(dashboard.clients || clients.length || 0)}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>📋 {t.totalOrders}</h3>
              <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{(dashboard.orders || orders.length || 0)}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>💰 {t.totalRevenue}</h3>
              <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{(dashboard.totalRevenue || orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0)).toLocaleString()} {t.currency}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>📦 {t.brands}</h3>
              <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold' }}>{(dashboard.brands || brands.length || 0)}</p>
            </div>
          </div>

          {/* Sales Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ color: '#1e293b', margin: '0 0 15px 0' }}>🏆 {t.topProducts}</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {dashboard.topProducts?.slice(0, 3).map((product, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
                    <span>{product.name}</span>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>{product.totalRevenue.toLocaleString()} {t.currency}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ color: '#1e293b', margin: '0 0 15px 0' }}>🥇 {t.topAgents}</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {dashboard.topSalesAgents?.slice(0, 3).map((agent, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
                    <span>{agent.name}</span>
                    <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{agent.totalRevenue.toLocaleString()} {t.currency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div>
          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.addClient}</h2>
            <form onSubmit={addClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input name="name" placeholder={t.clientName} required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="type" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">{t.clientType}</option>
                {t.clientTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <input name="location.address" placeholder={t.address} style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="location.city" placeholder={t.city} style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="location.province" placeholder={t.province} style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="contact.phone" placeholder={t.phone} style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="contact.email" placeholder={t.email} type="email" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="contact.contactPerson" placeholder={t.contactPerson} style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="business.registrationNumber" placeholder={t.registrationNumber} style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="credit.creditLimit" type="number" placeholder={t.creditLimit} style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <button type="submit" disabled={addingClient} style={{ 
                padding: '12px 24px', 
                background: addingClient ? '#64748b' : '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: addingClient ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}>
                {addingClient ? 'Adding...' : '➕ Add Client'}
              </button>
            </form>
          </div>

          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.clients} ({clients.length})</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {clients.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>{t.noClients}</p>
              ) : (
                clients.map(client => (
                  <div key={client._id} style={{ 
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
                      <strong style={{ color: '#1e293b', fontSize: '1.1em' }}>{client.name}</strong>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{client.type} • {client.location?.city}</p>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        📞 {client.contact?.phone} | 👤 {client.contact?.contactPerson}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                        💳 {client.credit?.creditLimit?.toLocaleString() || 0} {t.currency}
                      </span>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        {client.status === 'Active' ? '✅ Active' : '⏸️ Inactive'}
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
          {/* Add Brand Section */}
          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.addBrand}</h2>
            <form onSubmit={addBrand} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input name="name" placeholder="Brand Name *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="description" placeholder="Description" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="website" placeholder="Website" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="contact.phone" placeholder="Phone" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="contact.email" placeholder="Email" type="email" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="commission.rate" type="number" step="0.01" placeholder="Commission Rate (0.15)" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <button type="submit" disabled={addingBrand} style={{ 
                padding: '12px 24px', 
                background: addingBrand ? '#64748b' : '#8b5cf6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: addingBrand ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}>
                {addingBrand ? 'Adding...' : '🏷️ Add Brand'}
              </button>
            </form>
          </div>

          {/* Add Product Section */}
          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.addProduct}</h2>
            <form onSubmit={addProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input name="name" placeholder="Product Name *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="brandId" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">Select Brand</option>
                {brands.map(brand => <option key={brand._id} value={brand._id}>{brand.name}</option>)}
              </select>
              <input name="sku" placeholder="SKU *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="barcode" placeholder={t.barcode} style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="retailPrice" type="number" placeholder={`${t.retailPrice} (${t.currency}) *`} step="100" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="wholesalePrice" type="number" placeholder={`${t.wholesalePrice} (${t.currency}) *`} step="100" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="cost" type="number" placeholder={`Cost (${t.currency}) *`} step="100" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="quantity" type="number" placeholder="Quantity *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="minStock" type="number" placeholder="Min Stock Level" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
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
                {addingProduct ? 'Adding...' : '📦 Add Product'}
              </button>
            </form>
          </div>

          {/* Products List */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.products} ({products.length})</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {products.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>{t.noProducts}</p>
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
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
                        🏷️ {product.brand?.name} • SKU: {product.sku}
                      </p>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        📦 Stock: {product.inventory?.quantity} | Available: {product.inventory?.available}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>
                        <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                          💰 {product.price?.retail?.toLocaleString()} {t.currency}
                        </span>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                          Wholesale: {product.price?.wholesale?.toLocaleString()} {t.currency}
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: product.inventory?.quantity <= product.inventory?.minStock ? '#ef4444' : '#10b981', fontSize: '0.9em', fontWeight: 'bold' }}>
                          {product.inventory?.quantity <= product.inventory?.minStock ? '⚠️ Low Stock' : '✅ In Stock'}
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

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {/* Prominent Create Order Button */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <button 
              onClick={() => setShowOrderForm(!showOrderForm)}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.3s'
              }}
            >
              {showOrderForm ? '📋 Hide Order Form' : '📋 Create New Order'}
            </button>
          </div>

          {/* Create Order Form */}
          {showOrderForm && (
          <div id="orderForm" style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '2px solid #2563eb', boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 20px 0', textAlign: 'center' }}>📋 {t.addOrder}</h2>
            <form onSubmit={addOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <select name="clientId" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">Select Client *</option>
                {clients.map(client => <option key={client._id} value={client._id}>{client.name}</option>)}
              </select>
              <select name="salesAgentId" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">Select Sales Agent *</option>
                {workers.filter(w => w.role === 'Sales Agent').map(agent => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
              </select>
              <select name="productId" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">Select Product *</option>
                {products.map(product => <option key={product._id} value={product._id}>{product.name} - {product.price?.wholesale} DZD</option>)}
              </select>
              <input name="quantity" type="number" placeholder="Quantity *" min="1" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="unitPrice" type="number" placeholder="Unit Price (DZD) *" step="100" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="discount" type="number" placeholder="Discount (%)" step="0.01" min="0" max="100" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <select name="paymentMethod" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">Payment Method *</option>
                {t.paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
              </select>
              <select name="deliveryType" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}>
                <option value="">Delivery Type *</option>
                <option value="Delivery">Delivery</option>
                <option value="Pickup">Pickup</option>
              </select>
              <input name="deliveryAddress" placeholder="Delivery Address *" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <input name="scheduledDate" type="date" required style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }} />
              <textarea name="notes" placeholder="Order Notes" rows="3" style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', gridColumn: '1 / -1' }}></textarea>
              <button type="submit" disabled={addingOrder} style={{ 
                padding: '12px 24px', 
                background: addingOrder ? '#64748b' : '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: addingOrder ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}>
                {addingOrder ? 'Creating...' : '📋 Create Order'}
              </button>
            </form>
          </div>
          )}

          {/* Orders List */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1e293b', margin: '0' }}>{t.orders} ({orders.length})</h2>
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
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>{t.noOrders}</p>
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
                          • {item.product?.name} x {item.quantity} = {item.totalPrice?.toLocaleString()} {t.currency}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e293b' }}>
                        Total: {order.pricing?.total?.toLocaleString()} {t.currency}
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

      {/* Delivery Tab */}
      {activeTab === 'delivery' && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.delivery} ({deliveries.length})</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {deliveries.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No deliveries yet.</p>
            ) : (
              deliveries.map(delivery => (
                <div key={delivery._id} style={{ 
                  padding: '15px', 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#1e293b', fontSize: '1.1em' }}>{delivery.deliveryNumber}</strong>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
                        📍 {delivery.route} • 🚚 {delivery.vehicle?.plateNumber}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        color: delivery.status === 'Completed' ? '#10b981' : delivery.status === 'Failed' ? '#ef4444' : '#f59e0b', 
                        fontWeight: 'bold', fontSize: '1.1em' 
                      }}>
                        {delivery.status}
                      </span>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                        👤 {delivery.driver?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.workers} ({workers.length})</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {workers.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No sales team members yet.</p>
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
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{worker.position}</p>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                      📞 {worker.phone} | 📧 {worker.email}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                      💰 {worker.salary?.toLocaleString()} {t.currency}
                    </span>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                      {worker.status === 'Active' ? '✅ Active' : '⏸️ Inactive'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.income} ({income.length})</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {income.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No income records yet.</p>
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
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{item.type}</p>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>
                      +{item.amount.toLocaleString()} {t.currency}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#1e293b', margin: '0 0 20px 0' }}>{t.expenses} ({expenses.length})</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {expenses.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No expense records yet.</p>
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
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{item.category}</p>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1em' }}>
                      -{item.amount.toLocaleString()} {t.currency}
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

export default App;
