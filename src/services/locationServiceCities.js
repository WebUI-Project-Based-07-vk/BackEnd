const locationServiceCities = {
  getCities: async (api_key, iso2_code) => {
    var headers = new Headers()
    headers.append('X-CSCAPI-KEY', api_key)

    var requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    }

    try {
      const response = await fetch(`https://api.countrystatecity.in/v1/countries/${iso2_code}/cities`, requestOptions)
      const result = await response.text()
      return JSON.parse(result)
    } catch (error) {
      //
    }
  }
}

module.exports = locationServiceCities
