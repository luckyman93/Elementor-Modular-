import tests from '../tests';

/* global require */

export default class EditorBootstrap {
	constructor() {
		jQuery( this.initialize.bind( this ) );
	}

	initialize() {
		// Since JS API catch errors that occurs while running commands, the tests should expect it.
		// eslint-disable-next-line no-console
		console.error = ( ... args ) => {
			throw new Error( args );
		};

		const EditorTest = require( './test' ).default,
			ajax = require( '../mock/ajax' ),
			eData = require( '../mock/e-data' ),
			$body = jQuery( 'body' ).append( '<div id="elementor-test"></div>' ),
			$elementorTest = $body.find( '#elementor-test' );

		// Load the template to `#elementor-test`.
		$elementorTest.append( window.__html__[ 'tests/qunit/index.html' ] );

		window.elementor = new EditorTest();

		// Mock document for `initDocument`;
		const request = {
				unique_id: `document-1`,
				data: { id: 1 },
			},
			cacheKey = elementorCommon.ajax.getCacheKey( request );
		elementorCommon.ajax.cache[ cacheKey ] = elementor.getConfig().document;

		ajax.silence();
		eData.emptyFetch();

		elementor.on( 'preview:loaded', () => {
			// Disable UI Hooks.
			$e.hooks.ui.deactivate();

			this.runTests();
		} );

		elementor.start();

		elementor.$preview.trigger( 'load' );
	}

	runTests() {
		return tests();
	}
}
