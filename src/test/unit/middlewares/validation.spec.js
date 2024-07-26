jest.mock('~/utils/errorsHelper')
jest.mock('~/consts/errors', () => ({
  BODY_IS_NOT_DEFINED: 1
}))
jest.mock('~/utils/validationHelper')

const { createError } = require('~/utils/errorsHelper')

const validationMiddleware = require('~/middlewares/validation')

const { validateRequired, validateFunc } = require('~/utils/validationHelper')

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
    jest.resetAllMocks()
  })

  it('Should return error when body is not present', () => {
    req.body = null

    expect(() => validationMiddleware(mockSchema)(req, res, next)).toThrow(new Error(1))
  })

  it('Should return error when required field is not present', () => {
    validateRequired.mockImplementation(() => {
      throw 2
    })

    expect(() => validationMiddleware(mockSchema)(req, res, next)).toThrow(new Error(2))

    expect(validateRequired).toHaveBeenCalledWith('test1', mockSchema.test1.required, undefined)
  })

  it('Should call next when empty field is not required', () => {
    req.body = {
      test1: undefined
    }

    try {
      validationMiddleware({
        test1: {
          required: false
        }
      })(req, res, next)
    } catch (err) {
      expect(err).not.toBeDefined()
    }

    expect(next).toHaveBeenCalled()
  })

  it('Should return error when field has wrong type', () => {
    req.body = {
      test1: 1
    }

    validateFunc.type.mockImplementation(() => {
      throw 3
    })

    expect(() => validationMiddleware(mockSchema)(req, res, next)).toThrow(new Error(3))

    expect(validateFunc.type).toHaveBeenCalledWith('test1', mockSchema.test1.type, req.body.test1)
  })

  it('Should return error when field has wrong length', () => {
    req.body = {
      test1: '123'
    }

    validateFunc.length.mockImplementation(() => {
      throw 4
    })

    expect(() => validationMiddleware(mockSchema)(req, res, next)).toThrow(new Error(4))

    expect(validateFunc.length).toHaveBeenCalledWith('test1', mockSchema.test1.length, req.body.test1)
  })

  it("Should return error when field doesn't match regex", () => {
    req.body = {
      test1: 'abcd123'
    }

    validateFunc.regex.mockImplementation(() => {
      throw 5
    })

    expect(() => validationMiddleware(mockSchema)(req, res, next)).toThrow(new Error(5))

    expect(validateFunc.regex).toHaveBeenCalledWith('test1', mockSchema.test1.regex, req.body.test1)
  })

  it("Should return error when field isn't enum value", () => {
    req.body = {
      test1: 'testtest'
    }

    validateFunc.enum.mockImplementation(() => {
      throw 6
    })

    expect(() => validationMiddleware(mockSchema)(req, res, next)).toThrow(new Error(6))

    expect(validateFunc.enum).toHaveBeenCalledWith('test1', mockSchema.test1.enum, req.body.test1)
  })

  it('Should not call next function when error appear', () => {
    validateRequired.mockImplementation(() => {
      throw 2
    })

    expect(() => validationMiddleware(mockSchema)(req, res, next)).toThrow(new Error(2))

    expect(next).not.toHaveBeenCalled()
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
