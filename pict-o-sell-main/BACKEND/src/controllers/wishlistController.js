const { Wishlist, Product, User } = require('../models');

exports.getWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        include: [{
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'fullName']
        }]
      }]
    });

    res.json({
      success: true,
      wishlistItems
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist'
    });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const [wishlistItem, created] = await Wishlist.findOrCreate({
      where: {
        userId: req.user.id,
        productId
      }
    });

    if (!created) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    const wishlistItemWithProduct = await Wishlist.findByPk(wishlistItem.id, {
      include: [{
        model: Product,
        include: [{
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'fullName']
        }]
      }]
    });

    res.status(201).json({
      success: true,
      wishlistItem: wishlistItemWithProduct
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to wishlist'
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    await wishlistItem.destroy();

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from wishlist'
    });
  }
};

exports.clearWishlist = async (req, res) => {
  try {
    await Wishlist.destroy({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist'
    });
  }
};
