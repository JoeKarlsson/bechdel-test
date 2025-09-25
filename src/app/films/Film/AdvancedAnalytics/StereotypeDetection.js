import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const StereotypeDetection = memo(({ data }) => {
    if (!data) {
        return null;
    }

    // Handle parse errors by showing raw response
    if (data.failed) {
        return (
            <div className="analysis-card stereotype-detection">
                <div className="card-header">
                    <h4>Stereotype Detection</h4>
                    <span className="card-icon">🔍</span>
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
            <div className="analysis-card stereotype-detection">
                <div className="card-header">
                    <h4>Stereotype Detection</h4>
                    <span className="card-icon">🔍</span>
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
        detectedStereotypes = [],
        characterArchetypes = {},
        problematicPatterns = [],
        stereotypeScore = 0,
        recommendations = ''
    } = data || {};

    const getScoreColor = (score) => {
        if (score <= 3) return '#4CAF50';
        if (score <= 6) return '#FF9800';
        return '#F44336';
    };

    const getScoreLabel = (score) => {
        if (score <= 3) return 'Low Stereotyping';
        if (score <= 6) return 'Moderate Stereotyping';
        return 'High Stereotyping';
    };

    return (
        <div className="analysis-card stereotype-detection">
            <div className="card-header">
                <h4>Stereotype Detection</h4>
                <span className="card-icon">🔍</span>
            </div>
            <div className="card-content">
                <div className="score-section">
                    <div className="score-display">
                        <div
                            className="score-circle"
                            style={{ backgroundColor: getScoreColor(stereotypeScore) }}
                        >
                            {stereotypeScore}/10
                        </div>
                        <div className="score-label">{getScoreLabel(stereotypeScore)}</div>
                    </div>
                </div>

                {detectedStereotypes && detectedStereotypes.length > 0 && (
                    <div className="analysis-section">
                        <h5>Detected Stereotypes</h5>
                        <div className="stereotype-tags">
                            {detectedStereotypes.map((stereotype, index) => (
                                <span key={index} className="stereotype-tag">
                                    {stereotype}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {characterArchetypes && Object.keys(characterArchetypes).length > 0 && (
                    <div className="analysis-section">
                        <h5>Character Archetypes</h5>
                        <div className="archetype-list">
                            {Object.entries(characterArchetypes).map(([character, archetype]) => (
                                <div key={character} className="archetype-item">
                                    <span className="character-name">{character}</span>
                                    <div className="archetype-details">
                                        {typeof archetype === 'string' ? (
                                            <span className="archetype-type">{archetype}</span>
                                        ) : (
                                            <div className="archetype-object">
                                                {Object.entries(archetype).map(([key, value]) => (
                                                    <div key={key} className="archetype-property">
                                                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
                                                        <span>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {problematicPatterns && problematicPatterns.length > 0 && (
                    <div className="analysis-section">
                        <h5>Problematic Patterns</h5>
                        <ul className="pattern-list">
                            {problematicPatterns.map((pattern, index) => (
                                <li key={index} className="pattern-item">
                                    <span className="pattern-icon">⚠️</span>
                                    {pattern}
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

StereotypeDetection.propTypes = {
    data: PropTypes.shape({
        detectedStereotypes: PropTypes.arrayOf(PropTypes.string),
        characterArchetypes: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
        problematicPatterns: PropTypes.arrayOf(PropTypes.string),
        stereotypeScore: PropTypes.number,
        recommendations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        failed: PropTypes.bool,
        parseError: PropTypes.bool,
        rawResponse: PropTypes.string,
        error: PropTypes.string,
    }),
};

StereotypeDetection.displayName = 'StereotypeDetection';

export default StereotypeDetection;
