const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerui = require('swagger-ui-express')
const swaggerDocs = require('~/docs/swagger')

const {
  config: { CLIENT_URL }
} = require('~/configs/config')
const router = require('~/routes')
const locationServiceCountriesRoutes = require('~/routes/locationServiceCountries')
const locationServiceCitiesRoutes = require('~/routes/locationServiceCities')
const { createNotFoundError } = require('~/utils/errorsHelper')
const errorMiddleware = require('~/middlewares/error')

const initialization = (app) => {
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(
    cors({
      origin: process.env.NODE_ENV === 'development' ? true : CLIENT_URL,
      credentials: true,
      methods: 'GET, POST, PATCH, DELETE',
      allowedHeaders: 'Content-Type, Authorization'
    })
  )

  app.use('/', router)

  router.use('/api/location', locationServiceCountriesRoutes)
  router.use('/api/location', locationServiceCitiesRoutes)

  app.use('/api-docs', swaggerui.serve, swaggerui.setup(swaggerDocs))

  app.use((_req, _res, next) => {
    next(createNotFoundError())
  })

  app.use(errorMiddleware)
}

module.exports = initialization
