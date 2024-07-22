const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const userService = require('~/services/user')
const User = require('~/models/user')
const { createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await User.deleteMany({})
})

describe('User Service', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const user = await userService.createUser('student', 'Eva', 'Mendez', 'em@gmailcom', 'qwerty9876', 'en')

      const createdUser = await User.findById(user._id).lean().exec()
      expect(createdUser).toBeDefined()
      expect(createdUser.email).toBe('em@gmailcom')
      expect(createdUser.firstName).toBe('Eva')
      expect(createdUser.lastName).toBe('Mendez')
    })

    it('should throw ALREADY_REGISTERED error if user already exists', async () => {
      await userService.createUser('student', 'Eva', 'Mendez', 'em@gmailcom', 'qwerty9876', 'en')

      await expect(
        userService.createUser('student', 'Eva', 'Mendez', 'em@gmailcom', 'qwerty9876', 'en')
      ).rejects.toThrowError(createError(409, ALREADY_REGISTERED))
    })
  })

  describe('getUserById', () => {
    it('should retrieve a user by id', async () => {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: 'Eva',
        lastName: 'Mendez',
        email: 'em@gmailcom',
        password: 'qwerty9876'
      })
      await user.save()

      const retrievedUser = await userService.getUserById(user._id)
      expect(retrievedUser).not.toBeNull()
      expect(retrievedUser._id.toString()).toEqual(user._id.toString())
    })

    it('should return null if user not found', async () => {
      const nonExistentId = mongoose.Types.ObjectId()
      const retrievedUser = await userService.getUserById(nonExistentId)
      expect(retrievedUser).toBeNull()
    })

    it('should throw DOCUMENT_NOT_FOUND error if user not found', async () => {
      const nonExistentId = mongoose.Types.ObjectId()
      try {
        await userService.getUserById(nonExistentId)
      } catch (error) {
        expect(error).toEqual(createError(404, DOCUMENT_NOT_FOUND([User.modelName])))
      }
    })
  })

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const createdUser = await userService.createUser('student', 'Jason', 'Statham', 'js@gmail.com', '111qwerty', 'en')
      const updateData = { firstName: 'Jason' }

      await userService.updateUser(createdUser._id, 'student', updateData)

      const updatedUser = await User.findById(createdUser._id).lean().exec()
      expect(updatedUser.firstName).toBe('Jason')
    })

    it('should throw DOCUMENT_NOT_FOUND error if user not found', async () => {
      await expect(
        userService.updateUser(mongoose.Types.ObjectId(), 'student', { firstName: 'Jason' })
      ).rejects.toThrowError(createError(404, DOCUMENT_NOT_FOUND([User.modelName])))
    })
  })

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      const createdUser = await userService.createUser('student', 'Jason', 'Statham', 'js@gmail.com', '111qwerty', 'en')

      await userService.deleteUser(createdUser._id)

      const deletedUser = await User.findById(createdUser._id).lean().exec()
      expect(deletedUser).toBeNull()
    })

    it('should handle delete operation for non-existing user', async () => {
      await expect(userService.deleteUser(mongoose.Types.ObjectId())).resolves.toBeUndefined()
    })
  })
})
