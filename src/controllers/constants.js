const { getSpokenLangs } = require('~/services/constants')

const sendSpokenLangs = (_req, res) => {
  res.status(200).json(getSpokenLangs())
}

module.exports = {
  sendSpokenLangs
}
