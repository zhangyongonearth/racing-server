const express = require('express')
const WebSocket = require('ws')
const http = require('http')
const app = express()
const { login, logout, initRace, beginRace, endRace, changeScore, nextQuestion,
  rename, answer, config, state } = require('./data')
const { getUrlParam } = require('./utils')
app.use('/', express.static(config.pagePath))

const server = http.createServer(app)// a pre-created http/s server
function verifyClient(info) {
  console.log('verifyClient')
  return login(info.req.url)

  // var ws2 = new WebSocket('ws://localhost?key=123aaa')
  // info.req.url = /?key=123aaa
}
const wss = new WebSocket.Server({
  server,
  verifyClient
})
// 封装广播接口
wss.broadcast = function(data, clientType) {
  this.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN && client.clientType === clientType) {
      client.send(data)
    }
  })
}
// 封装停止答题

// 封装抢答
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
    try { message = JSON.parse(message) } catch (e) {
      console.error(e)
    }
    const { action, data } = message
    switch (action) {
      case 'initRace':
        console.log('initRace', data)
        break
    }
    //
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(config))
      }
    })
    // Broadcast to everyone else end

    // urlParam.type: join, answer, quit
    wss.clients.forEach(function(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(state))
      }
    })
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
