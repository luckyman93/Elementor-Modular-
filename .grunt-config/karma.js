/**
 * Grunt karma task config
 * @package Elementor
 */
module.exports = {
	unit: {
		configFile: 'karma.conf.js',
		reporters: [ 'dots', 'fail-fast']
	},
	coverage: {
		configFile: 'karma.conf.js',
		reporters: [ 'progress', 'coverage', 'coverage-istanbul' ],
	},
	coverageHtml: {
		configFile: 'karma.conf.js',
		reporters: [ 'progress', 'coverage', 'coverage-istanbul' ],
		reports: [ 'text', 'html' ],
	},
	debug: {
		configFile: 'karma.conf.js',
		browsers: [ 'Chrome' ],
		singleRun: false,
		client: {
			qunit: {
				showUI: true,
			},
		},
	},
};
