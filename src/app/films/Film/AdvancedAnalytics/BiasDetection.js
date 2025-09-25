import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const BiasDetection = memo(({ data }) => {
    if (!data) {
        return null;
    }

    // Handle parse errors by showing raw response
    if (data.failed) {
        return (
            <div className="analysis-card bias-detection">
                <div className="card-header">
                    <h4>Bias Detection</h4>
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
            <div className="analysis-card bias-detection">
                <div className="card-header">
                    <h4>Bias Detection</h4>
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
        detectedBiases = [],
        biasPatterns = [],
        microaggressions = [],
        systemicBias = '',
        biasScore = 0,
        recommendations = ''
    } = data || {};


    const getScoreColor = (score) => {
        if (score <= 3) return '#4CAF50';
        if (score <= 6) return '#FF9800';
        return '#F44336';
    };

    const getScoreLabel = (score) => {
        if (score <= 3) return 'Low Bias';
        if (score <= 6) return 'Moderate Bias';
        return 'High Bias';
    };

    return (
        <div className="analysis-card bias-detection">
            <div className="card-header">
                <h4>Bias Detection</h4>
                <span className="card-icon">🎯</span>
            </div>
            <div className="card-content">
                <div className="score-section">
                    <div className="score-display">
                        <div
                            className="score-circle"
                            style={{ backgroundColor: getScoreColor(biasScore) }}
                        >
                            {biasScore}/10
                        </div>
                        <div className="score-label">{getScoreLabel(biasScore)}</div>
                    </div>
                </div>

                {detectedBiases && detectedBiases.length > 0 && (
                    <div className="analysis-section">
                        <h5>Detected Biases</h5>
                        <ul className="bias-list">
                            {detectedBiases.map((bias, index) => (
                                <li key={index} className="bias-item">
                                    <span className="bias-icon">⚠️</span>
                                    {bias}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {biasPatterns && (
                    <div className="analysis-section">
                        <h5>Bias Patterns</h5>
                        {renderAnalysisData(biasPatterns)}
                    </div>
                )}

                {microaggressions && microaggressions.length > 0 && (
                    <div className="analysis-section">
                        <h5>Microaggressions</h5>
                        <ul className="microaggression-list">
                            {microaggressions.map((microaggression, index) => (
                                <li key={index} className="microaggression-item">
                                    <span className="microaggression-icon">🔍</span>
                                    {microaggression}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {systemicBias && (
                    <div className="analysis-section">
                        <h5>Systemic Bias</h5>
                        {renderAnalysisData(systemicBias)}
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

BiasDetection.propTypes = {
    data: PropTypes.shape({
        detectedBiases: PropTypes.arrayOf(PropTypes.string),
        biasPatterns: PropTypes.string,
        microaggressions: PropTypes.arrayOf(PropTypes.string),
        systemicBias: PropTypes.string,
        biasScore: PropTypes.number,
        recommendations: PropTypes.string,
        failed: PropTypes.bool,
        parseError: PropTypes.bool,
        rawResponse: PropTypes.string,
        error: PropTypes.string,
    }),
};

BiasDetection.displayName = 'BiasDetection';

export default BiasDetection;
