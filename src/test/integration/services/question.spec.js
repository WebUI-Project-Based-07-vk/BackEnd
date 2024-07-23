const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const questionService = require('~/services/question')
const userSchema = require('~/models/user')
const resourcesCategorySchema = require('~/models/resourcesCategory')
const { enums } = require('~/consts/validation.js')
const ObjectId = require('mongoose').Types.ObjectId
const { createForbiddenError } = require('~/utils/errorsHelper')
const Question = require('~/models/question')

describe('Question service', () => {
  let mongodb
  let user
  let category
  let question
  let questionMatchObject

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create()
    const uri = mongodb.getUri()
    await mongoose.connect(uri)

    user = new userSchema({
      role: enums.ROLE_ENUM[0],
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@test.test',
      password: 'test12345678',
      appLanguage: enums.APP_LANG_ENUM[0]
    })
    await user.save()

    category = new resourcesCategorySchema({
      name: 'test',
      author: user['_id'].toString()
    })
    await category.save()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongodb.stop()
  })

  it('Should create question and return value', async () => {
    const mockData = {
      author: user['_id'].toString(),
      data: {
        title: 'test',
        text: 'test',
        answers: [
          {
            text: 'test',
            isCorrect: true
          }
        ],
        type: enums.QUESTION_TYPE_ENUM[0],
        category: category['_id'].toString()
      }
    }

    const response = await questionService.createQuestion(mockData.author, mockData.data)

    expect(response).toMatchObject({
      title: mockData.data.title,
      text: mockData.data.text,
      answers: mockData.data.answers,
      type: mockData.data.type,
      category: {
        _id: new ObjectId(mockData.data.category)
      },
      author: new ObjectId(mockData.author)
    })

    expect(response._id).toBeInstanceOf(ObjectId)
    expect(response.createdAt).toBeInstanceOf(Date)
    expect(response.updatedAt).toBeInstanceOf(Date)

    question = response
    questionMatchObject = {
      title: question.title,
      text: question.text,
      answers: [{ text: question.answers[0].text, isCorrect: question.answers[0].isCorrect }],
      type: question.type,
      category: question.category._id,
      author: question.author,
      resourceType: question.resourceType,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    }
  })

  it('Should find question by Id', async () => {
    const response = await questionService.getQuestionById(question._id)
    expect(response).toMatchObject(questionMatchObject)
  })

  it('Should find question by author', async () => {
    const matchOption = {
      author: question.author.toString()
    }
    const sortOption = {
      updatedAt: 'asc'
    }

    const response = await questionService.getQuestions(matchOption, sortOption)
    expect(response.count).toEqual(1)
    expect(response.items[0]).toMatchObject(questionMatchObject)
  })

  it('Should find question by title', async () => {
    const matchOption = {
      title: 'test'
    }
    const sortOption = {
      updatedAt: 'asc'
    }

    const response = await questionService.getQuestions(matchOption, sortOption)
    expect(response.count).toEqual(1)
    expect(response.items[0]).toMatchObject(questionMatchObject)
  })

  it('Should find question by category', async () => {
    const matchOption = {
      category: category._id
    }
    const sortOption = {
      updatedAt: 'asc'
    }

    const response = await questionService.getQuestions(matchOption, sortOption)
    expect(response.count).toEqual(1)
    expect(response.items[0]).toMatchObject(questionMatchObject)
  })

  it('Should sort desc by updateData', async () => {
    const mockData = {
      author: user['_id'].toString(),
      data: {
        title: 'test2',
        text: 'test',
        answers: [
          {
            text: 'test',
            isCorrect: true
          }
        ],
        type: enums.QUESTION_TYPE_ENUM[0],
        category: category['_id'].toString()
      }
    }
    await questionService.createQuestion(mockData.author, mockData.data)

    const matchOption = {
      category: category._id
    }
    const sortOption = {
      updatedAt: 'desc'
    }

    const response = await questionService.getQuestions(matchOption, sortOption)
    expect(response.items[1]).toMatchObject(questionMatchObject)
  })

  it("Should not update question when currentUser doesn't match author", async () => {
    const mockData = {
      id: question._id.toString(),
      toUpdate: {
        title: 'updateTest'
      },
      userId: '12345678'
    }

    const questionMock = {
      _id: question._id,
      author: 'different-user-id',
      save: jest.fn(),
      populate: jest.fn().mockResolvedValue({})
    }

    jest.spyOn(Question, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValue(questionMock)
    })

    expect(
      async () => await questionService.updateQuestion(mockData.id, mockData.userId, mockData.toUpdate)
    ).rejects.toThrow(createForbiddenError())

    expect(questionMock.save).not.toHaveBeenCalled()
  })

  it('Should update question', async () => {
    const mockData = {
      id: question._id.toString(),
      toUpdate: {
        title: 'updateTest'
      },
      userId: question.author.toString()
    }

    const questionMock = {
      _id: question._id,
      author: 'different-user-id',
      save: jest.fn(),
      populate: jest.fn().mockResolvedValue({})
    }

    jest.spyOn(Question, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValue(questionMock)
    })

    const response = await questionService.updateQuestion(mockData.id, mockData.userId, mockData.toUpdate)

    const matchObject = {
      ...questionMatchObject
    }

    matchObject.title = 'updateTest'
    matchObject.category = matchObject.category._id

    delete matchObject.updatedAt

    expect(response).toMatchObject(matchObject)
    expect(response.updatedAt).not.toEqual(question.updatedAt)
    expect(questionMock.save).toHaveBeenCalled()
  })

  it("Should not delete question when currentUser doesn't match author", async () => {
    const mockData = {
      id: question._id.toString(),
      userId: '12345678'
    }

    const spy = jest.spyOn(Question, 'findByIdAndRemove')

    expect(async () => await questionService.deleteQuestion(mockData.id, mockData.userId)).rejects.toThrow(
      createForbiddenError()
    )

    expect(spy).not.toHaveBeenCalled()
  })

  it('Should delete question', async () => {
    const mockData = {
      id: question._id.toString(),
      userId: question.author.toString()
    }

    await questionService.deleteQuestion(mockData.id, mockData.userId)

    const matchOption = {
      category: category._id
    }
    const sortOption = {
      updatedAt: 'asc'
    }

    const response = await questionService.getQuestions(matchOption, sortOption)
    expect(response.count).toEqual(1)
    expect(response.items[0]._id.toString()).not.toEqual(question._id.toString())
  })
})
