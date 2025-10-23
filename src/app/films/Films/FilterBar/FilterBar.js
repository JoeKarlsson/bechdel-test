import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './FilterBar.scss';

const FilterBar = ({
	onFilterChange,
	currentFilters = {},
	// Pagination props
	pagination = null,
	currentPage = 1,
	pageSize = 20,
	sortBy = 'popularity',
	onNextPage = null,
	onPrevPage = null,
	onPageSizeChange = null,
	onSortChange = null
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [filters, setFilters] = useState({
		pass: currentFilters.pass || '',
		genres: currentFilters.genres || [],
		yearMin: currentFilters.yearMin || '',
		yearMax: currentFilters.yearMax || '',
		minRating: currentFilters.minRating || '',
	});

	// Available genres (you can fetch this from API if needed)
	const availableGenres = [
		'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
		'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
		'History', 'Horror', 'Music', 'Musical', 'Mystery',
		'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
	];

	// Sort and page size options
	const sortOptions = [
		{ value: 'popularity', label: 'Most Popular' },
		{ value: 'rating', label: 'Highest Rated' },
		{ value: 'newest', label: 'Recently Added' },
		{ value: 'oldest', label: 'Oldest First' },
		{ value: 'title-asc', label: 'Title (A-Z)' },
		{ value: 'title-desc', label: 'Title (Z-A)' },
		{ value: 'year-desc', label: 'Year (Newest)' },
		{ value: 'year-asc', label: 'Year (Oldest)' },
		{ value: 'bechdel-score', label: 'Bechdel Score' }
	];

	const pageSizeOptions = [20, 10, 30, 50, 100];

	const handleFilterChange = (filterName, value) => {
		const newFilters = { ...filters, [filterName]: value };
		setFilters(newFilters);

		// Notify parent component
		if (onFilterChange) {
			onFilterChange(newFilters);
		}
	};

	const handleGenreToggle = (genre) => {
		const newGenres = filters.genres.includes(genre)
			? filters.genres.filter(g => g !== genre)
			: [...filters.genres, genre];

		handleFilterChange('genres', newGenres);
	};

	const clearAllFilters = () => {
		const clearedFilters = {
			pass: '',
			genres: [],
			yearMin: '',
			yearMax: '',
			minRating: '',
		};
		setFilters(clearedFilters);
		if (onFilterChange) {
			onFilterChange(clearedFilters);
		}
	};

	const getActiveFilterCount = () => {
		let count = 0;
		if (filters.pass !== '') count++;
		if (filters.genres.length > 0) count += filters.genres.length;
		if (filters.yearMin || filters.yearMax) count++;
		if (filters.minRating) count++;
		return count;
	};

	const activeCount = getActiveFilterCount();

	return (
		<div className="filter-bar">
			<div className="filter-bar__header">
				<button
					type="button"
					className="filter-bar__toggle"
					onClick={() => setIsExpanded(!isExpanded)}
					aria-expanded={isExpanded}
				>
					<span className="filter-icon">🔍</span>
					<span className="filter-text">
						Filters
						{activeCount > 0 && (
							<span className="filter-badge">{activeCount}</span>
						)}
					</span>
					<span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
						▼
					</span>
				</button>

				{activeCount > 0 && (
					<button
						type="button"
						className="filter-bar__clear"
						onClick={clearAllFilters}
					>
						Clear All
					</button>
				)}
			</div>

			{/* Pagination controls row */}
			{pagination && (
				<div className="filter-bar__controls">
					<div className="filter-bar__sort-selector">
						<label htmlFor="sort-select">Sort by:</label>
						<select
							id="sort-select"
							value={sortBy}
							onChange={(e) => onSortChange && onSortChange(e.target.value)}
							className="filter-bar__select"
						>
							{sortOptions.map(option => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</div>

					<div className="filter-bar__page-size-selector">
						<label htmlFor="page-size-select">Films per page:</label>
						<select
							id="page-size-select"
							value={pageSize}
							onChange={(e) => onPageSizeChange && onPageSizeChange(parseInt(e.target.value, 10))}
							className="filter-bar__select"
						>
							{pageSizeOptions.map(size => (
								<option key={size} value={size}>{size}</option>
							))}
						</select>
					</div>

					<div className="filter-bar__page-info">
						Page {currentPage} of {pagination.totalPages} ({pagination.totalCount} total films)
					</div>

					<div className="filter-bar__navigation">
						{pagination.hasPrevPage && onPrevPage && (
							<button
								className="filter-bar__nav-button filter-bar__prev-button"
								onClick={onPrevPage}
								type="button"
							>
								← Previous
							</button>
						)}
						{pagination.hasNextPage && onNextPage && (
							<button
								className="filter-bar__nav-button filter-bar__next-button"
								onClick={onNextPage}
								type="button"
							>
								Next →
							</button>
						)}
					</div>
				</div>
			)}

			{isExpanded && (
				<div className="filter-bar__content">
					{/* Bechdel Test Filter */}
					<div className="filter-group">
						<label className="filter-label">Bechdel Test</label>
						<div className="filter-options">
							<button
								type="button"
								className={`filter-chip ${filters.pass === '' ? 'active' : ''}`}
								onClick={() => handleFilterChange('pass', '')}
							>
								All Films
							</button>
							<button
								type="button"
								className={`filter-chip ${filters.pass === 'true' ? 'active' : ''}`}
								onClick={() => handleFilterChange('pass', 'true')}
							>
								✅ Pass
							</button>
							<button
								type="button"
								className={`filter-chip ${filters.pass === 'false' ? 'active' : ''}`}
								onClick={() => handleFilterChange('pass', 'false')}
							>
								❌ Fail
							</button>
						</div>
					</div>

					{/* Genre Filter */}
					<div className="filter-group">
						<label className="filter-label">
							Genres
							{filters.genres.length > 0 && (
								<span className="selected-count">({filters.genres.length} selected)</span>
							)}
						</label>
						<div className="filter-options genre-grid">
							{availableGenres.map(genre => (
								<button
									key={genre}
									type="button"
									className={`filter-chip ${filters.genres.includes(genre) ? 'active' : ''}`}
									onClick={() => handleGenreToggle(genre)}
								>
									{genre}
								</button>
							))}
						</div>
					</div>

					{/* Year Range Filter */}
					<div className="filter-group">
						<label className="filter-label">Year Range</label>
						<div className="filter-options year-range">
							<input
								type="number"
								className="filter-input"
								placeholder="Min (e.g., 1990)"
								value={filters.yearMin}
								onChange={(e) => handleFilterChange('yearMin', e.target.value)}
								min="1900"
								max={new Date().getFullYear()}
							/>
							<span className="range-separator">to</span>
							<input
								type="number"
								className="filter-input"
								placeholder="Max (e.g., 2024)"
								value={filters.yearMax}
								onChange={(e) => handleFilterChange('yearMax', e.target.value)}
								min="1900"
								max={new Date().getFullYear()}
							/>
						</div>
					</div>

					{/* Minimum Rating Filter */}
					<div className="filter-group">
						<label className="filter-label">
							Minimum IMDb Rating
							{filters.minRating && (
								<span className="selected-count">({filters.minRating}+)</span>
							)}
						</label>
						<div className="filter-options">
							<input
								type="range"
								className="filter-slider"
								min="0"
								max="10"
								step="0.5"
								value={filters.minRating || 0}
								onChange={(e) => handleFilterChange('minRating', e.target.value)}
							/>
							<div className="slider-labels">
								<span>0</span>
								<span>5</span>
								<span>10</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

FilterBar.propTypes = {
	onFilterChange: PropTypes.func.isRequired,
	currentFilters: PropTypes.shape({
		pass: PropTypes.string,
		genres: PropTypes.arrayOf(PropTypes.string),
		yearMin: PropTypes.string,
		yearMax: PropTypes.string,
		minRating: PropTypes.string,
	}),
	// Pagination props
	pagination: PropTypes.object,
	currentPage: PropTypes.number,
	pageSize: PropTypes.number,
	sortBy: PropTypes.string,
	onNextPage: PropTypes.func,
	onPrevPage: PropTypes.func,
	onPageSizeChange: PropTypes.func,
	onSortChange: PropTypes.func,
};

export default FilterBar;
