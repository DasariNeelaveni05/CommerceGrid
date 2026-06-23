const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/errorHandler');

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
  ],
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Get current user
router.get('/me', protect, authController.getMe);

// Update profile
router.patch('/me', protect, authController.updateProfile);

module.exports = router;
