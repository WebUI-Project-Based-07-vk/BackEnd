const { createError } = require('~/utils/errorsHelper')
const { COUNTRYSTATECITY_API_ISSUE } = require('~/consts/errors')

const locationServiceCountries = {
  getCountries: async (api_key) => {
    const headers = new Headers()
    headers.append('X-CSCAPI-KEY', api_key)

    const requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    }

    try {
      const response = await fetch('https://api.countrystatecity.in/v1/countries', requestOptions)
      const result = await response.json()
      return result
    } catch (error) {
      throw createError(401, COUNTRYSTATECITY_API_ISSUE)
    }
  }
}

module.exports = locationServiceCountries
