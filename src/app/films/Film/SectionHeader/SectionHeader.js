import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './SectionHeader.scss';

const SectionHeader = memo(({ title, subtitle, icon }) => (
	<div className="section-header">
		{icon && <span className="section-icon" aria-hidden="true">{icon}</span>}
		<div className="section-header-content">
			<h2 className="section-title">{title}</h2>
			{subtitle && <p className="section-subtitle">{subtitle}</p>}
		</div>
	</div>
));

SectionHeader.propTypes = {
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string,
	icon: PropTypes.string,
};

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
