import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const PowerDynamics = memo(({ data }) => {
    if (!data) {
        return null;
    }

    // Handle parse errors by showing raw response
    if (data.failed) {
        return (
            <div className="analysis-card power-dynamics">
                <div className="card-header">
                    <h4>Power Dynamics</h4>
                    <span className="card-icon">⚖️</span>
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
            <div className="analysis-card power-dynamics">
                <div className="card-header">
                    <h4>Power Dynamics</h4>
                    <span className="card-icon">⚖️</span>
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
        interruptionPatterns = [],
        questionCommandAnalysis = '',
        speakingTimeAnalysis = '',
        authorityPatterns = [],
        powerDynamicsScore = 0,
        recommendations = ''
    } = data || {};

    const getScoreColor = (score) => {
        if (score >= 8) return '#4CAF50';
        if (score >= 6) return '#FF9800';
        return '#F44336';
    };

    const getScoreLabel = (score) => {
        if (score >= 8) return 'Balanced Power';
        if (score >= 6) return 'Moderate Balance';
        return 'Imbalanced Power';
    };

    return (
        <div className="analysis-card power-dynamics">
            <div className="card-header">
                <h4>Power Dynamics</h4>
                <span className="card-icon">⚖️</span>
            </div>
            <div className="card-content">
                <div className="score-section">
                    <div className="score-display">
                        <div
                            className="score-circle"
                            style={{ backgroundColor: getScoreColor(powerDynamicsScore) }}
                        >
                            {powerDynamicsScore}/10
                        </div>
                        <div className="score-label">{getScoreLabel(powerDynamicsScore)}</div>
                    </div>
                </div>

                {interruptionPatterns && (
                    <div className="analysis-section">
                        <h5>Interruption Patterns</h5>
                        {renderAnalysisData(interruptionPatterns)}
                    </div>
                )}

                {questionCommandAnalysis && (
                    <div className="analysis-section">
                        <h5>Questions vs Commands</h5>
                        {renderAnalysisData(questionCommandAnalysis)}
                    </div>
                )}

                {speakingTimeAnalysis && (
                    <div className="analysis-section">
                        <h5>Speaking Time Analysis</h5>
                        {renderAnalysisData(speakingTimeAnalysis)}
                    </div>
                )}

                {authorityPatterns && (
                    <div className="analysis-section">
                        <h5>Authority Patterns</h5>
                        {renderAnalysisData(authorityPatterns)}
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

PowerDynamics.propTypes = {
    data: PropTypes.shape({
        interruptionPatterns: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        questionCommandAnalysis: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        speakingTimeAnalysis: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        authorityPatterns: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        powerDynamicsScore: PropTypes.number,
        recommendations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        failed: PropTypes.bool,
        parseError: PropTypes.bool,
        rawResponse: PropTypes.string,
        error: PropTypes.string,
    }),
};

PowerDynamics.displayName = 'PowerDynamics';

export default PowerDynamics;
