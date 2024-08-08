const Subject = require('~/models/subject')
const { createError } = require('../utils/errorsHelper')
const { INTERNAL_SERVER_ERROR, INVALID_ID } = require('~/consts/errors')

const subjectService = {
  getSubjects: async () => {
    try {
      const subjects = await Subject.find().exec()
      return subjects
    } catch (error) {
      throw createError(500, INTERNAL_SERVER_ERROR)
    }
  },

  getSubjectById: async (id) => {
    try {
      const subject = await Subject.findById(id)
      return subject
    } catch (error) {
      throw createError(404, INVALID_ID)
    }
  }
}

module.exports = subjectService
