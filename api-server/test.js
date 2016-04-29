var avgDist = function (x1, y1, x2, y2, x3, y3) {
	var dists = 0;
	dist += Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	dist += Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2));
	dist += Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
	return dist / 3;
};
console.log(avgDist(0, 0, 10, 10, 5, 5));