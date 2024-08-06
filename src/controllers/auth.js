const authService = require('~/services/auth')
const { oneDayInMs } = require('~/consts/auth')
const {
  config: { COOKIE_DOMAIN }
} = require('~/configs/config')
const {
  tokenNames: { REFRESH_TOKEN, ACCESS_TOKEN }
} = require('~/consts/auth')
const { ID_TOKEN_NOT_RETRIEVED, REFRESH_TOKEN_NOT_RETRIEVED } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const COOKIE_OPTIONS = {
  maxAge: oneDayInMs,
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: COOKIE_DOMAIN
}

const signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body
  const lang = req.lang

  const userData = await authService.signup(role, firstName, lastName, email, password, lang)

  res.status(201).json(userData)
}

const login = async (req, res) => {
  const { email, password } = req.body

  const tokens = await authService.login(email, password)

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  res.status(200).json({ accessToken: tokens.accessToken })
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies

  await authService.logout(refreshToken)

  res.clearCookie(REFRESH_TOKEN)
  res.clearCookie(ACCESS_TOKEN)

  res.status(204).end()
}

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    res.clearCookie(ACCESS_TOKEN)
    throw createError(401, REFRESH_TOKEN_NOT_RETRIEVED)
  }

  const tokens = await authService.refreshAccessToken(refreshToken)

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  res.status(200).json({ accessToken: tokens.accessToken })
}

const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body
  const lang = req.lang

  await authService.sendResetPasswordEmail(email, lang)

  res.status(204).end()
}

const updatePassword = async (req, res) => {
  const { password } = req.body
  const resetToken = req.params.token
  const lang = req.lang

  await authService.updatePassword(resetToken, password, lang)

  res.status(204).end()
}

const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params
    await authService.confirmEmail(token)
    console.log('Email confirmed successfully')
    res.status(200).redirect(`${process.env.CLIENT_URL}/success`)
    // res.status(200).redirect(`${process.env.CLIENT_URL}`)
  } catch (error) {
    console.error('Error confirming email:', error)
    res.status(400).redirect(`${process.env.CLIENT_URL}/error?status=${encodeURIComponent(error.message)}`)
  }
}
const googleLogin = async (req, res) => {
  const idToken = req.body.token?.credential

  if (!idToken) throw createError(401, ID_TOKEN_NOT_RETRIEVED)

  const ticket = await authService.getGoogleClientTicket(idToken)

  const tokens = await authService.login(ticket.email, null, true)

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  res.status(200).json({ accessToken: tokens.accessToken })
}
module.exports = {
  signup,
  login,
  logout,
  refreshAccessToken,
  sendResetPasswordEmail,
  updatePassword,
  confirmEmail,
  googleLogin
}
