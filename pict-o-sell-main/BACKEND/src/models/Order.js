const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    field: 'user_id'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'shipping_address'
  },
  paymentMethod: {
    type: DataTypes.ENUM('Cash on Delivery', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'),
    defaultValue: 'Cash on Delivery',
    field: 'payment_method'
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed', 'Refunded'),
    defaultValue: 'Pending',
    field: 'payment_status'
  },
  orderStatus: {
    type: DataTypes.ENUM('Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
    defaultValue: 'Placed',
    field: 'order_status'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'Orders',
  timestamps: true,
  underscored: true
});

// Define associations
Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

module.exports = Order;
