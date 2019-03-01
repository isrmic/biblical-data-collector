const path = require('path');

process.env.resourcedir = path.join(__dirname, 'src/resources');

module.exports = {
	oldtestament: {
		startOfBook: 1,
	},
	newtestament: {
		startOfBook: 1,
	},
	book: {
		directory: path.join(__dirname, 'books'),
	},
	allbooks: {
		filename: 'nvt.json',
		directory: path.join(__dirname, 'books'),
	},
};