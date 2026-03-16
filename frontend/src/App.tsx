import { Routes, Route } from 'react-router-dom'
import { ERPLayout } from './components/ui/ERPLayout'
import { ERPDashboard } from './pages/ERPDashboard'
import { RawMaterials } from './pages/RawMaterials'
import { ProductionOrders } from './pages/ProductionOrders'
import { FinancialTracking } from './pages/FinancialTracking'
import { SupplierManagement } from './pages/SupplierManagement'
import { WorkerManagement } from './pages/WorkerManagement'
import { Analytics } from './pages/Analytics'
import { Expenses } from './pages/Expenses'
import { Incomes } from './pages/Incomes'
import { Models } from './pages/Models'
import { Employees } from './pages/Employees'
import { PieceWorkers } from './pages/PieceWorkers'
import { SalaryAllowances } from './pages/SalaryAllowances'
import { Settings } from './pages/Settings'

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
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/incomes" element={<Incomes />} />
        <Route path="/models" element={<Models />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/piece-workers" element={<PieceWorkers />} />
        <Route path="/salary-allowances" element={<SalaryAllowances />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </ERPLayout>
  )
}

export default App
