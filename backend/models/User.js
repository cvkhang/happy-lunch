const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar_url: {
    type: DataTypes.STRING
  },
  intro: {
    type: DataTypes.TEXT
  },
  address: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  account_type: {
    type: DataTypes.ENUM('personal', 'family'),
    defaultValue: 'personal'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
