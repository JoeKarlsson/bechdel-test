import React, { Component } from 'react';
import Hero from './Hero/Hero';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import FilmList from './FilmList/FilmList';
import api from '../../helper/api';
// import './Films.scss';

class Films extends Component {
	constructor() {
		super();
		this.state = {
			films: [],
		};
		this.getAllFilms = this.getAllFilms.bind(this);
	}

	componentDidMount() {
		this.getAllFilms();
	}

	getAllFilms() {
		const url = '/api/film/';
		const options = {
			method: 'GET',
		};

		api(url, options).then(data => {
			this.setState({
				films: data,
			});
		});
	}

	render() {
		return (
			<div className="films">
				<Hero />
				<div className="row">
					<ErrorBoundary>
						<FilmList films={this.state.films} />
					</ErrorBoundary>
				</div>
			</div>
		);
	}
}

Films.propTypes = {};

Films.defaultProps = {};

export default Films;
