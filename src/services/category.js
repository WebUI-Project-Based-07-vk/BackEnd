// const Offer = require('~/models/offer')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { CATEGORY_NOT_FOUND, NOT_FOUND, CATEGORY_ALREADY_EXISTS, INTERNAL_SERVER_ERROR } = require('~/consts/errors')

const categoryService = {
  getCategories: async (sort, skip = 0, limit = 10) => {
    try {
      const categories = await Category.find().sort(sort).skip(skip).limit(limit).lean().exec()
      const count = await Category.countDocuments()

      return { count, categories }
    } catch (error) {
      throw createError(500, INTERNAL_SERVER_ERROR)
    }
  },

  getCategoryById: async (req, _res) => {
    try {
      const category = await Category.findById(req.params.id)
      if (!category) throw 'error'
      return category
    } catch {
      throw createError(404, CATEGORY_NOT_FOUND)
    }
  },

  addCategory: async (req, _res) => {
    try {
      const existingEntry = await Category.findOne(req.body)
      if (existingEntry) throw 'error'
    } catch {
      throw createError(409, CATEGORY_ALREADY_EXISTS)
    }

    try {
      const newCategory = await Category.create(req.body)
      return { newCategory }
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
  },

  getCategoryNames: async () => {
    try {
      const categoryNames = await Category.find({}, 'name').lean().exec()
      const count = await Category.countDocuments()

      return { categoryNames, count }
    } catch (err) {
      throw createError(404, NOT_FOUND)
    }
  }
}

module.exports = categoryService
