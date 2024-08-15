const categoryService = require('~/services/category')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { INTERNAL_SERVER_ERROR } = require('~/consts/errors')

jest.mock('~/models/category')
jest.mock('~/models/subject')
jest.mock('~/utils/errorsHelper')

describe('categoryService', () => {
  describe('getCategories', () => {
    it('should return categories and count when called with valid arguments', async () => {
      const mockCategories = [{ name: 'Category 1' }, { name: 'Category 2' }]
      Category.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCategories)
      })
      Category.countDocuments.mockResolvedValue(mockCategories.length)

      const result = await categoryService.getCategories('name', 0, 10)

      expect(result).toEqual({ count: 2, categories: mockCategories })
      expect(Category.find).toHaveBeenCalled()
      expect(Category.find().sort).toHaveBeenCalledWith('name')
      expect(Category.find().sort().skip).toHaveBeenCalledWith(0)
      expect(Category.find().sort().skip().limit).toHaveBeenCalledWith(10)
      expect(Category.countDocuments).toHaveBeenCalled()
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
      Category.countDocuments.mockRejectedValue(error)
      createError.mockReturnValue(new Error(INTERNAL_SERVER_ERROR))

      await expect(categoryService.getCategories('name')).rejects.toThrow(new Error(INTERNAL_SERVER_ERROR))
      expect(createError).toHaveBeenCalledWith(500, INTERNAL_SERVER_ERROR)
    })
  })

  describe('getSubjectsNameByCategoryId', () => {
    it('should return subject names and count when called with a valid category ID', async () => {
      const categoryId = '66b4eaf3083ca75e2ac9a31e'
      const mockSubjects = [
        { _id: '66b5d09d3f423a59f09e8003', name: 'Gold' },
        { _id: '66b5f03d45ac7cd55a8f9b2a', name: 'Subject' }
      ]

      Subject.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSubjects)
      })
      Subject.countDocuments.mockResolvedValue(mockSubjects.length)

      const result = await categoryService.getSubjectsNameByCategoryId(categoryId)

      expect(result).toEqual({
        count: 2,
        subjects: [
          { _id: '66b5d09d3f423a59f09e8003', name: 'Gold' },
          { _id: '66b5f03d45ac7cd55a8f9b2a', name: 'Subject' }
        ]
      })
      expect(Subject.find).toHaveBeenCalledWith({ category: categoryId }, '_id, name')
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
