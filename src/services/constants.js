const {
  enums: { SPOKEN_LANG_ENUM }
} = require('~/consts/validation')

const constService = {
  getSpokenLangs: () => {
    return SPOKEN_LANG_ENUM
  }
}

module.exports = constService
