const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get wishlist items
router.get('/', protect, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }]
    });
    res.json({ wishlistItems });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to get wishlist items' });
  }
});

// Add item to wishlist
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlistItem = await Wishlist.create({
      userId: req.user.id,
      productId
    });
    res.json({ wishlistItem });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await Wishlist.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!result) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }
    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

module.exports = router;
