import React from 'react';
import PropTypes from 'prop-types';
import './FilmInfoCard.scss';

const FilmInfoCard = ({ film }) => {
	const { directors, writers, genres, rated, idIMDB, title } = film;

	const nodeBuilder = array => {
		return array.map((item, index) => {
			if (index < array.length - 1) {
				return <span key={`${item.name || item}-${index}`}>{item.name || item}, </span>;
			}
			return <span key={`${item.name || item}-${index}`}>{item.name || item}</span>;
		});
	};

	const directorNode = nodeBuilder(directors);
	const writerNode = nodeBuilder(writers);
	const genreNode = nodeBuilder(genres);

	return (
		<div className="film-info-card">
			<div className="info-section">
				<div className="info-item">
					<div className="info-label">
						<span className="info-icon">🎬</span>
						Directors
					</div>
					<div className="info-value">{directorNode}</div>
				</div>

				<div className="info-item">
					<div className="info-label">
						<span className="info-icon">✍️</span>
						Writers
					</div>
					<div className="info-value">{writerNode}</div>
				</div>

				<div className="info-item">
					<div className="info-label">
						<span className="info-icon">🏷️</span>
						Genres
					</div>
					<div className="info-value">{genreNode}</div>
				</div>

				<div className="info-item">
					<div className="info-label">
						<span className="info-icon">📺</span>
						Rating
					</div>
					<div className="info-value">
						<span className="rating-badge">{rated}</span>
					</div>
				</div>

				<div className="info-item">
					<div className="info-label">
						<span className="info-icon">🔗</span>
						IMDB
					</div>
					<div className="info-value">
						<a 
							href={`http://www.imdb.com/title/${idIMDB}`} 
							target="_blank" 
							rel="noreferrer"
							className="imdb-link"
						>
							View on IMDB
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

FilmInfoCard.propTypes = {
	film: PropTypes.shape({
		directors: PropTypes.arrayOf(
			PropTypes.shape({
				name: PropTypes.string,
			})
		),
		writers: PropTypes.arrayOf(
			PropTypes.shape({
				name: PropTypes.string,
			})
		),
		genres: PropTypes.arrayOf(PropTypes.string),
		rated: PropTypes.string,
		idIMDB: PropTypes.string,
		title: PropTypes.string,
	}).isRequired,
};

export default FilmInfoCard;
