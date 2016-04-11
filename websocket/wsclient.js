var WebSocket = require('ws');
var opts = {
	protocolVersion: 8,
	headers: {
		"temp-i": '{"i": "040E0E430ED675DD2E86BE2E172DA09FCE1415353DA20CF43AFC48B0BAA8F0D7656EE244C0097EE1A73C196DCF5DF1DE6E313407E82ADE6A9EC2F7697103BA1FCF"}'
	}
};
//var ws = new WebSocket('ws://52.35.64.221:9090/fermat/ws', opts);
var ws = new WebSocket('ws://localhost:8081', opts);
ws.on('open', function open() {
	ws.send('something');
});
ws.on('error', function (x, y, z) {
	console.dir(x);
});
ws.on('close', function (x, y, z) {
	console.dir(x);
	console.log(y);
	console.log(z);
});
ws.on('message', function (data, flags) {
	console.log(data);
	console.log(flags);
	setTimeout(function () {
		ws.send(data + '-');
	}, 1000);
});