/* jshint esversion: 6 */
'usestrict';

const tsc = require('typescript');
const tsConfig = require('./tsconfig.test.json');

exports.process = function process(src, path) {
	if (path.endsWith('.ts')) {
		console.log(path);
		return tsc.transpile(src, tsConfig.compilerOptions, path, []);
	}
	return src;
};
