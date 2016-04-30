var engine = require('engine.io');
var server = new engine.Server();
var http = require('http').createServer().listen(8081, function () {
	console.log((new Date()) + ' Server is listening on port 8081');
});
try {
	server.on('connection', function (socket) {
		socket.on('message', function (data) {
			console.log('»' + data + '«');
			setTimeout(function () {
				socket.send(data + '+');
			}, 1000);
		});
		socket.on('close', function () {
			console.log('Connection closed');
		});
	});
} catch (err) {
	console.error(err);
}
http.on('upgrade', function (req, socket, head) {
	console.log('upgrade');
	console.dir(req.headers);
	console.log('temp-i');
	console.log(req.headers['temp-i']);
	server.handleUpgrade(req, socket, head);
});
http.on('request', function (req, res) {
	console.log('request');
	console.dir(req.headers);
	console.log('temp-i');
	console.log(req.headers['temp-i']);
	server.handleRequest(req, res);
});