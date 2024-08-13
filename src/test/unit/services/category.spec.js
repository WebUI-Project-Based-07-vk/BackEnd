const categoryService = require('~/services/category')
const Category = require('~/models/category')
const { createError } = require('~/utils/errorsHelper')
const { INTERNAL_SERVER_ERROR } = require('~/consts/errors')

jest.mock('~/models/category')
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
})
