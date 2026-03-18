import { Router } from 'express'
import { workerController } from '../controllers/workerController'

const router = Router()

// GET /api/workers - Get all workers with optional filtering
router.get('/', workerController.getWorkers.bind(workerController))

// GET /api/workers/stats/overview - Get worker statistics
router.get('/stats/overview', workerController.getWorkerStats.bind(workerController))

// GET /api/workers/department/:department - Get workers by department
router.get('/department/:department', workerController.getWorkersByDepartment.bind(workerController))

// GET /api/workers/skill/:skill - Get workers by skill
router.get('/skill/:skill', workerController.getWorkersBySkill.bind(workerController))

// GET /api/workers/employee/:employeeId - Get worker by employee ID
router.get('/employee/:employeeId', workerController.getWorkerByEmployeeId.bind(workerController))

// GET /api/workers/:id - Get worker by ID
router.get('/:id', workerController.getWorkerById.bind(workerController))

// POST /api/workers - Create new worker
router.post('/', workerController.createWorker.bind(workerController))

// PUT /api/workers/:id - Update worker
router.put('/:id', workerController.updateWorker.bind(workerController))

// DELETE /api/workers/:id - Delete worker
router.delete('/:id', workerController.deleteWorker.bind(workerController))

export default router
