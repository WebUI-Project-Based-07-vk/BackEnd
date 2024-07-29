const expectError = (statusCode, error, response) => {
  expect(response.body).toEqual({
    ...error,
    status: statusCode
  })
}

const expectStatusCode = (statusCode, response) => {
  expect(response.status).toEqual(statusCode)
}

const expectTokensCookies = (tokens, response) => {
  let accessToken = ''
  let refreshToken = ''

  if (tokens) {
    ;({ accessToken, refreshToken } = tokens)
  }

  expect(response.headers['set-cookie']).toEqual(
    expect.arrayContaining([
      expect.stringContaining(`accessToken=${accessToken}`),
      expect.stringContaining(`refreshToken=${refreshToken}`)
    ])
  )
}

module.exports = { expectError, expectStatusCode, expectTokensCookies }
