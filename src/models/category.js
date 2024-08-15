const { Schema, model } = require('mongoose')

const { CATEGORY } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY } = require('~/consts/errors')

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('name')],
      unique: true
    },
    appearance: {
      icon: {
        type: String,
        default: 'mocked-path-to-icon',
        required: [true, FIELD_CANNOT_BE_EMPTY('icon')]
      },
      color: {
        type: String,
        default: '#66C42C',
        required: [true, FIELD_CANNOT_BE_EMPTY('color')]
      }
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(CATEGORY, categorySchema)
