const express = require('express')
const WebSocket = require('ws')
const http = require('http')
const app = express()
const { login, initRace, beginRace, endRace, changeScore, nextQuestion, showAnswer,
  rename, answer, config, state } = require('./data')
const { getUrlParam } = require('./utils')
app.use('/', express.static(config.pagePath))

const server = http.createServer(app)// a pre-created http/s server
function verifyClient(info) {
  console.log('verifyClient')
  return login(getUrlParam(info.req.url))

  // var ws2 = new WebSocket('ws://localhost?key=123aaa')
  // info.req.url = /?key=123aaa
}
const wss = new WebSocket.Server({
  server,
  verifyClient
})
// 封装广播接口，exclusiveClient不需要，客户端发送完消息之后需要从后台知道是否抢到了
wss.broadcast = function(data, action, clientType) {
  data = { action, data }
  this.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN && (!clientType || client.clientType === clientType)) {
      client.send(JSON.stringify(data))
    }
  })
}

wss.on('connection', function(ws, req) {
  // 能否在此时，为ws添加clientType属性？此时的哪个参数中有token？
  console.log('@connection')
  const param = getUrlParam(req.url)
  ws.clientType = 'screen'
  param.judgeToken && (ws.clientType = 'judge')
  param.teamToken && (ws.clientType = 'team')

  ws.on('message', function(message) {
    console.log('@message')
    console.log(message)
    console.log('ws === this: ', ws === this)
    console.log(this.clientType)
    try { message = JSON.parse(message) } catch (e) {
      console.error(e)
    }
    const { action, data } = message
    let resp
    switch (action) {
      case 'initRace':
        console.log('initRace', data)
        resp = initRace(data.raceName, data.teamCount, data.raceMode)
        wss.broadcast({ teamTokens: config.teamTokens }, action, 'judge')
        wss.broadcast({
          raceName: data.raceName,
          teamCount: data.teamCount,
          raceMode: config.raceMode,
          enableAnswer: false
        }, action, 'screen')
        wss.broadcast(resp, action, 'team')
        break
      case 'beginRace':
        console.log('beginRace')
        resp = beginRace()
        wss.broadcast(resp, action)
        break
      case 'nextQuestion':
        console.log('nextQuestion')
        resp = nextQuestion()
        wss.broadcast(resp, action)
        break
      case 'showAnswer':
        resp = showAnswer(data.questionIndex)
        wss.broadcast(resp, action, 'screen')
        wss.broadcast(resp, action, 'team')
        break
      case 'changeScore':
        resp = changeScore(data.teamToken, data.newValue)
        wss.broadcast(resp, action, 'screen')
        wss.broadcast(resp, action, 'team')
        break
      case 'endRace':
        resp = endRace()
        wss.broadcast(resp, action)
        break
      case 'rename':
        resp = rename(data.teamToken, data.newName)
        wss.broadcast(resp, action, 'screen')
        wss.broadcast(resp, action, 'judge')
        break
      case 'answer':
        resp = answer(data.teamToken, data.answer, data.questionIndex)
        wss.broadcast(resp, action, 'screen')
        wss.broadcast(resp, action, 'team')
        break
      case 'logout':

        break
    }
    console.log(resp)
  })

  ws.on('close', function(ws, err) {
    console.log('@close')
    console.log(ws)
  })
  // 以防该客户端是在比赛开始的时候连接进来的
  // 前端页面刷新后如何判断状态？需要
  // screen页面：beginTime，raceName，raceMode，question，questionIndex，teams
  // 不管enableAnswer是否为true，均能点击下一题或显示答案
  // judge页面：questionIndex，enableAnswer，teams
  // 如果questionIndex === 0 && enableAnswer === false  state为initRace，需要点击开始比赛，不能点击下一题或者显示答案
  // else 均可以点击下一题或显示答案（index===0的时候，显示答案为空）
  // team页面：activeTeam，enableAnswer， questionIndex，token

  //
  ws.send(JSON.stringify({
    action: 'connect',
    data: {
      raceName: config.raceName,
      raceMode: config.raceMode,
      beginTime: config.beginTime,
      enableAnswer: state.enableAnswer,
      questionIndex: state.questionIndex,
      question: state.question,
      updateTime: state.updateTime,
      activeTeam: state.activeTeam,
      teams: state.teams // 以防该主持人在比赛过程中刷新
    }
  }))
})
wss.on('error', function(ws, err) {
  console.log('@error')
  console.log(ws)
  console.log(err)
})

server.listen(config.serverPort, function() {
  console.log('Listening on %d', server.address().port)
})
