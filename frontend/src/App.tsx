import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, SignedIn, SignedOut, SignInButton } from '@/lib/auth.tsx'
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

// SAFE QUERY CLIENT - PREVENTS CRASHES!
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
})

// SAFE APP COMPONENT - PREVENTS CRASHES!
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SignedIn>
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
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ERPLayout>
        </SignedIn>
        <SignedOut>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 p-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Factory Management</h1>
                <p className="text-gray-600 mb-8">Please sign in to access the dashboard</p>
                <SignInButton mode="modal">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </SignedOut>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
