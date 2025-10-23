import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const SentimentAnalysis = memo(({ data }) => {
	if (!data) {
		return null;
	}

	// Handle parse errors by showing raw response
	if (data.failed) {
		return (
			<div className="analysis-card sentiment">
				<div className="card-header">
					<h4>Sentiment Analysis</h4>
					<span className="card-icon">💭</span>
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
			<div className="analysis-card sentiment">
				<div className="card-header">
					<h4>Sentiment Analysis</h4>
					<span className="card-icon">💭</span>
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

	// Safely destructure with fallbacks and handle both string and object data
	const {
		maleSentimentAnalysis = '',
		femaleSentimentAnalysis = '',
		sentimentComparison = '',
		emotionalRange = '',
		recommendations = ''
	} = data || {};


	return (
		<div className="analysis-card sentiment">
			<div className="card-header">
				<h4>Sentiment Analysis</h4>
				<span className="card-icon">💭</span>
			</div>
			<div className="card-content">
				<div className="sentiment-comparison">
					<div className="sentiment-section">
						<h5>Male Characters</h5>
						<div className="sentiment-content">
							{maleSentimentAnalysis && renderAnalysisData(maleSentimentAnalysis)}
						</div>
					</div>

					<div className="sentiment-section">
						<h5>Female Characters</h5>
						<div className="sentiment-content">
							{femaleSentimentAnalysis && renderAnalysisData(femaleSentimentAnalysis)}
						</div>
					</div>
				</div>

				{sentimentComparison && (
					<div className="analysis-section">
						<h5>Sentiment Comparison</h5>
						{renderAnalysisData(sentimentComparison)}
					</div>
				)}

				{emotionalRange && (
					<div className="analysis-section">
						<h5>Emotional Range</h5>
						{renderAnalysisData(emotionalRange)}
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

SentimentAnalysis.propTypes = {
	data: PropTypes.shape({
		maleSentimentAnalysis: PropTypes.string,
		femaleSentimentAnalysis: PropTypes.string,
		sentimentComparison: PropTypes.string,
		emotionalRange: PropTypes.string,
		recommendations: PropTypes.string,
		failed: PropTypes.bool,
		parseError: PropTypes.bool,
		rawResponse: PropTypes.string,
		error: PropTypes.string,
	}),
};

SentimentAnalysis.displayName = 'SentimentAnalysis';

export default SentimentAnalysis;
