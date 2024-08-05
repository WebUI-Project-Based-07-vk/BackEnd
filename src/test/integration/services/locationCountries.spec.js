const locationServiceCountries = require('~/services/locationServiceCountries')
const { COUNTRYSTATECITY_API_ISSUE } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

global.fetch = jest.fn()

describe('locationServiceCountries.getCountries', () => {
  const api_key = 'test-api-key'

  beforeEach(() => {
    fetch.mockClear()
  })

  it('should return countries data when fetch is successful', async () => {
    const mockResponse = [
      {
        id: 1,
        name: 'Afghanistan',
        iso2: 'AF',
        iso3: 'AFG',
        phonecode: '93',
        capital: 'Kabul',
        currency: 'AFN',
        native: 'افغانستان',
        emoji: '🇦🇫'
      }
    ]
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse)
    })

    const result = await locationServiceCountries.getCountries(api_key)
    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith('https://api.countrystatecity.in/v1/countries', {
      method: 'GET',
      headers: expect.any(Headers),
      redirect: 'follow'
    })
    expect(result[0].id).toEqual(1)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('iso2')
    expect(result[0]).toHaveProperty('iso3')
    expect(result[0]).toHaveProperty('phonecode')
    expect(result[0]).toHaveProperty('capital')
    expect(result[0]).toHaveProperty('currency')
    expect(result[0]).toHaveProperty('native')
    expect(result[0]).toHaveProperty('emoji')
  })
  it('should throw an error when fetch fails', async () => {
    fetch.mockRejectedValue(new Error('API error'))
    await expect(locationServiceCountries.getCountries(api_key)).rejects.toHaveProperty('status', 401)
    await expect(locationServiceCountries.getCountries(api_key)).rejects.toHaveProperty(
      'message',
      COUNTRYSTATECITY_API_ISSUE.message
    )
    await expect(locationServiceCountries.getCountries(api_key)).rejects.toThrowError(
      createError(401, COUNTRYSTATECITY_API_ISSUE)
    )
  })
})
