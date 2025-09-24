import React, { useState, useEffect } from 'react';
import Films from './Films';
import api from '../../helper/api';

const FilmsContainer = () => {
	const [films, setFilms] = useState([]);
	const [loading, setLoading] = useState(false);

	const getAllFilms = () => {
		const url = '/api/film';
		const options = {
			method: 'GET',
		};

		setLoading(true);

		api(url, options)
			.then(data => {
				if (data.errMsg) {
					setLoading(false);
					setFilms([]);
				} else {
					setFilms(data);
					setLoading(false);
				}
			})
			.catch(err => {
				console.error(err);
				setLoading(false);
				setFilms([]);
			});
	};

	useEffect(() => {
		getAllFilms();
	}, []);

	if (films.length === 0) {
		return <div>No Films Have Been Added Yet</div>;
	}
	return <Films films={films} loading={loading} />;
};

FilmsContainer.propTypes = {};

FilmsContainer.defaultProps = {};

export default FilmsContainer;
