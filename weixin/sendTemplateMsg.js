const { urlRequestPost, log, getNowTime } = require('../utils/tool')
const { getLocalAccessToken } = require('./auth')

const mongoose = require('mongoose')
const Vote = require('../database/schema/Vote')


exports.sendTemplateMsg = async ()  => {
  let { access_token } = getLocalAccessToken()
  let reqUrl = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`

  let result = await Vote.find({
    'overTime': {$gt: getNowTime()}
  })

  let filterRes = result.filter(item => {
    return (new Date(item.overTime).getTime() - new Date().getTime()) <= 5 * 60 * 1000
  })


  for (let vote in filterRes) {
    let parentItem = filterRes[vote]
    const _id = mongoose.Types.ObjectId(parentItem._id)
    for (let item in parentItem.joinUser) {
      let joinUserItem = parentItem['joinUser'][item]
      if (joinUserItem['isUse'] == '0') {
        let data = {
          'touser': joinUserItem['openId'],
          'template_id': 'QaLqQPmx1UdjTtPc7pqO7DlVpjE_3r-WpStMXGIqPN4',
          'page': 'pages/home/home',
          'form_id': joinUserItem['formId'],
          "data": {
            'keyword1': {
                'value': `你参加的 ${parentItem['title']} 投票即将结束`
            },
            'keyword2': {
                'value': parentItem['beginTime']
            },
            'keyword3': {
              'value': parentItem['overTime']
            }
          }
        }
        await Vote.updateOne({_id, 'joinUser.openId': joinUserItem['openId']}, {'joinUser.$.isUse': '1'})
        urlRequestPost(reqUrl, data).then(res => {
          console.log('推送结果:')
          console.log(res)
          log('推送成功')
        }).catch(err => {
          log('推送失败')
          log(err)
        })
      }
    }
  }
}