import React from 'react';
import Hero from './Hero/Hero';
import Films from '../../films/Films/FilmsContainer';

const Home = () => {
	return (
		<div className="Home">
			<Hero />
			<Films />
		</div>
	);
};

export default Home;
