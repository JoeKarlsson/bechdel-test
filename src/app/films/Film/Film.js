import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Hero from './Hero/Hero';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import BechdelResults from './BechdelResults/BechdelResults';
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

class Film extends Component {
	renderFilm() {
		const {
			directors,
			writers,
			genres,
			title,
			bechdelResults,
			images,
			plot,
			idIMDB,
			rated,
		} = this.props.film;

		const directorNode = nodeBuilder(directors);
		const writerNode = nodeBuilder(writers);
		const genreNode = genreNodeBuilder(genres);

		return (
			<div className="filmInfo">
				<ErrorBoundary>
					<Hero title={title} bechdelResults={bechdelResults} images={images} />
					<div className="plot container">
						<p>{plot}</p>
						<span className="results container">
							<div className="filmData">
								<span className="catName">Directors:</span> {directorNode}
								<br />
								<span className="catName">Writers:</span> {writerNode} <br />
								<span className="catName">Genre:</span> {genreNode}
								<br />
								<span className="catName">Rated:</span> {rated}
								<br />
								<span className="catName">IMDB:</span>{' '}
								<a href={`http://www.imdb.com/title/${idIMDB}`} target="_blank">
									{title}
								</a>
								<br />
							</div>
							<BechdelResults bechdelResults={bechdelResults} />
						</span>
						<Link to="/">
							<button>All Films</button>
						</Link>
					</div>
				</ErrorBoundary>
			</div>
		);
	}

	render() {
		const { film, loading } = this.props;

		if (loading) {
			return <Loading />;
		} else if (isValidFilm(film)) {
			return this.renderFilm();
		}
		return <Error />;
	}
}

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
			pass: PropTypes.string,
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

Film.defaultProps = {
	film: {
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
			pass: 'false',
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
	loading: true,
};

export default Film;
