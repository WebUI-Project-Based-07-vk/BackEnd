const mongoose = require('mongoose')
const { INVALID_ID } = require('~/consts/errors')
const idValidation = require('~/middlewares/idValidation')
const { createError } = require('~/utils/errorsHelper')

jest.mock('~/utils/errorsHelper', () => ({
  createError: jest.fn((status, errorInfo) => {
    return new Error("test error");
  })
}));

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

    expect(createError).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  })

  it('should throw an error if id is invalid', () => {
    const invalidId = 'invalid-id'

    try {
      idValidation(req, res, next, invalidId);
    } catch (error) {
      expect(error.message).toEqual("test error")
    }
    expect(createError).toHaveBeenCalledWith(400, INVALID_ID);
    expect(next).not.toHaveBeenCalled()
  })
})
