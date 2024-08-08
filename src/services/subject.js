const Subject = require('~/models/subject')
const { createError } = require('../utils/errorsHelper')
const { INTERNAL_SERVER_ERROR } = require('~/consts/errors')

const subjectService = {
  getSubjects: async () => {
    try {
      const subjects = await Subject.find().exec()
      return subjects
    } catch (error) {
      throw createError(500, INTERNAL_SERVER_ERROR)
    }
  }
}

module.exports = subjectService
