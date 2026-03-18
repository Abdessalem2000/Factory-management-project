import { api } from './api'

export interface FactoryData {
  workers: any[]
  incomes: any[]
  expenses: any[]
  rawMaterials: any[]
  suppliers: any[]
  productionOrders: any[]
}

export async function generateFactoryAudit(factoryData: FactoryData): Promise<string> {
  try {
    const response = await api.post('/ai-audit', factoryData)
    return response.data.data
  } catch (error) {
    console.error('AI Audit Error:', error)
    return "AI Audit temporarily unavailable. Please check your API key configuration."
  }
}

export function downloadAsPDF(content: string, filename: string = 'factory-audit-report.txt') {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
