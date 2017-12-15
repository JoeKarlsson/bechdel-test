import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import BechdelResults from './BechdelResults/BechdelResults';
import getAllFilmData from '../../helper/getAllFilms';
import hash from '../../helper/hash';
import './Film.scss';

class Film extends React.Component {
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
	}

	componentDidMount() {
		const { id } = this.props.match.params;

		getAllFilmData(id)
			.then((data) => {
				this.setState({
					film: data,
				});
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

		const directorNode = directors.map((director) => {
			if (director.name === directors[directors.length - 1].name) {
				return <span key={director.id}>{director.name}</span>;
			}
			return <span key={director.id}>{director.name} & </span>;
		});
		const writerNode = writers.map((writer) => {
			if (writer.name !== writers[writers.length - 1].name) {
				return <span key={writer.id}>{writer.name} & </span>;
			}
			return <span key={writer.id}>{writer.name}</span>;
		});
		const genreNode = genres.map((genre) => {
			if (genre !== genres[genres.length - 1]) {
				return <span key={hash(genre)}>{genre} | </span>;
			}
			return <span key={hash(genre)}>{genre}</span>;
		});

		return (
			<div className="filmInfo">
				<ErrorBoundary>
					<h1>
						{title}
					</h1>
					<h3>
						Bechdel Pass:{' '}
						{bechdelResults.pass.toString().toUpperCase()}
					</h3>
					<p>
						Bechdel Score: {bechdelResults.bechdelScore} of 3
					</p>
					<img
						src={images.backdrop}
						alt={title}
					/>
					<div className="plot">
						<p>{this.state.film.plot}</p>
					</div>
					<span className="results">
						<div className="filmData">
							<span className="catName">Directors:</span> {directorNode}
							<br />
							<span className="catName">Writers:</span> {writerNode} <br />
							<span className="catName">Genre:</span> {genreNode}
							<br />
							<span className="catName">Rated:</span>{' '}
							{this.state.film.rated}
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
