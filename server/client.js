var ws = new WebSocket('ws://localhost')
ws.onopen = function() {
  console.log('@open')
}

ws.onmessage = function(e) {
  console.log('@message')
  console.log(e.data)
}
ws.onclose = function() {
  console.log('@close')
}
ws.onerror = function() {
  console.log('@error')
}
ws.send('Hello Server!')
ws.close()
