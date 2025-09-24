import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { highlightSearchTerm } from '../../../helper/searchHighlight';
import { useSearch } from '../../../shared/SearchContext/SearchContext';
import './FilmItem.scss';

const FilmItem = ({ film = {
	title: 'Movie Title',
	images: {
		poster: 'Movie Poster URL',
	},
	id: '123456',
} }) => {
	const { debouncedSearchQuery } = useSearch();
	const filmUrl = `/film/${film._id}`;
	const passesTest = film.bechdelResults?.pass;
	const testIcon = passesTest ? '✓' : '✗';
	const displayTitle = film.title || '';
	const highlightedTitle = highlightSearchTerm(displayTitle, debouncedSearchQuery);

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
								<h3 className="film-title">{highlightedTitle}</h3>
								<div className="test-result">
									<span className={`test-icon ${passesTest ? 'pass' : 'fail'}`}>
										{testIcon}
									</span>
									<span className={`test-text ${passesTest ? 'pass' : 'fail'}`}>
										{passesTest ? 'pass' : 'fail'}
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

export default FilmItem;
