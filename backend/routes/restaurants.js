const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/RestaurantController');

// GET /api/restaurants - Get all restaurants or search
router.get('/', RestaurantController.getAllRestaurants.bind(RestaurantController));

// GET /api/restaurants/:id - Get single restaurant
router.get('/:id', RestaurantController.getRestaurantById.bind(RestaurantController));

// POST /api/restaurants - Create new restaurant
router.post('/', RestaurantController.createRestaurant.bind(RestaurantController));

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', RestaurantController.updateRestaurant.bind(RestaurantController));

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', RestaurantController.deleteRestaurant.bind(RestaurantController));

module.exports = router;
