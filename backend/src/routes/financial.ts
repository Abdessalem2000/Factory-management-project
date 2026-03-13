import { Router } from 'express';
import { Transaction } from '../models/Transaction';
import { ApiResponse, FinancialFilters } from '../types';

const router = Router();

// Get all transactions with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      type,
      category,
      supplierId,
      startDate,
      endDate,
    } = req.query;

    const filters: any = {};

    if (type) filters.type = type;
    if (category) filters.category = category;
    if (supplierId) filters.supplierId = supplierId;

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate as string);
      if (endDate) filters.date.$lte = new Date(endDate as string);
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(filters)
        .populate('supplierId', 'name email')
        .populate('productionOrderId', 'orderNumber product.name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data: transactions,
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
      message: 'Failed to fetch transactions',
    });
  }
});

// Get single transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('supplierId', 'name email phone')
      .populate('productionOrderId', 'orderNumber product.name quantity');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: transaction,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch transaction',
    });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const transactionData = req.body;
    
    // Validate required fields
    if (!transactionData.type || !transactionData.category || !transactionData.amount) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Type, category, and amount are required',
      });
    }

    const transaction = new Transaction(transactionData);
    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('supplierId', 'name email')
      .populate('productionOrderId', 'orderNumber product.name');

    res.status(201).json({
      success: true,
      data: populatedTransaction,
      message: 'Transaction created successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Creation Error',
      message: error.message || 'Failed to create transaction',
    });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('supplierId', 'name email')
      .populate('productionOrderId', 'orderNumber product.name');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Update Error',
      message: error.message || 'Failed to update transaction',
    });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to delete transaction',
    });
  }
});

// Get financial summary
router.get('/summary/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const summary = await (Transaction as any).getFinancialSummary(start, end);
    const categoryBreakdown = await (Transaction as any).getCategoryBreakdown(start, end, 'expense');

    res.json({
      success: true,
      data: {
        ...summary,
        period: { start, end },
        categoryBreakdown,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch financial summary',
    });
  }
});

// Get category breakdown
router.get('/summary/categories', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();
    const transactionType = (type as 'income' | 'expense') || 'expense';

    const breakdown = await (Transaction as any).getCategoryBreakdown(start, end, transactionType);

    res.json({
      success: true,
      data: breakdown,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch category breakdown',
    });
  }
});

export default router;
