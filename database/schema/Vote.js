const mongoose = require('mongoose')

const { Schema } = mongoose

const voteSchema = new Schema({
  voteId: Schema.Types.ObjectId,
  // 用户 openid
  openId: {
    type: String,
    required: true
  },
  // 投票标题
  title: {
    type: String,
    required: true
  },
  // 开始时间
  beginTime: {
    type: String,
    required: true
  },
  overTime: {
    type: String,
    required: true
  },
  detail: {
    type: String
  },
  voteItem: {
    type: Array
  },
  voteNumber: {
    type: Array
  },
  joinUser: {
    type: Array
  },
  joinLength: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

module.exports = mongoose.model('Vote', voteSchema, 'Vote')