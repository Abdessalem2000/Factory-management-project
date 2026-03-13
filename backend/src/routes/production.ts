import { Router } from 'express';
import { ProductionOrder } from '../models/ProductionOrder';
import { Worker } from '../models/Worker';
import { ApiResponse, ProductionFilters } from '../types';

const router = Router();

// Get all production orders with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      assignedWorker,
      startDate,
      endDate,
    } = req.query;

    const filters: any = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedWorker) filters.assignedWorkers = assignedWorker;

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate as string);
      if (endDate) filters.createdAt.$lte = new Date(endDate as string);
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      ProductionOrder.find(filters)
        .populate('assignedWorkers', 'firstName lastName employeeId')
        .populate('stages.assignedWorker', 'firstName lastName employeeId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      ProductionOrder.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data: orders,
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
      message: 'Failed to fetch production orders',
    });
  }
});

// Get single production order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await ProductionOrder.findById(req.params.id)
      .populate('assignedWorkers', 'firstName lastName employeeId')
      .populate('stages.assignedWorker', 'firstName lastName employeeId');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Production order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch production order',
    });
  }
});

// Create new production order
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.product || !orderData.quantity || !orderData.unitOfMeasure) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Product, quantity, and unit of measure are required',
      });
    }

    // Validate assigned workers exist
    if (orderData.assignedWorkers && orderData.assignedWorkers.length > 0) {
      const workers = await Worker.find({ _id: { $in: orderData.assignedWorkers } });
      if (workers.length !== orderData.assignedWorkers.length) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'One or more assigned workers not found',
        });
      }
    }

    const order = new ProductionOrder(orderData);
    await order.save();

    const populatedOrder = await ProductionOrder.findById(order._id)
      .populate('assignedWorkers', 'firstName lastName employeeId')
      .populate('stages.assignedWorker', 'firstName lastName employeeId');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Production order created successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Creation Error',
      message: error.message || 'Failed to create production order',
    });
  }
});

// Update production order
router.put('/:id', async (req, res) => {
  try {
    const order = await ProductionOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignedWorkers', 'firstName lastName employeeId')
      .populate('stages.assignedWorker', 'firstName lastName employeeId');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Production order not found',
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Production order updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Update Error',
      message: error.message || 'Failed to update production order',
    });
  }
});

// Update production stage
router.patch('/:id/stages/:stageId', async (req, res) => {
  try {
    const { stageId } = req.params;
    const updateData = req.body;

    const order = await ProductionOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Production order not found',
      });
    }

    const stage = order.stages.id(stageId);
    if (!stage) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Production stage not found',
      });
    }

    // Update stage fields
    Object.assign(stage, updateData);

    // Auto-set timestamps based on status changes
    if (updateData.status === 'in_progress' && !stage.startedAt) {
      stage.startedAt = new Date();
    }
    if (updateData.status === 'completed' && !stage.completedAt) {
      stage.completedAt = new Date();
      if (stage.startedAt) {
        stage.actualDuration = Math.round(
          (stage.completedAt.getTime() - stage.startedAt.getTime()) / (1000 * 60 * 60)
        );
      }
    }

    await order.save();

    const updatedOrder = await ProductionOrder.findById(order._id)
      .populate('assignedWorkers', 'firstName lastName employeeId')
      .populate('stages.assignedWorker', 'firstName lastName employeeId');

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Production stage updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Update Error',
      message: error.message || 'Failed to update production stage',
    });
  }
});

// Delete production order
router.delete('/:id', async (req, res) => {
  try {
    const order = await ProductionOrder.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Production order not found',
      });
    }

    res.json({
      success: true,
      message: 'Production order deleted successfully',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to delete production order',
    });
  }
});

// Get production statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      overdueOrders,
    ] = await Promise.all([
      ProductionOrder.countDocuments(),
      ProductionOrder.countDocuments({ status: 'in_progress' }),
      ProductionOrder.countDocuments({ status: 'completed' }),
      ProductionOrder.countDocuments({
        status: { $in: ['pending', 'in_progress'] },
        estimatedCompletionDate: { $lt: new Date() },
      }),
    ]);

    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        activeOrders,
        completedOrders,
        overdueOrders,
        completionRate,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch production statistics',
    });
  }
});

export default router;
