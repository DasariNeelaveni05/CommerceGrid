const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  originalPrice: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: null,
  },
  brand: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  condition: {
    type: DataTypes.ENUM('new', 'like_new', 'good', 'fair', 'poor'),
    defaultValue: 'good',
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isSold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  wishlistCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  averageRating: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  availability: {
    type: DataTypes.ENUM('in_stock', 'out_of_stock', 'limited'),
    defaultValue: 'in_stock',
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (prod) => {
      if (!prod.slug) {
        const base = prod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        prod.slug = `${base}-${prod.id.slice(-6)}`;
      }
    },
    beforeUpdate: (prod) => {
      if (prod.changed('title') && !prod.slug) {
        const base = prod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        prod.slug = `${base}-${prod.id.slice(-6)}`;
      }
    },
  },
});

module.exports = Product;
