import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FilmItem from '../FilmItem/FilmItem';
import './FilmList.scss';

const FilmList = ({
	films = [],
	pagination = null,
	currentPage = 1,
	pageSize = 10,
	onNextPage = null,
	onPrevPage = null,
	onPageSizeChange = null
}) => {
	const [filmsPerRow, setFilmsPerRow] = useState(5);

	useEffect(() => {
		const updateFilmsPerRow = () => {
			const width = window.innerWidth;
			if (width <= 480) {
				setFilmsPerRow(2); // 2 films per row on mobile
			} else if (width <= 768) {
				setFilmsPerRow(3); // 3 films per row on tablets
			} else {
				setFilmsPerRow(5); // 5 films per row on desktop
			}
		};

		updateFilmsPerRow();
		window.addEventListener('resize', updateFilmsPerRow);
		return () => window.removeEventListener('resize', updateFilmsPerRow);
	}, []);

	if (films.length === 0) {
		return null; // Let the parent component handle empty state
	}
	const filmListNode = films.map(filmData => {
		return (
			<FilmItem film={filmData} key={filmData._id} className="filmListNode" />
		);
	});

	const numFillerNodes = (filmsPerRow - (films.length % filmsPerRow)) % filmsPerRow;

	const fillerNodes = Array.from({ length: numFillerNodes }, (_, index) => (
		<div key={`filler-${index}`} className="fillerNode" />
	));

	const pageSizeOptions = [10, 20, 50, 100];

	return (
		<div className="FilmList">
			<div className="FilmList__container">
				{filmListNode}
				{fillerNodes}
			</div>
			{pagination && (
				<div className="FilmList__pagination-section">
					<div className="FilmList__pagination-bar">
						<div className="FilmList__pagination-controls">
							<div className="FilmList__page-size-selector">
								<label htmlFor="page-size-select">Films per page:</label>
								<select
									id="page-size-select"
									value={pageSize}
									onChange={(e) => onPageSizeChange && onPageSizeChange(parseInt(e.target.value, 10))}
									className="FilmList__page-size-select"
								>
									{pageSizeOptions.map(size => (
										<option key={size} value={size}>{size}</option>
									))}
								</select>
							</div>
							<div className="FilmList__page-info">
								Page {currentPage} of {pagination.totalPages} ({pagination.totalCount} total films)
							</div>
							<div className="FilmList__navigation">
								{pagination.hasPrevPage && onPrevPage && (
									<button
										className="FilmList__nav-button FilmList__prev-button"
										onClick={onPrevPage}
										type="button"
									>
										← Previous
									</button>
								)}
								{pagination.hasNextPage && onNextPage && (
									<button
										className="FilmList__nav-button FilmList__next-button"
										onClick={onNextPage}
										type="button"
									>
										Next →
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

FilmList.propTypes = {
	films: PropTypes.array, // eslint-disable-line react/forbid-prop-types
	pagination: PropTypes.object,
	currentPage: PropTypes.number,
	pageSize: PropTypes.number,
	onNextPage: PropTypes.func,
	onPrevPage: PropTypes.func,
	onPageSizeChange: PropTypes.func,
};


export default FilmList;
