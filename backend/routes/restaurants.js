const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/RestaurantController');
const { adminAuth } = require('../middleware/auth');

// Public routes
// Get all restaurants (with optional search)
router.get('/', RestaurantController.getAllRestaurants.bind(RestaurantController));

// Get restaurant by ID (with menu and reviews)
router.get('/:id', RestaurantController.getRestaurantById.bind(RestaurantController));

const { body } = require('express-validator');

// Validation middleware
const validateRestaurant = [
  body('opening_hours')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] - ([0-1]?[0-9]|2[0-3]):[0-5][0-9](, ([0-1]?[0-9]|2[0-3]):[0-5][0-9] - ([0-1]?[0-9]|2[0-3]):[0-5][0-9])*$/)
    .withMessage('Opening hours must be in format HH:mm - HH:mm, separated by comma for multiple ranges')
];

// Admin only routes
// Create new restaurant
router.post('/', adminAuth, validateRestaurant, RestaurantController.createRestaurant.bind(RestaurantController));

// Update restaurant
router.put('/:id', adminAuth, validateRestaurant, RestaurantController.updateRestaurant.bind(RestaurantController));

// Delete restaurant
router.delete('/:id', adminAuth, RestaurantController.deleteRestaurant.bind(RestaurantController));

module.exports = router;
