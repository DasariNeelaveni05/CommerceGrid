const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  orderStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered'),
    allowNull: false,
    defaultValue: 'pending',
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Order;
