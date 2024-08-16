const Subject = require('~/models/subject')
const subjectService = require('~/services/subject')
const { createError } = require('~/utils/errorsHelper')
const { INTERNAL_SERVER_ERROR, INVALID_ID } = require('~/consts/errors')

jest.mock('~/models/subject')
jest.mock('~/utils/errorsHelper', () => ({
  createError: jest.fn()
}))

describe('subjectService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getSubjects', () => {
    it('should return subjects when find is successful', async () => {
      const mockSubjects = [{ name: 'Math' }, { name: 'Science' }]
      Subject.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubjects)
      })

      const subjects = await subjectService.getSubjects()

      expect(subjects).toBe(mockSubjects)
      expect(Subject.find).toHaveBeenCalledTimes(1)
      expect(Subject.find().exec).toHaveBeenCalledTimes(1)
    })

    it('should throw an error when find fails', async () => {
      const error = new Error('Database error')
      Subject.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error)
      })

      const mockError = createError(500, INTERNAL_SERVER_ERROR)
      createError.mockReturnValue(mockError)

      await expect(subjectService.getSubjects()).rejects.toEqual(mockError)
      expect(createError).toHaveBeenCalledWith(500, INTERNAL_SERVER_ERROR)
    })

    it('should return an empty array when no subjects are found', async () => {
      Subject.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })

      const subjects = await subjectService.getSubjects()

      expect(subjects).toEqual([])
      expect(Subject.find).toHaveBeenCalledTimes(1)
      expect(Subject.find().exec).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSubjectById', () => {
    it('should return a subject when findById is successful', async () => {
      const mockSubject = { name: 'Math', _id: '123' }
      const subjectId = '123'
      Subject.findById.mockResolvedValue(mockSubject)

      const subject = await subjectService.getSubjectById(subjectId)

      expect(subject).toBe(mockSubject)
      expect(Subject.findById).toHaveBeenCalledWith(subjectId)
      expect(Subject.findById).toHaveBeenCalledTimes(1)
    })

    it('should throw an error when findById fails', async () => {
      const error = new Error('Database error')
      const subjectId = '123'
      Subject.findById.mockRejectedValue(error)

      const mockError = createError(404, INVALID_ID)
      createError.mockReturnValue(mockError)

      await expect(subjectService.getSubjectById(subjectId)).rejects.toEqual(mockError)
      expect(createError).toHaveBeenCalledWith(404, INVALID_ID)
    })
  })

  describe('createSubject', () => {
    it('should create and return a populated subject when valid data is provided', async () => {
      const mockSubject = {
        name: 'Physics',
        category: 'category_id',
        populate: jest.fn().mockResolvedValue({
          name: 'Physics',
          category: { _id: 'category_id', name: 'Science' }
        })
      }

      const subjectData = { name: 'Physics', category: 'category_id' }
      Subject.create.mockResolvedValue(mockSubject)

      const result = await subjectService.createSubject(subjectData)

      expect(Subject.create).toHaveBeenCalledWith({
        name: 'Physics',
        category: 'category_id'
      })
      expect(mockSubject.populate).toHaveBeenCalledWith({
        path: 'category',
        select: '_id name'
      })
      expect(result).toEqual({
        name: 'Physics',
        category: { _id: 'category_id', name: 'Science' }
      })
    })

    it('should throw an error when creation fails', async () => {
      const error = new Error('Database error')
      Subject.create.mockRejectedValue(error)

      const mockError = createError(500, INTERNAL_SERVER_ERROR)
      createError.mockReturnValue(mockError)

      await expect(subjectService.createSubject({ name: 'Physics', category: 'category_id' })).rejects.toEqual(
        mockError
      )
      expect(createError).toHaveBeenCalledWith(500, INTERNAL_SERVER_ERROR)
    })
  })
  describe('deleteSubject', () => {
    it('should delete the subject when findByIdAndRemove is successful', async () => {
      const subjectId = '123'
      Subject.findByIdAndRemove.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: subjectId, name: 'Math' })
      })
      await subjectService.deleteSubject(subjectId)
      expect(Subject.findByIdAndRemove).toHaveBeenCalledWith(subjectId)
    })
  })

  describe('updateSubject', () => {
    it('should update the subject and return the populated subject when valid data is provided', async () => {
      const mockSubject = {
        _id: '123',
        name: 'Physics',
        category: 'category_id',
        save: jest.fn().mockResolvedValue({
          _id: '123',
          name: 'Updated Physics',
          category: 'category_id'
        }),
        populate: jest.fn().mockResolvedValue({
          _id: '123',
          name: 'Updated Physics',
          category: { _id: 'category_id', name: 'Science' }
        })
      }

      Subject.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubject)
      })

      const subjectId = '123'
      const updateData = { name: 'Updated Physics' }

      const result = await subjectService.updateSubject(subjectId, updateData)

      expect(Subject.findById).toHaveBeenCalledWith(subjectId)
      expect(Subject.findById).toHaveBeenCalledTimes(1)

      expect(mockSubject.name).toBe(updateData.name)
      expect(mockSubject.save).toHaveBeenCalledTimes(1)

      expect(mockSubject.populate).toHaveBeenCalledWith({
        path: 'category',
        select: '_id name'
      })

      expect(result).toEqual({
        _id: '123',
        name: 'Updated Physics',
        category: { _id: 'category_id', name: 'Science' }
      })
    })

    it('should throw an error when update fails', async () => {
      const error = new Error('Database error')
      const subjectId = '123'
      Subject.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error)
      })

      const mockError = createError(500, INTERNAL_SERVER_ERROR)
      createError.mockReturnValue(mockError)

      await expect(subjectService.updateSubject(subjectId, { name: 'Updated Physics' })).rejects.toEqual(mockError)
      expect(createError).toHaveBeenCalledWith(500, INTERNAL_SERVER_ERROR)
    })
  })
})
