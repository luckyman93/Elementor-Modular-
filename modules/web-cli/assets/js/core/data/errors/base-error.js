import Helpers from 'elementor-api/utils/helpers';
import ForceMethodImplementation from '../../../utils/force-method-implementation';

export default class BaseError extends Error {
	/**
	 * The server error code.
	 *
	 * @type {string}
	 */
	code = '';

	/**
	 * Additional data about the current error.
	 *
	 * @type {*[]}
	 */
	data = [];

	/**
	 * Static helper function to create the error.
	 *
	 * @param message
	 * @param code
	 * @param data
	 * @returns {BaseError}
	 */
	static create( message, code = '', data = [] ) {
		return new this( message, code, data );
	}

	/**
	 * Returns the status code of the error.
	 */
	static getHTTPErrorCode() {
		ForceMethodImplementation();
	}

	/**
	 * Error constructor.
	 *
	 * @param code
	 * @param message
	 * @param data
	 */
	constructor( message = '', code = '', data = [] ) {
		super( message );

		this.code = code;
		this.data = data;
	}

	/**
	 * Notify a message when the error occurs.
	 */
	notify() {
		Helpers.consoleError( { message: this.message, ...this } );
	}
}
