const { Order, OrderItem, Product, User, Transaction } = require('../models');
const { Op } = require('sequelize');

// Create a new order
module.exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const productIds = items.map(item => item.productId);
    
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'One or more products not found' });
    }

    // Map products by ID for easy access
    const productsMap = {};
    products.forEach(product => {
      productsMap[product.id] = product;
    });

    // Validate stock and calculate total
    for (const item of items) {
      const product = productsMap[item.productId];
      
      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${product.title}. Available: ${product.stock}` 
        });
      }
      
      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      userId,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Placed'
    });

    // Create order items
    const orderItems = [];
    for (const item of items) {
      const product = productsMap[item.productId];
      
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });
      
      orderItems.push(orderItem);
      
      // Update product stock
      await product.update({
        stock: product.stock - item.quantity,
        status: product.stock - item.quantity <= 0 ? 'Sold' : 'Available'
      });
    }

    // Create transaction record
    await Transaction.create({
      orderId: order.id,
      userId,
      amount: totalAmount,
      paymentMethod,
      status: 'Pending'
    });

    return res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order.toJSON(),
        items: orderItems
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Get all orders for a user
module.exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'price', 'image_path']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get order details
module.exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'price', 'image_path', 'description']
            }
          ]
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Transaction
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    return res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
};

// Update order status (for admin or seller)
module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is admin or seller of the products in this order
    // This would require additional logic to verify user permissions
    
    await order.update({ orderStatus });
    
    return res.status(200).json({ 
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// Cancel order
module.exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const order = await Order.findOne({
      where: { id, userId },
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only allow cancellation if order is not already shipped or delivered
    if (['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.orderStatus}` 
      });
    }
    
    // Update order status
    await order.update({ 
      orderStatus: 'Cancelled',
      paymentStatus: order.paymentStatus === 'Completed' ? 'Refunded' : 'Cancelled'
    });
    
    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await product.update({
          stock: product.stock + item.quantity,
          status: 'Available'
        });
      }
    }
    
    // Update transaction if exists
    const transaction = await Transaction.findOne({
      where: { orderId: order.id }
    });
    
    if (transaction) {
      await transaction.update({
        status: transaction.status === 'Completed' ? 'Refunded' : 'Cancelled'
      });
    }
    
    return res.status(200).json({ 
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
};
