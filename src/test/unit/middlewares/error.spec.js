jest.mock('~/consts/errors', () => ({
  INTERNAL_SERVER_ERROR: {
    code: 500
  },
  DOCUMENT_ALREADY_EXISTS: jest.fn(),
  MONGO_SERVER_ERROR: jest.fn(),
  VALIDATION_ERROR: jest.fn()
}))
jest.mock('~/logger/logger')
jest.mock('~/utils/getUniqueFields', () => jest.fn().mockImplementation((t) => t))
const {
  INTERNAL_SERVER_ERROR,
  DOCUMENT_ALREADY_EXISTS,
  MONGO_SERVER_ERROR,
  VALIDATION_ERROR
} = require('~/consts/errors')
const logger = require('~/logger/logger')
const getUniqueFields = require('~/utils/getUniqueFields')
const errorMiddleware = require('~/middlewares/error')

describe('Error middleware', () => {
  const req = jest.fn()
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  }
  const next = jest.fn()

  beforeAll(() => {
    logger.error = jest.fn()
  })

  it('Should call logger', () => {
    const error = {
      name: 'http'
    }
    errorMiddleware(error, req, res, next)
    expect(logger.error).toHaveBeenCalledWith(error)
  })

  it('Should handle DOCUMENT_ALREADY_EXIST', () => {
    const error = {
      name: 'MongoServerError',
      code: 11000,
      message: 'error'
    }

    errorMiddleware(error, req, res, next)

    expect(getUniqueFields).toHaveBeenCalledWith(error.message)
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409
    })
    expect(DOCUMENT_ALREADY_EXISTS).toHaveBeenCalledWith(error.message)
  })

  it('Should handle MONGO_SERVER_ERROR', () => {
    const error = {
      name: 'MongoServerError',
      message: 'error'
    }

    errorMiddleware(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      status: 500
    })
    expect(MONGO_SERVER_ERROR).toHaveBeenCalledWith(error.message)
  })

  it('Should handle VALIDATION_ERROR', () => {
    const error = {
      name: 'ValidationError',
      message: 'error'
    }

    errorMiddleware(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409
    })
    expect(VALIDATION_ERROR).toHaveBeenCalledWith(error.message)
  })

  it('Should handle INTERNAL_SERVER_ERROR', () => {
    const error = {
      name: 'error',
      message: 'error'
    }

    errorMiddleware(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      code: INTERNAL_SERVER_ERROR.code,
      message: error.message
    })
  })

  it('Should handle custom error', () => {
    const error = {
      name: 'http',
      status: 418,
      code: 'user error',
      message: 'I`m teapot'
    }

    errorMiddleware(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(error.status)
    expect(res.json).toHaveBeenCalledWith({
      status: error.status,
      code: error.code,
      message: error.message
    })
  })
})
