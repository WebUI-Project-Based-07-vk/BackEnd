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
    let mockSubjects

    beforeEach(() => {
      mockSubjects = [{ name: 'Math' }, { name: 'Science' }]

      Subject.find.mockClear()
      Subject.countDocuments.mockClear()

      Subject.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSubjects)
      })

      Subject.countDocuments.mockResolvedValue(mockSubjects.length)
    })

    it('should return subjects and count when find is successful', async () => {
      const match = {}
      const sort = {}
      const skip = 0
      const limit = 10

      const result = await subjectService.getSubjects(match, sort, skip, limit)

      expect(result).toEqual({ count: mockSubjects.length, total: mockSubjects.length, subjects: mockSubjects })
      expect(Subject.find).toHaveBeenCalledTimes(1)
      expect(Subject.find).toHaveBeenCalledWith(match)
      expect(Subject.find().sort).toHaveBeenCalledWith(sort)
      expect(Subject.find().skip).toHaveBeenCalledWith(skip)
      expect(Subject.find().limit).toHaveBeenCalledWith(limit)
      expect(Subject.find().lean).toHaveBeenCalledTimes(1)
      expect(Subject.find().exec).toHaveBeenCalledTimes(1)
      expect(Subject.countDocuments).toHaveBeenCalledTimes(1)
      expect(Subject.countDocuments).toHaveBeenCalledWith(match)
    })

    it('should not call Subject.find when skip is greater than or equal to count', async () => {
      const mockCount = 5
      const mockSubjects = []
      const match = {}
      const sort = {}
      const skip = 10
      const limit = 10

      Subject.countDocuments.mockResolvedValue(mockCount)
      Subject.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSubjects)
      })

      const result = await subjectService.getSubjects(match, sort, skip, limit)

      expect(result).toEqual({ count: 0, total: mockCount, subjects: [] })

      expect(Subject.find).not.toHaveBeenCalled()

      expect(Subject.countDocuments).toHaveBeenCalledTimes(1)
      expect(Subject.countDocuments).toHaveBeenCalledWith(match)
    })

    it('should handle the case when skip is greater than the total count', async () => {
      const mockCount = 5
      const mockSubjects = []
      const match = {}
      const sort = {}
      const skip = 10
      const limit = 10

      Subject.countDocuments.mockResolvedValue(mockCount)
      Subject.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSubjects)
      })

      const result = await subjectService.getSubjects(match, sort, skip, limit)

      expect(result).toEqual({ count: 0, total: mockCount, subjects: [] })
      expect(Subject.countDocuments).toHaveBeenCalledTimes(1)
      expect(Subject.countDocuments).toHaveBeenCalledWith(match)
      expect(Subject.find).not.toHaveBeenCalled()
    })

    it('should handle case where match.category is a valid ObjectId', async () => {
      const match = { category: '507f191e810c19729de860ea' }
      const sort = {}
      const skip = 0
      const limit = 10

      const mockSubjects = [{ name: 'Math' }]
      Subject.countDocuments.mockResolvedValue(1)
      Subject.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSubjects)
      })

      const result = await subjectService.getSubjects(match, sort, skip, limit)

      expect(result).toEqual({ count: mockSubjects.length, total: 1, subjects: mockSubjects })
      expect(Subject.countDocuments).toHaveBeenCalledWith(match)
    })

    it('should handle case where match.name is a regex query', async () => {
      const match = { name: 'Math' }
      const sort = {}
      const skip = 0
      const limit = 10

      const mockSubjects = [{ name: 'Math' }]
      Subject.countDocuments.mockResolvedValue(1)
      Subject.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSubjects)
      })

      const result = await subjectService.getSubjects(match, sort, skip, limit)

      expect(result).toEqual({ count: mockSubjects.length, total: 1, subjects: mockSubjects })
      expect(Subject.countDocuments).toHaveBeenCalledWith(match)
    })

    it('should handle error and throw a 500 error', async () => {
      const match = {}
      const sort = {}
      const skip = 0
      const limit = 10

      const error = new Error('Database error')
      Subject.countDocuments.mockRejectedValueOnce(error)

      const mockError = createError(500, INTERNAL_SERVER_ERROR)
      createError.mockReturnValue(mockError)

      await expect(subjectService.getSubjects(match, sort, skip, limit)).rejects.toEqual(mockError)

      expect(createError).toHaveBeenCalledWith(500, INTERNAL_SERVER_ERROR)
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
