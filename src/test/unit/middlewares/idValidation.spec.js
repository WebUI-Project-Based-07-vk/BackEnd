const mongoose = require('mongoose')
const { INVALID_ID } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const idValidation = require('~/middlewares/idValidation')

describe('idValidation Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {}
    next = jest.fn()
  })

  it('should call next if id is valid', () => {
    const validId = new mongoose.Types.ObjectId().toString()

    idValidation(req, res, next, validId)

    expect(next).toHaveBeenCalled()
  })

  it('should throw an error if id is invalid', () => {
    const invalidId = 'invalid-id'

    expect(() => idValidation(req, res, next, invalidId)).toThrow(createError(400, INVALID_ID))
    expect(next).not.toHaveBeenCalled()
  })
})
