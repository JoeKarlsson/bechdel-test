import React, { Component } from 'react';
import Films from './Films';
import api from '../../helper/api';

class FilmsContainer extends Component {
	constructor() {
		super();
		this.state = {
			films: [],
			loading: false,
		};
		this.getAllFilms = this.getAllFilms.bind(this);
	}

	componentDidMount() {
		this.getAllFilms();
	}

	getAllFilms() {
		const url = '/api/film';
		const options = {
			method: 'GET',
		};

		this.setState({
			loading: true,
		});

		api(url, options)
			.then(data => {
				this.setState({
					films: data,
					loading: false,
				});
			})
			.catch(err => {
				console.err(err);
				this.setState({
					loading: false,
				});
			});
	}

	render() {
		return <Films {...this.state} />;
	}
}

FilmsContainer.propTypes = {};

FilmsContainer.defaultProps = {};

export default FilmsContainer;
