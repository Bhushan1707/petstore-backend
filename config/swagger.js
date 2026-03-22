const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pet Store API',
      version: '1.0.0',
      description: 'API Documentation for the Pet Store application',
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:5000',
        description: 'Current server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // points to files containing annotations relative to the execution context
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
