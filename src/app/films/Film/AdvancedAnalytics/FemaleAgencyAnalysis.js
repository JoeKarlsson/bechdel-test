import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const FemaleAgencyAnalysis = memo(({ data }) => {
    if (!data) {
        return null;
    }

    // Handle parse errors by showing raw response
    if (data.failed) {
        return (
            <div className="analysis-card female-agency">
                <div className="card-header">
                    <h4>Female Agency Analysis</h4>
                    <span className="card-icon">🎯</span>
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
            <div className="analysis-card female-agency">
                <div className="card-header">
                    <h4>Female Agency Analysis</h4>
                    <span className="card-icon">🎯</span>
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
        agencyScore = 0,
        plotDrivingMoments = [],
        reactiveMoments = [],
        decisionMaking = '',
        goalPursuit = '',
        recommendations = ''
    } = data || {};


    const getScoreColor = (score) => {
        if (score >= 8) return '#4CAF50';
        if (score >= 6) return '#FF9800';
        return '#F44336';
    };

    const getScoreLabel = (score) => {
        if (score >= 8) return 'High Agency';
        if (score >= 6) return 'Moderate Agency';
        return 'Low Agency';
    };

    return (
        <div className="analysis-card female-agency">
            <div className="card-header">
                <h4>Female Agency Analysis</h4>
                <span className="card-icon">🎯</span>
            </div>
            <div className="card-content">
                <div className="score-section">
                    <div className="score-display">
                        <div
                            className="score-circle"
                            style={{ backgroundColor: getScoreColor(agencyScore) }}
                        >
                            {agencyScore}/10
                        </div>
                        <div className="score-label">{getScoreLabel(agencyScore)}</div>
                    </div>
                </div>

                {plotDrivingMoments && plotDrivingMoments.length > 0 && (
                    <div className="analysis-section">
                        <h5>Plot-Driving Moments</h5>
                        <ul className="moment-list">
                            {plotDrivingMoments.slice(0, 3).map((moment, index) => (
                                <li key={index} className="moment-item">
                                    <span className="moment-icon">⚡</span>
                                    {moment}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {reactiveMoments && reactiveMoments.length > 0 && (
                    <div className="analysis-section">
                        <h5>Reactive Moments</h5>
                        <ul className="moment-list">
                            {reactiveMoments.slice(0, 3).map((moment, index) => (
                                <li key={index} className="moment-item reactive">
                                    <span className="moment-icon">🔄</span>
                                    {moment}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {decisionMaking && (
                    <div className="analysis-section">
                        <h5>Decision-Making Patterns</h5>
                        {renderAnalysisData(decisionMaking)}
                    </div>
                )}

                {goalPursuit && (
                    <div className="analysis-section">
                        <h5>Goal Pursuit</h5>
                        {renderAnalysisData(goalPursuit)}
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

FemaleAgencyAnalysis.propTypes = {
    data: PropTypes.shape({
        agencyScore: PropTypes.number,
        plotDrivingMoments: PropTypes.arrayOf(PropTypes.string),
        reactiveMoments: PropTypes.arrayOf(PropTypes.string),
        decisionMaking: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        goalPursuit: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        recommendations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        failed: PropTypes.bool,
        parseError: PropTypes.bool,
        rawResponse: PropTypes.string,
        error: PropTypes.string,
    }),
};

FemaleAgencyAnalysis.displayName = 'FemaleAgencyAnalysis';

export default FemaleAgencyAnalysis;
