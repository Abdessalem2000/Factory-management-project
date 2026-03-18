import { prisma } from '../lib/prisma'
import { Worker, WorkerStatus, PaymentType } from '@prisma/client'

export interface CreateWorkerData {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  position: string
  department: string
  status?: WorkerStatus
  hourlyRate: number
  currency?: string
  paymentType?: PaymentType
  hireDate?: Date
  skills?: string[]
}

export interface UpdateWorkerData {
  firstName?: string
  lastName?: string
  email?: string
  position?: string
  department?: string
  status?: WorkerStatus
  hourlyRate?: number
  currency?: string
  paymentType?: PaymentType
  skills?: string[]
}

export interface WorkerFilters {
  search?: string
  department?: string
  status?: WorkerStatus
  paymentType?: PaymentType
  page?: number
  limit?: number
}

class WorkerService {
  // Get all workers with optional filtering
  async getWorkers(filters: WorkerFilters = {}) {
    const {
      search,
      department,
      status,
      paymentType,
      page = 1,
      limit = 50
    } = filters

    const where: any = {}

    // Search functionality
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' }
    }

    if (status) {
      where.status = status
    }

    if (paymentType) {
      where.paymentType = paymentType
    }

    const skip = (page - 1) * limit

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          expenses: {
            select: { amount: true, date: true }
          },
          incomes: {
            select: { amount: true, date: true }
          }
        }
      }),
      prisma.worker.count({ where })
    ])

    return {
      data: workers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Get worker by ID
  async getWorkerById(id: string) {
    return await prisma.worker.findUnique({
      where: { id },
      include: {
        expenses: true,
        incomes: true
      }
    })
  }

  // Get worker by employee ID
  async getWorkerByEmployeeId(employeeId: string) {
    return await prisma.worker.findUnique({
      where: { employeeId },
      include: {
        expenses: true,
        incomes: true
      }
    })
  }

  // Create new worker
  async createWorker(data: CreateWorkerData): Promise<Worker> {
    try {
      return await prisma.worker.create({
        data: {
          ...data,
          hireDate: data.hireDate || new Date(),
          skills: data.skills || [],
          status: data.status || WorkerStatus.ACTIVE,
          currency: data.currency || 'DZD',
          paymentType: data.paymentType || PaymentType.HOURLY
        },
        include: {
          expenses: true,
          incomes: true
        }
      })
    } catch (error: any) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[]
        if (target?.includes('email')) {
          throw new Error('Email already exists')
        }
        if (target?.includes('employeeId')) {
          throw new Error('Employee ID already exists')
        }
      }
      throw error
    }
  }

  // Update worker
  async updateWorker(id: string, data: UpdateWorkerData): Promise<Worker> {
    try {
      return await prisma.worker.update({
        where: { id },
        data,
        include: {
          expenses: true,
          incomes: true
        }
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[]
        if (target?.includes('email')) {
          throw new Error('Email already exists')
        }
      }
      if (error.code === 'P2025') {
        throw new Error('Worker not found')
      }
      throw error
    }
  }

  // Delete worker
  async deleteWorker(id: string): Promise<void> {
    try {
      await prisma.worker.delete({
        where: { id }
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Worker not found')
      }
      throw error
    }
  }

  // Get workers by department
  async getWorkersByDepartment(department: string) {
    return await prisma.worker.findMany({
      where: {
        department: { contains: department, mode: 'insensitive' }
      },
      orderBy: { firstName: 'asc' }
    })
  }

  // Get workers by skill
  async getWorkersBySkill(skill: string) {
    return await prisma.worker.findMany({
      where: {
        skills: {
          has: skill
        }
      },
      orderBy: { firstName: 'asc' }
    })
  }

  // Get worker statistics
  async getWorkerStats() {
    const [
      totalWorkers,
      activeWorkers,
      inactiveWorkers,
      departments,
      paymentTypes,
      avgHourlyRate
    ] = await Promise.all([
      prisma.worker.count(),
      prisma.worker.count({ where: { status: WorkerStatus.ACTIVE } }),
      prisma.worker.count({ where: { status: WorkerStatus.INACTIVE } }),
      prisma.worker.groupBy({
        by: ['department'],
        _count: { department: true }
      }),
      prisma.worker.groupBy({
        by: ['paymentType'],
        _count: { paymentType: true }
      }),
      prisma.worker.aggregate({
        _avg: { hourlyRate: true }
      })
    ])

    return {
      total: totalWorkers,
      active: activeWorkers,
      inactive: inactiveWorkers,
      departments: departments.map(d => ({
        name: d.department,
        count: d._count.department
      })),
      paymentTypes: paymentTypes.map(p => ({
        type: p.paymentType,
        count: p._count.paymentType
      })),
      averageHourlyRate: avgHourlyRate._avg.hourlyRate || 0
    }
  }
}

export const workerService = new WorkerService()
