var TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' ),
	TemplateLibraryTemplateRemoteView;

TemplateLibraryTemplateRemoteView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-remote',

	ui: function() {
		return jQuery.extend( TemplateLibraryTemplateView.prototype.ui.apply( this, arguments ), {
			favoriteCheckbox: '.elementor-template-library-template-favorite-input',
		} );
	},

	events: function() {
		return jQuery.extend( TemplateLibraryTemplateView.prototype.events.apply( this, arguments ), {
			'change @ui.favoriteCheckbox': 'onFavoriteCheckboxChange',
		} );
	},

	onPreviewButtonClick: function() {
		$e.route( 'library/preview', { model: this.model } );
	},

	onFavoriteCheckboxChange: function() {
		var isFavorite = this.ui.favoriteCheckbox[ 0 ].checked;

		this.model.set( 'favorite', isFavorite );

		elementor.templates.markAsFavorite( this.model, isFavorite );

		if ( ! isFavorite && elementor.templates.getFilter( 'favorite' ) ) {
			elementor.channels.templates.trigger( 'filter:change' );
		}
	},
} );

module.exports = TemplateLibraryTemplateRemoteView;
