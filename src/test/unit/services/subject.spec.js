const Subject = require('~/models/subject')
const subjectService = require('~/services/subject')
const { createError } = require('~/utils/errorsHelper')
const { INTERNAL_SERVER_ERROR } = require('~/consts/errors')

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
  })
})
