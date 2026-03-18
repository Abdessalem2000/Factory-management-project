import { Request, Response } from 'express'
import { workerService, CreateWorkerData, UpdateWorkerData, WorkerFilters } from '../services/workerService'

export class WorkerController {
  // GET /api/workers
  async getWorkers(req: Request, res: Response) {
    try {
      const filters: WorkerFilters = {
        search: req.query.search as string,
        department: req.query.department as string,
        status: req.query.status as any,
        paymentType: req.query.paymentType as any,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      }

      const result = await workerService.getWorkers(filters)
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Workers retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting workers:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve workers'
      })
    }
  }

  // GET /api/workers/:id
  async getWorkerById(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const worker = await workerService.getWorkerById(id)
      
      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker not found'
        })
      }

      res.json({
        success: true,
        data: worker,
        message: 'Worker retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting worker:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve worker'
      })
    }
  }

  // GET /api/workers/employee/:employeeId
  async getWorkerByEmployeeId(req: Request, res: Response) {
    try {
      const { employeeId } = req.params
      
      const worker = await workerService.getWorkerByEmployeeId(employeeId)
      
      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker not found'
        })
      }

      res.json({
        success: true,
        data: worker,
        message: 'Worker retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting worker by employee ID:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve worker'
      })
    }
  }

  // POST /api/workers
  async createWorker(req: Request, res: Response) {
    try {
      const workerData: CreateWorkerData = req.body
      
      // Validate required fields
      const requiredFields = ['employeeId', 'firstName', 'lastName', 'email', 'position', 'department', 'hourlyRate']
      const missingFields = requiredFields.filter(field => !workerData[field as keyof CreateWorkerData])
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(workerData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        })
      }

      // Validate hourly rate
      if (workerData.hourlyRate <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Hourly rate must be greater than 0'
        })
      }

      const worker = await workerService.createWorker(workerData)
      
      res.status(201).json({
        success: true,
        data: worker,
        message: 'Worker created successfully'
      })
    } catch (error: any) {
      console.error('Error creating worker:', error)
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create worker'
      })
    }
  }

  // PUT /api/workers/:id
  async updateWorker(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData: UpdateWorkerData = req.body
      
      // Validate email if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(updateData.email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          })
        }
      }

      // Validate hourly rate if provided
      if (updateData.hourlyRate !== undefined && updateData.hourlyRate <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Hourly rate must be greater than 0'
        })
      }

      const worker = await workerService.updateWorker(id, updateData)
      
      res.json({
        success: true,
        data: worker,
        message: 'Worker updated successfully'
      })
    } catch (error: any) {
      console.error('Error updating worker:', error)
      
      if (error.message === 'Worker not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        })
      }
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update worker'
      })
    }
  }

  // DELETE /api/workers/:id
  async deleteWorker(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      await workerService.deleteWorker(id)
      
      res.json({
        success: true,
        message: 'Worker deleted successfully'
      })
    } catch (error: any) {
      console.error('Error deleting worker:', error)
      
      if (error.message === 'Worker not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete worker'
      })
    }
  }

  // GET /api/workers/department/:department
  async getWorkersByDepartment(req: Request, res: Response) {
    try {
      const { department } = req.params
      
      const workers = await workerService.getWorkersByDepartment(department)
      
      res.json({
        success: true,
        data: workers,
        message: `Workers in ${department} department retrieved successfully`
      })
    } catch (error: any) {
      console.error('Error getting workers by department:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve workers by department'
      })
    }
  }

  // GET /api/workers/skill/:skill
  async getWorkersBySkill(req: Request, res: Response) {
    try {
      const { skill } = req.params
      
      const workers = await workerService.getWorkersBySkill(skill)
      
      res.json({
        success: true,
        data: workers,
        message: `Workers with ${skill} skill retrieved successfully`
      })
    } catch (error: any) {
      console.error('Error getting workers by skill:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve workers by skill'
      })
    }
  }

  // GET /api/workers/stats/overview
  async getWorkerStats(req: Request, res: Response) {
    try {
      const stats = await workerService.getWorkerStats()
      
      res.json({
        success: true,
        data: stats,
        message: 'Worker statistics retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting worker stats:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve worker statistics'
      })
    }
  }
}

export const workerController = new WorkerController()
