const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BE Test API Documentation',
      version: '1.0.0',
      description: 'Documentation for BE Test API with JWT Authentication',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            fullName: {
              type: 'string',
              description: 'User full name'
            },
            accountNumber: {
              type: 'string',
              description: 'Bank account number'
            },
            emailAddress: {
              type: 'string',
              format: 'email'
            },
            registrationNumber: {
              type: 'string',
              description: 'Government registration number'
            },
            password: {
              type: 'string',
              format: 'password'
            }
          },
          required: [ 'fullName', 'emailAddress', 'password']
        },
        AccountLogin: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string'
            },
            userName: {
              type: 'string'
            },
            password: {
              type: 'string',
              format: 'password'
            },
            lastLoginDateTime: {
              type: 'string',
              format: 'date-time'
            },
            userId: {
              type: 'string'
            }
          },
          required: ['accountId', 'userName', 'password', 'userId']
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
