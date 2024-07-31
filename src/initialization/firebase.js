const { fireBaseConfig } = require('~/configs/config')
const firebase = require('firebase/app')

function initFireBase() {
  firebase.initializeApp(fireBaseConfig)
}

module.exports = { initFireBase }
