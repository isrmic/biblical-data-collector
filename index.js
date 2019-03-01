const startCollect = require('./src/collector');
const config = require('./config');

try {
	startCollect(config);
}
catch (err) {
	console.warn(err);
}