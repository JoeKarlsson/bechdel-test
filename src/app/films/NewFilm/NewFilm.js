import React from 'react';
import PropTypes from 'prop-types';
import Uploader from './Uploader/Uploader';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import './NewFilm.scss';

const NewFilm = () => {
	return (
		<div className="new-film">
			<div className="container">
				<header className="new-film__header">
					<h1 className="new-film__title">Test a New Script</h1>
					<p className="new-film__subtitle">
						Upload a movie script to analyze it with the Bechdel Test
					</p>
				</header>

				<main className="new-film__content">
					<ErrorBoundary>
						<Uploader />
					</ErrorBoundary>
				</main>

				<aside className="new-film__info">
					<div className="info-card">
						<h3 className="info-card__title">Script Requirements</h3>
						<div className="info-card__content">
							<p>
								This tool currently only supports scripts with a <strong>.txt</strong> format,
								and the script must follow the{' '}
								<a
									href="http://www.simplyscripts.com/WR_format.html"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Standard Script Format (opens in new tab)"
								>
									Standard Script Format
								</a>
								.
							</p>
						</div>
					</div>

					<div className="info-card">
						<h3 className="info-card__title">Need Help?</h3>
						<div className="info-card__content">
							<p>
								If you're still having issues using the tool, try adding the title of
								the script on the first line. Or you can submit an{' '}
								<a
									href="https://github.com/JoeKarlsson1/bechdel-test/issues"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Report an issue on GitHub (opens in new tab)"
								>
									issue
								</a>
								{' '}to help us improve.
							</p>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

NewFilm.propTypes = {
	// No props needed for this component
};

NewFilm.defaultProps = {
	// No default props
};

export default NewFilm;
