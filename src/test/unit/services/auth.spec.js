const authService = require('../../../services/auth')

jest.mock('~/services/auth')

describe('Auth Service', () => {
  describe('Google Auth', () => {
    it('should return token on successful Google Auth', async () => {
      const email = 'test@gmail.com'
      const tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' }

      authService.googleAuth = jest.fn().mockResolvedValue(tokens)

      const result = await authService.googleAuth(email)

      expect(result).toEqual(tokens)
    })

    it('should throw USER_NOT_FOUND error if user is not found', async () => {
      const email = 'nonexistent@gmail.com'

      authService.googleAuth = jest.fn().mockRejectedValue(new Error('USER_NOT_FOUND'))

      await expect(authService.googleAuth(email)).rejects.toThrow('USER_NOT_FOUND')
    })

    it('should throw EMAIL_NOT_CONFIRMED error if email is not confirmed', async () => {
      const email = 'unconfirmed@gmail.com'

      authService.googleAuth = jest.fn().mockRejectedValue(new Error('EMAIL_NOT_CONFIRMED'))

      await expect(authService.googleAuth(email)).rejects.toThrow('EMAIL_NOT_CONFIRMED')
    })
  })
})
