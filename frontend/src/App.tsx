import { Routes, Route } from 'react-router-dom'
import { ERPLayout } from './components/ui/ERPLayout'
import { ERPDashboard } from './pages/ERPDashboard'
import { RawMaterials } from './pages/RawMaterials'
import { ProductionOrders } from './pages/ProductionOrders'
import { FinancialTracking } from './pages/FinancialTracking'
import { SupplierManagement } from './pages/SupplierManagement'
import { WorkerManagement } from './pages/WorkerManagement'
import { Analytics } from './pages/Analytics'

function App() {
  return (
    <ERPLayout>
      <Routes>
        <Route path="/" element={<ERPDashboard />} />
        <Route path="/dashboard" element={<ERPDashboard />} />
        <Route path="/production" element={<ProductionOrders />} />
        <Route path="/raw-materials" element={<RawMaterials />} />
        <Route path="/financial" element={<FinancialTracking />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/workers" element={<WorkerManagement />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </ERPLayout>
  )
}

export default App
