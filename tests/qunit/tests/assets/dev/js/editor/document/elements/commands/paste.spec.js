import ElementsHelper from '../helper';
import HistoryHelper from '../../history/helper';

// TODO: Check code coverage and add required tests.
export const Paste = () => {
	QUnit.module( 'Paste', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eButton = ElementsHelper.createButton( eColumn );

				ElementsHelper.copy( eButton );

				// Ensure editor saver.
				$e.internal( 'document/save/set-is-modified', { status: false } );

				ElementsHelper.paste( eColumn );

				// Check.
				assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
					'Pasted element were created.' );
				assert.equal( elementor.saver.isEditorChanged(), true,
					'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eWidget = ElementsHelper.createButton( eColumn );

				ElementsHelper.copy( eWidget );

				const ePastedWidget = ElementsHelper.paste( eColumn ),
					historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'paste', 'Elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Element Does not exist.
				HistoryHelper.destroyedValidate( assert, ePastedWidget );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Element exist again.
				HistoryHelper.recreatedValidate( assert, ePastedWidget );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eSection1 = ElementsHelper.createSection(),
					eSection2 = ElementsHelper.createSection(),
					eColumns = ElementsHelper.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButton = ElementsHelper.createButton( eColumns[ 0 ] ),
					eHeading = ElementsHelper.createHeading( eColumns[ 0 ] ),
					toCopy = [ eButton, eHeading ];

				ElementsHelper.multiCopy( toCopy.slice().reverse() );

				ElementsHelper.paste( eColumns[ 1 ] );

				// Check pasted elements existence.
				assert.equal( eColumns[ 1 ].children.length, 2, `Both elements pasted.` );

				// Check whether they preserved their order.
				for ( let i = 0; i < toCopy.length; i++ ) {
					assert.equal(
						eColumns[ 1 ].model.get( 'elements' ).models[ i ].get( 'widgetType' ),
						toCopy[ i ].model.get( 'widgetType' ),
						`Element ${ i + 1 } preserved its order.`
					);
				}
			} );

			QUnit.test( 'Columns', ( assert ) => {
				const eSection1 = ElementsHelper.createSection( 2 ),
					eSection2 = ElementsHelper.createSection(),
					eColumn1 = eSection1.children[ 0 ],
					eColumn2 = eSection1.children[ 1 ],
					toCopy = [ eColumn1, eColumn2 ];

				// We want to create different widgets in different columns in order to check later whether the paste
				// order is preserved using the `widgetType`.
				ElementsHelper.createButton( eColumn1 );

				ElementsHelper.createHeading( eColumn2 );

				ElementsHelper.multiCopy( toCopy.slice().reverse() );

				ElementsHelper.paste( eSection2 );

				// Check pasted elements existence.
				assert.equal( eSection2.children.length, 3, `Both elements pasted.` );

				// Check whether they preserved their order.
				for ( let i = 0; i < toCopy.length; i++ ) {
					assert.equal(
						toCopy[ i ].children[ 0 ].model.get( 'widgetType' ),
						eSection2.children[ i + 1 ].model.get( 'elements' ).models[ 0 ].get( 'widgetType' ),
						`Column ${ i + 1 } preserved its order.`
					);
				}
			} );

			QUnit.test( 'Sections', ( assert ) => {
				const eSection1 = ElementsHelper.createSection(),
					eSection2 = ElementsHelper.createSection(),
					toCopy = [ eSection1, eSection2 ],
					initialElementsCount = elementor.elements.length;
				// We want to create different widgets in different sections in order to check later whether the paste
				// order is preserved using the `widgetType`.
				ElementsHelper.createButton( eSection1.children[ 0 ] );

				ElementsHelper.createHeading( eSection2.children[ 0 ] );

				ElementsHelper.multiCopy( toCopy.slice().reverse() );

				const pasted = ElementsHelper.paste( elementor.getPreviewContainer(), true );

				// Check pasted elements existence.
				assert.equal( initialElementsCount + 2, elementor.elements.length, `Both elements pasted.` );

				// Check whether they preserved their order.
				for ( let i = 0; i < toCopy.length; i++ ) {
					assert.equal(
						toCopy[ i ].children[ 0 ].model.get( 'elements' ).models[ 0 ].get( 'widgetType' ),
						pasted[ i ].model.get( 'elements' ).models[ 0 ].get( 'elements' ).models[ 0 ].get( 'widgetType' ),
						`Column ${ i + 1 } preserved its order.`
					);
				}
			} );

			QUnit.test( 'On preview container', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eButton = ElementsHelper.createButton( eColumn ),
					eHeading = ElementsHelper.createHeading( eColumn ),
					toCopy = [ eButton, eHeading ];

				ElementsHelper.multiCopy( toCopy );

				const pasted = ElementsHelper.paste( elementor.getPreviewContainer(), true ),
					parents = pasted.map( ( container ) => container.parent.parent );

				// Check pasted elements existence.
				assert.ok( parents.every( ( parent ) => parent ), `Both elements pasted.` );

				// Check whether they preserved their order.
				assert.equal(
					elementor.getContainer( elementor.elements.models[ elementor.elements.length - 1 ].get( 'id' ) )
						.children[ 0 ].children[ 0 ].model.get( 'widgetType' ),
					toCopy[ toCopy.length - 1 ].model.get( 'widgetType' ),
					'Elements preserved their position.'
				);
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eWidget = ElementsHelper.createButton( eColumn );

				ElementsHelper.copy( eWidget );

				const ePastedWidget = ElementsHelper.paste( eColumn ),
					historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'paste', 'Elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Element Does not exist.
				HistoryHelper.destroyedValidate( assert, ePastedWidget );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Element exist again.
				HistoryHelper.recreatedValidate( assert, ePastedWidget );
			} );
		} );
	} );
};

export default Paste;
