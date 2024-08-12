const router = require('express').Router({ mergeParams: true })

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const idValidation = require('~/middlewares/idValidation')
const isEntityValid = require('~/middlewares/entityValidation')

const subjectController = require('~/controllers/subject')
const Subject = require('~/models/subject')

const params = [{ model: Subject, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(subjectController.getSubjects))
router.get('/:id', isEntityValid({ params }), asyncWrapper(subjectController.getSubjectById))

module.exports = router
