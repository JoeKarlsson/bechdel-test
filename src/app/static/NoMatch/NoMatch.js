import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FilmItem from '../../films/Films/FilmItem/FilmItem';
import Loading from '../../shared/Loading/Loading';
import './NoMatch.scss';

const NoMatch = () => {
	const [popularFilms, setPopularFilms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPopularFilms = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/film?sort=popularity&limit=6');

				if (!response.ok) {
					throw new Error('Failed to fetch popular films');
				}

				const data = await response.json();
				setPopularFilms(data.films || []);
			} catch (err) {
				console.error('Error fetching popular films:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchPopularFilms();
	}, []);

	return (
		<div className="no-match-page">
			<div className="no-match-container">
				<div className="no-match-content">
					<div className="error-code">404</div>
					<h1 className="error-title">Page Not Found</h1>
					<p className="error-description">
						Oops! The page you're looking for seems to have wandered off the set.
					</p>
					<div className="error-actions">
						<Link to="/" className="btn-primary">
							Go Home
						</Link>
						<Link to="/films" className="btn-secondary">
							Browse Films
						</Link>
					</div>
				</div>

				{/* Popular Films Section */}
				<div className="popular-films-section">
					<h2 className="section-title">
						<span className="section-icon">🎬</span>
						Or Explore Popular Films
					</h2>

					{loading && (
						<div className="loading-container">
							<Loading />
						</div>
					)}

					{error && (
						<div className="error-message">
							<p>Unable to load popular films. Please try again later.</p>
						</div>
					)}

					{!loading && !error && popularFilms.length > 0 && (
						<div className="films-grid">
							<ul className="film-list">
								{popularFilms.map((film) => (
									<FilmItem key={film._id} film={film} />
								))}
							</ul>
						</div>
					)}

					{!loading && !error && popularFilms.length === 0 && (
						<div className="no-films-message">
							<p>No films available at the moment.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default NoMatch;
