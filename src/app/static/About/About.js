import React from 'react';
import { Link } from 'react-router-dom';

const About = () => (
	<div className="About">
		<h1>about bechdel.io</h1>
		<p>
			The Bechdel Test, sometimes called the Mo Movie Measure or Bechdel Rule is
			a simple test which names the following three criteria:
		</p>
		<p>1) It includes at least two women</p>
		<p>2) who have at least one conversation</p>
		<p>3) about something other than a man or men.</p>

		<h2>philosophy</h2>
		<p>
			This collaborative digital humanities project by Joe and I is the product
			of a shared passion for film, feminism, and the creative potential of
			technology. By combining the talents and interests of myself, an English
			scholar, and Joe, a software engineer, we’ve been able to create an
			innovative data mining tool for film analysis that we hope to continue to
			work on and improve.
		</p>
		<p>
			This project was born when I reached out to Joe for advice on a few ideas
			I had been mulling over for a digital humanities project. Hoping to do
			something related to feminist film analysis, I was feeling very limited by
			my lack of coding experience and hadn’t been able to find an existing data
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
			this is a slow and cumbersome process. With the tool we’ve created, the
			process is automated, which allows massive amounts of data to be generated
			with ease. Thus, data can be produced for large bodies of film, i.e. a
			certain director’s filmography, a certain actress’ body of work, or for
			the films released in a specific year.
		</p>
		<p>
			This project has also been an experiment in collaboration. All of the work
			on this project has been done without in-person meetings or a physical
			workspace, as I currently live in Boulder, Colorado while Joe resides in
			Honolulu, Hawaii. Due to the ocean that separates us, Joe and I have
			mainly relied on FaceTime, iMessage, and Google Docs in order to stay
			connected. While this process was not without its challenges, we’re
			excited to have successfully embraced the spirit of collaboration -- a key
			tenet of the digital humanities field.
		</p>
		<p>
			We view this tool as a form of feminist activism. As such, the software is
			open source and available for use by anyone and everyone.
		</p>
		<p>--Laurel & Joe</p>

		<p>
			P.S. If you have any suggestions for how to grow the application, we would
			love to hear from
			<a target="blank" href="https://www.callmejoe.net/contact/">
				{' '}
				you
			</a>.
		</p>
		<Link to="/">
			<button>All Films</button>
		</Link>
	</div>
);

export default About;
