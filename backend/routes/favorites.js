const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const FavoriteController = require('../controllers/FavoriteController');
const { auth } = require('../middleware/auth');


// Get all favorites (requires auth)
router.get('/', auth, FavoriteController.getFavorites);

// Add to favorites (requires auth)
router.post('/',
  auth,
  [
    body('restaurant_id')
      .isInt()
      .withMessage('Restaurant ID is required')
  ],
  FavoriteController.addFavorite
);

// Remove from favorites (requires auth)
router.delete('/:restaurant_id', auth, FavoriteController.removeFavorite);

// Check if restaurant is favorited (requires auth)
router.get('/check/:restaurant_id', auth, FavoriteController.checkFavorite);

module.exports = router;
