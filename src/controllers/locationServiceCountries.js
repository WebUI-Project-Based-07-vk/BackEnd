require('dotenv').config({ path: '~/../.env.local' })
const locationServiceCountries = require('~/services/locationServiceCountries')

const getCountryList = async (req, res) => {
  const country_list = await locationServiceCountries.getCountries(process.env.COUNTRYSTATECITY_API_KEY)
  res.status(200).json(country_list)
}

module.exports = {
  getCountryList
}
