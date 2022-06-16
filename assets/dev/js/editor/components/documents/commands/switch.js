import CommandBase from 'elementor-api/modules/command-base';

export class Switch extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id, mode, onClose } = args;

		return $e.run( 'editor/documents/close', {
			id: elementor.documents.getCurrentId(),
			mode,
			onClose,
		} )
		.then( () => {
			return $e.run( 'editor/documents/open', { id } );
		} );
	}
}

export default Switch;
