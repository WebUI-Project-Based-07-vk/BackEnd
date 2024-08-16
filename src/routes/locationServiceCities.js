const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const locationServiceCitiesController = require('~/controllers/locationServiceCities')

router.get('/countries/:id/cities', asyncWrapper(locationServiceCitiesController.getCityList))

module.exports = router
