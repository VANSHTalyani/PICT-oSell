const { Review, Product, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Create a new review
module.exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      where: { productId, userId }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create the review
    const review = await Review.create({
      productId,
      userId,
      rating,
      comment
    });

    // Update product rating
    const reviews = await Review.findAll({
      where: { productId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']]
    });

    const averageRating = reviews[0].dataValues.averageRating || 0;
    await product.update({ rating: averageRating });

    return res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
};

// Get all reviews for a product
module.exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.findAll({
      where: { productId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'profilePic']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Update a review
module.exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: { id, userId }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or you are not authorized to update it' });
    }

    await review.update({ rating, comment });

    // Update product rating
    const productId = review.productId;
    const reviews = await Review.findAll({
      where: { productId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']]
    });

    const averageRating = reviews[0].dataValues.averageRating || 0;
    await Product.update({ rating: averageRating }, { where: { id: productId } });

    return res.status(200).json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
};

// Delete a review
module.exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: { id, userId }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or you are not authorized to delete it' });
    }

    const productId = review.productId;
    await review.destroy();

    // Update product rating
    const reviews = await Review.findAll({
      where: { productId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']]
    });

    const averageRating = reviews[0]?.dataValues.averageRating || 0;
    await Product.update({ rating: averageRating }, { where: { id: productId } });

    return res.status(200).json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};
