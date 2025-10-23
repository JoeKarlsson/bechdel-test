import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from './Hero/Hero';
import Films from '../../films/Films/FilmsContainer';
import useDocumentTitle from '../../helper/useDocumentTitle';

const Home = () => {
	// Set document title to just "bechdel.io" for homepage
	useDocumentTitle('', 'bechdel.io', false);

	const metaDescription = 'Analyze films through the Bechdel Test with AI-powered feminist film theory insights. Explore gender representation, female agency, power dynamics, and dialogue distribution in hundreds of films. A digital humanities tool for film scholars and enthusiasts.';

	return (
		<div className="Home">
			<Helmet>
				{/* Primary Meta Tags */}
				<title>bechdel.io | AI-Powered Feminist Film Analysis & Bechdel Test</title>
				<meta name="title" content="bechdel.io | AI-Powered Feminist Film Analysis & Bechdel Test" />
				<meta name="description" content={metaDescription} />
				<meta name="keywords" content="Bechdel Test, feminist film theory, gender representation, film analysis, female agency, digital humanities, AI analysis" />

				{/* Open Graph / Facebook */}
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://bechdel.io/" />
				<meta property="og:title" content="bechdel.io | AI-Powered Feminist Film Analysis" />
				<meta property="og:description" content={metaDescription} />
				<meta property="og:site_name" content="bechdel.io" />

				{/* Twitter Card */}
				<meta property="twitter:card" content="summary" />
				<meta property="twitter:url" content="https://bechdel.io/" />
				<meta property="twitter:title" content="bechdel.io | AI-Powered Feminist Film Analysis" />
				<meta property="twitter:description" content={metaDescription} />

				{/* Structured Data */}
				<script type="application/ld+json">
					{JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'WebApplication',
						name: 'bechdel.io',
						url: 'https://bechdel.io/',
						description: metaDescription,
						applicationCategory: 'EducationalApplication',
						operatingSystem: 'Web Browser',
						offers: {
							'@type': 'Offer',
							price: '0',
							priceCurrency: 'USD',
						},
						author: [
							{
								'@type': 'Person',
								name: 'Laurel',
							},
							{
								'@type': 'Person',
								name: 'Joe',
							},
						],
					})}
				</script>
			</Helmet>

			<Hero />
			<Films />
		</div>
	);
};

export default Home;
