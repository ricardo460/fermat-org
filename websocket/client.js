//
/*client.connect('ws://52.35.64.221:9090/fermat/ws', '', '', {
	"temp-i": {
		"i": "040E0E430ED675DD2E86BE2E172DA09FCE1415353DA20CF43AFC48B0BAA8F0D7656EE244C0097EE1A73C196DCF5DF1DE6E313407E82ADE6A9EC2F7697103BA1FCF"
	}
});*/
//client.connect('ws://52.35.64.221:9090/fermat/ws');
//GET / HTTP/1.1
// Upgrade: WebSocket
// Connection: Upgrade
var opts = {
	extraHeaders: {
		"temp-i": '{"i": "040E0E430ED675DD2E86BE2E172DA09FCE1415353DA20CF43AFC48B0BAA8F0D7656EE244C0097EE1A73C196DCF5DF1DE6E313407E82ADE6A9EC2F7697103BA1FCF"}'
	}
};
var socket = require('engine.io-client')('http://localhost:8081', opts);
//var socket = require('engine.io-client')('http://52.35.64.221:9090/fermat/ws', opts);
try {
	socket.on('message', function () {
		console.log('message');
	});
	socket.on('close', function (x, y, z) {
		console.dir(x);
		console.dir(y);
		console.log('close');
	});
	socket.on('flush', function () {
		console.log('flush');
	});
	socket.on('drain', function () {
		console.log('drain');
	});
	socket.on('upgradeError', function () {
		console.log('upgradeError');
	});
	socket.on('upgrade', function () {
		console.log('upgrade');
	});
	socket.on('ping', function () {
		console.log('ping');
	});
	socket.on('pong', function () {
		console.log('pong');
	});
	socket.on('error', function (err) {
		console.log('Connection ' + err.toString());
		console.error(err.stack);
	});
	socket.on('open', function () {
		socket.on('message', function (data) {
			console.log(data);
			socket.send(data + '-');
		});
		socket.on('close', function () {
			console.log('Connection closed');
		});
		console.log('Client Connected');
		socket.send('hi');
	});
} catch (err) {
	console.error(err);
}
/*
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
client.connect('ws://localhost:8081/', 'echo-protocol');*/