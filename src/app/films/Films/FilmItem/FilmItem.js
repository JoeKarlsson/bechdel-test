import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './FilmItem.scss';

const FilmItem = props => {
	const { film } = props;
	const filmUrl = `/film/${film._id}`;

	return (
		<div className="filmItem">
			<li>
				<div>
					<Link to={filmUrl}>
						<img src={film.images.poster} alt={film.title} />
						<div className="description">
							<h2 className="filmItem_title">{film.title}</h2>
							<p>2015</p>
						</div>
					</Link>
				</div>
			</li>
		</div>
	);
};

FilmItem.propTypes = {
	film: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

FilmItem.defaultProps = {
	film: {
		title: 'Movie Title',
		images: {
			poster: 'Movie Poster URL',
		},
		id: '123456',
	},
};

export default FilmItem;
