const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewLike = sequelize.define('ReviewLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  review_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reviews',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'review_likes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['review_id', 'user_id']
    }
  ]
});

module.exports = ReviewLike;
