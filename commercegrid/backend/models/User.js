const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  lastName: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  avatarPublicId: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  addressStreet: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  addressCity: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  addressState: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  addressPincode: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  addressCountry: {
    type: DataTypes.STRING,
    defaultValue: 'India',
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

// Compare password method
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Override toJSON to exclude password by default
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  values.fullName = `${values.firstName} ${values.lastName}`.trim() || values.email;
  return values;
};

module.exports = User;
