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

const formatCitiesResponse = (citiesData, countryName) => {
  return {
    label: countryName,
    cities: citiesData.map((city) => ({ label: city.name }))
  }
}

const locationServiceCities = {
  citiesCache: [],

  getCities: async (iso2_code, countryName) => {
    const cachedData = locationServiceCities.citiesCache.find((item) => item.iso2 === iso2_code)
    if (cachedData) {
      return cachedData.cities
    }

    const requestOptions = createRequestOptions()

    try {
      const response = await fetch(`https://api.countrystatecity.in/v1/countries/${iso2_code}/cities`, requestOptions)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()

      const formattedCitiesData = formatCitiesResponse(result, countryName)
      locationServiceCities.citiesCache.push({ iso2: iso2_code, cities: formattedCitiesData })

      return formattedCitiesData
    } catch (error) {
      throw createError(500, COUNTRYSTATECITY_API_ISSUE)
    }
  },

  clearCache: () => {
    locationServiceCities.citiesCache = []
  }
}

module.exports = locationServiceCities
