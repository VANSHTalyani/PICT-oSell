const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Wishlist = require('./Wishlist');

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

module.exports = {
  User,
  Product,
  Cart,
  Wishlist
};
