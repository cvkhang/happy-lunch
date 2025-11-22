const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  restaurant_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'restaurants',
      key: 'id'
    }
  }
}, {
  tableName: 'favorites',
  timestamps: true
});

module.exports = Favorite;
