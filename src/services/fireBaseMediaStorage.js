const { getStorage, ref, uploadString, getDownloadURL, deleteObject } = require('firebase/storage')
const { FIREBASE_UPLOAD_ERROR, FIREBASE_GET_LINK_ERROR, FIREBASE_DELETE_ERROR } = require('~/consts/errors')

async function uploadFile(dataUrl, userId) {
  const storage = getStorage()
  const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'))

  const imageRef = ref(storage, `photos/${userId}`)
  const metaData = {
    contentType: mimeType
  }

  try {
    const response = await uploadString(imageRef, dataUrl, 'data_url', metaData)
    return response.ref.fullPath
  } catch (e) {
    throw FIREBASE_UPLOAD_ERROR(e.message)
  }
}

async function getDownloadLink(path) {
  const storage = getStorage()
  try {
    const imageRef = ref(storage, path)
    return await getDownloadURL(imageRef)
  } catch (e) {
    throw FIREBASE_GET_LINK_ERROR(e.message)
  }
}

async function deleteFile(userId) {
  const storage = getStorage()
  const imageRef = ref(storage, `photos/${userId}`)

  try {
    await deleteObject(imageRef)
  } catch (e) {
    throw FIREBASE_DELETE_ERROR(e.message)
  }
}

module.exports = { uploadFile, getDownloadLink, deleteFile }
