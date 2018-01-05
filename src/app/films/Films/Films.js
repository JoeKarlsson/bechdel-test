import React, { Component } from 'react';
import Hero from './Hero/Hero';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import FilmList from './FilmList/FilmList';
import api from '../../helper/api';
// import './Films.scss';

class Films extends Component {
	static renderLoading() {
		return <div>Loading...</div>;
	}

	static renderError() {
		return <div>Im sorry! Please try again.</div>;
	}

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
		const url = '/api/filmasdas/';
		const options = {
			method: 'GET',
		};

		this.setState({
			loading: true,
		});

		api(url, options).then(data => {
			this.setState({
				films: data,
				loading: false,
			}).catch(() => {
				this.setState({
					loading: false,
				});
			});
		});
	}

	renderFilms() {
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

	render() {
		if (this.state.loading) {
			return Films.renderLoading();
		} else if (this.state.films) {
			return Films.renderFilms();
		}
		return this.renderError();
	}
}

Films.propTypes = {};

Films.defaultProps = {};

export default Films;
