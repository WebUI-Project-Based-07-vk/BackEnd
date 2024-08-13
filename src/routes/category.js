const router = require('express').Router({ mergeParams: true })

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')

const categoryController = require('~/controllers/category')
// eslint-disable-next-line no-unused-vars
const Category = require('~/models/category')

router.use(authMiddleware)

router.get('/', asyncWrapper(categoryController.getCategories))

module.exports = router
