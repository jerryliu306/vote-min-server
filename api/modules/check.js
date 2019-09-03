// 接入微信消息推送-服务器验证
const Router = require('koa-router')
const crypto = require('crypto')
const { log } = require('../../utils/tool')

const router = new Router()

const token = 'b1an'

function sha1 (str) {
  let shasum = crypto.createHash('sha1')
  return shasum.update(str, 'utf-8').digest('hex')
}

/** 
 * 小程序开启消息推送时验证服务器调用接口
 * 本地服务端口需要是 80 或 443
 * */
router.get('/checkWeChatPush', async (ctx, next) => {
  const req_query = ctx.query
  let {signature, echostr, timestamp, nonce} = req_query
  let reqArray = [nonce, timestamp, token]
  let sortStr = reqArray.sort().join('')
  let sha1Str = sha1(sortStr.toString().replace(/,/g, ''))

  if (sha1Str == signature) {
    ctx.body = echostr
  } else {
    log('验证失败')
  }
})

module.exports = router