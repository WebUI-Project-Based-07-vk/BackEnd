const {
  countrystatecityCredentials: { API_KEY }
} = require('~/configs/config')
const locationServiceCities = require('~/services/locationServiceCities')

const getCityList = async (req, res) => {
  const city_list = await locationServiceCities.getCities(API_KEY, req.params.id)
  res.status(200).json(city_list)
}

module.exports = {
  getCityList
}
