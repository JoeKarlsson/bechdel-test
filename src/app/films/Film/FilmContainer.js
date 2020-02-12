import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Film from './Film';
import api from '../../helper/api';

class FilmContainer extends Component {
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
			loading: true,
		};

		this.getFilm = this.getFilm.bind(this);
	}

	componentDidMount() {
		try {
			this.getFilm();
		} catch (error) {
			console.log(error);
		}
	}

	getFilm() {
		const { id } = this.props.match.params;
		const url = `/api/film/${id}`;
		const options = {
			method: 'GET',
		};

		this.setState({
			loading: true,
		});

		api(url, options)
			.then(data => {
				// console.log(data);
				this.setState({
					film: data,
					loading: false,
				});
				return data;
			})
			.catch(err => {
				console.error(err);
				this.setState({
					loading: false,
				});
			});
	}

	render() {
		return <Film {...this.state} />;
	}
}

FilmContainer.propTypes = {
	match: PropTypes.shape({
		params: PropTypes.shape({
			id: PropTypes.string,
		}),
	}).isRequired,
};

FilmContainer.defaultProps = {};

export default FilmContainer;
