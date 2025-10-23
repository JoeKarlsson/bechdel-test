import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useDocumentTitle from '../../helper/useDocumentTitle';
import './About.scss';

const About = () => {
	// Set document title
	useDocumentTitle('about');

	const metaDescription = 'Learn about the Bechdel Test, its history from Alison Bechdel\'s 1985 comic, and how bechdel.io uses AI-powered analysis to evaluate gender representation in films. A collaborative digital humanities project combining feminist film theory with modern technology.';

	return (
		<div className="About">
			<Helmet>
				{/* Primary Meta Tags */}
				<title>About the Bechdel Test & bechdel.io | Feminist Film Analysis</title>
				<meta name="title" content="About the Bechdel Test & bechdel.io | Feminist Film Analysis" />
				<meta name="description" content={metaDescription} />

				{/* Open Graph / Facebook */}
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://bechdel.io/about" />
				<meta property="og:title" content="About the Bechdel Test & bechdel.io" />
				<meta property="og:description" content={metaDescription} />
				<meta property="og:site_name" content="bechdel.io" />

				{/* Twitter Card */}
				<meta property="twitter:card" content="summary" />
				<meta property="twitter:url" content="https://bechdel.io/about" />
				<meta property="twitter:title" content="About the Bechdel Test & bechdel.io" />
				<meta property="twitter:description" content={metaDescription} />

				{/* Structured Data */}
				<script type="application/ld+json">
					{JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'AboutPage',
						name: 'About bechdel.io',
						description: metaDescription,
						url: 'https://bechdel.io/about',
						mainEntity: {
							'@type': 'WebApplication',
							name: 'bechdel.io',
							applicationCategory: 'EducationalApplication',
							description: 'AI-powered feminist film analysis tool using the Bechdel Test',
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
						},
					})}
				</script>
			</Helmet>

			<div className="container">
				<header className="about-header">
					<h1>about bechdel.io</h1>
					<p className="about-subtitle">
						A collaborative digital humanities project analyzing films through the lens of the Bechdel Test
					</p>
				</header>

				<div className="about-content">
					<div className="bechdel-criteria">
						<p>
							The Bechdel Test, sometimes called the Mo Movie Measure or Bechdel Rule is
							a simple test which names the following three criteria:
						</p>
						<p>1) It includes at least two women</p>
						<p>2) who have at least one conversation</p>
						<p>3) about something other than a man or men.</p>
					</div>

					<h2>origins & history</h2>
					<p>
						The Bechdel Test originated in Alison Bechdel's 1985 comic strip "Dykes to Watch Out For,"
						specifically in the strip titled "<a href="https://en.wikipedia.org/wiki/Bechdel_test#/media/File:Dykes_to_Watch_Out_For_(Bechdel_test_origin).jpg" target="_blank" rel="noopener noreferrer">The Rule</a>."
						In this comic, one character explains that she only watches movies that meet these three criteria.
						Bechdel credits the idea to her friend Liz Wallace, and notes that Wallace was inspired by
						Virginia Woolf's essay "<em>A Room of One's Own</em>" (1929).
					</p>
					<p>
						What began as a humorous observation in an independent comic strip has since become one of the
						most widely recognized measures of gender representation in media. The test gained significant
						traction in the 2010s when Swedish cinemas began using it to rate films, and major media outlets
						started tracking Hollywood's performance on the test. By highlighting how few films feature even
						basic conversations between women about topics other than men, the Bechdel Test became a powerful
						tool for feminist film criticism and advocacy.
					</p>

					<h2>understanding the test's limitations</h2>
					<p>
						While the Bechdel Test has proven invaluable in sparking conversations about representation,
						it's crucial to understand its limitations. The test is intentionally simple—that's part of
						its power—but this simplicity also means it can't capture the full complexity of gender representation.
					</p>
					<div className="limitations-list">
						<p><strong>What the test measures:</strong></p>
						<ul>
							<li>The presence of female characters with speaking roles</li>
							<li>Whether women have conversations with each other</li>
							<li>Whether those conversations extend beyond male characters</li>
						</ul>

						<p><strong>What the test doesn't measure:</strong></p>
						<ul>
							<li>The quality of female representation or character development</li>
							<li>Whether female characters have agency or complexity</li>
							<li>Intersectional representation (race, class, sexuality, disability)</li>
							<li>The context or significance of the conversation</li>
							<li>Who created the film (director, writer, cinematographer gender)</li>
						</ul>
					</div>
					<p>
						A film can pass the Bechdel Test while still perpetuating harmful stereotypes, and a film
						can fail the test while offering nuanced, powerful female characters. For example, <em>Gravity</em>
						(2013) fails the test because there's only one woman, yet features a complex female protagonist
						surviving against impossible odds. Conversely, some films pass the test with a brief, trivial
						conversation between background characters while relegating women to stereotypical roles.
					</p>
					<p>
						This is why our tool goes beyond simple pass/fail metrics to provide deeper analysis through
						AI-powered feminist film theory insights, examining female agency, stereotype detection, power
						dynamics, and intersectional representation. We encourage using the Bechdel Test as a starting
						point for conversation, not as a final judgment on a film's feminist merits.
					</p>

					<h2>philosophy</h2>
					<p>
						This collaborative digital humanities project by Joe and I is the product
						of a shared passion for film, feminism, and the creative potential of
						technology. By combining the talents and interests of myself, an English
						scholar, and Joe, a software engineer, we've been able to create an
						innovative data mining tool for film analysis that we hope to continue to
						work on and improve.
					</p>
					<p>
						This project was born when I reached out to Joe for advice on a few ideas
						I had been mulling over for a digital humanities project. Hoping to do
						something related to feminist film analysis, I was feeling very limited by
						my lack of coding experience and hadn't been able to find an existing data
						mining tool to accomplish what I was looking to do. Joe immediately
						offered up his coding expertise, looking to gain experience by building a
						tool from scratch which would accomplish the specific needs of the
						project. After brainstorming several different project ideas, we settled
						on the one you see here.
					</p>
					<p>
						We selected this project not only based on our shared interest in it, but
						also due to the current lack of digital humanities projects related to
						film. Data mining tools are so often used to analyze literature and other
						texts, but Joe and I noticed a gap in digital scholarship related to film.
						We recognize that the importance of this tool lies in its ability to
						analyze films on the macro-level. While anyone can sit through a film with
						a notebook and pencil in order to determine if it passes the Bechdel Test,
						this is a slow and cumbersome process. With the tool we've created, the
						process is automated, which allows massive amounts of data to be generated
						with ease. Thus, data can be produced for large bodies of film, i.e. a
						certain director's filmography, a certain actress' body of work, or for
						the films released in a specific year.
					</p>
					<p>
						This project has also been an experiment in collaboration. All of the work
						on this project has been done without in-person meetings or a physical
						workspace, as I currently live in Boulder, Colorado while Joe resides in
						Honolulu, Hawaii. Due to the ocean that separates us, Joe and I have
						mainly relied on FaceTime, iMessage, and Google Docs in order to stay
						connected. While this process was not without its challenges, we're
						excited to have successfully embraced the spirit of collaboration -- a key
						tenet of the digital humanities field.
					</p>
					<p>
						We view this tool as a form of feminist activism. As such, the software is
						open source and available for use by anyone and everyone.
					</p>
					<p className="signature">--Laurel & Joe</p>

					<p>
						P.S. If you have any suggestions for how to grow the application, we would
						love to hear from
						<a target="blank" href="https://www.callmejoe.net/contact/">
							{' '}
							you
						</a>
						.
					</p>
				</div>

				<div className="about-actions">
					<Link to="/">
						<button type="button">All Films</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default About;