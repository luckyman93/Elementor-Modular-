module.exports = Marionette.CompositeView.extend( {
	templateHelpers: function() {
		return {
			view: this,
		};
	},

	getBehavior: function( name ) {
		return this._behaviors[ Object.keys( this.behaviors() ).indexOf( name ) ];
	},

	initialize: function() {
		this.collection = this.model.get( 'elements' );
	},

	addChildModel: function( model, options ) {
		return this.collection.add( model, options, true );
	},

	addElement( data, options ) {
		if ( this.isCollectionFilled() ) {
			return;
		}

		options = jQuery.extend( {
			trigger: false,
			edit: true,
			onBeforeAdd: null,
			onAfterAdd: null,
		}, options );

		const childTypes = this.getChildType();
		let newItem,
			elType;

		if ( data instanceof Backbone.Model ) {
			newItem = data;

			elType = newItem.get( 'elType' );
		} else {
			newItem = {
				id: elementorCommon.helpers.getUniqueId(),
				elType: childTypes[ 0 ],
				settings: {},
				elements: [],
			};

			if ( data ) {
				jQuery.extend( newItem, data );
			}

			elType = newItem.elType;
		}

		if ( -1 === childTypes.indexOf( elType ) ) {
			return this.children.last().addElement( newItem, options );
		}

		if ( options.clone ) {
			newItem = this.cloneItem( newItem );
		}

		if ( options.trigger ) {
			elementor.channels.data.trigger( options.trigger.beforeAdd, newItem );
		}

		if ( options.onBeforeAdd ) {
			options.onBeforeAdd();
		}

		var newModel = this.addChildModel( newItem, { at: options.at } ),
			newView = this.children.findByModel( newModel );

		if ( options.onAfterAdd ) {
			options.onAfterAdd( newModel, newView );
		}

		if ( options.trigger ) {
			elementor.channels.data.trigger( options.trigger.afterAdd, newItem );
		}

		if ( options.edit && elementor.documents.getCurrent().history.getActive() ) {
			// Ensure container is created. TODO: Open editor via UI hook after `document/elements/create`.
			newView.getContainer();
			newModel.trigger( 'request:edit', { scrollIntoView: options.scrollIntoView } );
		}

		return newView;
	},

	createElementFromContainer( container, options = {} ) {
		return this.createElementFromModel( container.model, options );
	},

	createElementFromModel( model, options = {} ) {
		let container = this.getContainer();

		if ( model instanceof Backbone.Model ) {
			model = model.toJSON();
		}

		if ( elementor.helpers.maybeDisableWidget( model.widgetType ) ) {
			return;
		}

		model = Object.assign( model, model.custom );

		// Check whether the container cannot contain a section, in which case we should use an inner-section.
		if ( 'section' === model.elType ) {
			model.isInner = true;
		}

		const historyId = $e.internal( 'document/history/start-log', {
			type: this.getHistoryType( options.event ),
			title: elementor.helpers.getModelLabel( model ),
		} );

		if ( options.shouldWrap ) {
			const containerExperiment = elementorCommon.config.experimentalFeatures.container;

			container = $e.run( 'document/elements/create', {
				model: {
					elType: containerExperiment ? 'container' : 'section',
				},
				container,
				columns: Number( ! containerExperiment ),
				options: {
					at: options.at,
				},
			} );

			// Since wrapping an element with container doesn't produce a column, we shouldn't try to access it.
			if ( ! containerExperiment ) {
				container = container.view.children.findByIndex( 0 )
					.getContainer();
			}
		}

		// Create the element in column.
		const widget = $e.run( 'document/elements/create', {
			container,
			model,
			options,
		} );

		$e.internal( 'document/history/end-log', { id: historyId } );

		return widget;
	},

	onDrop( event, options ) {
		const input = event.originalEvent.dataTransfer.files;

		if ( input.length ) {
			$e.run( 'editor/browser-import/import', {
				input,
				target: this.getContainer(),
				options: { event, target: { at: options.at } },
			} );

			return;
		}

		this.createElementFromModel(
			Object.fromEntries(
				Object.entries( elementor.channels.panelElements.request( 'element:selected' )?.model.attributes )
					// The `custom` property is responsible for storing global-widgets related data.
					.filter( ( [ key ] ) => [ 'elType', 'widgetType', 'custom' ].includes( key ) )
			),
			options
		);
	},

	getHistoryType( event ) {
		if ( event ) {
			if ( event.originalEvent ) {
				event = event.originalEvent;
			}

			switch ( event.constructor.name ) {
				case 'DragEvent':
					return 'import';
				case 'ClipboardEvent':
					return 'paste';
			}
		}

		return 'add';
	},

	cloneItem: function( item ) {
		var self = this;

		if ( item instanceof Backbone.Model ) {
			return item.clone();
		}

		item.id = elementorCommon.helpers.getUniqueId();

		item.settings._element_id = '';

		item.elements.forEach( function( childItem, index ) {
			item.elements[ index ] = self.cloneItem( childItem );
		} );

		return item;
	},

	lookup: function() {
		let element = this;

		if ( element.isDisconnected() ) {
			element = $e.components.get( 'document' ).utils.findViewById( element.model.id );
		}

		return element;
	},

	isDisconnected: function() {
		return this.isDestroyed || ! this.el.isConnected;
	},

	isCollectionFilled: function() {
		return false;
	},
} );
