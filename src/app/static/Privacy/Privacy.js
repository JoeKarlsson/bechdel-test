import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useDocumentTitle from '../../helper/useDocumentTitle';
import './Privacy.scss';

const Privacy = () => {
	// Set document title
	useDocumentTitle('privacy');

	const metaDescription = 'Privacy policy for bechdel.io. We respect your privacy - no cookies, no tracking, no third-party analytics. Learn about our data collection and usage policies.';

	return (
		<div className="Privacy">
			<Helmet>
				{/* Primary Meta Tags */}
				<title>Privacy Policy | bechdel.io</title>
				<meta name="title" content="Privacy Policy | bechdel.io" />
				<meta name="description" content={metaDescription} />
				<meta name="robots" content="index, follow" />

				{/* Open Graph / Facebook */}
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://bechdel.io/privacy" />
				<meta property="og:title" content="Privacy Policy | bechdel.io" />
				<meta property="og:description" content={metaDescription} />
				<meta property="og:site_name" content="bechdel.io" />

				{/* Twitter Card */}
				<meta property="twitter:card" content="summary" />
				<meta property="twitter:url" content="https://bechdel.io/privacy" />
				<meta property="twitter:title" content="Privacy Policy | bechdel.io" />
				<meta property="twitter:description" content={metaDescription} />
			</Helmet>

			<div className="container">
				<header className="privacy-header">
					<h1>privacy policy</h1>
					<p className="privacy-subtitle">
						Information about how we collect, use, and protect your data
					</p>
				</header>

				<div className="privacy-content">
					<p>
						If you require any more information or have any questions about our
						privacy policy, please feel free to contact us by email at webmaster at
						this domain.
					</p>
					<p>
						At bechdel.io, the privacy of our visitors is of extreme importance to us.
						This privacy policy document outlines the types of personal information is
						received and collected by bechdel.io and how it is used.
					</p>
					<h2>log files</h2>
					<p>
						Like many other Web sites, bechdel.io makes use of log files. The
						information inside the log files includes internet protocol (IP)
						addresses, type of browser, Internet Service Provider (ISP), date/time
						stamp, referring/exit pages, and number of clicks to analyze trends,
						administer the site, track user&apos;s movement around the site, and
						gather demographic information. IP addresses, and other such information
						are not linked to any information that is personally identifiable.
					</p>
					<h2>cookies</h2>
					<p>bechdel.io does not use cookies or tracking technologies.</p>
					<h2>third-party services</h2>
					<p>
						bechdel.io does not use any third-party advertising services, analytics services,
						or tracking technologies. We do not share your data with any third parties.
					</p>
				</div>

				<div className="privacy-actions">
					<Link to="/">
						<button type="button">All Films</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Privacy;
