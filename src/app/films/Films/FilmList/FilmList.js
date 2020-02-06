import React from 'react';
import PropTypes from 'prop-types';
import FilmItem from '../FilmItem/FilmItem';
import './FilmList.scss';

const FilmList = props => {
	console.log(props.films.length);
	if (props.films.length === 0) {
		return <div>No Films Have Been Added Yet</div>;
	}
	const filmListNode = props.films.map(filmData => {
		return (
			<FilmItem film={filmData} key={filmData._id} className="filmListNode" />
		);
	});

	const numFillerNodes = props.films.length % 6;

	const arr = new Array(numFillerNodes);
	const fillerNode = arr.map(() => {
		return <div className="fillerNode" />;
	});

	return (
		<div className="FilmList">
			{filmListNode}
			{fillerNode}
		</div>
	);
};

FilmList.propTypes = {
	films: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

FilmList.defaultProps = {
	films: [],
};

export default FilmList;
