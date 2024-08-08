const subjectService = require('~/services/subject')

const getSubjects = async (req, res) => {
  const subjects = await subjectService.getSubjects()

  res.status(200).json(subjects)
}

const getSubjectById = async (req, res) => {
  const { id } = req.params

  const subject = await subjectService.getSubjectById(id)

  res.status(200).json(subject)
}

const createSubject = async (req, res) => {
  const data = req.body
  console.log(req.body)
  const newSubject = await subjectService.createSubject(data)
  console.log(newSubject)

  res.status(201).json({ data: 'soon' })
}

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject
}
