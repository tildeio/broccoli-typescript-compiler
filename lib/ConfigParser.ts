import _tsconfig = require('tsconfig');
import _ = require('lodash');

class ConfigParser {
	constructor(private options: TypeScriptFilterOptions = {},
				private tsconfig = _tsconfig) {}

	generalOptions(): TypeScriptFilterGeneralOptions {
		return this.options.options || {};
	}
	tsOptions(): _tsconfig.Options {
		// Empty Options object, file options, supplied options
		let defaultOptions = { compilerOptions: {} };
		let fileOptions = {};
		let objOptions = this.options.tsOptions || {};

		if (this.options.tsConfigPath) {
			fileOptions = this.tsconfig.loadSync(this.options.tsConfigPath);
		}

		return _.merge(defaultOptions, fileOptions, objOptions);
	}
}

export = ConfigParser;