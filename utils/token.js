const JWT = require('jsonwebtoken')
const config = require('./config')

// 创建 token
exports.createToken = (data, expiresIn = '1h') => {
  const exp = { expiresIn }
  return JWT.sign({...data}, config.JWT_SECREAT, exp)
}

// 解析请求头, 获取 token
exports.parseHeader = ctx => {
  if (!ctx || !ctx.request || !ctx.request.header || !ctx.request.header.authorization) return null
  return ctx.request.header.authorization.split(' ')[1]
}

// 验证 token
exports.verity =  () => {
  return async (ctx, next) => {
    let token = this.parseHeader(ctx)
    if (ctx.method == 'GET' && ctx.request.url.split('?')[0] == '/check/checkWeChatPush' && token == null) {
      ctx.status = 200
      await next()
    } else {
      if (!token) {
        ctx.body = {
          code: 401,
          msg: '登录超时'
        }
      } else if (token == 'undefined') {
        await next()
      }else {
        let decode = JWT.verify(token, config.JWT_SECREAT)
        let { openid } = decode
        if (openid) {
          ctx.status = 200
          await next()
        }
      }
    }
  }
}

// 解析 token, 获取 token 中信息
exports.decode = token => {
  return JWT.decode(token)
}

// 获取 openid
exports.getOpenId = ctx => {
  const token = this.parseHeader(ctx)
  let { openid } = JWT.decode(token)
  return openid
}