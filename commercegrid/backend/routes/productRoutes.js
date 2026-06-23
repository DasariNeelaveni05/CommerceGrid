const express = require('express');
const { body, query } = require('express-validator');
const multer = require('multer');
const router = express.Router();

const productController = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/errorHandler');

// Multer: store in memory, then upload to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

// Validation rules
const productValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').escape(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').optional().trim().escape(),
  body('brand').optional().trim().escape(),
  body('condition')
    .optional()
    .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
];

// ── Public routes ─────────────────────────────────────────────
// GET /api/products/search — must come before /:id
router.get('/search', productController.searchProducts);

// GET /api/products/stats (admin)
router.get('/stats', protect, adminOnly, productController.getStats);

// GET /api/products
router.get('/', optionalAuth, productController.getProducts);

// GET /api/products/:id  (slug or ObjectId)
router.get('/:id', optionalAuth, productController.getProductById);

// GET /api/products/:id/reviews
router.get('/:id/reviews', productController.getProductReviews);

// ── Auth routes ───────────────────────────────────────────────
// POST /api/products/:id/reviews
router.post(
  '/:id/reviews',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().trim().escape(),
  ],
  validate,
  productController.addReview
);

// ── Admin routes ──────────────────────────────────────────────
// POST /api/products
router.post(
  '/',
  protect,
  adminOnly,
  upload.array('images', 5),
  productValidation,
  validate,
  productController.createProduct
);

// PUT /api/products/:id
router.put(
  '/:id',
  protect,
  adminOnly,
  upload.array('images', 5),
  validate,
  productController.updateProduct
);

// DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

// DELETE /api/products/:id/images/:imageId
router.delete('/:id/images/:imageId', protect, adminOnly, productController.deleteProductImage);

module.exports = router;
