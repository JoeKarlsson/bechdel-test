import React from 'react';
import heroImage from '../../../assets/images/hero.jpg';
import './Hero.scss';

const Hero = () => (
	<div
		className="section hero"
		style={{
			backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImage})`
		}}
	>
		<div className="container">
			<div className="row">
				<div className="u-max-full-width ">
					<h1 className="hero-heading">bechdel.io</h1>
					<h2 className="hero-tagline">discover which movies pass the bechdel test and explore feminist film data.</h2>
				</div>
			</div>
		</div>
	</div>
);

export default Hero;
