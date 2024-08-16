const mongoose = require('mongoose')
const Subject = require('~/models/subject')
const { createError } = require('../utils/errorsHelper')
const { INTERNAL_SERVER_ERROR, INVALID_ID } = require('~/consts/errors')

const subjectService = {
  getSubjects: async (match, sort, skip = 0, limit = 10) => {
    try {
      if (match.category) {
        match.category = mongoose.Types.ObjectId(match.category)
      }
      if (match.name) {
        match.name = { $regex: match.name, $options: 'i' }
      }

      const total = await Subject.countDocuments(match)
      if (skip >= total) {
        return { count: 0, total, subjects: [] }
      }

      const subjects = await Subject.find(match).sort(sort).skip(skip).limit(limit).lean().exec()
      const count = subjects.length

      return { count, total, subjects }
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
  },

  createSubject: async (data) => {
    try {
      const { name, category } = data

      const subject = await Subject.create({
        name,
        category
      })

      return await subject.populate({ path: 'category', select: '_id name' })
    } catch (error) {
      throw createError(500, INTERNAL_SERVER_ERROR)
    }
  },

  deleteSubject: async (id) => {
    try {
      Subject.findByIdAndRemove(id).exec()
    } catch (error) {
      throw createError(500, INTERNAL_SERVER_ERROR)
    }
  },

  updateSubject: async (id, data) => {
    try {
      const subject = await Subject.findById(id).exec()

      for (let field in data) {
        subject[field] = data[field]
      }

      await subject.save()
      return subject.populate({ path: 'category', select: '_id name' })
    } catch (error) {
      throw createError(500, INTERNAL_SERVER_ERROR)
    }
  }
}

module.exports = subjectService
