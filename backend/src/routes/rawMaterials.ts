import express from 'express';
import { authenticate } from '../middleware/auth';
import { RawMaterial } from '../../models/RawMaterial';

const router = express.Router();

// Get all raw materials
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category && category !== 'all') {
      query = { ...query, category };
    }
    
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { reference: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const materials = await RawMaterial.find(query).sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    res.status(500).json({ error: 'Failed to fetch raw materials' });
  }
});

// Get single raw material
router.get('/:id', authenticate, async (req, res) => {
  try {
    const material = await RawMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Raw material not found' });
    }
    res.json(material);
  } catch (error) {
    console.error('Error fetching raw material:', error);
    res.status(500).json({ error: 'Failed to fetch raw material' });
  }
});

// Create raw material
router.post('/', authenticate, async (req, res) => {
  try {
    const materialData = {
      ...req.body,
      supplier: req.body.supplier || null, // Handle string supplier for now
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const material = new RawMaterial(materialData);
    await material.save();
    
    res.status(201).json(material);
  } catch (error) {
    console.error('Error creating raw material:', error);
    res.status(500).json({ error: 'Failed to create raw material' });
  }
});

// Update raw material
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const material = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ error: 'Raw material not found' });
    }
    
    res.json(material);
  } catch (error) {
    console.error('Error updating raw material:', error);
    res.status(500).json({ error: 'Failed to update raw material' });
  }
});

// Delete raw material
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const material = await RawMaterial.findByIdAndDelete(req.params.id);
    
    if (!material) {
      return res.status(404).json({ error: 'Raw material not found' });
    }
    
    res.json({ message: 'Raw material deleted successfully' });
  } catch (error) {
    console.error('Error deleting raw material:', error);
    res.status(500).json({ error: 'Failed to delete raw material' });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', authenticate, async (req, res) => {
  try {
    const lowStockMaterials = await RawMaterial.find({
      $expr: { $lte: ['$currentStock', '$minStockAlert'] }
    });
    
    res.json(lowStockMaterials);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

// Update stock
router.patch('/:id/stock', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const material = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      { 
        currentStock: quantity,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ error: 'Raw material not found' });
    }
    
    res.json(material);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Get stock movements (placeholder)
router.get('/:id/movements', authenticate, async (req, res) => {
  try {
    // Placeholder - implement stock movements tracking
    res.json([]);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Get categories
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await RawMaterial.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get suppliers (placeholder)
router.get('/suppliers', authenticate, async (req, res) => {
  try {
    // Placeholder - should integrate with supplier API
    res.json([]);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Create test data (development only)
router.post('/test-data', authenticate, async (req, res) => {
  try {
    // Clear existing data
    await RawMaterial.deleteMany({});
    
    // Create test materials
    const testMaterials = [
      {
        name: 'Cotton Fabric - Blue',
        reference: 'CF-BLUE-001',
        category: 'fabric',
        currentStock: 45,
        minStockAlert: 100,
        unit: 'meters',
        unitCost: 250,
        supplier: 'Textile Supplier Co.',
        lastRestocked: new Date('2024-03-10'),
        location: 'Warehouse A',
        status: 'active'
      },
      {
        name: 'Zippers - Metal',
        reference: 'ZIP-MET-002',
        category: 'zippers',
        currentStock: 12,
        minStockAlert: 50,
        unit: 'pieces',
        unitCost: 85,
        supplier: 'Hardware Supplies Inc.',
        lastRestocked: new Date('2024-03-08'),
        location: 'Warehouse B',
        status: 'active'
      },
      {
        name: 'Thread - White',
        reference: 'THR-WHT-003',
        category: 'thread',
        currentStock: 8,
        minStockAlert: 25,
        unit: 'rolls',
        unitCost: 45,
        supplier: 'Thread Masters Ltd.',
        lastRestocked: new Date('2024-03-05'),
        location: 'Warehouse A',
        status: 'active'
      },
      {
        name: 'Buttons - Pearl',
        reference: 'BTN-PRL-004',
        category: 'buttons',
        currentStock: 15,
        minStockAlert: 30,
        unit: 'pieces',
        unitCost: 12,
        supplier: 'Button World Co.',
        lastRestocked: new Date('2024-03-12'),
        location: 'Warehouse C',
        status: 'active'
      }
    ];
    
    const materials = await RawMaterial.insertMany(testMaterials);
    res.json({ message: 'Test data created', count: materials.length });
  } catch (error) {
    console.error('Error creating test data:', error);
    res.status(500).json({ error: 'Failed to create test data' });
  }
});

export default router;
