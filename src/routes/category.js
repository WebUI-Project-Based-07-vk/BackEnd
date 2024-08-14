const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const categoryController = require('~/controllers/category')

const Category = require('~/models/category')

const params = [{ model: Category, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(categoryController.getCategories))
router.get('/:id/subjects/names', isEntityValid({ params }), categoryController.getSubjectsNamesByCategoryId)

module.exports = router
