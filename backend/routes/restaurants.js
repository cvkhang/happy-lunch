const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/RestaurantController');
const { adminAuth } = require('../middleware/auth');

// Public routes
// Get all restaurants (with optional search)
router.get('/', RestaurantController.getAllRestaurants.bind(RestaurantController));

// Get restaurant by ID (with menu and reviews)
router.get('/:id', RestaurantController.getRestaurantById.bind(RestaurantController));

// Admin only routes
// Create new restaurant
router.post('/', adminAuth, RestaurantController.createRestaurant.bind(RestaurantController));

// Update restaurant
router.put('/:id', adminAuth, RestaurantController.updateRestaurant.bind(RestaurantController));

// Delete restaurant
router.delete('/:id', adminAuth, RestaurantController.deleteRestaurant.bind(RestaurantController));

module.exports = router;
