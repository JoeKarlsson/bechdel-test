import React from 'react';
import PropTypes from 'prop-types';
import './Hero.scss';

const Hero = ({ title, bechdelResults, images }) => {
	const { pass, bechdelScore, totalLinesFemaleDialogue, totalLinesMaleDialogue, numScenesPass, numScenesDontPass, numOfFemalesCharsWithDialogue } = bechdelResults;
	const icon = pass ? '✓' : '✗';
	const iconClass = pass ? 'pass-icon' : 'fail-icon';

	// Calculate quick stats
	const totalLines = totalLinesFemaleDialogue + totalLinesMaleDialogue;
	const femaleDialoguePercent = totalLines > 0
		? Math.round((totalLinesFemaleDialogue / totalLines) * 100)
		: 0;

	const totalScenes = numScenesPass + numScenesDontPass;
	const passScenePercent = totalScenes > 0
		? Math.round((numScenesPass / totalScenes) * 100)
		: 0;

	return (
		<div className="film-hero">
			<img className="film-image" src={images.backdrop} alt={title} />
			<span className="film-hero-title">
				<h4>{title}</h4>
				<h3>
					<span className={`bechdel-status ${iconClass}`}>
						<span className="status-icon">{icon}</span>
						Bechdel Pass: {pass.toString().toUpperCase()}
					</span>
				</h3>

				{/* Quick Stats Badges */}
				<div className="hero-quick-stats">
					<div className="stat-badge stat-badge--score">
						<span className="stat-label">Bechdel Score</span>
						<span className="stat-value">{bechdelScore}/3</span>
					</div>

					<div className="stat-badge stat-badge--dialogue">
						<span className="stat-label">Female Dialogue</span>
						<span className="stat-value">{femaleDialoguePercent}%</span>
					</div>

					{totalScenes > 0 && (
						<div className="stat-badge stat-badge--scenes">
							<span className="stat-label">Scenes Passing</span>
							<span className="stat-value">{passScenePercent}%</span>
						</div>
					)}

					{numOfFemalesCharsWithDialogue > 0 && (
						<div className="stat-badge stat-badge--characters">
							<span className="stat-label">Female Characters</span>
							<span className="stat-value">{numOfFemalesCharsWithDialogue}</span>
						</div>
					)}
				</div>
			</span>
		</div>
	);
};

Hero.propTypes = {
	title: PropTypes.string.isRequired,
	bechdelResults: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
	images: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};


export default Hero;
