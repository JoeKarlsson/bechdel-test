import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import FilmList from './FilmList/FilmList';
import Loading from '../../shared/Loading/Loading';
import Error from '../../shared/Error/Error';
import { useSearch } from '../../shared/SearchContext/SearchContext';
import './Films.scss';

const Films = ({ films = [], loading = false }) => {
	const { debouncedSearchQuery } = useSearch();

	const renderFilms = () => {
		return (
			<div className="films">
				{debouncedSearchQuery.trim() && (
					<div className="search-results-header">
						<p className="search-results-count">
							Found {films.length} film{films.length !== 1 ? 's' : ''} matching "{debouncedSearchQuery}"
						</p>
					</div>
				)}
				<div className="row">
					<ErrorBoundary>
						<FilmList films={films} />
					</ErrorBoundary>
				</div>
			</div>
		);
	};

	if (loading) {
		return <Loading />;
	} if (films) {
		return renderFilms();
	}
	return <Error />;
};

Films.propTypes = {
	films: PropTypes.array, // eslint-disable-line react/forbid-prop-types
	loading: PropTypes.bool,
};


export default Films;
