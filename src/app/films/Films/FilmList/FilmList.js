import React from 'react';
import PropTypes from 'prop-types';
import FilmItem from '../FilmItem/FilmItem';
import './FilmList.scss';

const FilmList = (props) => {
	const filmListNode = props.films.map((filmData) => {
		return (
			<FilmItem
				film={filmData}
				key={filmData._id}
				className="filmListNode"
			/>
		);
	});


	return (
		<div className="FilmList">
			{filmListNode}
		</div>
	);
};

FilmList.propTypes = {
	films: PropTypes.array
};

FilmList.defaultProps = {
	films: [],
};

export default FilmList;
