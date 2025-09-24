import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';
import FilmList from './FilmList/FilmList';
import Loading from '../../shared/Loading/Loading';
import Error from '../../shared/Error/Error';

const Films = ({ films = [], loading = false }) => {
	const renderFilms = () => {
		return (
			<div className="films">
				<div className="row">
					<ErrorBoundary>
						<FilmList films={films} />
					</ErrorBoundary>
				</div>
			</div>
		);
	};

	if (loading) {
		return <Loading />;
	} else if (films) {
		return renderFilms();
	}
	return <Error />;
};

Films.propTypes = {
	films: PropTypes.array, // eslint-disable-line react/forbid-prop-types
	loading: PropTypes.bool,
};


export default Films;
