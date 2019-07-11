const express = require('express')
const WebSocket = require('ws')
const http = require('http')
const path = require('path')
const app = express()
const { config, state } = require('./data')
const { questionLib, getUrlParam } = require('./utils')
app.use('/', express.static(config.pagePath))

const server = http.createServer(app)// a pre-created http/s server
function verifyClient(info, req) {
  const param = getUrlParam(info.req.url)
  if (param.zhuchiToken && param.zhuchiToken === config.zhuchiToken) {
    return true
  }
  if (param.teamToken && config.teamTokens.indexOf(param.teamToken) !== -1) {
    return true
    // 暂时不限时每队的connect个数
  }
  return false
  // var ws2 = new WebSocket('ws://localhost?key=123aaa')
  // info.req.url = /?key=123aaa
}
const wss = new WebSocket.Server({
  server,
  verifyClient
})
// 封装广播接口
wss.broadcast = function(data) {
  console.log(this === wss)
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}
// 封装停止答题

// 封装抢答
wss.on('connection', function(ws, req) {
  // this === wss?
  ws.on('message', function(message) {
    console.log('@message')
    //
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
    // Broadcast to everyone else end

    // urlParam.type: join, answer, quit
    wss.clients.forEach(function(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(state)
      }
    })
  })
  ws.on('close', function(ws, err) {
    console.log('@close')
    console.log(ws)
  })
  ws.send('Hello Client')
})
wss.on('error', function(ws, err) {
  console.log('@error')
  console.log(ws)
  console.log(err)
})

server.listen(config.serverPort, function() {
  console.log('Listening on %d', server.address().port)
})
