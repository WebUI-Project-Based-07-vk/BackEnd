const authService = require('~/services/auth')
const { createError } = require('~/utils/errorsHelper')

jest.mock('~/services/auth')

describe('Auth Service', () => {
  describe('Email Confirmation', () => {
    it('should confirm email successfully with valid token', async () => {
      const token = 'valid-confirmation-token'

      authService.confirmEmail = jest.fn().mockResolvedValue({ message: 'Email confirmed successfully' })

      const result = await authService.confirmEmail(token)

      expect(result).toEqual({ message: 'Email confirmed successfully' })
    })

    it('should throw INVALID_TOKEN error if token is invalid', async () => {
      const token = 'invalid-token'

      authService.confirmEmail = jest.fn().mockRejectedValue(createError(400, 'INVALID_TOKEN'))

      await expect(authService.confirmEmail(token)).rejects.toThrow('INVALID_TOKEN')
    })

    it('should throw TOKEN_EXPIRED error if token has expired', async () => {
      const token = 'expired-token'

      authService.confirmEmail = jest.fn().mockRejectedValue(createError(400, 'TOKEN_EXPIRED'))

      await expect(authService.confirmEmail(token)).rejects.toThrow('TOKEN_EXPIRED')
    })
  })
})
