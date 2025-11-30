const { validationResult } = require('express-validator');
const FavoriteRepository = require('../repositories/FavoriteRepository');
const { Restaurant } = require('../models');

class FavoriteController {
  async getFavorites(req, res) {
    try {
      const user_id = req.user.id;
      const favorites = await FavoriteRepository.findByUser(user_id);

      res.json({
        success: true,
        favorites
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async addFavorite(req, res) {
    try {
      const { restaurant_id } = req.body;
      const user_id = req.user.id;

      // Check if restaurant exists
      const restaurant = await Restaurant.findByPk(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const result = await FavoriteRepository.add(user_id, restaurant_id);

      if (result.alreadyExists) {
        return res.status(400).json({
          success: false,
          message: 'Already in favorites'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Added to favorites'
      });
    } catch (error) {
      console.error('Add favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async removeFavorite(req, res) {
    try {
      const { restaurant_id } = req.params;
      const user_id = req.user.id;

      const result = await FavoriteRepository.remove(user_id, restaurant_id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
      }

      res.json({
        success: true,
        message: 'Removed from favorites'
      });
    } catch (error) {
      console.error('Remove favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async checkFavorite(req, res) {
    try {
      const { restaurant_id } = req.params;
      const user_id = req.user.id;

      const isFavorited = await FavoriteRepository.isFavorited(user_id, restaurant_id);

      res.json({
        success: true,
        is_favorite: isFavorited
      });
    } catch (error) {
      console.error('Check favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new FavoriteController();
