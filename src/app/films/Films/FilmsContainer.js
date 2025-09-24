import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Films from './Films';
import Loading from '../../shared/Loading/Loading';
import api from '../../helper/api';
import './FilmsContainer.scss';

// Empty state component
const EmptyFilmsState = () => (
	<div className="empty-films" role="status" aria-live="polite">
		<div className="empty-films__container">
			<div className="empty-films__icon" aria-hidden="true">
				🎬
			</div>
			<h2 className="empty-films__title">No Films Available</h2>
			<p className="empty-films__message">
				No films have been added yet. Be the first to upload a script and analyze it with the Bechdel Test!
			</p>
			<div className="empty-films__actions">
				<a
					href="/film/new"
					className="empty-films__button"
					aria-label="Upload a new script to analyze"
				>
					Upload Your First Script
				</a>
			</div>
		</div>
	</div>
);

// Error state component
const FilmsError = ({ error, onRetry, retryCount }) => (
	<div className="films-error" role="alert" aria-live="polite">
		<div className="films-error__container">
			<div className="films-error__icon" aria-hidden="true">
				⚠️
			</div>
			<h2 className="films-error__title">Unable to Load Films</h2>
			<p className="films-error__message">
				{error || 'There was a problem loading the films list. Please try again.'}
			</p>
			<div className="films-error__actions">
				<button
					type="button"
					className="films-error__button films-error__button--primary"
					onClick={onRetry}
					aria-label="Try loading films again"
				>
					Try Again
				</button>
			</div>
			{retryCount > 0 && (
				<p className="films-error__retry-count">
					Retry attempt: {retryCount}
				</p>
			)}
		</div>
	</div>
);

FilmsError.propTypes = {
	error: PropTypes.string,
	onRetry: PropTypes.func.isRequired,
	retryCount: PropTypes.number,
};

FilmsError.defaultProps = {
	error: null,
	retryCount: 0,
};

const FilmsContainer = () => {
	const [films, setFilms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);

	const fetchFilms = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const url = '/api/film';
			const options = {
				method: 'GET',
			};

			const data = await api(url, options);

			// Validate the response data - handle paginated response
			if (!data || typeof data !== 'object') {
				throw new Error('Invalid films data received');
			}

			// Extract films array from paginated response
			const filmsArray = data.films || data;

			// Validate that we have an array of films
			if (!Array.isArray(filmsArray)) {
				throw new Error('Invalid films data received');
			}

			setFilms(filmsArray);
		} catch (err) {
			console.error('Error fetching films:', err);
			setError(err.message || 'Failed to load films');
			setFilms([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1);
		fetchFilms();
	}, [fetchFilms]);

	useEffect(() => {
		fetchFilms();
	}, [fetchFilms]);

	// Memoize the films component props to prevent unnecessary re-renders
	const filmsProps = useMemo(() => ({
		films,
		loading,
	}), [films, loading]);

	// Handle different states
	if (loading) {
		return <Loading />;
	}

	if (error) {
		return (
			<FilmsError
				error={error}
				onRetry={handleRetry}
				retryCount={retryCount}
			/>
		);
	}

	if (films.length === 0) {
		return <EmptyFilmsState />;
	}

	return <Films {...filmsProps} />;
};

FilmsContainer.propTypes = {
	// No props needed for this component
};

FilmsContainer.defaultProps = {
	// No default props
};

export default FilmsContainer;
