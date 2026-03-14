import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Admin only routes
router.get('/users', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { User } = await import('../models/User');
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
