const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

const connectToDatabase = async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
}

const disconnectFromDatabase = async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
}

const clearDatabase = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  clearDatabase
}
