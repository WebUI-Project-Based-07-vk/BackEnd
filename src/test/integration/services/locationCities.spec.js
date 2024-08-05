const { COUNTRYSTATECITY_API_ISSUE } = require('~/consts/errors')
const locationServiceCities = require('~/services/locationServiceCities')
const { createError } = require('~/utils/errorsHelper')

global.fetch = jest.fn()

describe('locationServiceCountries.getCountries', () => {
  const api_key = 'test-api-key'
  const ISO2_code_test = 'test_ISO2'

  beforeEach(() => {
    fetch.mockClear()
  })

  it('should return cities data when fetch is successful', async () => {
    const mockResponse = [
      {
        id: 105829,
        name: 'Afanas’yeva'
      }
    ]
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse)
    })
    const result = await locationServiceCities.getCities(api_key, ISO2_code_test)
    expect(result).toEqual(mockResponse)
    expect(result[0].id).toEqual(105829)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
  })
  it('should throw an error when fetch fails', async () => {
    fetch.mockRejectedValue(new Error('API error'))
    await expect(locationServiceCities.getCities(api_key, ISO2_code_test)).rejects.toHaveProperty('status', 401)
    await expect(locationServiceCities.getCities(api_key, ISO2_code_test)).rejects.toHaveProperty(
      'message',
      COUNTRYSTATECITY_API_ISSUE.message
    )
    await expect(locationServiceCities.getCities(api_key, ISO2_code_test)).rejects.toThrowError(
      createError(401, COUNTRYSTATECITY_API_ISSUE)
    )
  })
})
