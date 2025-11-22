const sequelize = require('../config/database');
const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Review = require('./Review');
const ReviewLike = require('./ReviewLike');
const Favorite = require('./Favorite');

// Associations

// User - Review (One-to-Many)
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Restaurant - Review (One-to-Many)
Restaurant.hasMany(Review, { foreignKey: 'restaurant_id' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Restaurant - MenuItem (One-to-Many)
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// User - ReviewLike (One-to-Many)
User.hasMany(ReviewLike, { foreignKey: 'user_id' });
ReviewLike.belongsTo(User, { foreignKey: 'user_id' });

// Review - ReviewLike (One-to-Many)
Review.hasMany(ReviewLike, { foreignKey: 'review_id' });
ReviewLike.belongsTo(Review, { foreignKey: 'review_id' });

// User - Restaurant (Favorites) (Many-to-Many)
User.belongsToMany(Restaurant, { through: Favorite, foreignKey: 'user_id', as: 'FavoriteRestaurants' });
Restaurant.belongsToMany(User, { through: Favorite, foreignKey: 'restaurant_id', as: 'FavoritedBy' });

module.exports = {
  sequelize,
  User,
  Restaurant,
  MenuItem,
  Review,
  ReviewLike,
  Favorite
};
