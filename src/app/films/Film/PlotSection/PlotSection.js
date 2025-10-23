import React from 'react';
import PropTypes from 'prop-types';
import './PlotSection.scss';

const PlotSection = ({ plot }) => {
	return (
		<div className="plot-section">
			<div className="plot-header">
				<h3>
					<span className="plot-icon">📖</span>
					Plot Summary
				</h3>
			</div>
			<div className="plot-content">
				<p>{plot}</p>
			</div>
		</div>
	);
};

PlotSection.propTypes = {
	plot: PropTypes.string.isRequired,
};

export default PlotSection;
