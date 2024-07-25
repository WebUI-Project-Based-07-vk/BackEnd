const router = require('express').Router()
const constController = require('~/controllers/constants')

router.get('/spoken-lang', constController.sendSpokenLangs)

module.exports = router
