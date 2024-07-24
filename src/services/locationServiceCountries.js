const locationServiceCountries = {
  getCountries: async (api_key) => {
    //console.log(api_key);
    var headers = new Headers()
    headers.append('X-CSCAPI-KEY', api_key)

    var requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    }

    try {
      const response = await fetch('https://api.countrystatecity.in/v1/countries', requestOptions)
      const result = await response.text()
      return JSON.parse(result)
    } catch (error) {
      //console.log('error', error);
      //throw error;
    }
  }
}

module.exports = locationServiceCountries
