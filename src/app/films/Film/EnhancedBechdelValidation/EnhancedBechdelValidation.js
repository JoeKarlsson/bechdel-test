import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './EnhancedBechdelValidation.css';

const EnhancedBechdelValidation = ({ validationData }) => {
	const [expandedScenes, setExpandedScenes] = useState(new Set());

	if (!validationData || !validationData.overallAssessment) {
		return null;
	}

	const { overallAssessment, scenes, scenesAnalyzed } = validationData;
	const {
		keywordTestScore,
		llmRecommendedScore,
		llmPass,
		falsePositivesDetected,
		reasoning
	} = overallAssessment;

	const toggleScene = (sceneNumber) => {
		const newExpanded = new Set(expandedScenes);
		if (newExpanded.has(sceneNumber)) {
			newExpanded.delete(sceneNumber);
		} else {
			newExpanded.add(sceneNumber);
		}
		setExpandedScenes(newExpanded);
	};

	const getScoreColor = (score) => {
		if (score === 3) return '#4caf50'; // Green
		if (score === 2) return '#ff9800'; // Orange
		if (score === 1) return '#f44336'; // Red
		return '#9e9e9e'; // Gray
	};

	const getConfidenceColor = (confidence) => {
		if (confidence >= 0.8) return '#4caf50';
		if (confidence >= 0.6) return '#ff9800';
		return '#f44336';
	};

	return (
		<div className="enhanced-bechdel-validation">
			<h3 className="validation-title">
				🤖 AI-Enhanced Bechdel Analysis
			</h3>

			<div className="validation-summary">
				<div className="score-comparison">
					<div className="score-card">
						<div className="score-label">Keyword Test</div>
						<div
							className="score-value"
							style={{ color: getScoreColor(keywordTestScore) }}
						>
							{keywordTestScore}/3
						</div>
					</div>

					<div className="score-arrow">→</div>

					<div className="score-card">
						<div className="score-label">AI Recommended</div>
						<div
							className="score-value"
							style={{ color: getScoreColor(llmRecommendedScore) }}
						>
							{llmRecommendedScore}/3
						</div>
					</div>
				</div>

				{falsePositivesDetected > 0 && (
					<div className="false-positives-alert">
						⚠️ {falsePositivesDetected} false positive{falsePositivesDetected !== 1 ? 's' : ''} detected
					</div>
				)}

				<div className="overall-assessment">
					<div className="assessment-status">
						<strong>AI Assessment:</strong>
						<span className={`status-badge ${llmPass ? 'pass' : 'fail'}`}>
							{llmPass ? '✓ PASS' : '✗ FAIL'}
						</span>
					</div>
					<div className="assessment-reasoning">{reasoning}</div>
				</div>

				<div className="scenes-analyzed-info">
					Analyzed {scenesAnalyzed} scene{scenesAnalyzed !== 1 ? 's' : ''} that passed keyword test
				</div>
			</div>

			{scenes && scenes.length > 0 && (
				<div className="scene-details">
					<h4 className="scene-details-title">Scene-by-Scene Analysis</h4>
					{scenes.map((scene, index) => (
						<div
							key={index}
							className={`scene-card ${scene.falsePositive ? 'false-positive' : ''}`}
						>
							<div
								className="scene-header"
								onClick={() => toggleScene(scene.sceneNumber)}
								role="button"
								tabIndex={0}
								onKeyPress={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										toggleScene(scene.sceneNumber);
									}
								}}
							>
								<div className="scene-header-left">
									<span className="scene-number">Scene {scene.sceneNumber}</span>
									<span className={`scene-result ${scene.llmResult}`}>
										{scene.llmResult === 'pass' ? '✓' : '✗'} {scene.llmResult.toUpperCase()}
									</span>
									{scene.falsePositive && (
										<span className="false-positive-badge">FALSE POSITIVE</span>
									)}
								</div>
								<div className="scene-header-right">
									<span
										className="confidence-badge"
										style={{ backgroundColor: getConfidenceColor(scene.confidence) }}
									>
										{Math.round(scene.confidence * 100)}% confident
									</span>
									<span className="expand-icon">
										{expandedScenes.has(scene.sceneNumber) ? '▼' : '▶'}
									</span>
								</div>
							</div>

							{expandedScenes.has(scene.sceneNumber) && (
								<div className="scene-details-expanded">
									<div className="scene-detail-row">
										<strong>Female Characters:</strong>
										<span>{scene.femaleCharactersIdentified?.join(', ') || 'None identified'}</span>
									</div>
									<div className="scene-detail-row">
										<strong>Conversation Subject:</strong>
										<span>{scene.conversationSubject || 'N/A'}</span>
									</div>
									<div className="scene-detail-row">
										<strong>AI Reasoning:</strong>
										<span className="reasoning-text">{scene.reasoning}</span>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<div className="validation-footer">
				<small>
					💡 This AI analysis helps identify false positives in the keyword-based Bechdel test,
					providing more accurate results through semantic understanding.
				</small>
			</div>
		</div>
	);
};

EnhancedBechdelValidation.propTypes = {
	validationData: PropTypes.shape({
		scenesAnalyzed: PropTypes.number,
		scenes: PropTypes.arrayOf(PropTypes.shape({
			sceneNumber: PropTypes.number,
			llmResult: PropTypes.string,
			confidence: PropTypes.number,
			reasoning: PropTypes.string,
			femaleCharactersIdentified: PropTypes.arrayOf(PropTypes.string),
			conversationSubject: PropTypes.string,
			falsePositive: PropTypes.bool,
		})),
		overallAssessment: PropTypes.shape({
			keywordTestScore: PropTypes.number,
			llmRecommendedScore: PropTypes.number,
			llmPass: PropTypes.bool,
			falsePositivesDetected: PropTypes.number,
			reasoning: PropTypes.string,
		}),
	}),
};

export default EnhancedBechdelValidation;
