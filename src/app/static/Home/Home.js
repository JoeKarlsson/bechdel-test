import React from 'react';
import Hero from './Hero/Hero';
import Films from '../../films/Films/FilmsContainer';
import useDocumentTitle from '../../helper/useDocumentTitle';

const Home = () => {
	// Set document title to just "bechdel.io" for homepage
	useDocumentTitle('', 'bechdel.io', false);

	return (
		<div className="Home">
			<Hero />
			<Films />
		</div>
	);
};

export default Home;
