const schedule = require('node-schedule')
const { checkAccessToken } = require('../weixin/auth') // 判断accesstoken
const { sendTemplateMsg } = require('../weixin/sendTemplateMsg') // 推送
const { log } = require('../utils/tool')

const rule = new schedule.RecurrenceRule()
const times = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56]
rule.second = times

// schedule.scheduleJob(rule, function () {
//   console.log('定时任务执行了')
// })

// 定时任务:获取微信认证 access_token
const access_token_rule = new schedule.RecurrenceRule()
access_token_rule.minute = 60
schedule.scheduleJob(access_token_rule, function () {
  log('执行 checkAccessToken 定时任务')
  checkAccessToken()
})

// 定时任务: 发送微信消息推送
const times_push_msg_rule = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]
const push_msg_rule = new schedule.RecurrenceRule()
push_msg_rule.minute = times_push_msg_rule
schedule.scheduleJob(push_msg_rule, function () {
  log('执行 sendTemplateMsg 定时任务')
  sendTemplateMsg()
})