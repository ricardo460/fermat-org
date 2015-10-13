function Route(url, status, body, time) {
	this.url = url || '/';
	this.status = status || 200;
	this.body = body || {};
	this.time = time || 3600000;
	this.date = new Date();
}

Route.prototype.isValid = function() {
	var now = new Date();
	var valid = now.getTime() - this.time.getTime() > this.time;
	return valid;
}

module.exports = Route;