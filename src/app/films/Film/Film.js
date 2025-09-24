import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Hero from './Hero/Hero';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import BechdelResults from './BechdelResults/BechdelResults';
import BechdelCharts from './BechdelCharts';
import FilmInfoCard from './FilmInfoCard';
import PlotSection from './PlotSection';
import ScriptTimeline from './ScriptTimeline';
import Loading from '../../shared/Loading/Loading';
import Error from '../../shared/Error/Error';
import hash from '../../helper/hash';
import './Film.scss';

// Utility functions
const isLastItem = (item, array) => {
	return item !== array[array.length - 1];
};

const genreNodeBuilder = array => {
	return array.map(item => {
		if (isLastItem(item, array)) {
			return <span key={hash(item.toString())}>{item} | </span>;
		}
		return <span key={hash(item)}>{item}</span>;
	});
};

const nodeBuilder = array => {
	return array.map(item => {
		if (isLastItem(item, array)) {
			return <span key={hash(item.toString())}>{item.name} | </span>;
		}
		return <span key={hash(item)}>{item.name}</span>;
	});
};

const isValidFilm = film => {
	return film && film.title && film.title.trim() !== '';
};

// Default film data structure
const defaultFilmData = {
	title: '',
	images: {
		poster: '',
		backdrop: '',
	},
	plot: '',
	idIMDB: '',
	rated: '',
	directors: [],
	writers: [],
	genres: [],
	actors: [],
	bechdelResults: {
		pass: false,
		bechdelScore: 0,
		numScenesPass: 0,
		scenesThatPass: [],
		numScenesDontPass: 0,
		numOfFemalesChars: 0,
		numOfMaleChars: 0,
		numOfFemalesCharsWithDialogue: 0,
		numOfMaleCharsWithDialogue: 0,
		totalLinesFemaleDialogue: 0,
		totalLinesMaleDialogue: 0,
	},
};

// Error component for film loading errors
const FilmError = ({ error, onRetry, retryCount }) => (
	<div className="film-error" role="alert" aria-live="polite">
		<div className="film-error__container">
			<div className="film-error__icon" aria-hidden="true">
				🎬
			</div>
			<h2 className="film-error__title">Unable to Load Film</h2>
			<p className="film-error__message">
				{error || 'There was a problem loading this film. Please try again.'}
			</p>
			<div className="film-error__actions">
				<button
					type="button"
					className="film-error__button film-error__button--primary"
					onClick={onRetry}
					aria-label="Try loading the film again"
				>
					Try Again
				</button>
				<Link
					to="/"
					className="film-error__button film-error__button--secondary"
					aria-label="Go back to all films"
				>
					Back to Films
				</Link>
			</div>
			{retryCount > 0 && (
				<p className="film-error__retry-count">
					Retry attempt: {retryCount}
				</p>
			)}
		</div>
	</div>
);

FilmError.propTypes = {
	error: PropTypes.string,
	onRetry: PropTypes.func.isRequired,
	retryCount: PropTypes.number,
};

FilmError.defaultProps = {
	error: null,
	retryCount: 0,
};

const Film = memo(({
	film = defaultFilmData,
	loading = true,
	error = null,
	onRetry,
	retryCount = 0,
}) => {
	// Memoize the film content to prevent unnecessary re-renders
	const filmContent = useMemo(() => {
		if (!isValidFilm(film)) {
			return null;
		}

		const {
			title,
			bechdelResults,
			images,
			plot,
			actors,
		} = film;

		return (
			<div className="filmInfo">
				<ErrorBoundary>
					<Hero
						title={title}
						bechdelResults={bechdelResults}
						images={images}
					/>

					{/* Plot Summary and Details Container */}
					<div className="plot-details-container">
						<div className="plot-details-content">
							<PlotSection plot={plot} />
							<FilmInfoCard film={film} />
						</div>
					</div>

					{/* Charts and Score Data Section */}
					<div className="charts-data-section">
						<div className="charts-data-content">
							<BechdelCharts bechdelResults={bechdelResults} />
							<div className="detailed-results">
								<h3>Detailed Bechdel Analysis</h3>
								<BechdelResults bechdelResults={bechdelResults} />
							</div>
						</div>
					</div>

					<div className="timeline-section">
						<ScriptTimeline
							bechdelResults={bechdelResults}
							characters={actors}
						/>
					</div>

					<div className="navigation-section">
						<Link
							to="/"
							className="back-button"
							aria-label="Go back to all films"
						>
							<span className="button-icon" aria-hidden="true">←</span>
							Back to All Films
						</Link>
					</div>
				</ErrorBoundary>
			</div>
		);
	}, [film]);

	// Handle different states
	if (loading) {
		return <Loading />;
	}

	if (error) {
		return (
			<FilmError
				error={error}
				onRetry={onRetry}
				retryCount={retryCount}
			/>
		);
	}

	if (!isValidFilm(film)) {
		return <Error />;
	}

	return filmContent;
});

Film.propTypes = {
	film: PropTypes.shape({
		title: PropTypes.string,
		images: PropTypes.shape({
			poster: PropTypes.string,
			backdrop: PropTypes.string,
		}),
		plot: PropTypes.string,
		idIMDB: PropTypes.string,
		rated: PropTypes.string,
		directors: PropTypes.arrayOf(
			PropTypes.shape({
				name: PropTypes.string,
			})
		),
		writers: PropTypes.arrayOf(
			PropTypes.shape({
				name: PropTypes.string,
			})
		),
		genres: PropTypes.arrayOf(PropTypes.string),
		actors: PropTypes.arrayOf(
			PropTypes.shape({
				actorName: PropTypes.string,
				character: PropTypes.string,
				actorActress: PropTypes.string,
			})
		),
		bechdelResults: PropTypes.shape({
			pass: PropTypes.bool,
			bechdelScore: PropTypes.number,
			numScenesPass: PropTypes.number,
			scenesThatPass: PropTypes.arrayOf(PropTypes.string),
			numScenesDontPass: PropTypes.number,
			numOfFemalesChars: PropTypes.number,
			numOfMaleChars: PropTypes.number,
			numOfFemalesCharsWithDialogue: PropTypes.number,
			numOfMaleCharsWithDialogue: PropTypes.number,
			totalLinesFemaleDialogue: PropTypes.number,
			totalLinesMaleDialogue: PropTypes.number,
		}),
	}),
	loading: PropTypes.bool,
	error: PropTypes.string,
	onRetry: PropTypes.func,
	retryCount: PropTypes.number,
};

Film.defaultProps = {
	film: defaultFilmData,
	loading: true,
	error: null,
	onRetry: null,
	retryCount: 0,
};

// Add display name for debugging
Film.displayName = 'Film';

export default Film;
