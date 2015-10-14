function Route(body, status, date, time) {
    //this.url = url || '/';
    this.body = body || {};
    this.status = status || 200;
    this.date = date || new Date();
    this.time = time || 3600000;
}

Route.prototype.isValid = function() {
	var then = new Date(this.date);
    var now = new Date();
    var valid = now.getTime() - then.getTime() < this.time;
    return valid;
};

module.exports = Route;