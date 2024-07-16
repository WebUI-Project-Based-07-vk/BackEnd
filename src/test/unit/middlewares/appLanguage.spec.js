const langMiddleware = require('~/middlewares/appLanguage')
const { INVALID_LANGUAGE } = require('~/consts/errors')
const {
  enums: { APP_LANG_ENUM }
} = require('~/consts/validation')
const { createError } = require('~/utils/errorsHelper')

jest.mock('~/utils/errorsHelper')

describe('langMiddleware', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = {
      acceptsLanguages: jest.fn()
    }
    res = {}
    next = jest.fn()
    createError.mockClear()
  })

  it('should set the language if a valid language is provided', () => {
    req.acceptsLanguages.mockReturnValue(APP_LANG_ENUM[0])

    langMiddleware(req, res, next)

    expect(req.lang).toBe(APP_LANG_ENUM[0])
    expect(next).toHaveBeenCalled()
  })

  it('should throw an error if an invalid language is provided', () => {
    req.acceptsLanguages.mockReturnValue(false)
    createError.mockImplementation((status, message) => {
      const error = new Error(message)
      error.status = status
      return error
    })

    expect(() => langMiddleware(req, res, next)).toThrow(createError(400, INVALID_LANGUAGE))
    expect(next).not.toHaveBeenCalled()
  })

  it('should throw an error if no language is provided', () => {
    req.acceptsLanguages.mockReturnValue(null)
    createError.mockImplementation((status, message) => {
      const error = new Error(message)
      error.status = status
      return error
    })

    expect(() => langMiddleware(req, res, next)).toThrow(createError(400, INVALID_LANGUAGE))
    expect(next).not.toHaveBeenCalled()
  })
})
