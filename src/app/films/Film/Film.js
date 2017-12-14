import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import getAllFilmData from '../../helper/api';
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
		getAllFilmData(id);
	}

	render() {
		const directorNode = this.state.film.directors.map((director) => {
			const { directors } = this.state.film;
			if (director.name === directors[directors.length - 1].name) {
				return <span key={director.id}>{director.name}</span>;
			}
			return <span key={director.id}>{director.name} & </span>;
		});
		const writerNode = this.state.film.writers.map((writer) => {
			const { writers } = this.state.film;
			if (writer.name !== writers[writers.length - 1].name) {
				return <span key={writer.id}>{writer.name} & </span>;
			}
			return <span key={writer.id}>{writer.name}</span>;
		});
		const genreNode = this.state.film.genres.map((genre) => {
			const { genres } = this.state.film;
			if (genre !== genres[genres.length - 1]) {
				return <span key={hash(genre)}>{genre} | </span>;
			}
			return <span key={hash(genre)}>{genre}</span>;
		});

		return (
			<div className="filmInfo">
				<h1>{this.state.film.title}</h1>
				<h3>
				Bechdel Pass:{' '}
					{this.state.film.bechdelResults.pass.toString().toUpperCase()}
				</h3>
				<p>Bechdel Score: {this.state.film.bechdelResults.bechdelScore} of 3</p>
				<img
					src={this.state.film.images.backdrop}
					alt={this.state.film.title}
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
					<div className="bechdelResults">
						<span className="catName">Bechdel Score:</span>{' '}
						{this.state.film.bechdelResults.bechdelScore} of 3<br />
						<span className="catName">
						Number of Scenes that pass:
						</span>{' '}
						{this.state.film.bechdelResults.numScenesPass}
						<br />
						<span className="catName">
						Number of Scenes that dont pass:
						</span>{' '}
						{this.state.film.bechdelResults.numScenesDontPass}
						<br />
						<span className="catName">
						Number Of Females Characters:
						</span>{' '}
						{this.state.film.bechdelResults.numOfFemalesChars}
						<br />
						<span className="catName">
						Number Of Male Characters:
						</span>{' '}
						{this.state.film.bechdelResults.numOfMaleChars}
						<br />
						<span className="catName">
						Number of Females Characters With Dialogue:
						</span>{' '}
						{this.state.film.bechdelResults.numOfFemalesCharsWithDialogue}
						<br />
						<span className="catName">
						Number of Male Characters With Dialogue:
						</span>{' '}
						{this.state.film.bechdelResults.numOfMaleCharsWithDialogue}
						<br />
						<span className="catName">
						Total Lines of Female Dialogue:
						</span>{' '}
						{this.state.film.bechdelResults.totalLinesFemaleDialogue}
						<br />
						<span className="catName">
						Total Lines of Male Dialogue:
						</span>{' '}
						{this.state.film.bechdelResults.totalLinesMaleDialogue}
						<br />
					</div>
				</span>
				<Link to="/">
					<button>All Films</button>
				</Link>
			</div>
		);
	}
}

Film.propTypes = {
	match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

Film.defaultProps = {};

export default Film;
