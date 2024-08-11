const { createError } = require('~/utils/errorsHelper')
const { COUNTRYSTATECITY_API_ISSUE } = require('~/consts/errors')

const createRequestOptions = () => {
  const headers = new Headers()
  headers.append('X-CSCAPI-KEY', process.env.COUNTRYSTATECITY_API_KEY)

  return {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  }
}

const formatCountriesResponse = (countriesData) => {
  return countriesData.map((country) => ({
    label: country.name,
    iso2: country.iso2,
    id: country.iso2,
    cities: []
  }))
}

const locationServiceCountries = {
  countriesCache: [],

  getCountries: async function () {
    if (this.countriesCache.length > 0) {
      return this.countriesCache
    }

    const requestOptions = createRequestOptions()

    try {
      const response = await fetch('https://api.countrystatecity.in/v1/countries', requestOptions)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const formattedCountriesData = formatCountriesResponse(result)
      this.countriesCache = formattedCountriesData

      return formattedCountriesData
    } catch (error) {
      throw createError(500, COUNTRYSTATECITY_API_ISSUE)
    }
  },

  clearCache: function () {
    this.countriesCache = []
  }
}

module.exports = locationServiceCountries
