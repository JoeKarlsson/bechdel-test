import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const IntersectionalityAnalysis = memo(({ data }) => {
	if (!data) {
		return null;
	}

	// Handle parse errors by showing raw response
	if (data.failed) {
		return (
			<div className="analysis-card intersectionality">
				<div className="card-header">
					<h4>Intersectionality Analysis</h4>
					<span className="card-icon">🌈</span>
				</div>
				<div className="card-content">
					<div className="error-section">
						<p className="error-message">Analysis failed: {data.error}</p>
					</div>
				</div>
			</div>
		);
	}

	// Handle parse errors by showing raw response
	if (data.parseError) {
		return (
			<div className="analysis-card intersectionality">
				<div className="card-header">
					<h4>Intersectionality Analysis</h4>
					<span className="card-icon">🌈</span>
				</div>
				<div className="card-content">
					<div className="raw-response-section">
						<h5>Analysis Results</h5>
						<div className="raw-response-content">
							<p className="analysis-text">{data.rawResponse}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Safely destructure with fallbacks
	const {
		diversityScore = 0,
		intersectionalAnalysis = '',
		representationGaps = [],
		tokenismDetection = [],
		recommendations = ''
	} = data || {};

	const getScoreColor = (score) => {
		if (score >= 8) return '#4CAF50';
		if (score >= 6) return '#FF9800';
		return '#F44336';
	};

	const getScoreLabel = (score) => {
		if (score >= 8) return 'High Diversity';
		if (score >= 6) return 'Moderate Diversity';
		return 'Low Diversity';
	};

	return (
		<div className="analysis-card intersectionality">
			<div className="card-header">
				<h4>Intersectionality Analysis</h4>
				<span className="card-icon">🌈</span>
			</div>
			<div className="card-content">
				<div className="score-section">
					<div className="score-display">
						<div
							className="score-circle"
							style={{ backgroundColor: getScoreColor(diversityScore) }}
						>
							{diversityScore}/10
						</div>
						<div className="score-label">{getScoreLabel(diversityScore)}</div>
					</div>
				</div>

				{intersectionalAnalysis && (
					<div className="analysis-section">
						<h5>Intersectional Analysis</h5>
						{renderAnalysisData(intersectionalAnalysis)}
					</div>
				)}

				{representationGaps && representationGaps.length > 0 && (
					<div className="analysis-section">
						<h5>Representation Gaps</h5>
						<ul className="gap-list">
							{representationGaps.map((gap, index) => (
								<li key={index} className="gap-item">
									<span className="gap-icon">📊</span>
									{typeof gap === 'string' ? gap : JSON.stringify(gap)}
								</li>
							))}
						</ul>
					</div>
				)}

				{tokenismDetection && tokenismDetection.length > 0 && (
					<div className="analysis-section">
						<h5>Tokenism Detection</h5>
						<ul className="tokenism-list">
							{tokenismDetection.map((token, index) => (
								<li key={index} className="tokenism-item">
									<span className="tokenism-icon">🎭</span>
									{typeof token === 'string' ? token : JSON.stringify(token)}
								</li>
							))}
						</ul>
					</div>
				)}

				{recommendations && (
					<div className="recommendations-section">
						<h5>Recommendations</h5>
						{renderAnalysisData(recommendations, 'recommendations-text')}
					</div>
				)}
			</div>
		</div>
	);
});

IntersectionalityAnalysis.propTypes = {
	data: PropTypes.shape({
		diversityScore: PropTypes.number,
		intersectionalAnalysis: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
		representationGaps: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
		tokenismDetection: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
		recommendations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
		failed: PropTypes.bool,
		parseError: PropTypes.bool,
		rawResponse: PropTypes.string,
		error: PropTypes.string,
	}),
};

IntersectionalityAnalysis.displayName = 'IntersectionalityAnalysis';

export default IntersectionalityAnalysis;
