import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import FilmList from './FilmList/FilmList';
import FilterBar from './FilterBar';
import Loading from '../../shared/Loading/Loading';
import Error from '../../shared/Error/Error';
import { useSearch } from '../../shared/SearchContext/SearchContext';
import './Films.scss';

const Films = ({
	films = [],
	loading = false,
	pagination = null,
	currentPage = 1,
	pageSize = 10,
	sortBy = 'popularity',
	filters = {},
	onNextPage = null,
	onPrevPage = null,
	onPageSizeChange = null,
	onSortChange = null,
	onFilterChange = null
}) => {
	const { debouncedSearchQuery } = useSearch();

	const renderFilms = () => {
		return (
			<div className="films">
				{!debouncedSearchQuery.trim() && onFilterChange && (
					<FilterBar
						onFilterChange={onFilterChange}
						currentFilters={filters}
						pagination={pagination}
						currentPage={currentPage}
						pageSize={pageSize}
						sortBy={sortBy}
						onNextPage={onNextPage}
						onPrevPage={onPrevPage}
						onPageSizeChange={onPageSizeChange}
						onSortChange={onSortChange}
					/>
				)}

				{debouncedSearchQuery.trim() && (
					<div className="search-results-header">
						<p className="search-results-count">
							Found {films.length} film{films.length !== 1 ? 's' : ''} matching "{debouncedSearchQuery}"
						</p>
					</div>
				)}
				<div className="row">
					<ErrorBoundary>
						<FilmList
							films={films}
							pagination={pagination}
							currentPage={currentPage}
							pageSize={pageSize}
							sortBy={sortBy}
							onNextPage={onNextPage}
							onPrevPage={onPrevPage}
							onPageSizeChange={onPageSizeChange}
							onSortChange={onSortChange}
						/>
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
	pagination: PropTypes.object,
	currentPage: PropTypes.number,
	pageSize: PropTypes.number,
	sortBy: PropTypes.string,
	filters: PropTypes.object,
	onNextPage: PropTypes.func,
	onPrevPage: PropTypes.func,
	onPageSizeChange: PropTypes.func,
	onSortChange: PropTypes.func,
	onFilterChange: PropTypes.func,
};


export default Films;
