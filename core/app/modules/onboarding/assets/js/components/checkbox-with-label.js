import Checkbox from '../../../../../assets/js/ui/atoms/checkbox';

export default function CheckBoxWithLabel( props ) {
	return (
		<label className="e-onboarding__checkbox-label">
			<Checkbox
				className="e-onboarding__checkbox-input"
				checked={ props.checked }
				onChange={ ( event ) => props.onChangeCallback( event ) }
			/>
			{ props.labelText }
		</label>
	);
}

CheckBoxWithLabel.propTypes = {
	checked: PropTypes.any,
	labelText: PropTypes.string,
	onChangeCallback: PropTypes.func.isRequired,
};
