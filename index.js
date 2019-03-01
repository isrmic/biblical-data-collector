const startCollect = require('./collector');

try {
	startCollect();
}
catch (err) {
	console.warn(err);
}