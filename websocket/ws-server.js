var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
	port: 8081
});
wss.on('connection', function (ws) {
	console.dir(ws.upgradeReq.headers);
	ws.on('message', function (message) {
		console.log('received: %s', message);
		setTimeout(function () {
			ws.send(message + '+');
		}, 1000);
	});
});