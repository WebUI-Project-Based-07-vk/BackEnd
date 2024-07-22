const { config } = require('~/configs/config')
const bcrypt = require('bcrypt')
const { PASSWORD_HASH_ERROR } = require('~/consts/errors')

async function getHash(plainText) {
  console.log(plainText)
  console.log(config)
  try {
    return bcrypt.hash(plainText, config.HASH_SALT_ROUNDS)
  } catch (e) {
    throw PASSWORD_HASH_ERROR
  }
}

async function compareHashes(plainText, hash) {
  return bcrypt.compare(plainText, hash)
}

module.exports = { getHash, compareHashes }
