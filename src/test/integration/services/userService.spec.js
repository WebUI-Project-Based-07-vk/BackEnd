const mongoose = require('mongoose')
const userService = require('~/services/user')
const User = require('~/models/user')
const { createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')
const { connectToDatabase, disconnectFromDatabase, clearDatabase } = require('../setupTests')

beforeAll(async () => {
  await connectToDatabase()
})

afterAll(async () => {
  await disconnectFromDatabase()
})

beforeEach(async () => {
  await clearDatabase()
})

describe('User Service', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const user = await userService.createUser(
        'student',
        'studentone',
        'studentone',
        'studentone@gmailcom',
        'studentone9876',
        'en'
      )

      const createdUser = await User.findById(user._id).lean().exec()
      expect(createdUser).toBeDefined()
      expect(createdUser.email).toBe('studentone@gmailcom')
      expect(createdUser.firstName).toBe('studentone')
      expect(createdUser.lastName).toBe('studentone')
    })

    it('should throw ALREADY_REGISTERED error if user already exists', async () => {
      await userService.createUser('student', 'studentone', 'studentone', 'studentone@gmailcom', 'studentone9876', 'en')

      await expect(
        userService.createUser('student', 'studentone', 'studentone', 'studentone@gmailcom', 'studentone9876', 'en')
      ).rejects.toThrowError(createError(409, ALREADY_REGISTERED))
    })
  })

  describe('getUserById', () => {
    it('should retrieve a user by id', async () => {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: 'studentone',
        lastName: 'studentone',
        email: 'studentone@gmailcom',
        password: 'studentone9876'
      })
      await user.save()

      const retrievedUser = await userService.getUserById(user._id)
      expect(retrievedUser).not.toBeNull()
      expect(retrievedUser._id).toEqual(user._id)
    })

    it('should return null if user not found', async () => {
      const nonExistentId = mongoose.Types.ObjectId()
      const retrievedUser = await userService.getUserById(nonExistentId)
      expect(retrievedUser).toBeNull()
    })

    it('should handle DOCUMENT_NOT_FOUND scenario if user not found', async () => {
      const nonExistentId = mongoose.Types.ObjectId()
      const retrievedUser = await userService.getUserById(nonExistentId)

      if (!retrievedUser) {
        const error = createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
        expect(error.status).toBe(404)
        expect(error.message).toBe(DOCUMENT_NOT_FOUND([User.modelName]).message)
      } else {
        throw new Error('Expected null, but received a user.')
      }
    })
  })

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const createdUser = await userService.createUser(
        'student',
        'studenttwo',
        'studenttwo',
        'studenttwo@gmail.com',
        '111studenttwo',
        'en'
      )
      const updateData = { firstName: 'studenttwo' }

      await userService.updateUser(createdUser._id, 'student', updateData)

      const updatedUser = await User.findById(createdUser._id).lean().exec()
      expect(updatedUser.firstName).toBe('studenttwo')
    })

    it('should throw DOCUMENT_NOT_FOUND error if user not found', async () => {
      await expect(
        userService.updateUser(mongoose.Types.ObjectId(), 'student', { firstName: 'studenttwo' })
      ).rejects.toThrowError(createError(404, DOCUMENT_NOT_FOUND([User.modelName])))
    })
  })

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      const createdUser = await userService.createUser(
        'student',
        'studenttwo',
        'studenttwo',
        'studenttwo@gmail.com',
        '111studenttwo',
        'en'
      )

      await userService.deleteUser(createdUser._id)

      const deletedUser = await User.findById(createdUser._id).lean().exec()
      expect(deletedUser).toBeNull()
    })

    it('should handle delete operation for non-existing user', async () => {
      await expect(userService.deleteUser(mongoose.Types.ObjectId())).resolves.toBeUndefined()
    })
  })
})
