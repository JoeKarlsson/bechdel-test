import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import FilmList from './FilmList/FilmList';
import Loading from '../../shared/Loading/Loading';
import Error from '../../shared/Error/Error';

class Films extends Component {
	renderFilms() {
		const { films } = this.props;

		return (
			<div className="films">
				<div className="row">
					<ErrorBoundary>
						<FilmList films={films} />
					</ErrorBoundary>
				</div>
			</div>
		);
	}

	render() {
		const { films, loading } = this.props;

		if (loading) {
			return <Loading />;
		} else if (films) {
			return this.renderFilms();
		}
		return <Error />;
	}
}

Films.propTypes = {
	films: PropTypes.array, // eslint-disable-line react/forbid-prop-types
	loading: PropTypes.bool,
};

Films.defaultProps = {
	films: [],
	loading: false,
};

export default Films;
