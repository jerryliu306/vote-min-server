const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema({
  userId: Schema.Types.ObjectId,

  openid: {
    type: String,
    unique: true,
    required: true
  },

  userInfo: {
    type: Object,
    default: Object
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

module.exports = mongoose.model('User', userSchema, 'User')