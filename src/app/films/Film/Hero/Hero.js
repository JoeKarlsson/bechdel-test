import React from 'react';
import PropTypes from 'prop-types';
import './Hero.scss';

const Hero = props => {
	const { title, bechdelResults, images } = props;
	return (
		<div className="film-image">
			<img className="film-image" src={images.backdrop} alt={title} />
			<span className="film-hero-title">
				<h4>{title}</h4>
				<h3>Bechdel Pass: {bechdelResults.pass.toString().toUpperCase()}</h3>
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

Hero.defaultProps = {};

export default Hero;
