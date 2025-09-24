import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Hero from './Hero/Hero';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import BechdelResults from './BechdelResults/BechdelResults';
import BechdelCharts from './BechdelCharts';
import FilmInfoCard from './FilmInfoCard';
import PlotSection from './PlotSection';
import ScriptTimeline from './ScriptTimeline';
import Loading from '../../shared/Loading/Loading';
import Error from '../../shared/Error/Error';
import hash from '../../helper/hash';
import './Film.scss';

const isLastItem = (item, array) => {
	return item !== array[array.length - 1];
};

const genreNodeBuilder = array => {
	return array.map(item => {
		if (isLastItem(item, array)) {
			return <span key={hash(item.toString())}>{item} | </span>;
		}
		return <span key={hash(item)}>{item}</span>;
	});
};

const nodeBuilder = array => {
	return array.map(item => {
		if (isLastItem(item, array)) {
			return <span key={hash(item.toString())}>{item.name} | </span>;
		}
		return <span key={hash(item)}>{item.name}</span>;
	});
};

const isValidFilm = film => {
	return film.title !== '';
};

const Film = ({
	film = {
		title: '',
		images: {
			poster: '',
			backdrop: '',
		},
		plot: '',
		idIMDB: '',
		rated: '',
		directors: [{ name: '' }],
		writers: [{ name: '' }],
		genres: [],
		bechdelResults: {
			pass: false,
			bechdelScore: 0,
			numScenesPass: 0,
			scenesThatPass: [],
			numScenesDontPass: 0,
			numOfFemalesChars: 0,
			numOfMaleChars: 0,
			numOfFemalesCharsWithDialogue: 0,
			numOfMaleCharsWithDialogue: 0,
			totalLinesFemaleDialogue: 0,
			totalLinesMaleDialogue: 0,
		},
	},
	loading = true
}) => {
	const renderFilm = () => {
		const {
			title,
			bechdelResults,
			images,
			plot,
			actors,
		} = film;

		return (
			<div className="filmInfo">
				<ErrorBoundary>
					<Hero title={title} bechdelResults={bechdelResults} images={images} />
					
					<div className="film-content">
						<div className="content-grid">
							<div className="left-column">
								<PlotSection plot={plot} />
								<FilmInfoCard film={film} />
							</div>
							
							<div className="right-column">
								<BechdelCharts bechdelResults={bechdelResults} />
								<div className="detailed-results">
									<h3>Detailed Bechdel Analysis</h3>
									<BechdelResults bechdelResults={bechdelResults} />
								</div>
							</div>
						</div>
						
						<div className="timeline-section">
							<ScriptTimeline bechdelResults={bechdelResults} characters={actors} />
						</div>
						
						<div className="navigation-section">
							<Link to="/" className="back-button">
								<span className="button-icon">←</span>
								Back to All Films
							</Link>
						</div>
					</div>
				</ErrorBoundary>
			</div>
		);
	};

	if (loading) {
		return <Loading />;
	} if (isValidFilm(film)) {
		return renderFilm();
	}
	return <Error />;
};

Film.propTypes = {
	film: PropTypes.shape({
		title: PropTypes.string,
		images: PropTypes.shape({
			poster: PropTypes.string,
			backdrop: PropTypes.string,
		}),
		plot: PropTypes.string,
		idIMDB: PropTypes.string,
		rated: PropTypes.string,
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
		bechdelResults: PropTypes.shape({
			pass: PropTypes.bool,
			bechdelScore: PropTypes.number,
			numScenesPass: PropTypes.number,
			scenesThatPass: PropTypes.arrayOf(PropTypes.string),
			numScenesDontPass: PropTypes.number,
			numOfFemalesChars: PropTypes.number,
			numOfMaleChars: PropTypes.number,
			numOfFemalesCharsWithDialogue: PropTypes.number,
			numOfMaleCharsWithDialogue: PropTypes.number,
			totalLinesFemaleDialogue: PropTypes.number,
			totalLinesMaleDialogue: PropTypes.number,
		}),
	}),
	loading: PropTypes.bool,
};


export default Film;
