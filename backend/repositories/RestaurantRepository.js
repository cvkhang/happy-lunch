const { Restaurant, MenuItem, Review, User } = require('../models');
const { Op } = require('sequelize');

class RestaurantRepository {
  /**
   * Lấy tất cả restaurants với các điều kiện tìm kiếm
   * @param {Object} filters - Điều kiện lọc (search, etc.)
   * @returns {Promise<Array>} Danh sách restaurants
   */
  async findAll(filters = {}) {
    const { search } = filters;
    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } },
          { cuisine_type: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const restaurants = await Restaurant.findAll({
      where: whereClause,
      include: [
        { model: MenuItem },
        {
          model: Review,
          where: { status: 'approved' },
          required: false,
          include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar_url'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return restaurants;
  }

  /**
   * Tìm restaurant theo ID
   * @param {number} id - ID của restaurant
   * @returns {Promise<Object|null>} Restaurant hoặc null nếu không tìm thấy
   */
  async findById(id) {
    const restaurant = await Restaurant.findByPk(id, {
      include: [
        { model: MenuItem },
        {
          model: Review,
          where: { status: 'approved' },
          required: false,
          include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar_url'] }]
        }
      ]
    });


    return restaurant;
  }

  /**
   * Tạo mới restaurant
   * @param {Object} restaurantData - Dữ liệu restaurant cần tạo
   * @returns {Promise<Object>} Restaurant vừa tạo
   */
  async create(restaurantData) {
    const newRestaurant = await Restaurant.create(restaurantData);
    return newRestaurant;
  }

  /**
   * Cập nhật restaurant
   * @param {number} id - ID của restaurant cần cập nhật
   * @param {Object} restaurantData - Dữ liệu cần cập nhật
   * @returns {Promise<Object|null>} Restaurant đã cập nhật hoặc null nếu không tìm thấy
   */
  async update(id, restaurantData) {
    const [updated] = await Restaurant.update(restaurantData, {
      where: { id }
    });

    if (!updated) {
      return null;
    }

    const updatedRestaurant = await this.findById(id);
    return updatedRestaurant;
  }

  /**
   * Xóa restaurant
   * @param {number} id - ID của restaurant cần xóa
   * @returns {Promise<boolean>} true nếu xóa thành công, false nếu không tìm thấy
   */
  async delete(id) {
    const deleted = await Restaurant.destroy({
      where: { id }
    });

    return deleted > 0;
  }
}

module.exports = new RestaurantRepository();
