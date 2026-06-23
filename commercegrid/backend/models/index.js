const { sequelize } = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Review = require('./Review');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Relationships

// Category parent-child relationship
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parentId', onDelete: 'SET NULL' });
Category.belongsTo(Category, { as: 'parentCategory', foreignKey: 'parentId' });

// User and Product (Seller relationship)
User.hasMany(Product, { as: 'products', foreignKey: 'sellerId', onDelete: 'SET NULL' });
Product.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

// Category and Product
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId', onDelete: 'SET NULL' });
Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

// User and Review
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Product and Review
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User and CartItem
User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Product and CartItem
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User and Order
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order and OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product and OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'SET NULL' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Review,
  CartItem,
  Order,
  OrderItem,
};
