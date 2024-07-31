const {
  countrystatecityCredentials: { API_KEY }
} = require('~/configs/config')
const locationServiceCountries = require('~/services/locationServiceCountries')

const getCountryList = async (req, res) => {
  const country_list = await locationServiceCountries.getCountries(API_KEY)
  res.status(200).json(country_list)
}

module.exports = {
  getCountryList
}
