import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Film from './Film';
import api from '../../helper/api';

const FilmContainer = () => {
	const { id } = useParams();
	const [film, setFilm] = useState({
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
	});
	const [loading, setLoading] = useState(true);

	const getFilm = () => {
		const url = `/api/film/${id}`;
		const options = {
			method: 'GET',
		};

		setLoading(true);

		api(url, options)
			.then(data => {
				setFilm(data);
				setLoading(false);
				return data;
			})
			.catch(err => {
				console.error(err);
				setLoading(false);
			});
	};

	useEffect(() => {
		try {
			getFilm();
		} catch (error) {
			console.log(error);
		}
	}, [id]);

	return <Film film={film} loading={loading} />;
};

export default FilmContainer;
