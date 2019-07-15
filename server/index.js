const express = require('express')
const WebSocket = require('ws')
const http = require('http')
const app = express()
const { login, logout, initRace, beginRace, endRace, changeScore, nextQuestion, showAnswer,
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
wss.broadcast = function(data, clientType) {
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
        wss.broadcast({ teamTokens: config.teamTokens }, 'judge')
        wss.broadcast({
          raceName: data.raceName,
          teamCount: data.teamCount,
          beginTime: config.beginTime,
          raceMode: config.raceMode,
          status: state.status
        }, 'screen')
        wss.broadcast(resp, 'team')
        break
      case 'beginRace':
        console.log('beginRace')
        resp = beginRace()
        wss.broadcast(resp)
        break
      case 'nextQuestion':
        console.log('nextQuestion')
        resp = nextQuestion()
        wss.broadcast(resp)
        break
      case 'showAnswer':
        resp = showAnswer(data.questionIndex)
        wss.broadcast(resp, 'screen')
        wss.broadcast(resp, 'team')
        break
      case 'changeScore':
        resp = changeScore(data.teamToken, data.newValue)
        break
      case 'endRace':
        resp = endRace()
        wss.broadcast(req)
        break
      case 'login':

        break
      case 'rename':
        resp = rename(data.teamToken, data.newName)
        wss.broadcast(resp, 'screen')
        break
      case 'answer':
        resp = answer(data.teamToken, data.answer, data.questionIndex)
        wss.broadcast(resp, 'screen')
        wss.broadcast(resp, 'team')
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
  ws.send('connected')
})
wss.on('error', function(ws, err) {
  console.log('@error')
  console.log(ws)
  console.log(err)
})

server.listen(config.serverPort, function() {
  console.log('Listening on %d', server.address().port)
})
