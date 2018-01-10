import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Hero from './Hero/Hero';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import BechdelResults from './BechdelResults/BechdelResults';
import api from '../../helper/api';
import hash from '../../helper/hash';
import './Film.scss';

class Film extends Component {
	constructor() {
		super();
		this.state = {
			film: {
				title: '',
				images: {
					poster: '',
					backdrop: '',
				},
				plot: '',
				directors: [],
				writers: [],
				genres: [],
				rated: '',
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
		};

		this.getFilm = this.getFilm.bind(this);
	}

	componentDidMount() {
		this.getFilm();
	}

	getFilm() {
		const { id } = this.props.match.params;
		const url = `/api/film/${id}`;
		const options = {
			method: 'GET',
		};

		api(url, options)
			.then(data => {
				this.setState({
					film: data,
				});
			})
			.catch(err => {
				console.error(err);
			});
	}

	render() {
		const {
			directors,
			writers,
			genres,
			title,
			bechdelResults,
			images,
		} = this.state.film;

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

		const directorNode = nodeBuilder(directors);
		const writerNode = nodeBuilder(writers);
		const genreNode = genreNodeBuilder(genres);

		return (
			<div className="filmInfo">
				<ErrorBoundary>
					<Hero title={title} bechdelResults={bechdelResults} images={images} />
					<div className="plot container">
						<p>{this.state.film.plot}</p>
						<span className="results container">
							<div className="filmData">
								<span className="catName">Directors:</span> {directorNode}
								<br />
								<span className="catName">Writers:</span> {writerNode} <br />
								<span className="catName">Genre:</span> {genreNode}
								<br />
								<span className="catName">Rated:</span> {this.state.film.rated}
								<br />
								<span className="catName">IMDB:</span>{' '}
								<a
									href={`http://www.imdb.com/title/${this.state.film.idIMDB}`}
									target="_blank"
								>
									{this.state.film.title}
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
}

Film.propTypes = {
	match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

Film.defaultProps = {};

export default Film;
