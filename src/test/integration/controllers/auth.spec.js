const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')
const errors = require('~/consts/errors')
const tokenService = require('~/services/token')
const Token = require('~/models/token')
const { expectError } = require('~/test/helpers')
const authService = require('~/services/auth')

describe('Auth controller', () => {
  let app, server, signupResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    signupResponse = await app.post('/auth/signup').send(user)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  const user = {
    role: 'student',
    firstName: 'test',
    lastName: 'test',
    email: 'test@gmail.com',
    password: 'testpass_135'
  }

  describe('Signup endpoint', () => {
    it('should throw validation errors for the firstName field', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, firstName: '12345' })
      const responseForNull = await app.post('/auth/signup').send({ ...user, firstName: null })

      const formatError = errors.NAME_FIELD_IS_NOT_OF_PROPER_FORMAT('firstName')
      const nullError = errors.FIELD_IS_NOT_DEFINED('firstName')
      expectError(422, formatError, responseForFormat)
      expectError(422, nullError, responseForNull)
    })

    it('should throw validation errors for the email format', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, email: 'test' })
      const responseForType = await app.post('/auth/signup').send({ ...user, email: 312938 })

      const formatError = errors.FIELD_IS_NOT_OF_PROPER_FORMAT('email')
      const typeError = errors.FIELD_IS_NOT_OF_PROPER_TYPE('email', 'string')
      expectError(422, formatError, responseForFormat)
      expectError(422, typeError, responseForType)
    })

    it('should throw validation error for the role value', async () => {
      const signupResponse = await app.post('/auth/signup').send({ ...user, role: 'test' })

      const error = errors.FIELD_IS_NOT_OF_PROPER_ENUM_VALUE('role', ROLE_ENUM)
      expectError(422, error, signupResponse)
    })

    it('should throw validation errors for the password`s length', async () => {
      const responseForMax = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MAX_PASSWORD_LENGTH + 1) })

      const responseForMin = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MIN_PASSWORD_LENGTH - 1) })

      const error = errors.FIELD_IS_NOT_OF_PROPER_LENGTH('password', {
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH
      })
      expectError(422, error, responseForMax)
      expectError(422, error, responseForMin)
    })

    it('should throw ALREADY_REGISTERED error', async () => {
      await app.post('/auth/signup').send(user)

      const response = await app.post('/auth/signup').send(user)

      expectError(409, errors.ALREADY_REGISTERED, response)
    })
  })

  describe('SendResetPasswordEmail endpoint', () => {
    it('should throw USER_NOT_FOUND error', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'invalid@gmail.com' })

      expectError(404, errors.USER_NOT_FOUND, response)
    })
  })

  describe('UpdatePassword endpoint', () => {
    let resetToken
    beforeEach(() => {
      const { firstName, email, role } = user

      resetToken = tokenService.generateResetToken({ id: signupResponse.body.userId, firstName, email, role })

      Token.findOne = jest.fn().mockResolvedValue({ save: jest.fn().mockResolvedValue(resetToken) })
    })
    afterEach(() => jest.resetAllMocks())

    it('should throw BAD_RESET_TOKEN error', async () => {
      const response = await app.patch('/auth/reset-password/invalid-token').send({ password: 'valid_pass1' })

      expectError(400, errors.BAD_RESET_TOKEN, response)
    })
  })

  describe('googleLogin endpoint', () => {
    const originalGetGoogleClientTicket = authService.getGoogleClientTicket
    const mockTokens = {
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken'
    }

    beforeEach(() => {
      authService.getGoogleClientTicket = jest.fn().mockResolvedValue({ email: user.email })
    })
    afterEach(() => jest.resetAllMocks())

    it('should throw ID_TOKEN_NOT_RETRIEVED error if idToken was not provided', async () => {
      const response = await app.post('/auth/google-auth').send({ token: { credential: null } })

      expectError(401, errors.ID_TOKEN_NOT_RETRIEVED, response)
    })

    it('should return BAD_ID_TOKEN error', async () => {
      authService.getGoogleClientTicket = originalGetGoogleClientTicket
      const response = await app.post('/auth/google-auth').send({ token: { credential: 'mockIdToken' } })

      expectError(400, errors.BAD_ID_TOKEN, response)
    })

    it('should set tokens cookies and response with accessToken', async () => {
      authService.login = jest.fn().mockResolvedValue(mockTokens)

      const response = await app.post('/auth/google-auth').send({ token: { credential: 'mockIdToken' } })

      expect(authService.login).toHaveBeenCalledWith(user.email, null, true)
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining(`accessToken=${mockTokens.accessToken}`),
          expect.stringContaining(`refreshToken=${mockTokens.refreshToken}`)
        ])
      )
      expect(response.body).toEqual({ accessToken: mockTokens.accessToken })
    })
  })
})
