import { Router } from 'express';
import { Supplier } from '../models/Supplier';
import { ApiResponse, SupplierFilters } from '../types';

const router = Router();

// Get all suppliers with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      status,
      category,
      rating,
    } = req.query;

    const filters: any = {};

    if (status) filters.status = status;
    if (category) filters.categories = { $in: [category] };
    if (rating) filters.rating = parseInt(rating as string);

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [suppliers, total] = await Promise.all([
      Supplier.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Supplier.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data: suppliers,
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
      message: 'Failed to fetch suppliers',
    });
  }
});

// Get single supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Supplier not found',
      });
    }

    res.json({
      success: true,
      data: supplier,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch supplier',
    });
  }
});

// Create new supplier
router.post('/', async (req, res) => {
  try {
    const supplierData = req.body;
    
    // Validate required fields
    if (!supplierData.name || !supplierData.contactPerson || !supplierData.email) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Name, contact person, and email are required',
      });
    }

    const supplier = new Supplier(supplierData);
    await supplier.save();

    res.status(201).json({
      success: true,
      data: supplier,
      message: 'Supplier created successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Creation Error',
      message: error.message || 'Failed to create supplier',
    });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Supplier not found',
      });
    }

    res.json({
      success: true,
      data: supplier,
      message: 'Supplier updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Update Error',
      message: error.message || 'Failed to update supplier',
    });
  }
});

// Update supplier rating
router.patch('/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Rating must be between 1 and 5',
      });
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Supplier not found',
      });
    }

    await (supplier as any).updateRating(rating);

    res.json({
      success: true,
      data: supplier,
      message: 'Supplier rating updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Update Error',
      message: error.message || 'Failed to update supplier rating',
    });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Supplier not found',
      });
    }

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to delete supplier',
    });
  }
});

// Get supplier statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      blacklistedSuppliers,
    ] = await Promise.all([
      Supplier.countDocuments(),
      Supplier.countDocuments({ status: 'active' }),
      Supplier.countDocuments({ status: 'inactive' }),
      Supplier.countDocuments({ status: 'blacklisted' }),
    ]);

    // Get average rating
    const ratingStats = await Supplier.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRated: { $sum: 1 },
        },
      },
    ]);

    const averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 0;

    res.json({
      success: true,
      data: {
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
        blacklistedSuppliers,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch supplier statistics',
    });
  }
});

// Get suppliers by category
router.get('/by-category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const suppliers = await (Supplier as any).getSuppliersByCategory(category);

    res.json({
      success: true,
      data: suppliers,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to fetch suppliers by category',
    });
  }
});

export default router;
