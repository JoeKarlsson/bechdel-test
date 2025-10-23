import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FilmItem from '../FilmItem/FilmItem';
import './FilmList.scss';

const FilmList = ({
	films = [],
	pagination = null,
	currentPage = 1,
	pageSize = 20,
	sortBy = 'popularity',
	onNextPage = null,
	onPrevPage = null,
	onPageSizeChange = null,
	onSortChange = null
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

	return (
		<div className="FilmList">
			<div className="FilmList__container">
				{filmListNode}
				{fillerNodes}
			</div>
		</div>
	);
};

FilmList.propTypes = {
	films: PropTypes.array, // eslint-disable-line react/forbid-prop-types
	pagination: PropTypes.object,
	currentPage: PropTypes.number,
	pageSize: PropTypes.number,
	sortBy: PropTypes.string,
	onNextPage: PropTypes.func,
	onPrevPage: PropTypes.func,
	onPageSizeChange: PropTypes.func,
	onSortChange: PropTypes.func,
};


export default FilmList;
