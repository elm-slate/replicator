const is = require('is_js');
const R = require('ramda');

const utils = {
	formatNumber: n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
	isStringPositiveInteger: s => is.string(s) && utils.isPositiveInteger(Number(s)),
	isPositiveInteger: n => is.number(n) &  is.integer(n) && is.positive(n),
	parseInteger: s => {
		return R.cond([
			[R.curry(x => is.number(x) && is.integer(x)), x => x],
			[R.curry(x => is.string(x) && is.number(Number(x)) && is.integer(Number(x))), x => Number(x)],
			[R.T, x => {throw new Error(`${JSON.stringify(x)} is not an integer`);}]
		])(s);
	},
	validateConnectionParameters: (parameters, parametersName) => {
		var errors = [];
		if (parameters) {
			if (!parameters.host || is.not.string(parameters.host)) {
				errors = R.append(`${parametersName}.host is missing or invalid:  ${parameters.host}`, errors);
			}
			if (!parameters.databaseName || is.not.string(parameters.databaseName)) {
				errors = R.append(`${parametersName}.databaseName is missing or invalid:  ${parameters.databaseName}`, errors);
			}
			if (parameters.userName && is.not.string(parameters.userName)) {
				errors = R.append(`${parametersName}.userName is invalid:  ${parameters.userName}`, errors);
			}
			if (parameters.password && is.not.string(parameters.password)) {
				errors = R.append(`${parametersName}.password is invalid:  ${parameters.password}`, errors);
			}
		}
		else {
			errors = R.append(`connection parameters for ${parametersName} are missing or invalid`, errors);
		}
		return errors;
	},
	yieldToEventLoop: () => {
		return new Promise((resolve) => {
			setImmediate(() => resolve());
		});
	}
};

module.exports = utils;
