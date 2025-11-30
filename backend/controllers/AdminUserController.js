const UserRepository = require('../repositories/UserRepository');

class AdminUserController {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(req, res) {
    try {
      const filters = {
        search: req.query.search,
        role: req.query.role,
        is_blocked: req.query.is_blocked,
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      const result = await UserRepository.findAll(filters);

      res.json({
        success: true,
        users: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await UserRepository.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Block user (Admin only)
   */
  async blockUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from blocking themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot block yourself'
        });
      }

      const user = await UserRepository.updateBlockStatus(id, true);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User blocked successfully',
        user
      });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Unblock user (Admin only)
   */
  async unblockUser(req, res) {
    try {
      const { id } = req.params;

      const user = await UserRepository.updateBlockStatus(id, false);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User unblocked successfully',
        user
      });
    } catch (error) {
      console.error('Unblock user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Delete user (Admin only) - Optional, use with caution
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete yourself'
        });
      }

      const result = await UserRepository.delete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Get user statistics (Admin only)
   */
  async getUserStats(req, res) {
    try {
      const stats = await UserRepository.getStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラー / Server error'
      });
    }
  }

  /**
   * Update user role (Admin only) - Promote/demote
   */
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: '無効な役割です / Invalid role'
        });
      }

      // Prevent admin from changing their own role
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: '自分の役割を変更できません / Cannot change your own role'
        });
      }

      const user = await UserRepository.update(id, { role });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ユーザーが見つかりません / User not found'
        });
      }

      res.json({
        success: true,
        message: 'ユーザーの役割が更新されました / User role updated successfully',
        user
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラー / Server error'
      });
    }
  }
}

module.exports = new AdminUserController();
