import { Router } from 'express';
import { Worker } from '../models/Worker';
import { ApiResponse, WorkerFilters } from '../types';

const router = Router();

// Get all workers with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'lastName',
      sortOrder = 'asc',
      status,
      department,
      skill,
    } = req.query;

    const filters: any = {};

    if (status) filters.status = status;
    if (department) filters.department = department;
    if (skill) filters.skills = { $in: [skill] };

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [workers, total] = await Promise.all([
      Worker.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Worker.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data: workers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch workers',
    });
  }
});

// Get single worker by ID
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Worker not found',
      });
    }

    res.json({
      success: true,
      data: worker,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch worker',
    });
  }
});

// Create new worker
router.post('/', async (req, res) => {
  try {
    const workerData = req.body;
    
    // Validate required fields
    if (!workerData.firstName || !workerData.lastName || !workerData.email || !workerData.position) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'First name, last name, email, and position are required',
      });
    }

    const worker = new Worker(workerData);
    await worker.save();

    res.status(201).json({
      success: true,
      data: worker,
      message: 'Worker created successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Creation Error',
      message: error.message || 'Failed to create worker',
    });
  }
});

// Update worker
router.put('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Worker not found',
      });
    }

    res.json({
      success: true,
      data: worker,
      message: 'Worker updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Update Error',
      message: error.message || 'Failed to update worker',
    });
  }
});

// Delete worker
router.delete('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Worker not found',
      });
    }

    res.json({
      success: true,
      message: 'Worker deleted successfully',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to delete worker',
    });
  }
});

// Get worker statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalWorkers,
      activeWorkers,
      inactiveWorkers,
      terminatedWorkers,
    ] = await Promise.all([
      Worker.countDocuments(),
      Worker.countDocuments({ status: 'active' }),
      Worker.countDocuments({ status: 'inactive' }),
      Worker.countDocuments({ status: 'terminated' }),
    ]);

    // Get department breakdown
    const departmentStats = await Worker.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get skill breakdown
    const skillStats = await Worker.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Calculate average hourly rate
    const rateStats = await Worker.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          averageHourlyRate: { $avg: '$hourlyRate' },
          totalActiveWorkers: { $sum: 1 },
        },
      },
    ]);

    const averageHourlyRate = rateStats.length > 0 ? rateStats[0].averageHourlyRate : 0;

    res.json({
      success: true,
      data: {
        totalWorkers,
        activeWorkers,
        inactiveWorkers,
        terminatedWorkers,
        departmentBreakdown: departmentStats,
        skillBreakdown: skillStats,
        averageHourlyRate: Math.round(averageHourlyRate * 100) / 100,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch worker statistics',
    });
  }
});

// Get workers by department
router.get('/by-department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    
    const workers = await (Worker as any).getWorkersByDepartment(department);

    res.json({
      success: true,
      data: workers,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch workers by department',
    });
  }
});

// Get workers by skill
router.get('/by-skill/:skill', async (req, res) => {
  try {
    const { skill } = req.params;
    
    const workers = await (Worker as any).getWorkersBySkill(skill);

    res.json({
      success: true,
      data: workers,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch workers by skill',
    });
  }
});

export default router;
