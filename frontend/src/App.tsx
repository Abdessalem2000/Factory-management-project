import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { ProductionOrders } from './pages/ProductionOrders'
import { FinancialTracking } from './pages/FinancialTracking'
import { SupplierManagement } from './pages/SupplierManagement'
import { WorkerManagement } from './pages/WorkerManagement'
import { Analytics } from './pages/Analytics'
import { AnalyticsTest } from './pages/Analytics-test'
import { TestSimple } from './pages/TestSimple'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/production" element={<ProductionOrders />} />
        <Route path="/financial" element={<FinancialTracking />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/workers" element={<WorkerManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics-test" element={<AnalyticsTest />} />
        <Route path="/test-simple" element={<TestSimple />} />
      </Routes>
    </Layout>
  )
}

export default App
