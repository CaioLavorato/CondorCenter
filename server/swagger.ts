
import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Condor Center API',
    version: '1.0.0',
    description: 'API documentation for Condor Center'
  },
  servers: [
    {
      url: '/api',
      description: 'API server'
    }
  ],
  components: {
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid'
      }
    }
  },
  paths: {
    '/products': {
      get: {
        summary: 'Get all products',
        responses: {
          '200': {
            description: 'List of products'
          }
        }
      }
    },
    '/buildings': {
      get: {
        summary: 'Get all buildings',
        security: [{ sessionAuth: [] }],
        responses: {
          '200': {
            description: 'List of buildings'
          }
        }
      }
    }
  }
};
