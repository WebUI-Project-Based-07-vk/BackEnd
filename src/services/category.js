const Category = require('~/models/category')
const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { INTERNAL_SERVER_ERROR } = require('~/consts/errors')

const categoryService = {
  getCategories: async (sort, skip = 0, limit = 10) => {
    try {
      const categories = await Category.find().sort(sort).skip(skip).limit(limit).lean().exec()
      return categories
    } catch (error) {
      throw createError(500, INTERNAL_SERVER_ERROR)
    }
  },

  getSubjectsNameByCategoryId: async (categoryId) => {
    try {
      const subjects = await Subject.find({ category: categoryId }, '_id, name').lean().exec()
      const count = await Subject.countDocuments({ category: categoryId })
      return { count, subjects }
    } catch (error) {
      throw createError(500, INTERNAL_SERVER_ERROR)
    }
  }
}

module.exports = categoryService
