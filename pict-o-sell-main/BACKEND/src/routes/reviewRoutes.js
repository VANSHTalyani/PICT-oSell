const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Get all reviews for a product (public route)
router.get('/product/:productId', reviewController.getProductReviews);

// Create a new review (protected route)
router.post('/', protect, reviewController.createReview);

// Update a review (protected route)
router.put('/:id', protect, reviewController.updateReview);

// Delete a review (protected route)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
