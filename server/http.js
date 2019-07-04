const http = require('http')
const server = http.createServer((req, res) => {
  const ip = res.socket.remoteAddress
  const port = res.socket.remotePort
  res.end(`Your IP address is ${ip} and your source port is ${port}.`)
})
server.listen(3000)
