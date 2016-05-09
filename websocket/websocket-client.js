#!/usr/bin/env node

var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
client.on('connectFailed', function (error) {
	console.log('Connect Error: ' + error.toString());
});
client.on('connect', function (connection) {
	console.log('WebSocket Client Connected');
	connection.on('error', function (error) {
		console.log("Connection Error: " + error.toString());
	});
	connection.on('close', function () {
		console.log('echo-protocol Connection Closed');
	});
	connection.on('message', function (message) {
		if (message.type === 'utf8') {
			console.log("Received: '" + message.utf8Data + "'");
		}
	});

	function sendNumber() {
		if (connection.connected) {
			var number = Math.round(Math.random() * 0xFFFFFF);
			connection.sendUTF(number.toString());
			setTimeout(sendNumber, 1000);
		}
	}
	sendNumber();
});
var headers = {
	"temp-i": '{"i": "040E0E430ED675DD2E86BE2E172DA09FCE1415353DA20CF43AFC48B0BAA8F0D7656EE244C0097EE1A73C196DCF5DF1DE6E313407E82ADE6A9EC2F7697103BA1FCF"}'
};
client.connect('ws://52.35.64.221:9090/fermat/ws', 'echo-protocol', null, headers, null);
//client.connect('ws://localhost:8080/', 'echo-protocol', null, headers, null);