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

	// Calculate additional metrics
	const year = film.year || film.bechdelData?.year;
	const {rating} = film;
	const {rated} = film;

	// Calculate female dialogue percentage
	const totalLines = (film.bechdelResults?.totalLinesFemaleDialogue || 0) +
					   (film.bechdelResults?.totalLinesMaleDialogue || 0);
	const femaleDialoguePercent = totalLines > 0
		? Math.round((film.bechdelResults?.totalLinesFemaleDialogue / totalLines) * 100)
		: null;

	// Get top 2 genres
	const topGenres = film.genres?.slice(0, 2) || [];

	// Calculate pass percentage
	const totalScenes = (film.bechdelResults?.numScenesPass || 0) +
						(film.bechdelResults?.numScenesDontPass || 0);
	const passPercent = totalScenes > 0
		? Math.round((film.bechdelResults?.numScenesPass / totalScenes) * 100)
		: null;

	return (
		<div className="filmItem">
			<li>
				<div className="film-poster-container">
					<Link to={filmUrl}>
						<img
							className="film-poster"
							src={film.images?.poster || '/default-poster.webp'}
							alt={displayTitle}
							loading="lazy"
							decoding="async"
						/>
						<div className="film-overlay">
							<div className="film-info">
								<h3 className="film-title">{highlightedTitle}</h3>
								<div className="film-meta">
									{year && <span className="meta-item year">{year}</span>}
									{rated && <span className="meta-item rated">{rated}</span>}
									{rating && <span className="meta-item rating">⭐ {rating}/10</span>}
								</div>
								{topGenres.length > 0 && (
									<div className="film-genres">
										{topGenres.map((genre, index) => (
											<span key={index} className="genre-tag">{genre}</span>
										))}
									</div>
								)}
								<div className="test-result">
									<span className={`test-icon ${passesTest ? 'pass' : 'fail'}`}>
										{testIcon}
									</span>
									<span className={`test-text ${passesTest ? 'pass' : 'fail'}`}>
										{passesTest ? 'Pass' : 'Fail'}
										{passPercent !== null && ` (${passPercent}%)`}
									</span>
								</div>
								{femaleDialoguePercent !== null && (
									<div className="dialogue-stat">
										💬 Female: {femaleDialoguePercent}%
									</div>
								)}
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
