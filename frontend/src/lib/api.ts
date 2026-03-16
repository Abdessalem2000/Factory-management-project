import axios from 'axios'
import { ApiResponse } from '../types'

// HARDCODED API URL - CONFIGURATION POUR NETLIFY
const API_BASE_URL = 'https://factory-management-project.onrender.com/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Important for CORS
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Generic API wrapper
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await api({
      method,
      url,
      data,
    })
    return response.data
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred' }
  }
}

// Production API
export const productionApi = {
  getOrders: (params?: any) => api.get('/production', { params }),
  getOrder: (id: string) => api.get(`/production/${id}`),
  createOrder: (data: any) => api.post('/production', data),
  updateOrder: (id: string, data: any) => api.put(`/production/${id}`, data),
  updateStage: (id: string, stageId: string, data: any) => 
    api.patch(`/production/${id}/stages/${stageId}`, data),
  deleteOrder: (id: string) => api.delete(`/production/${id}`),
  getStats: () => api.get('/production/stats/overview'),
  // Models - Using production orders as models (temporary solution)
  getModels: (params?: any) => api.get('/production', { params: { ...params, isModel: true } }),
  createModel: (data: any) => api.post('/production', { ...data, isModel: true }),
  updateModel: (id: string, data: any) => api.put(`/production/${id}`, data),
  deleteModel: (id: string) => api.delete(`/production/${id}`),
}

// Financial API
export const financialApi = {
  getTransactions: (params?: any) => api.get('/financial', { params }),
  getTransaction: (id: string) => api.get(`/financial/${id}`),
  createTransaction: (data: any) => api.post('/financial', data),
  updateTransaction: (id: string, data: any) => api.put(`/financial/${id}`, data),
  deleteTransaction: (id: string) => api.delete(`/financial/${id}`),
  getSummary: (params?: any) => api.get('/financial/summary/overview', { params }),
  getCategoryBreakdown: (params?: any) => api.get('/financial/summary/categories', { params }),
  getFinancialMetrics: (period: string) => api.get(`/financial/metrics/${period}`),
  getInvoices: () => api.get('/financial/invoices'),
  createInvoice: (data: any) => api.post('/financial/invoices', data),
  updateInvoice: (id: string, data: any) => api.put(`/financial/invoices/${id}`, data),
  deleteInvoice: (id: string) => api.delete(`/financial/invoices/${id}`),
  getExpenses: () => api.get('/financial/expenses'),
  createExpense: (data: any) => api.post('/financial/expenses', data),
  approveExpense: (id: string) => api.patch(`/financial/expenses/${id}/approve`),
  rejectExpense: (id: string) => api.patch(`/financial/expenses/${id}/reject`),
  getBudgets: () => api.get('/financial/budgets'),
  createBudget: (data: any) => api.post('/financial/budgets', data),
  updateBudget: (id: string, data: any) => api.put(`/financial/budgets/${id}`, data),
  deleteBudget: (id: string) => api.delete(`/financial/budgets/${id}`),
  getPayments: () => api.get('/financial/payments'),
  recordPayment: (data: any) => api.post('/financial/payments', data),
  getPaymentMetrics: (period: string) => api.get(`/financial/payments/metrics/${period}`),
  // Allowances - Using transactions with category 'allowance'
  getAllowances: (params?: any) => api.get('/financial', { params: { ...params, category: 'allowance' } }),
  createAllowance: (data: any) => api.post('/financial', { ...data, type: 'expense', category: 'allowance' }),
  updateAllowance: (id: string, data: any) => api.put(`/financial/${id}`, data),
  deleteAllowance: (id: string) => api.delete(`/financial/${id}`),
}

// Supplier API
export const supplierApi = {
  getSuppliers: (params?: any) => api.get('/supplier', { params }),
  getSupplier: (id: string) => api.get(`/supplier/${id}`),
  createSupplier: (data: any) => api.post('/supplier', data),
  updateSupplier: (id: string, data: any) => api.put(`/supplier/${id}`, data),
  updateRating: (id: string, rating: number) => 
    api.patch(`/supplier/${id}/rating`, { rating }),
  deleteSupplier: (id: string) => api.delete(`/supplier/${id}`),
  getStats: () => api.get('/supplier/stats/overview'),
  getByCategory: (category: string) => api.get(`/supplier/by-category/${category}`),
}

// Analytics API
export const analyticsApi = {
  getDashboard: (params?: any) => api.get('/analytics/dashboard', { params }),
  getWorkerAnalytics: (params?: any) => api.get('/analytics/workers', { params }),
  getFinancialAnalytics: (params?: any) => api.get('/analytics/financial', { params }),
}

// Search API
export const searchApi = {
  searchWorkers: (query: string) => api.get('/workers/search', { params: { query } }),
  searchTransactions: (query: string) => api.get('/transactions/search', { params: { query } }),
}

export const workerApi = {
  getWorkers: (params?: any) => api.get('/worker', { params }),
  getWorker: (id: string) => api.get(`/worker/${id}`),
  createWorker: (data: any) => api.post('/worker', data),
  updateWorker: (id: string, data: any) => api.put(`/worker/${id}`, data),
  deleteWorker: (id: string) => api.delete(`/worker/${id}`),
  getStats: () => api.get('/worker/stats/overview'),
  getByDepartment: (department: string) => api.get(`/worker/by-department/${department}`),
  getBySkill: (skill: string) => api.get(`/worker/by-skill/${skill}`),
}

// Production Planning API
export const productionPlanningApi = {
  getProductionPlans: (timeRange: string) => api.get(`/production/plans/${timeRange}`),
  createProductionPlan: (data: any) => api.post('/production/plans', data),
  updateProductionPlan: (id: string, data: any) => api.put(`/production/plans/${id}`, data),
  deleteProductionPlan: (id: string) => api.delete(`/production/plans/${id}`),
  getResourceAllocations: () => api.get('/production/resources'),
  getCapacityMetrics: () => api.get('/production/capacity'),
  updateResourceAllocation: (id: string, data: any) => api.put(`/production/resources/${id}`, data),
  getProductionSchedule: (timeRange: string) => api.get(`/production/schedule/${timeRange}`),
  updateProductionSchedule: (id: string, data: any) => api.put(`/production/schedule/${id}`, data),
  getBottlenecks: () => api.get('/production/bottlenecks'),
  getEfficiencyMetrics: (timeRange: string) => api.get(`/production/efficiency/${timeRange}`),
}

// Inventory Management API
export const inventoryApi = {
  getInventoryItems: (params: any) => api.get('/inventory/items', { params }),
  createInventoryItem: (data: any) => api.post('/inventory/items', data),
  updateInventoryItem: (id: string, data: any) => api.put(`/inventory/items/${id}`, data),
  deleteInventoryItem: (id: string) => api.delete(`/inventory/items/${id}`),
  getStockMovements: () => api.get('/inventory/movements'),
  recordStockMovement: (data: any) => api.post('/inventory/movements', data),
  getSuppliers: () => api.get('/inventory/suppliers'),
  createSupplier: (data: any) => api.post('/inventory/suppliers', data),
  updateSupplier: (id: string, data: any) => api.put(`/inventory/suppliers/${id}`, data),
  getInventoryMetrics: () => api.get('/inventory/metrics'),
  getLowStockAlerts: () => api.get('/inventory/alerts/low-stock'),
  getStockForecast: (itemId: string) => api.get(`/inventory/forecast/${itemId}`),
  getInventoryValuation: (params?: any) => api.get('/inventory/valuation', { params }),
  getConsumptionReport: (timeRange: string) => api.get(`/inventory/consumption/${timeRange}`),
}

// Employee Management API - Using worker routes as base
export const employeeApi = {
  getEmployees: (params: any) => api.get('/worker', { params }),
  createEmployee: (data: any) => api.post('/worker', data),
  updateEmployee: (id: string, data: any) => api.put(`/worker/${id}`, data),
  deleteEmployee: (id: string) => api.delete(`/worker/${id}`),
  // These endpoints don't exist yet - will need to be created in backend
  getAttendanceRecords: (params?: any) => api.get('/worker/attendance', { params }),
  recordAttendance: (data: any) => api.post('/worker/attendance', data),
  getLeaveRequests: () => api.get('/worker/leave'),
  createLeaveRequest: (data: any) => api.post('/worker/leave', data),
  approveLeaveRequest: (id: string) => api.patch(`/worker/leave/${id}/approve`),
  rejectLeaveRequest: (id: string) => api.patch(`/worker/leave/${id}/reject`),
  getPerformanceReviews: () => api.get('/employees/performance'),
  createPerformanceReview: (data: any) => api.post('/employees/performance', data),
  updatePerformanceReview: (id: string, data: any) => api.put(`/employees/performance/${id}`, data),
  getTrainingPrograms: () => api.get('/employees/training'),
  createTrainingProgram: (data: any) => api.post('/employees/training', data),
  enrollInTraining: (programId: string, employeeId: string) => api.post(`/employees/training/${programId}/enroll`, { employeeId }),
  getEmployeeMetrics: () => api.get('/employees/metrics'),
  getEmployeeProfile: (id: string) => api.get(`/employees/${id}/profile`),
  updateEmployeeProfile: (id: string, data: any) => api.put(`/employees/${id}/profile`, data),
  getEmployeeDocuments: (id: string) => api.get(`/employees/${id}/documents`),
  uploadEmployeeDocument: (id: string, data: any) => api.post(`/employees/${id}/documents`, data),
  getPayrollData: (params?: any) => api.get('/employees/payroll', { params }),
  generatePayroll: (data: any) => api.post('/employees/payroll/generate', data),
}

// Raw Materials API
export const rawMaterialsApi = {
  getRawMaterials: (params?: any) => api.get('/raw-materials', { params }),
  getRawMaterial: (id: string) => api.get(`/raw-materials/${id}`),
  createRawMaterial: (data: any) => api.post('/raw-materials', data),
  updateRawMaterial: (id: string, data: any) => api.put(`/raw-materials/${id}`, data),
  deleteRawMaterial: (id: string) => api.delete(`/raw-materials/${id}`),
  getLowStockAlerts: () => api.get('/raw-materials/alerts/low-stock'),
  updateStock: (id: string, quantity: number) => api.patch(`/raw-materials/${id}/stock`, { quantity }),
  getStockMovements: (id: string) => api.get(`/raw-materials/${id}/movements`),
  getCategories: () => api.get('/raw-materials/categories'),
  getSuppliers: () => api.get('/raw-materials/suppliers'),
}

// Advanced Reporting API
export const reportingApi = {
  getReports: (params: any) => api.get('/reports', { params }),
  createReport: (data: any) => api.post('/reports', data),
  updateReport: (id: string, data: any) => api.put(`/reports/${id}`, data),
  deleteReport: (id: string) => api.delete(`/reports/${id}`),
  getReportTemplates: () => api.get('/reports/templates'),
  createReportTemplate: (data: any) => api.post('/reports/templates', data),
  updateReportTemplate: (id: string, data: any) => api.put(`/reports/templates/${id}`, data),
  generateReport: (templateId: string, parameters: any) => api.post(`/reports/generate/${templateId}`, parameters),
  downloadReport: (id: string, format: string) => api.get(`/reports/${id}/download/${format}`, { responseType: 'blob' }),
  shareReport: (id: string, recipients: string[]) => api.post(`/reports/${id}/share`, { recipients }),
  getScheduledReports: () => api.get('/reports/scheduled'),
  createScheduledReport: (data: any) => api.post('/reports/scheduled', data),
  updateScheduledReport: (id: string, data: any) => api.put(`/reports/scheduled/${id}`, data),
  deleteScheduledReport: (id: string) => api.delete(`/reports/scheduled/${id}`),
  getReportAnalytics: (timeRange: string) => api.get(`/reports/analytics/${timeRange}`),
  getReportHistory: (id: string) => api.get(`/reports/${id}/history`),
  duplicateReport: (id: string) => api.post(`/reports/${id}/duplicate`),
  archiveReport: (id: string) => api.patch(`/reports/${id}/archive`),
  restoreReport: (id: string) => api.patch(`/reports/${id}/restore`),
}
