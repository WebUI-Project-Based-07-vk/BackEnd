const qs = require('qs')

const getSortOptions = (sort) => {
  try {
    let decodedSort = sort
    if (typeof sort === 'string') decodedSort = qs.parse(sort)

    const { order, orderBy } = JSON.parse(decodedSort)
    return { [orderBy || 'updatedAt']: order || 'asc' }
  } catch (error) {
    return { updatedAt: 'asc' }
  }
}

module.exports = getSortOptions
