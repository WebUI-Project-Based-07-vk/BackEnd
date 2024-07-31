const getCategoriesOptions = (categories) => {
  if (Array.isArray(categories)) {
    return categories.map((item) => (item === 'null' ? null : item))
  } else if (categories) {
    return categories === 'null' ? null : [categories]
  } else {
    return
  }
}
module.exports = getCategoriesOptions
