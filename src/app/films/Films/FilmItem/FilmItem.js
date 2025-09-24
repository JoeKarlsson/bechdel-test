import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toTitleCase } from '../../../helper/titleCase';
import './FilmItem.scss';

const FilmItem = props => {
	const { film } = props;
	const filmUrl = `/film/${film._id}`;
	const passesTest = film.bechdelResults?.pass;
	const testIcon = passesTest ? '✓' : '✗';
	const displayTitle = film.title ? toTitleCase(film.title) : '';

	return (
		<div className="filmItem">
			<li>
				<div className="film-poster-container">
					<Link to={filmUrl}>
						<img
							className="film-poster"
							src={film.images.poster}
							alt={displayTitle}
						/>
						<div className="film-overlay">
							<div className="film-info">
								<h3 className="film-title">Help</h3>
								<div className="test-result">
									<span className={`test-icon ${passesTest ? 'pass' : 'fail'}`}>
										{testIcon}
									</span>
								</div>
							</div>
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
