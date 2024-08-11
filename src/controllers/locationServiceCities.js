const locationServiceCities = require('~/services/locationServiceCities')

const getCityList = async (req, res) => {
  try {
    const { id: iso2_code } = req.params
    const countryName = req.query.countryName
    if (!iso2_code) {
      return res.status(400).json({ error: 'Country code is required' })
    }
    const city_list = await locationServiceCities.getCities(iso2_code, countryName)
    res.status(200).json(city_list)
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch cities' })
  }
}

module.exports = {
  getCityList
}
