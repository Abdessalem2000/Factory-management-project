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

  const [tab, setTab] = useState("dashboard");
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
    setLoadingAction(true);

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
    } catch (err) {
      alert("Error creating order");
    }

    setLoadingAction(false);
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
          <button key={x} onClick={() => setTab(x)}>
            {t[x]}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div>
          <h3>Clients: {clients.length}</h3>
          <h3>Orders: {orders.length}</h3>
          <h3>Products: {products.length}</h3>
        </div>
      )}

      {/* CLIENTS */}
      {tab === "clients" && (
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
      {tab === "products" && (
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
      {tab === "orders" && (
        <div>
          <button onClick={() => setShowOrderForm(!showOrderForm)}>
            Toggle Form
          </button>

          {showOrderForm && (
            <form onSubmit={addOrder}>
              <input name="quantity" placeholder="Qty" />
              <input name="unitPrice" placeholder="Price" />
              <input name="deliveryAddress" placeholder="Address" />
              <button>Create</button>
            </form>
          )}

          {orders.map((o) => (
            <div key={o._id}>{o.orderNumber}</div>
          ))}
        </div>
      )}
    </div>
  );
}