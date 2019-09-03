const Router = require('koa-router')
const User = require('../../database/schema/User')

const config = require('../../utils/config')
const { getUrlLink, urlRequest, log } = require('../../utils/tool')

const { createToken } = require('../../utils/token')

const router = new Router()

router.post('/login', async (ctx, next) => {
  const req = ctx.request.body

  let authUrl = config.WX_AUTH_URL
  let wxConfig = {...config.WX_CONFIG}
  wxConfig.js_code = req.code

  // 获取微信验证url
  let reqUrl = getUrlLink(authUrl, wxConfig)
  try {
    // 请求微信接口验证用户
    let result = await urlRequest(reqUrl)

    // 验证成功微信会返回用户的 openid
    result = JSON.parse(result)

    // { session_key: 'BI20gpOc5KI76xG2oravwQ==', openid: 'o1TpW42jjazI0OynAjD-rm_ggBRM' }
    if (result && result.openid) {
      let openid = result.openid
      // 获取用户信息
      let { userInfo } = req
      userInfo = JSON.parse(userInfo)
      // 查询判断是否数据库中是否有该用户,无则保存用户信息返回会token
      let user = await User.findOne({
        openid
      })
      // 创建 token
      let token = createToken({openid})
      if (user) {
        log('登录成功')
        log(`用户openid: ${openid}`)
        ctx.body = {
          code: 1,
          msg: {
            token,
            userInfo
          }
        }
      } else {
        // 保存新用户信息
        const newUser = new User({
          openid,
          userInfo
        })
        let result = await newUser.save()
        if (result) {
          log('新用户保存并登录成功')
          ctx.body = {
            code: 1,
            msg: {
              token,
              userInfo
            }
          }
        } else {
          ctx.body = {
            code: 1,
            msg: '登录失败'
          }
        }
      }
    } else {
      ctx.body = {
        code: 1,
        msg: '登录失败,请稍后再试!'
      }
    }
  } catch (err) {
    ctx.body = {
      code: 1,
      msg: err
    }
  }
})

module.exports = router