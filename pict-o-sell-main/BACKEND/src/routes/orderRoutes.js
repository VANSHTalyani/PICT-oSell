const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Create a new order (protected route)
router.post('/', protect, orderController.createOrder);

// Get all orders for the authenticated user (protected route)
router.get('/my-orders', protect, orderController.getUserOrders);

// Get order details by ID (protected route)
router.get('/:id', protect, orderController.getOrderById);

// Update order status (for admin or seller) (protected route)
router.patch('/:id/status', protect, orderController.updateOrderStatus);

// Cancel an order (protected route)
router.patch('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
