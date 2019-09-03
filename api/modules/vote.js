const Router = require('koa-router')
const mongoose = require('mongoose')
const Vote = require('../../database/schema/Vote')
const User = require('../../database/schema/User')

const { log, getNowTime } = require('../../utils/tool')
const { getOpenId } = require('../../utils/token')

const router = new Router()

// 发起投票,保存
router.post('/save', async (ctx, next) => {
  const req = ctx.request.body
  log(JSON.stringify(req))
  const openId = getOpenId(ctx)
  let params = {...req}

  params.voteItem = params.voteItem.split(',')
  params.openId = openId
  params.voteNumber = new Array(params.voteItem.length).fill(0)
  const newVote = new Vote(params)
  let result = await newVote.save()
  if (result) {
    ctx.body = {
      code: 1,
      msg: '投票创建成功!'
    }
  }
})


router.post('/find', async (ctx, next) => {
  const req = ctx.request.body
  const openId = getOpenId(ctx)
  let type = req.type // 1: 热门 2: 我参加的-首页返回未到结束时间的投票 3:我发起的-未到结束时间的投票 4:我参加的-所有状态投票 5:我发起的-所有状态的投票
  // db.getCollection('Vote').find({'joinLength': {$gte: 0},'overTime': {$gt: '2019-08-23 23:00'}}).sort({'joinLength': -1}).limit(5)
  let result
  if (type == 1) {
    // result = await Vote.find({'joinLength': {$gt: 1}, 'overTime': {$gt: getNowTime()}}).sort({'joinLength': -1}).limit(5)
  } else if (type == 2) {
    result = await Vote.find({
      joinUser: {$elemMatch: {openId}},
      'overTime': {$gt: getNowTime()}
    })
  } else if (type == 3) {
    result = await Vote.find({
      openId, 'overTime': {$gt: getNowTime()}
    })
  } else if (type == 4) {
    result = await Vote.find({
      joinUser: {$elemMatch: {openId}}
    })
  } else if (type == 5) {
    result = await Vote.find({
      openId
    })
  }
  if (result) {
    ctx.body = {
      code: 1,
      msg: 'ok',
      data: result
    }
  } else {
    ctx.body = {
      code: 0,
      msg: '获取数据失败'
    }
  }
})

// 投票详情
router.post('/detail', async (ctx, next) => {
  const req = ctx.request.body
  const { _id } = req
  let vote = await Vote.findOne({
    _id: _id
  })
  if (vote) {
    ctx.body = {
      code: 1,
      msg: 'ok',
      data: vote
    }
  } else {
    ctx.body = {
      code: 0,
      msg: '获取数据失败'
    }
  }
})

// 热门投票
router.post('/hot', async (ctx, next) => {
  const req = ctx.request.body
  let type = req.type // 1: 热门 2: 我参加的 3:我发起的
  // db.getCollection('Vote').find({ 'joinLength': {$gte: 0},  'joinUser': {$not: {$elemMatch: {'openId': 'o1TpW42jjazI0OynAjD-rm_ggBRM'} } } })
  let result
  result = await Vote.find({ 'joinLength': {$gte: 0}, 'beginTime': {$lte: getNowTime()}, 'overTime': {$gt: getNowTime()}}).sort({'joinLength': -1}).limit(5)
  if (result) {
    ctx.body = {
      code: 1,
      msg: 'ok',
      data: result
    }
  } else {
    ctx.body = {
      code: 0,
      msg: '获取数据失败'
    }
  }
})

// 参与投票
router.post('/join', async (ctx, next) => {
  const req = ctx.request.body
  const openId = getOpenId(ctx)
  const _id = mongoose.Types.ObjectId(req._id)

  const result = await Vote.findOne({_id, joinUser: {$elemMatch: {openId}}})

  let updateParams = {}
  updateParams[`voteNumber.${req.selectedIndex}`] = 1

  if (result) {
    log(`用户已参与投票,投票id:${_id}`)
    ctx.body = {
      code: 0,
      msg: '已经参与过该投票'
    }
  } else {
    let formId = req.formId
    
    // 更新数组中指定下标元素
    let update = await Vote.updateOne({
      _id
    }, {
      $addToSet: {'joinUser': {openId, formId, isUse: '0'}},
      $inc: {'joinLength': 1, ...updateParams} // 加1
    })
    if (update.nModified) {
      log(`用户参与投票成功,投票id:${_id},用户id:${openId}`)
      ctx.body = {
        code: 1,
        msg: '投票成功'
      }
    } else {
      log(`参与失败,投票id:${_id},用户id:${openId}`)
      ctx.body = {
        code: 0,
        msg: '投票失败'
      }
    }
  }
})

// 发起人删除创建的投票
router.post('/delete', async (ctx, next) => {
  const req = ctx.request.body
  const _id = mongoose.Types.ObjectId(req._id)
  const openId = getOpenId(ctx)
  let res = await Vote.deleteOne({_id})
  if (res) {
    ctx.body = {
      code: 1,
      msg: '删除成功'
    }
  } else {
    ctx.body = {
      code: 0,
      msg: '删除失败'
    }
  }
})

// 提前开始投票
router.post('/begin', async (ctx, next) => {
  const req = ctx.request.body
  const _id = mongoose.Types.ObjectId(req._id)
  const vote = await Vote.findOne({_id})
  if (new Date() > new Date(vote.beginTime)) {
    ctx.body = {
      code: 0,
      msg: '当前投投票已开启'
    }
  } else {
    let result = await Vote.updateOne({
      _id
    }, {
      beginTime: getNowTime()
    })
    if (result.nModified) {
      ctx.body = {
        code: 1,
        msg: '投票开启成功'
      }
    } else {
      ctx.body = {
        code: 0,
        msg: '失败'
      }
    }
  }
})

// 结束当前投票
router.post('/finish', async (ctx, next) => {
  const req = ctx.request.body
  const _id = mongoose.Types.ObjectId(req._id)
  let result = await Vote.updateOne({
    _id
  }, {
    overTime: getNowTime()
  })
  if (result.nModified) {
    ctx.body = {
      code: 1,
      msg: '成功结束投票'
    }
  } else {
    ctx.body = {
      code: 0,
      msg: '失败'
    }
  }
})

module.exports = router