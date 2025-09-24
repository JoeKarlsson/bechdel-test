import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Films from './Films';
import Loading from '../../shared/Loading/Loading';
import { useSearch } from '../../shared/SearchContext/SearchContext';
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
const FilmsError = ({ error = null, onRetry, retryCount = 0 }) => (
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

const FilmsContainer = () => {
	const [films, setFilms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [pagination, setPagination] = useState(null);
	const { debouncedSearchQuery } = useSearch();

	const fetchFilms = useCallback(async (page = 1, size = pageSize) => {
		try {
			setLoading(true);
			setError(null);

			const url = `/api/film?page=${page}&limit=${size}`;
			const options = {
				method: 'GET',
			};

			const data = await api(url, options);

			// Validate the response data - handle paginated response
			if (!data || typeof data !== 'object') {
				throw new Error('Invalid films data received');
			}

			// Extract films array and pagination info from paginated response
			const filmsArray = data.films || data;
			const paginationData = data.pagination;

			// Validate that we have an array of films
			if (!Array.isArray(filmsArray)) {
				throw new Error('Invalid films data received');
			}

			setFilms(filmsArray);
			setPagination(paginationData);
			setCurrentPage(page);
		} catch (err) {
			console.error('Error fetching films:', err);
			setError(err.message || 'Failed to load films');
			setFilms([]);
		} finally {
			setLoading(false);
		}
	}, [pageSize]);

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1);
		fetchFilms(currentPage);
	}, [fetchFilms, currentPage]);

	const handleNextPage = useCallback(() => {
		if (pagination && pagination.hasNextPage) {
			fetchFilms(currentPage + 1);
		}
	}, [fetchFilms, currentPage, pagination]);

	const handlePrevPage = useCallback(() => {
		if (pagination && pagination.hasPrevPage) {
			fetchFilms(currentPage - 1);
		}
	}, [fetchFilms, currentPage, pagination]);

	const handlePageSizeChange = useCallback((newSize) => {
		setPageSize(newSize);
		// Reset to page 1 when changing page size
		fetchFilms(1, newSize);
	}, [fetchFilms]);

	useEffect(() => {
		fetchFilms();
	}, [fetchFilms]);

	// Filter films based on search query
	const filteredFilms = useMemo(() => {
		if (!debouncedSearchQuery.trim()) {
			return films;
		}

		const query = debouncedSearchQuery.toLowerCase();
		return films.filter(film => {
			return (
				film.title?.toLowerCase().includes(query) ||
				film.plot?.toLowerCase().includes(query) ||
				film.directors?.some(director => director.name?.toLowerCase().includes(query)) ||
				film.writers?.some(writer => writer.name?.toLowerCase().includes(query)) ||
				film.genres?.some(genre => genre.toLowerCase().includes(query)) ||
				film.actors?.some(actor => actor.actorName?.toLowerCase().includes(query))
			);
		});
	}, [films, debouncedSearchQuery]);

	// Memoize the films component props to prevent unnecessary re-renders
	const filmsProps = useMemo(() => ({
		films: filteredFilms,
		loading,
		pagination,
		currentPage,
		pageSize,
		onNextPage: handleNextPage,
		onPrevPage: handlePrevPage,
		onPageSizeChange: handlePageSizeChange,
	}), [filteredFilms, loading, pagination, currentPage, pageSize, handleNextPage, handlePrevPage, handlePageSizeChange]);

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

	if (filteredFilms.length === 0 && debouncedSearchQuery.trim()) {
		return (
			<div className="no-search-results" role="status" aria-live="polite">
				<div className="no-search-results__container">
					<div className="no-search-results__icon" aria-hidden="true">
						🔍
					</div>
					<h2 className="no-search-results__title">No Films Found</h2>
					<p className="no-search-results__message">
						No films match your search for "{debouncedSearchQuery}". Try adjusting your search terms.
					</p>
				</div>
			</div>
		);
	}

	return <Films {...filmsProps} />;
};

FilmsContainer.propTypes = {
	// No props needed for this component
};

export default FilmsContainer;
