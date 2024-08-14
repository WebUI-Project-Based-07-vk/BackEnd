const categoryService = require('~/services/category')
const getSortOptions = require('~/utils/getSortOptions')

const getCategories = async (req, res) => {
  const { sort, skip, limit } = req.query

  const sortOptions = getSortOptions(sort)
  const categories = await categoryService.getCategories(sortOptions, parseInt(skip), parseInt(limit))

  res.status(200).json(categories)
}

const getSubjectsNamesByCategoryId = async (req, res) => {
  const { id } = req.params

  const subjectsNames = await categoryService.getSubjectsNameByCategoryId(id)
  res.status(200).json(subjectsNames)
}

module.exports = {
  getCategories,
  getSubjectsNamesByCategoryId
}
