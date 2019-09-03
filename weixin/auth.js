const fs = require('fs')
const path = require('path')
const { getUrlLink, urlRequest, log } = require('../utils/tool')
const config = require('../utils/config')

let filename = path.resolve(__dirname, './access_token.txt')

async function getAndSaveWXAccessToken () {
  let authBaseUrl = 'https://api.weixin.qq.com/cgi-bin/token'
  let options = {
    grant_type: 'client_credential',
    appid: config.WX_CONFIG.appid,
    secret: config.WX_CONFIG.secret
  }
  let authUrl = getUrlLink(authBaseUrl, options)
  let result = await urlRequest(authUrl)
  if (typeof result == 'string') {
    result = JSON.parse(result)
  }
  result.expires_in = new Date().getTime() + result.expires_in * 1000
  fs.writeFile(filename, JSON.stringify(result),function (err) {
    if(err){
      log('AccessToken写入失败', err)
    }
    log('AccessToken写入成功')
  })

  return result
}

exports.checkAccessToken = () => {
  let result = fs.readFileSync(filename, 'utf8')
  
  if (result) {
    result = JSON.parse(result)
    if (new Date().getTime() > result.expires_in - 20 * 60 * 1000) {
      getAndSaveWXAccessToken()
    }
  } else {
    getAndSaveWXAccessToken()
  }
}

exports.getLocalAccessToken = () => {
  return JSON.parse(fs.readFileSync(filename, 'utf8'))
}