const path = require('path')

module.exports = {
	mode: 'development',
	entry: './js/script.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'main.js',
	},
	watch: true,
	devtool: 'source-map',
	module: {},
}
