jest.mock('~/utils/errorsHelper')
jest.mock('~/consts/errors', () => ({
  BODY_IS_NOT_DEFINED: 1,
  FIELD_IS_NOT_DEFINED: () => 2,
  FIELD_IS_NOT_OF_PROPER_TYPE: () => 3,
  FIELD_IS_NOT_OF_PROPER_LENGTH: () => 4,
  FIELD_IS_NOT_OF_PROPER_FORMAT: () => 5,
  FIELD_IS_NOT_OF_PROPER_ENUM_VALUE: () => 6
}))

const { createError } = require('~/utils/errorsHelper')

const validationMiddleware = require('~/middlewares/validation')

const TestEnum = ['testvalue']

describe('Validation middleware', () => {
  const mockSchema = {
    test1: {
      required: true,
      type: 'string',
      length: {
        min: 5,
        max: 15
      },
      regex: /^[a-zA-Z]+$/,
      enum: TestEnum
    }
  }

  let req
  let res
  let next

  beforeEach(() => {
    req = { body: {} }
    res = {}
    next = jest.fn()

    createError.mockImplementation((statusCode, message) => {
      return message
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Should return error when body is not present', () => {
    req.body = null

    try {
      validationMiddleware({})(req, res, next)
    } catch (err) {
      expect(err).toEqual(1)
    }
  })

  it('Should return error when required field is not present', () => {
    try {
      validationMiddleware(mockSchema)(req, res, next)
    } catch (err) {
      expect(err).toEqual(2)
    }
  })

  it('Should return error when field has wrong type', () => {
    req.body = {
      test1: 1
    }

    try {
      validationMiddleware(mockSchema)(req, res, next)
    } catch (err) {
      expect(err).toEqual(3)
    }
  })

  it('Should return error when field has wrong length', () => {
    req.body = {
      test1: '123'
    }

    try {
      validationMiddleware(mockSchema)(req, res, next)
    } catch (err) {
      expect(err).toEqual(4)
    }
  })

  it("Should return error when field doesn't match regex", () => {
    req.body = {
      test1: 'abcd123'
    }

    try {
      validationMiddleware(mockSchema)(req, res, next)
    } catch (err) {
      expect(err).toEqual(5)
    }
  })

  it("Should return error when field isn't enum value", () => {
    req.body = {
      test1: 'testtest'
    }

    try {
      validationMiddleware(mockSchema)(req, res, next)
    } catch (err) {
      expect(err).toEqual(6)
    }
  })

  it('Should not call next function when error appear', () => {
    try {
      validationMiddleware(mockSchema)(req, res, next)
    } catch (err) {
      expect(next).not.toHaveBeenCalled()
    }
  })

  it('Should call next function when everything is good', () => {
    req.body = {
      test1: 'testvalue'
    }

    try {
      validationMiddleware(mockSchema)(req, res, next)
    } catch (err) {
      expect(err).not.toBeDefined()
    }

    expect(next).toHaveBeenCalled()
  })

  it('Should call next function when schema is empty', () => {
    req.body = {
      test1: 'testtest'
    }

    validationMiddleware({})(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
