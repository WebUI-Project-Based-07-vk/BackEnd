const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')
const errors = require('~/consts/errors')
const tokenService = require('~/services/token')
const Token = require('~/models/token')
const { expectError, expectStatusCode, expectTokensCookies } = require('~/test/helpers')
const authService = require('~/services/auth')

/*
  For these tests it is a must to have .env.test.local
  There you should use different SERVER_PORT and different database:
    MONGODB_URL=connection-string-to-our-own-db
    SERVER_PORT=8081
 */

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
  const mockTokens = {
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken'
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

    it('should send response with userData and status 201', async () => {
      const expectedBody = {
        userId: 'id',
        userEmail: user.email
      }
      authService.signup = jest.fn().mockResolvedValue(expectedBody)

      const response = await app.post('/auth/signup').send(user)

      expect(response.body).toEqual(expectedBody)
      expectStatusCode(201, response)
    })
  })

  describe('Login endpoint', () => {
    it('should set tokens cookies and send response with accessToken', async () => {
      authService.login = jest.fn().mockResolvedValue(mockTokens)

      const response = await app.post('/auth/login').send({
        email: user.email,
        password: user.password,
      })

      expect(authService.login).toHaveBeenCalledWith(user.email, user.password)
      expect(response.body).toEqual({ accessToken: mockTokens.accessToken })
      expectTokensCookies(mockTokens, response)
      expectStatusCode(200, response)
    })
  })

  describe('Logout endpoint', () => {
    it('should send response with status 204 and clear access and refresh tokens cookies', async () => {
      authService.logout = jest.fn()

      const response = await app.post('/auth/logout').set('Cookie', `refreshToken=${mockTokens.refreshToken}`)

      expect(authService.logout).toHaveBeenCalledWith(mockTokens.refreshToken)
      expectTokensCookies(null, response)
      expectStatusCode(204, response)
    })
  })

  describe('refreshAccessToken endpoint', () => {
    beforeEach(() => {
      authService.refreshAccessToken = jest.fn().mockResolvedValue(mockTokens)
    })
    afterEach(() => jest.resetAllMocks())

    it('should throw REFRESH_TOKEN_NOT_RETRIEVED error', async () => {
      const response = await app.get('/auth/refresh')

      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('accessToken='),
        ])
      )
      expectError(401, errors.REFRESH_TOKEN_NOT_RETRIEVED, response)
    })

    it('should set tokens cookies and send response with accessToken', async () => {
      const response = await app.get('/auth/refresh').set('Cookie', `refreshToken=${mockTokens.refreshToken}`)

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(mockTokens.refreshToken)
      expect(response.body).toEqual({ accessToken: mockTokens.accessToken })
      expectTokensCookies(mockTokens, response)
      expectStatusCode(200, response)
    })
  })

  describe('SendResetPasswordEmail endpoint', () => {
    it('should throw USER_NOT_FOUND error', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'invalid@gmail.com' })

      expectError(404, errors.USER_NOT_FOUND, response)
    })

    it('should send response with status 204', async () => {
      authService.sendResetPasswordEmail = jest.fn()
      const response = await app.post('/auth/forgot-password').send({ email: user.email })

      expectStatusCode(204, response)
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

    it('should send response with status 204', async () => {
      authService.updatePassword = jest.fn()
      const response = await app.patch('/auth/reset-password/token').send({ password: user.password })

      expectStatusCode(204, response)
    })
  })

  describe('googleLogin endpoint', () => {
    beforeEach(() => {
      authService.getGoogleClientTicket = jest.fn().mockResolvedValue({ email: user.email })
      authService.login = jest.fn().mockResolvedValue(mockTokens)
    })
    afterEach(() => jest.resetAllMocks())

    it('should throw ID_TOKEN_NOT_RETRIEVED error if idToken was not provided', async () => {
      const response = await app.post('/auth/google-auth').send({ token: { credential: null } })

      expectError(401, errors.ID_TOKEN_NOT_RETRIEVED, response)
    })

    it('should set tokens cookies and send response with accessToken', async () => {
      const response = await app.post('/auth/google-auth').send({ token: { credential: 'mockIdToken' } })

      expect(authService.login).toHaveBeenCalledWith(user.email, null, true)
      expect(response.body).toEqual({ accessToken: mockTokens.accessToken })
      expectTokensCookies(mockTokens, response)
      expectStatusCode(200, response)
    })
  })
})
