const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ハッピーランチ API',
      version: '1.0.0',
      description: 'API documentation for ハッピーランチ application - Restaurant search and management',
      contact: {
        name: 'ハッピーランチ Team',
        email: 'support@happylunch.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server (Port 5000)',
      },
      {
        url: 'https://happy-lunch.onrender.com',
        description: 'Production server',
      },
    ],
  },
  // Read swagger documentation from separate files
  apis: [
    './docs/swagger/*.swagger.js',  // All swagger documentation files
    './routes/*.js'                 // Routes for additional annotations if needed
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
