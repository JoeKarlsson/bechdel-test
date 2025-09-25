import React from 'react';
import PropTypes from 'prop-types';
import './Hero.scss';

const Hero = ({ title, bechdelResults, images }) => {
	const { pass } = bechdelResults;
	const icon = pass ? '✓' : '✗';
	const iconClass = pass ? 'pass-icon' : 'fail-icon';

	return (
		<div className="film-hero">
			<img className="film-image" src={images.backdrop} alt={title} />
			<span className="film-hero-title">
				<h4>{title}</h4>
				<h3>
					<span className={`bechdel-status ${iconClass}`}>
						<span className="status-icon">{icon}</span>
						Bechdel Pass: {pass.toString().toUpperCase()}
					</span>
				</h3>
				<p>Bechdel Score: {bechdelResults.bechdelScore} of 3</p>
			</span>
		</div>
	);
};

Hero.propTypes = {
	title: PropTypes.string.isRequired,
	bechdelResults: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
	images: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};


export default Hero;
