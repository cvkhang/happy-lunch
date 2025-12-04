const { restaurantRepository } = require('../repositories');

class RestaurantController {
  // GET /api/restaurants - Get all restaurants or search
  async getAllRestaurants(req, res) {
    try {
      const { search } = req.query;
      const restaurants = await restaurantRepository.findAll({ search });

      res.json(restaurants);
    } catch (error) {
      console.error('Error in getAllRestaurants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/restaurants/:id - Get single restaurant
  async getRestaurantById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const restaurant = await restaurantRepository.findById(id, userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json(restaurant);
    } catch (error) {
      console.error('Error in getRestaurantById:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /api/restaurants - Create new restaurant
  async createRestaurant(req, res) {
    try {
      const restaurantData = req.body;


      // Basic validation
      if (!restaurantData.name || !restaurantData.address) {
        return res.status(400).json({ error: 'Name and address are required' });
      }

      const newRestaurant = await restaurantRepository.create(restaurantData);
      res.status(201).json(newRestaurant);
    } catch (error) {
      console.error('Error in createRestaurant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /api/restaurants/:id - Update restaurant
  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const restaurantData = req.body;


      const updatedRestaurant = await restaurantRepository.update(id, restaurantData);

      if (!updatedRestaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json(updatedRestaurant);
    } catch (error) {
      console.error('Error in updateRestaurant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE /api/restaurants/:id - Delete restaurant
  async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;
      const deleted = await restaurantRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      console.error('Error in deleteRestaurant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new RestaurantController();
