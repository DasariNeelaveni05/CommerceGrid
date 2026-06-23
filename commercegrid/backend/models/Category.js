const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const slugify = require('slugify');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '📦',
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6',
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (cat) => {
      if (!cat.slug) {
        cat.slug = slugify(cat.name, { lower: true, strict: true });
      }
    },
    beforeUpdate: (cat) => {
      if (cat.changed('name') && !cat.slug) {
        cat.slug = slugify(cat.name, { lower: true, strict: true });
      }
    },
  },
});

module.exports = Category;
