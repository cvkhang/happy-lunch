const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cuisine_type: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  image_url: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  phone: {
    type: DataTypes.STRING
  },
  opening_hours: {
    type: DataTypes.STRING
  },
  latitude: {
    type: DataTypes.FLOAT
  },
  longitude: {
    type: DataTypes.FLOAT
  }
}, {
  tableName: 'restaurants',
  timestamps: true
});

module.exports = Restaurant;
