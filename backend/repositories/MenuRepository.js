const { MenuItem, Restaurant } = require('../models');
const { Op } = require('sequelize');

class MenuRepository {
  /**
   * Find all menu items with filters
   */
  async findAll(filters = {}) {
    const { restaurant_id, search, page = 1, limit = 50 } = filters;
    const whereClause = {};

    if (restaurant_id) {
      whereClause.restaurant_id = restaurant_id;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await MenuItem.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          attributes: ['id', 'name']
        }
      ],
      order: [['restaurant_id', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      menuItems: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Find menu item by ID
   */
  async findById(id) {
    return await MenuItem.findByPk(id, {
      include: [
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address']
        }
      ]
    });
  }

  /**
   * Find menu items by restaurant
   */
  async findByRestaurant(restaurantId) {
    return await MenuItem.findAll({
      where: { restaurant_id: restaurantId },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Create menu item
   */
  async create(menuData) {
    return await MenuItem.create(menuData);
  }

  /**
   * Update menu item
   */
  async update(id, menuData) {
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) return null;

    return await menuItem.update(menuData);
  }

  /**
   * Delete menu item
   */
  async delete(id) {
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) return null;

    await menuItem.destroy();
    return true;
  }

  /**
   * Get count by restaurant
   */
  async getCountByRestaurant(restaurantId) {
    return await MenuItem.count({
      where: { restaurant_id: restaurantId }
    });
  }

  /**
   * Check if menu item exists
   */
  async exists(id) {
    const menuItem = await MenuItem.findByPk(id);
    return !!menuItem;
  }

  /**
   * Get menu statistics
   */
  async getStats() {
    const totalMenuItems = await MenuItem.count();

    // Get average price
    const avgPrice = await MenuItem.findAll({
      attributes: [
        [MenuItem.sequelize.fn('AVG', MenuItem.sequelize.col('price')), 'avgPrice']
      ]
    });

    // Get restaurants with most menu items
    const restaurantStats = await MenuItem.findAll({
      attributes: [
        'restaurant_id',
        [MenuItem.sequelize.fn('COUNT', MenuItem.sequelize.col('MenuItem.id')), 'count']
      ],
      include: [
        {
          model: Restaurant,
          attributes: ['id', 'name']
        }
      ],
      group: ['restaurant_id', 'Restaurant.id'],
      order: [[MenuItem.sequelize.fn('COUNT', MenuItem.sequelize.col('MenuItem.id')), 'DESC']],
      limit: 5
    });

    return {
      total: totalMenuItems,
      averagePrice: parseFloat(avgPrice[0]?.dataValues?.avgPrice || 0).toFixed(2),
      topRestaurants: restaurantStats.map(stat => ({
        restaurant: stat.Restaurant,
        menuItemCount: parseInt(stat.dataValues.count)
      }))
    };
  }
}

module.exports = new MenuRepository();
