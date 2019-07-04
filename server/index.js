const express = require('express')
const WebSocket = require('ws')
const http = require('http')
const path = require('path')
const port = 80
const staticPath = '../static'
const app = express()
app.use('/', express.static(path.resolve(__dirname, staticPath)))

const server = http.createServer(app)// a pre-created http/s server
const keys = []
const zhuchiKey = '1605'
function verifyClient(info) {
  console.log(info.origin)
  console.log(info.req.t)
  console.log(info.secure)
  // var ws2 = new WebSocket('ws://localhost?key=123aaa')
  // info.req.url = /?key=123aaa
  // console.log(info.origin);
  // var origin = info.origin.match(/^(:?.+\:\/\/)([^\/]+)/);
  // if (origin.length >= 3 && origin[2] == "blog.luojia.me") {
  //    return true; //如果是来自blog.luojia.me的连接，就接受
  // }
  // console.log("连接",origin[2]);
  return true // 否则拒绝
  // 传入的info参数会包括这个连接的很多信息，你可以在此处使用console.log(info)来查看和选择如何验证连接
}
const wss = new WebSocket.Server({
  server,
  verifyClient
})
wss.on('connection', function connection(ws, req) {
  // this === wss?
  ws.on('message', function incoming(message) {
    keys.push(message)
    // message.type: join, answer, quit
    // ws.send('received: ' + message + '(From Server)')
    wss.clients.forEach(function(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send('received: ' + message + '(From Server)')
      }
    })
  })
  ws.on('close', function(ws, err) {
    console.log(ws)
  })
  ws.send('Hello Client')
})
wss.on('error', function(ws, err) {
  console.log(ws)
  console.log(err)
})

server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port)
})
