const fsp = require('fs/promises')
//const path = require('path');
const dotenv = require('dotenv')
const crypto = require('crypto')

const GenerateNewJWTKey = async () => {
  // Generate 32 random bytes and convert to hexadecimal
  return crypto.randomBytes(32).toString('hex')
}

const updateEnvWithNewJWTKeys = async (EnvFilePath) => {
  //update EnvFilePath file with new JWT keys
  try {
    // Load the existing environment variables from the env file
    const envPath = EnvFilePath //path.resolve(__dirname, '.env.local');
    const envContent = await fsp.readFile(envPath, 'utf8')
    const envConfig = dotenv.parse(envContent)

    // Update the configuration with the new keys
    envConfig['JWT_ACCESS_SECRET'] = await GenerateNewJWTKey()
    envConfig['JWT_REFRESH_SECRET'] = await GenerateNewJWTKey()
    envConfig['JWT_RESET_SECRET'] = await GenerateNewJWTKey()
    envConfig['JWT_CONFIRM_SECRET'] = await GenerateNewJWTKey()

    // Convert the envConfig object back to a string format
    const updatedEnvConfig = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Write the updated environment variables back to the .env.local file
    await fsp.writeFile(envPath, updatedEnvConfig)

    console.log('Successfully updated JWT keys in the specified env file.')
  } catch (error) {
    console.log('Error updating JWT keys in the specified env file:', error)
  }
}

//example usage after importing: updateEnvWithNewJWTKeys("./path/to/.env.local");
//or running from console like so: node src/utils/updateEnvWithNewJWTKeys .env.local (the "if" instruction below is for this)
if (process.argv[2].endsWith('.env.local') || process.argv[2].endsWith('.env.test.local')) {
  updateEnvWithNewJWTKeys(process.argv[2])
} else {
  console.log('Should use a path to .env.local or .env.test.local as a 2nd argument')
}

module.exports = updateEnvWithNewJWTKeys
