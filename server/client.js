var ws = new WebSocket('ws://localhost:8080')

var sendTimmer = null
var sendCount = 0

ws.onopen = function() {
  console.log('@open')

  sendCount++
  ws.send('Hello Server!' + sendCount)

  sendTimmer = setInterval(function() {
    sendCount++
    ws.send('Hi Server!' + sendCount)

    if (sendCount === 10) {
      ws.close()
    }
  }, 2000)
}
ws.onmessage = function(e) {
  console.log('@message')
  console.log(e.data)
}
ws.onclose = function() {
  console.log('@close')
  sendTimmer && clearInterval(sendTimmer)
}
ws.onerror = function() {
  console.log('@error')
}
