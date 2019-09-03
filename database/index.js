var mongoose = require('mongoose')
const config = require('../utils/config')

// 连接数据库
mongoose.connect(config.DB_ADDRESS, {useNewUrlParser: true}, err => {
  if (err) {
    console.log('[Mongoose] database connect failed!')
  } else {
    console.log('[mongoose] database connect success!')
  }
})

module.exports = mongoose