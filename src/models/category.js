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
        default: 'LanguageIcon',
        required: [true, FIELD_CANNOT_BE_EMPTY('icon')]
      },
      backgroundColor: {
        type: String,
        default: '#79B26033',
        required: [true, FIELD_CANNOT_BE_EMPTY('backgroundColor')]
      },
      iconColor: {
        type: String,
        default: '#79B260',
        required: [true, FIELD_CANNOT_BE_EMPTY('iconColor')]
      }
    }
  },
  { timestamps: true, versionKey: false }
)

module.exports = model(CATEGORY, categorySchema)
