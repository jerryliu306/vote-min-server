const Router = require('koa-router')
const userRouter = require('./modules/user')
const voteRouter = require('./modules/vote')
const scheduleRouter = require('./modules/schedule')
const checkRouter = require('./modules/check')

const router = new Router()

router.use('/user', userRouter.routes(), userRouter.allowedMethods())
router.use('/vote', voteRouter.routes(), voteRouter.allowedMethods())
router.use('/schedule', scheduleRouter.routes(), scheduleRouter.allowedMethods())
router.use('/check', checkRouter.routes(), checkRouter.allowedMethods())

module.exports = router