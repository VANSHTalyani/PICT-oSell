const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Order = require('./Order');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    },
    field: 'order_id'
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('Cash on Delivery', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'),
    allowNull: false,
    field: 'payment_method'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'transaction_id'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed', 'Refunded'),
    defaultValue: 'Pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'Transactions',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

// Define associations
Transaction.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(Transaction, { foreignKey: 'orderId' });

Transaction.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Transaction, { foreignKey: 'userId' });

module.exports = Transaction;
