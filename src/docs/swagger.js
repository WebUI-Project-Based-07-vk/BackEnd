const path = require('path')
const swaggerjsdoc = require('swagger-jsdoc')

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'S2s API Documentation',
      description: 'This is API documentation for SpaceToStudy application',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:8080'
      }
    ]
  },
  apis: [path.join(__dirname, './paths/*yaml')]
}

const swaggerDocs = swaggerjsdoc(swaggerOptions)

module.exports = swaggerDocs
