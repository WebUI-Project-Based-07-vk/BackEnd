const offerService = require('~/services/offer')
const Offer = require('~/models/offer')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedOfferFieldsForUpdate } = require('~/validation/services/offer')

jest.mock('~/models/offer', () => ({
  aggregate: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndRemove: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({})
  })
}))

jest.mock('~/utils/filterAllowedFields', () => jest.fn())

describe('offerService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new offer', async () => {
    const data = {
      author: 'authorId',
      authorRole: 'authorRole',
      price: 100,
      proficiencyLevel: 'beginner',
      title: 'Offer Title',
      description: 'Offer Description',
      languages: ['en'],
      subject: 'subjectId',
      category: 'categoryId',
      status: 'active',
      FAQ: []
    }

    Offer.create.mockResolvedValue(data)

    const result = await offerService.createOffer(data.author, data.authorRole, data)
    expect(Offer.create).toHaveBeenCalledWith(data)
    expect(result).toEqual(data)
  })

  it('should get all offers', async () => {
    const pipeline = []
    const response = [{ offer: 'offerData' }]

    Offer.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([response])
    })
    const result = await offerService.getOffers(pipeline)

    expect(Offer.aggregate).toHaveBeenCalledWith(pipeline)
    expect(result).toEqual(response)
  })

  it('should return empty array if no offers found', async () => {
    Offer.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([[]])
    })

    const result = await offerService.getOffers([])
    expect(result).toEqual([])
  })

  it('should throw error if aggregation fails', async () => {
    const error = new Error('Aggregation error')
    Offer.aggregate.mockReturnValue({
      exec: jest.fn().mockRejectedValue(error)
    })

    await expect(offerService.getOffers([])).rejects.toThrow('Aggregation error')
  })

  it('should get an offer by ID', async () => {
    const offer = {
      _id: 'offerId',
      author: {
        FAQ: { role: 'faq' },
        firstName: 'John',
        lastName: 'Doe',
        totalReviews: 10,
        averageRating: 4.5,
        photo: 'photoUrl',
        professionalSummary: 'summary'
      },
      subject: { name: 'subjectName' },
      category: { appearance: 'categoryAppearance' }
    }

    Offer.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(offer)
        })
      })
    })

    const result = await offerService.getOfferById('offerId')
    expect(Offer.findById).toHaveBeenCalledWith('offerId')
    expect(result).toEqual(offer)
  })

  it('should throw error when document is not found', async () => {
    Offer.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      })
    })

    await expect(offerService.getOfferById('nonExistingId')).rejects.toThrow(TypeError)
  })

  it('should update an offer', async () => {
    const id = 'offerId'
    const currentUserId = 'currentUserId'
    const updateData = { title: 'Updated Title' }
    const filteredUpdateData = { title: 'Updated Title' }

    filterAllowedFields.mockReturnValue(filteredUpdateData)

    const offer = {
      _id: id,
      title: 'Old Title',
      save: jest.fn(),
      validate: jest.fn()
    }

    Offer.findById.mockResolvedValue(offer)

    await offerService.updateOffer(id, currentUserId, updateData)

    expect(filterAllowedFields).toHaveBeenCalledWith(updateData, allowedOfferFieldsForUpdate)
    expect(offer.title).toEqual('Updated Title')
    expect(offer.validate).toHaveBeenCalled()
    expect(offer.save).toHaveBeenCalled()
  })

  it('should delete an offer by ID', async () => {
    Offer.findByIdAndRemove.mockReturnValue({
      exec: jest.fn().mockResolvedValue({})
    })

    await offerService.deleteOffer('offerId')
    expect(Offer.findByIdAndRemove).toHaveBeenCalledWith('offerId')
  })

  it('should set offer.author.FAQ based on authorRole if available', async () => {
    const offer = {
      _id: 'offerId',
      author: {
        FAQ: { role: 'faq', authorRole: 'specificFAQ' },
        firstName: 'John',
        lastName: 'Doe',
        totalReviews: 10,
        averageRating: 4.5,
        photo: 'photoUrl',
        professionalSummary: 'summary'
      },
      authorRole: 'authorRole',
      subject: { name: 'subjectName' },
      category: { appearance: 'categoryAppearance' }
    }

    Offer.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(offer)
        })
      })
    })

    const result = await offerService.getOfferById('offerId')
    expect(result.author.FAQ).toEqual('specificFAQ')
  })

  it('should delete offer.author.FAQ if authorRole is not in author.FAQ', async () => {
    const offer = {
      _id: 'offerId',
      author: {
        FAQ: { role: 'faq' },
        firstName: 'John',
        lastName: 'Doe',
        totalReviews: 10,
        averageRating: 4.5,
        photo: 'photoUrl',
        professionalSummary: 'summary'
      },
      authorRole: 'missingRole',
      subject: { name: 'subjectName' },
      category: { appearance: 'categoryAppearance' }
    }

    Offer.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(offer)
        })
      })
    })

    const result = await offerService.getOfferById('offerId')
    expect(result.author.FAQ).toBeUndefined()
  })
})
