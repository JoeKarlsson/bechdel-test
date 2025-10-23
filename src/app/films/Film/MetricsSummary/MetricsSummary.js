import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './MetricsSummary.scss';

const Metric = ({ icon, value, label, color }) => (
	<div className="metric-card" style={{ '--metric-color': color }}>
		<div className="metric-icon" aria-hidden="true">{icon}</div>
		<div className="metric-content">
			<div className="metric-value">{value}</div>
			<div className="metric-label">{label}</div>
		</div>
	</div>
);

Metric.propTypes = {
	icon: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	label: PropTypes.string.isRequired,
	color: PropTypes.string,
};

const MetricsSummary = memo(({ bechdelResults, enhancedAnalytics }) => {
	if (!bechdelResults) {
		return null;
	}

	const {
		pass,
		numScenesPass = 0,
		numScenesDontPass = 0,
		numOfFemalesCharsWithDialogue = 0,
		numOfMaleCharsWithDialogue = 0,
		totalLinesFemaleDialogue = 0,
		totalLinesMaleDialogue = 0,
	} = bechdelResults;

	// Calculate metrics
	const totalScenes = numScenesPass + numScenesDontPass;
	const passRate = totalScenes > 0
		? `${Math.round((numScenesPass / totalScenes) * 100)}%`
		: '0%';

	const totalDialogueLines = totalLinesFemaleDialogue + totalLinesMaleDialogue;
	const femaleDialoguePercent = totalDialogueLines > 0
		? `${Math.round((totalLinesFemaleDialogue / totalDialogueLines) * 100)}%`
		: '0%';

	const agencyScore = enhancedAnalytics?.femaleAgency?.agencyScore || 'N/A';

	return (
		<div className="metrics-summary">
			<div className="metrics-grid">
				<Metric
					icon={pass ? '✅' : '❌'}
					value={pass ? 'Pass' : 'Fail'}
					label="Bechdel Test"
					color={pass ? '#2ecc71' : '#e74c3c'}
				/>
				<Metric
					icon="📊"
					value={passRate}
					label="Scene Pass Rate"
					color="#667eea"
				/>
				<Metric
					icon="👥"
					value={`${numOfFemalesCharsWithDialogue}/${numOfMaleCharsWithDialogue}`}
					label="Female/Male Chars"
					color="#3498db"
				/>
				<Metric
					icon="💬"
					value={femaleDialoguePercent}
					label="Female Dialogue"
					color="#9b59b6"
				/>
				{agencyScore !== 'N/A' && (
					<Metric
						icon="🎯"
						value={`${agencyScore}/10`}
						label="Agency Score"
						color="#f39c12"
					/>
				)}
			</div>
		</div>
	);
});

MetricsSummary.propTypes = {
	bechdelResults: PropTypes.shape({
		pass: PropTypes.bool,
		numScenesPass: PropTypes.number,
		numScenesDontPass: PropTypes.number,
		numOfFemalesCharsWithDialogue: PropTypes.number,
		numOfMaleCharsWithDialogue: PropTypes.number,
		totalLinesFemaleDialogue: PropTypes.number,
		totalLinesMaleDialogue: PropTypes.number,
	}).isRequired,
	enhancedAnalytics: PropTypes.shape({
		femaleAgency: PropTypes.object,
	}),
};

MetricsSummary.displayName = 'MetricsSummary';

export default MetricsSummary;
