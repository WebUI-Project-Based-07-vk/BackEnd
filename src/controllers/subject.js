const subjectService = require('~/services/subject')
const getSortOptions = require('~/utils/getSortOptions')
const getMatchOptions = require('~/utils/getMatchOptions')

const getSubjects = async (req, res) => {
  const { sort, skip, limit, name, category } = req.query

  const sortOptions = getSortOptions(sort)
  const match = getMatchOptions({
    name,
    category
  })

  const subjects = await subjectService.getSubjects(match, sortOptions, parseInt(skip), parseInt(limit))

  res.status(200).json(subjects)
}

const getSubjectById = async (req, res) => {
  const { id } = req.params

  const subject = await subjectService.getSubjectById(id)

  res.status(200).json(subject)
}

const createSubject = async (req, res) => {
  const data = req.body

  const newSubject = await subjectService.createSubject(data)

  res.status(201).json(newSubject)
}

const deleteSubject = async (req, res) => {
  const { id } = req.params
  await subjectService.deleteSubject(id)

  res.status(204).end()
}
const updateSubject = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  const updatedSubject = await subjectService.updateSubject(id, updateData)

  res.status(200).json(updatedSubject)
}

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  deleteSubject,
  updateSubject
}
