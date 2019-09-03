const request = require('request')
const moment = require('moment')

// 拼接 url 和 params, 获得 get 请求链接
exports.getUrlLink = (url, params) => {
  let queryArray = []
  let queryString = ''
  for (let k in params) {
    queryArray.push(`${k}=${params[k]}`)
  }
  queryString = queryArray.join('&')
  return `${url}?${queryString}`
}

// 后端请求外部接口 get 请求
exports.urlRequest = async reqUrl => {
  return new Promise((resolve, reject) => {
    request(reqUrl, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.body)
      }
    })
  })
}

// 后端请求外部接口 post 请求
exports.urlRequestPost = async (reqUr, data) => {
  return new Promise((resolve, reject) => {
    request({
      url: reqUr,
      method: 'POST',
      json: true,
      body: data
    }, function (error, response, body) {
      if (error) {
        reject(error)
      } else {
        resolve(response.body)
      }
    })
  })
}

// log 封装
exports.log = log => {
  let hour = new Date().getHours()
  let minutes = new Date().getMinutes()
  let second = new Date().getSeconds()
  console.log('\x1B[36m%s\x1B[0m', `${hour}:${minutes}:${second}: ${log}`)
}

// 获取当前 YYYY-MM-DD HH:mm:ss 格式时间
exports.getNowTime = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss")
}