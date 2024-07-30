const { getDownloadLink } = require('~/services/fireBaseMediaStorage')

async function photoMiddleware(req, res, next) {
  const originalSend = res.send

  res.send = async function (body) {
    body = JSON.parse(body)
    const replaceAvatar = async (data) => {
      if (data.photo && typeof data.photo === 'string') {
        data.photo = await getDownloadLink(data.photo)
      }
      return data
    }
    if (typeof body === 'object' && body !== null) {
      if ('items' in body) {
        body = await Promise.all(body.items.map((item) => replaceAvatar(item)))
      } else {
        body = await replaceAvatar(body)
      }
    }

    originalSend.call(this, JSON.stringify(body))
  }

  next()
}

module.exports = photoMiddleware
