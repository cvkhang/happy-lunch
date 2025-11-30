const { Favorite, Restaurant, MenuItem } = require('../models');

class FavoriteRepository {
  /**
   * Get all favorites for a user
   */
  async findByUser(userId) {
    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Restaurant,
          include: [
            {
              model: MenuItem,
              limit: 3
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return favorites.map(fav => fav.Restaurant);
  }

  /**
   * Add restaurant to favorites
   */
  async add(userId, restaurantId) {
    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      where: { user_id: userId, restaurant_id: restaurantId }
    });

    if (existingFavorite) {
      return { alreadyExists: true };
    }

    await Favorite.create({ user_id: userId, restaurant_id: restaurantId });
    return { success: true };
  }

  /**
   * Remove restaurant from favorites
   */
  async remove(userId, restaurantId) {
    const favorite = await Favorite.findOne({
      where: { user_id: userId, restaurant_id: restaurantId }
    });

    if (!favorite) return null;

    await favorite.destroy();
    return true;
  }

  /**
   * Check if restaurant is favorited by user
   */
  async isFavorited(userId, restaurantId) {
    const favorite = await Favorite.findOne({
      where: { user_id: userId, restaurant_id: restaurantId }
    });

    return !!favorite;
  }

  /**
   * Get favorite count for a restaurant
   */
  async getCountByRestaurant(restaurantId) {
    return await Favorite.count({
      where: { restaurant_id: restaurantId }
    });
  }

  /**
   * Get favorite count for a user
   */
  async getCountByUser(userId) {
    return await Favorite.count({
      where: { user_id: userId }
    });
  }

  /**
   * Get favorite statistics
   */
  async getStats() {
    const totalFavorites = await Favorite.count();

    // Get most favorited restaurants
    const mostFavorited = await Favorite.findAll({
      attributes: [
        'restaurant_id',
        [Favorite.sequelize.fn('COUNT', Favorite.sequelize.col('restaurant_id')), 'count']
      ],
      include: [
        {
          model: Restaurant,
          attributes: ['id', 'name', 'image_url']
        }
      ],
      group: ['restaurant_id', 'Restaurant.id'],
      order: [[Favorite.sequelize.fn('COUNT', Favorite.sequelize.col('restaurant_id')), 'DESC']],
      limit: 5
    });

    return {
      total: totalFavorites,
      mostFavorited: mostFavorited.map(fav => ({
        restaurant: fav.Restaurant,
        favoriteCount: parseInt(fav.dataValues.count)
      }))
    };
  }

  /**
   * Toggle favorite (add if not exists, remove if exists)
   */
  async toggle(userId, restaurantId) {
    const existingFavorite = await Favorite.findOne({
      where: { user_id: userId, restaurant_id: restaurantId }
    });

    if (existingFavorite) {
      await existingFavorite.destroy();
      return { action: 'removed', isFavorited: false };
    } else {
      await Favorite.create({ user_id: userId, restaurant_id: restaurantId });
      return { action: 'added', isFavorited: true };
    }
  }
}

module.exports = new FavoriteRepository();
