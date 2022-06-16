import ApplyKitDialog from './apply-kit-dialog';
import ConnectDialog from './connect-dialog';
import Header from './layout/header';
import HeaderBackButton from './layout/header-back-button';
import Kit from '../models/kit';
import useDownloadLinkMutation from '../hooks/use-download-link-mutation';
import useKitCallToAction, { TYPE_PROMOTION, TYPE_CONNECT } from '../hooks/use-kit-call-to-action';
import { Dialog } from '@elementor/app-ui';
import { useMemo, useState } from 'react';
import { useSettingsContext } from '../context/settings-context';

import './item-header.scss';

/**
 * Returns the right call to action button.
 *
 * @param model
 * @param onConnect
 * @param onApply
 * @returns {object}
 */
function useKitCallToActionButton( model, { apply, isApplyLoading, onConnect } ) {
	const [ type, { subscriptionPlan } ] = useKitCallToAction( model.accessLevel );

	return useMemo( () => {
		if ( type === TYPE_CONNECT ) {
			return {
				id: 'connect',
				text: __( 'Apply Kit', 'elementor' ), // The label is Apply kit but the this is connect button
				hideText: false,
				variant: 'contained',
				color: 'primary',
				size: 'sm',
				onClick: onConnect,
				includeHeaderBtnClass: false,
			};
		}

		if ( type === TYPE_PROMOTION && subscriptionPlan ) {
			return {
				id: 'promotion',
				text: __( 'Go %s', 'elementor' ).replace( '%s', subscriptionPlan.label ),
				hideText: false,
				variant: 'contained',
				color: 'cta',
				size: 'sm',
				url: subscriptionPlan.promotion_url,
				target: '_blank',
				includeHeaderBtnClass: false,
			};
		}

		return {
			id: 'apply',
			text: __( 'Apply Kit', 'elementor' ),
			className: 'e-kit-library__apply-button',
			icon: isApplyLoading ? 'eicon-loading eicon-animation-spin' : '',
			hideText: false,
			variant: 'contained',
			color: isApplyLoading ? 'disabled' : 'primary',
			size: 'sm',
			onClick: isApplyLoading ? null : apply,
			includeHeaderBtnClass: false,
		};
	}, [ type, subscriptionPlan, isApplyLoading, apply ] );
}

export default function ItemHeader( props ) {
	const { updateSettings } = useSettingsContext();

	const [ isConnectDialogOpen, setIsConnectDialogOpen ] = useState( false );
	const [ downloadLinkData, setDownloadLinkData ] = useState( null );
	const [ error, setError ] = useState( false );

	const { mutate: apply, isLoading: isApplyLoading } = useDownloadLinkMutation(
		props.model,
		{
			onSuccess: ( { data } ) => setDownloadLinkData( data ),
			onError: ( errorResponse ) => {
				if ( 401 === errorResponse.code ) {
					elementorCommon.config.library_connect.is_connected = false;
					elementorCommon.config.library_connect.current_access_level = 0;

					updateSettings( {
						is_library_connected: false,
						access_level: 0,
					} );

					setIsConnectDialogOpen( true );

					return;
				}

				setError( {
					code: errorResponse.code,
					message: __( 'Something went wrong.', 'elementor' ),
				} );
			},
		}
	);

	const applyButton = useKitCallToActionButton( props.model, {
		onConnect: () => setIsConnectDialogOpen( true ),
		apply,
		isApplyLoading,
	} );

	const buttons = useMemo( () => [ applyButton, ...props.buttons ], [ props.buttons, applyButton ] );

	return (
		<>
			{
				error && (
					<Dialog
						title={ error.message }
						text={ __( 'Nothing to worry about, just try again. If the problem continues, head over to the Help Center.', 'elementor' ) }
						approveButtonText={ __( 'Learn More', 'elementor' ) }
						approveButtonColor="link"
						approveButtonUrl="http://go.elementor.com/app-kit-library-error"
						approveButtonOnClick={ () => setError( false ) }
						dismissButtonText={ __( 'Got it', 'elementor' ) }
						dismissButtonOnClick={ () => setError( false ) }
						onClose={ () => setError( false ) }
					/>
				)
			}
			{
				downloadLinkData && <ApplyKitDialog
					downloadLink={ downloadLinkData.data.download_link }
					nonce={ downloadLinkData.meta.nonce }
					onClose={ () => setDownloadLinkData( null ) }
				/>
			}
			{
				isConnectDialogOpen && <ConnectDialog
					pageId={ props.pageId }
					onClose={ () => setIsConnectDialogOpen( false ) }
					onSuccess={ ( data ) => {
						const accessLevel = data.kits_access_level || data.access_level || 0;

						elementorCommon.config.library_connect.is_connected = true;
						elementorCommon.config.library_connect.current_access_level = accessLevel;

						updateSettings( {
							is_library_connected: true,
							access_level: accessLevel, // BC: Check for 'access_level' prop
						} );

						if ( data.access_level < props.model.accessLevel ) {
							return;
						}

						apply();
					} }
					onError={ ( message ) => setError( { message } ) }
				/>
			}
			<Header
				startColumn={ <HeaderBackButton/> }
				centerColumn={ props.centerColumn }
				buttons={ buttons }
			/>
		</>
	);
}

ItemHeader.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
	centerColumn: PropTypes.node,
	buttons: PropTypes.arrayOf( PropTypes.object ),
	pageId: PropTypes.string,
};
