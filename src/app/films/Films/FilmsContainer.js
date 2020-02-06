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
				console.log(data);
				if (data.errMsg) {
					this.setState({
						loading: false,
						films: [],
					});
				} else {
					this.setState({
						films: data,
						loading: false,
					});
				}
			})
			.catch(err => {
				console.err(err);
				this.setState({
					loading: false,
					films: [],
				});
			});
	}

	render() {
		if (this.state.films.length === 0) {
			return <div>No Films Have Been Added Yet</div>;
		}
		return <Films {...this.state} />;
	}
}

FilmsContainer.propTypes = {};

FilmsContainer.defaultProps = {};

export default FilmsContainer;
