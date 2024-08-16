const categoryService = require('~/services/category')
const getSortOptions = require('~/utils/getSortOptions')

const getCategories = async (req, res) => {
  const { sort, skip, limit } = req.query

  const sortOptions = getSortOptions(sort)
  const categories = await categoryService.getCategories(sortOptions, parseInt(skip), parseInt(limit))

  res.status(200).json(categories)
}

const getCategoryById = async (req, res) => {
  const category = await categoryService.getCategoryById(req, res)
  res.status(200).json(category)
}

const addCategory = async (req, res) => {
  const newCategory = await categoryService.addCategory(req, res)
  res.status(200).json(newCategory)
}

const getSubjectsNamesByCategoryId = async (req, res) => {
  const { id } = req.params

  const subjectsNames = await categoryService.getSubjectsNameByCategoryId(id)
  res.status(200).json(subjectsNames)
}

const getCategoryNames = async (req, res) => {
  const categoryNames = await categoryService.getCategoryNames()

  res.status(200).json(categoryNames)
}

module.exports = {
  getCategories,
  getCategoryById,
  getSubjectsNamesByCategoryId,
  getCategoryNames,
  addCategory
}
