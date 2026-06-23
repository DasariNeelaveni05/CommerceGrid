const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/auth');

// All order routes are protected
router.use(protect);

router.get('/', orderController.getMyOrders);
router.post('/', orderController.createOrder);
router.get('/admin', adminOnly, orderController.getAdminOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', adminOnly, orderController.updateOrderStatus);

module.exports = router;
