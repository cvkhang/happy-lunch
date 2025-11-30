require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const restaurantRoutes = require('./routes/restaurants');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');
const adminRoutes = require('./routes/admin');
const sequelize = require('./config/database');
const { models } = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Happy Lunch API Documentation',
}));


// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);

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
      console.log(`API Documentation available at http://localhost:${config.PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
