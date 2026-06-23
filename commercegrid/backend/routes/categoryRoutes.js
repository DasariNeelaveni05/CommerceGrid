const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validate } = require('../middlewares/errorHandler');

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required').escape(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  body('description').optional().trim().escape(),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
];

// GET /api/categories
router.get('/', categoryController.getCategories);

// GET /api/categories/:id
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories — Admin only
router.post('/', protect, adminOnly, categoryValidation, validate, categoryController.createCategory);

// PUT /api/categories/:id — Admin only
router.put('/:id', protect, adminOnly, categoryValidation, validate, categoryController.updateCategory);

// DELETE /api/categories/:id — Admin only
router.delete('/:id', protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
