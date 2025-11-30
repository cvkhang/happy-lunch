const { validationResult } = require('express-validator');
const MenuRepository = require('../repositories/MenuRepository');
const { Restaurant } = require('../models');

class MenuController {
  /**
   * Get all menu items (for admin)
   */
  async getAllMenuItems(req, res) {
    try {
      const filters = {
        restaurant_id: req.query.restaurant_id,
        search: req.query.search,
        page: req.query.page || 1,
        limit: req.query.limit || 50
      };

      const result = await MenuRepository.findAll(filters);

      res.json({
        success: true,
        menuItems: result.menuItems,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Get menu items error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Get menu item by ID
   */
  async getMenuItem(req, res) {
    try {
      const { id } = req.params;

      const menuItem = await MenuRepository.findById(id);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        menuItem
      });
    } catch (error) {
      console.error('Get menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Create menu item (Admin only)
   */
  async createMenuItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { restaurant_id, name, description, price, image_url } = req.body;

      // Check if restaurant exists
      const restaurant = await Restaurant.findByPk(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const menuItem = await MenuRepository.create({
        restaurant_id,
        name,
        description,
        price,
        image_url
      });

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        menuItem
      });
    } catch (error) {
      console.error('Create menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Update menu item (Admin only)
   */
  async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, image_url } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (image_url !== undefined) updateData.image_url = image_url;

      const menuItem = await MenuRepository.update(id, updateData);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        message: 'Menu item updated successfully',
        menuItem
      });
    } catch (error) {
      console.error('Update menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Delete menu item (Admin only)
   */
  async deleteMenuItem(req, res) {
    try {
      const { id } = req.params;

      const result = await MenuRepository.delete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      console.error('Delete menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Get menu items by restaurant
   */
  async getMenuItemsByRestaurant(req, res) {
    try {
      const { restaurant_id } = req.params;

      const restaurant = await Restaurant.findByPk(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const menuItems = await MenuRepository.findByRestaurant(restaurant_id);

      res.json({
        success: true,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name
        },
        menuItems
      });
    } catch (error) {
      console.error('Get restaurant menu items error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new MenuController();
