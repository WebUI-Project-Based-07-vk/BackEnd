const router = require('express').Router({ mergeParams: true })

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const idValidation = require('~/middlewares/idValidation')
const isEntityValid = require('~/middlewares/entityValidation')

const subjectController = require('~/controllers/subject')
const Subject = require('~/models/subject')

const {
  roles: { ADMIN }
} = require('~/consts/auth')
const params = [{ model: Subject, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(subjectController.getSubjects))
router.get('/:id', isEntityValid({ params }), asyncWrapper(subjectController.getSubjectById))
router.use(restrictTo(ADMIN))
router.post('/', asyncWrapper(subjectController.createSubject))
router.delete('/:id',isEntityValid({ params }),asyncWrapper(subjectController.deleteSubject))

module.exports = router
