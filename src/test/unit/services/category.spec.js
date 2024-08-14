const categoryService = require('~/services/category')
const Category = require('~/models/category')
const Subject = require('~/models/Subject')
const { createError } = require('~/utils/errorsHelper')
const { INTERNAL_SERVER_ERROR } = require('~/consts/errors')

jest.mock('~/models/category')
jest.mock('~/models/subject')
jest.mock('~/utils/errorsHelper')

describe('categoryService', () => {
  describe('getCategories', () => {
    it('should return categories when called with valid arguments', async () => {
      const mockCategories = [{ name: 'Category 1' }, { name: 'Category 2' }]
      Category.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCategories)
      })

      const result = await categoryService.getCategories('name', 0, 10)

      expect(result).toEqual(mockCategories)
      expect(Category.find).toHaveBeenCalled()
      expect(Category.find().sort).toHaveBeenCalledWith('name')
      expect(Category.find().sort().skip).toHaveBeenCalledWith(0)
      expect(Category.find().sort().skip().limit).toHaveBeenCalledWith(10)
    })

    it('should throw a 500 error if an error occurs during fetching categories', async () => {
      const error = new Error('Database error')
      Category.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(error)
      })
      createError.mockReturnValue(new Error(INTERNAL_SERVER_ERROR))

      await expect(categoryService.getCategories('name')).rejects.toThrow(new Error(INTERNAL_SERVER_ERROR))
      expect(createError).toHaveBeenCalledWith(500, INTERNAL_SERVER_ERROR)
    })
  })

  describe('getSubjectsNameByCategoryId', () => {
    it('should return subject names and count when called with a valid category ID', async () => {
      const categoryId = '66b4eaf3083ca75e2ac9a31e'
      const mockSubjects = [{ name: 'New Subject' }, { name: 'Gold' }, { name: 'Subject' }, { name: 'Bitcoin' }]

      Subject.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSubjects)
      })
      Subject.countDocuments.mockResolvedValue(mockSubjects.length)

      const result = await categoryService.getSubjectsNameByCategoryId(categoryId)

      expect(result).toEqual({
        count: 4,
        subjectsNames: [{ name: 'New Subject' }, { name: 'Gold' }, { name: 'Subject' }, { name: 'Bitcoin' }]
      })
      expect(Subject.find).toHaveBeenCalledWith({ category: categoryId })
      expect(Subject.find().lean).toHaveBeenCalled()
      expect(Subject.countDocuments).toHaveBeenCalledWith({ category: categoryId })
    })

    it('should throw a 500 error if an error occurs during fetching subjects', async () => {
      const categoryId = '66b4eaf3083ca75e2ac9a31e'
      const error = new Error('Database error')

      Subject.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(error)
      })
      Subject.countDocuments.mockRejectedValue(error)
      createError.mockReturnValue(new Error(INTERNAL_SERVER_ERROR))

      await expect(categoryService.getSubjectsNameByCategoryId(categoryId)).rejects.toThrow(
        new Error(INTERNAL_SERVER_ERROR)
      )
      expect(createError).toHaveBeenCalledWith(500, INTERNAL_SERVER_ERROR)
    })
  })
})
