const Koa = require('koa')

const bodyParser = require('koa-bodyparser') // bodyParser
const cors = require('koa-cors') // 允许跨域
const jwt = require('koa-jwt') // json web token

const schedule = require('./schedule') // 定时任务

const router = require('./api')

const mongoose = require('./database')


const config = require('./utils/config')

const { verity } = require('./utils/token')
const { checkAccessToken } = require('./weixin/auth')

const app = new Koa()

checkAccessToken()

app.use(cors()) // 跨域
app.use(bodyParser())

// 挂载 jwt 中间件,并设置不需要拦截的路由
app.use(
  jwt({ secret: config.JWT_SECREAT})
    // unless 中的路由都不会被拦截,但是设置的全局路由验证,需要过滤掉 unless 的验证结果
    .unless({
      path: [
        '/user/login',
        '/vote/hot',
        '/vote/detail',
        '/check/checkWeChatPush'
      ]
    })
)

// jwt 拦截错误处理,被 jwt 拦截后会返回 401
app.use((ctx, next) => {
  return next().catch(err => {
    console.log(err)
    if (err.status === 401) {
      ctx.status = 401
      ctx.body = {
        code: 401,
        mag: '暂无权限'
      }
    } else {
      throw err
    }
  })
})

app.use(verity())


app.use(router.routes())
  .use(router.allowedMethods())

app.listen(config.port, () => {
  console.log(`[Koa]Server is listen at port ${config.port}`)
})