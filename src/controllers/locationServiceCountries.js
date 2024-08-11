const {
  countrystatecityCredentials: { API_KEY }
} = require('~/configs/config')
const locationServiceCountries = require('~/services/locationServiceCountries')

const getCountryList = async (req, res) => {
  try {
    const country_list = await locationServiceCountries.getCountries(API_KEY)
    res.status(200).json(country_list)
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch countries' })
  }
}

module.exports = {
  getCountryList
}
