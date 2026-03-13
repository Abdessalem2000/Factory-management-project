import axios from 'axios'
import { ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Worker API
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
