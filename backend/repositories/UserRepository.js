const { User } = require('../models');
const { Op } = require('sequelize');

class UserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email, includePassword = true) {
    const options = includePassword
      ? {}
      : { attributes: { exclude: ['password_hash'] } };

    return await User.findOne({ where: { email }, ...options });
  }

  /**
   * Find user by ID
   */
  async findById(id, options = {}) {
    const defaultOptions = {
      attributes: { exclude: ['password_hash'] }
    };

    return await User.findByPk(id, { ...defaultOptions, ...options });
  }

  /**
   * Create new user
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Update user
   */
  async update(id, userData) {
    const user = await User.findByPk(id);
    if (!user) return null;

    return await user.update(userData);
  }

  /**
   * Delete user
   */
  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.destroy();
    return true;
  }

  /**
   * Get all users with filters (for admin)
   */
  async findAll(filters = {}) {
    const { search, role, is_blocked, page = 1, limit = 10 } = filters;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (is_blocked !== undefined) {
      whereClause.is_blocked = is_blocked;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Block/Unblock user
   */
  async updateBlockStatus(id, isBlocked) {
    const user = await User.findByPk(id);
    if (!user) return null;

    return await user.update({ is_blocked: isBlocked });
  }

  /**
   * Get user statistics
   */
  async getStats() {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_blocked: false } });
    const blockedUsers = await User.count({ where: { is_blocked: true } });
    const adminUsers = await User.count({ where: { role: 'admin' } });

    return {
      total: totalUsers,
      active: activeUsers,
      blocked: blockedUsers,
      admins: adminUsers
    };
  }
}

module.exports = new UserRepository();
