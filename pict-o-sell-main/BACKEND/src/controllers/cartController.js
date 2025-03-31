const { Cart, Product, User } = require('../models');

exports.getCart = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
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
      cartItems
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart'
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    let cartItem = await Cart.findOne({
      where: {
        userId: req.user.id,
        productId
      }
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }

      cartItem = await cartItem.update({
        quantity: newQuantity
      });
    } else {
      cartItem = await Cart.create({
        userId: req.user.id,
        productId,
        quantity
      });
    }

    const cartItemWithProduct = await Cart.findByPk(cartItem.id, {
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
      cartItem: cartItemWithProduct
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart'
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [Product]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (cartItem.Product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    await cartItem.update({ quantity });

    const updatedCartItem = await Cart.findByPk(cartItem.id, {
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
      cartItem: updatedCartItem
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item'
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart'
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.destroy({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
};
