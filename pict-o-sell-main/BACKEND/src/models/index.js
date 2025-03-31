const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Wishlist = require('./Wishlist');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Transaction = require('./Transaction');

// Define relationships
Product.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller'
});

User.hasMany(Product, {
  foreignKey: 'sellerId',
  as: 'products'
});

User.hasMany(Cart, {
  foreignKey: 'userId',
  as: 'cartItems'
});

Cart.belongsTo(User, {
  foreignKey: 'userId'
});

Cart.belongsTo(Product, {
  foreignKey: 'productId'
});

User.hasMany(Wishlist, {
  foreignKey: 'userId',
  as: 'wishlistItems'
});

Wishlist.belongsTo(User, {
  foreignKey: 'userId'
});

Wishlist.belongsTo(Product, {
  foreignKey: 'productId'
});

// Order relationships are defined in the Order model
// OrderItem relationships are defined in the OrderItem model
// Review relationships are defined in the Review model
// Transaction relationships are defined in the Transaction model

module.exports = {
  User,
  Product,
  Cart,
  Wishlist,
  Order,
  OrderItem,
  Review,
  Transaction
};
