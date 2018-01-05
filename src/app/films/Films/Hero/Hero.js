import React from 'react';
import { NavLink } from 'react-router-dom';
import './Hero.scss';

const Hero = () => (
	<div className="section hero">
		<div className="container">
			<div className="row">
				<div className="u-max-full-width ">
					<h4 className="hero-heading">bechdel.io</h4>
					<h5>find out if your favorite film passes the test.</h5>
					<NavLink to="/film/new">
						<button className="button">upload script</button>
					</NavLink>
				</div>
			</div>
		</div>
	</div>
);

export default Hero;
