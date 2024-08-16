const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { restrictTo, authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const categoryController = require('~/controllers/category')

const Category = require('~/models/category')

const params = [{ model: Category, idName: 'id' }]

const {
  roles: { ADMIN }
} = require('~/consts/auth')

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(categoryController.getCategories))
router.get('/:id', asyncWrapper(categoryController.getCategoryById))
router.get('/:id/subjects/names', isEntityValid({ params }), categoryController.getSubjectsNamesByCategoryId)
router.get('/names', asyncWrapper(categoryController.getCategoryNames))

router.use(restrictTo(ADMIN))
router.post('/', asyncWrapper(categoryController.addCategory))

module.exports = router
