import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Film from './Film';
import api from '../../helper/api';

// Default film data structure
const defaultFilmData = {
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
	actors: [],
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
};

const FilmContainer = () => {
	const { id } = useParams();
	const [film, setFilm] = useState(defaultFilmData);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);

	const fetchFilm = useCallback(async () => {
		if (!id) {
			setError('No film ID provided');
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const url = `/api/film/${id}`;
			const options = {
				method: 'GET',
			};

			const data = await api(url, options);

			// Validate the response data
			if (!data || typeof data !== 'object') {
				throw new Error('Invalid film data received');
			}

			setFilm(data);
		} catch (err) {
			console.error('Error fetching film:', err);
			setError(err.message || 'Failed to load film data');
		} finally {
			setLoading(false);
		}
	}, [id]);

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1);
		fetchFilm();
	}, [fetchFilm]);

	useEffect(() => {
		fetchFilm();
	}, [fetchFilm]);

	// Memoize the film component props to prevent unnecessary re-renders
	const filmProps = useMemo(() => ({
		film,
		loading,
		error,
		onRetry: handleRetry,
		retryCount,
	}), [film, loading, error, handleRetry, retryCount]);

	return <Film {...filmProps} />;
};

FilmContainer.propTypes = {
	// No props needed as this component uses useParams
};

export default FilmContainer;
