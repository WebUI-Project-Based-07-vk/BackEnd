const authService = require('~/services/auth')
const tokenService = require('~/services/token')
const emailService = require('~/services/email')
const userService = require('~/services/user')
const { EMAIL_NOT_CONFIRMED, USER_NOT_FOUND, INCORRECT_CREDENTIALS, BAD_RESET_TOKEN } = require('~/consts/errors')
const { tokenNames } = require('~/consts/auth')

jest.mock('~/services/token')
jest.mock('~/services/email')
jest.mock('~/services/user')

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should confirm email successfully', async () => {
    const token = 'validToken'
    const userId = 'userId'
    tokenService.validateConfirmToken.mockReturnValue({ id: userId })
    userService.privateUpdateUser.mockResolvedValue()
    tokenService.removeConfirmToken.mockResolvedValue()

    await authService.confirmEmail(token)

    expect(tokenService.validateConfirmToken).toHaveBeenCalledWith(token)
    expect(userService.privateUpdateUser).toHaveBeenCalledWith(userId, { isEmailConfirmed: true })
    expect(tokenService.removeConfirmToken).toHaveBeenCalledWith(userId)
  })

  it('should throw an error if the token is invalid', async () => {
    const invalidToken = 'invalidtoken'
    tokenService.validateConfirmToken.mockReturnValue(null)

    await expect(authService.confirmEmail(invalidToken)).rejects.toThrow(EMAIL_NOT_CONFIRMED.message)
  })

  it('should login user successfully', async () => {
    const email = 'test@gmail.com'
    const password = 'correctPassword'
    const user = {
      _id: 'userId',
      email: email,
      password: password,
      lastLoginAs: 'user',
      isFirstLogin: true,
      isEmailConfirmed: true
    }
    const tokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    }

    userService.getUserByEmail.mockResolvedValue(user)
    tokenService.generateTokens.mockReturnValue(tokens)
    tokenService.saveToken.mockResolvedValue()
    userService.privateUpdateUser.mockResolvedValue()

    const result = await authService.login(email, password, false)

    expect(result).toEqual(tokens)
    expect(userService.getUserByEmail).toHaveBeenCalledWith(email)
    expect(tokenService.generateTokens).toHaveBeenCalledWith({
      id: user._id,
      role: user.lastLoginAs,
      isFirstLogin: user.isFirstLogin
    })
    expect(tokenService.saveToken).toHaveBeenCalledWith(user._id, tokens.refreshToken, tokenNames.REFRESH_TOKEN)
    expect(userService.privateUpdateUser).toHaveBeenCalledWith(user._id, { lastLogin: expect.any(Date) })
  })

  it('should throw an error if the user is not found', async () => {
    userService.getUserByEmail.mockResolvedValue(null)

    await expect(authService.login('notfound@gmail.com', 'password', false)).rejects.toThrow(USER_NOT_FOUND.message)
  })

  it('should throw an error if the password is incorrect', async () => {
    const user = {
      email: 'test@gmail.com',
      password: 'correctPassword',
      isEmailConfirmed: true
    }

    userService.getUserByEmail.mockResolvedValue(user)

    await expect(authService.login('test@gmail.com', 'wrongPassword', false)).rejects.toThrow(
      INCORRECT_CREDENTIALS.message
    )
  })

  it('should send reset password email successfully', async () => {
    const email = 'test@gmail.com'
    const language = 'en'
    const user = {
      _id: 'userId',
      firstName: 'Test',
      email: email
    }
    const resetToken = 'resetToken'

    userService.getUserByEmail.mockResolvedValue(user)
    tokenService.generateResetToken.mockReturnValue(resetToken)
    tokenService.saveToken.mockResolvedValue()
    emailService.sendEmail.mockResolvedValue()

    await authService.sendResetPasswordEmail(email, language)

    expect(userService.getUserByEmail).toHaveBeenCalledWith(email)
    expect(tokenService.generateResetToken).toHaveBeenCalledWith({
      id: user._id,
      firstName: user.firstName,
      email: email
    })
    expect(tokenService.saveToken).toHaveBeenCalledWith(user._id, resetToken, tokenNames.RESET_TOKEN)
    expect(emailService.sendEmail).toHaveBeenCalledWith(email, 'RESET_PASSWORD', language, {
      resetToken,
      email,
      firstName: user.firstName
    })
  })

  it('should throw an error if the reset token is invalid', async () => {
    tokenService.validateResetToken.mockReturnValue(null)
    tokenService.findToken.mockResolvedValue(null)

    await expect(authService.updatePassword('invalidToken', 'newPassword', 'en')).rejects.toThrow(
      BAD_RESET_TOKEN.message
    )
  })

  it('should update password successfully', async () => {
    const resetToken = 'resetToken'
    const newPassword = 'newPassword'
    const language = 'en'
    const userId = 'userId'
    const user = {
      id: userId,
      firstName: 'Test',
      email: 'test@gmail.com'
    }

    tokenService.validateResetToken.mockReturnValue(user)
    tokenService.findToken.mockResolvedValue(resetToken)
    userService.privateUpdateUser.mockResolvedValue()
    tokenService.removeResetToken.mockResolvedValue()
    emailService.sendEmail.mockResolvedValue()

    await authService.updatePassword(resetToken, newPassword, language)

    expect(tokenService.validateResetToken).toHaveBeenCalledWith(resetToken)
    expect(tokenService.findToken).toHaveBeenCalledWith(resetToken, tokenNames.RESET_TOKEN)
    expect(userService.privateUpdateUser).toHaveBeenCalledWith(userId, { password: newPassword })
    expect(tokenService.removeResetToken).toHaveBeenCalledWith(userId)
    expect(emailService.sendEmail).toHaveBeenCalledWith(user.email, 'SUCCESSFUL_PASSWORD_RESET', language, {
      firstName: user.firstName
    })
  })
})
