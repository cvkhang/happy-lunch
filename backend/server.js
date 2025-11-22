const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const restaurantRoutes = require('./routes/restaurants');
const sequelize = require('./config/database');
const { models } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/restaurants', restaurantRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database (create tables if not exist, but don't drop)
    await sequelize.sync();
    console.log('Database synchronized.');

    app.listen(config.PORT, () => {
      console.log(`Server is running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
