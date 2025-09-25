import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const CharacterDevelopment = memo(({ data, characters }) => {
    if (!data) {
        return null;
    }

    // Handle parse errors by showing raw response
    if (data.failed) {
        return (
            <div className="analysis-card character-development">
                <div className="card-header">
                    <h4>Character Development Analysis</h4>
                    <span className="card-icon">📈</span>
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
            <div className="analysis-card character-development">
                <div className="card-header">
                    <h4>Character Development Analysis</h4>
                    <span className="card-icon">📈</span>
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
        femaleCharacterArcs = '',
        maleCharacterArcs = '',
        developmentComparison = '',
        growthPatterns = '',
        complexityAnalysis = '',
        recommendations = ''
    } = data || {};


    return (
        <div className="analysis-card character-development">
            <div className="card-header">
                <h4>Character Development Analysis</h4>
                <span className="card-icon">📈</span>
            </div>
            <div className="card-content">
                <div className="character-development-comparison">
                    <div className="character-section">
                        <h5>Female Character Arcs</h5>
                        <div className="character-content">
                            {femaleCharacterArcs && renderAnalysisData(femaleCharacterArcs)}
                        </div>
                    </div>

                    <div className="character-section">
                        <h5>Male Character Arcs</h5>
                        <div className="character-content">
                            {maleCharacterArcs && renderAnalysisData(maleCharacterArcs)}
                        </div>
                    </div>
                </div>

                {developmentComparison && (
                    <div className="analysis-section">
                        <h5>Development Comparison</h5>
                        {renderAnalysisData(developmentComparison)}
                    </div>
                )}

                {growthPatterns && (
                    <div className="analysis-section">
                        <h5>Growth Patterns</h5>
                        {renderAnalysisData(growthPatterns)}
                    </div>
                )}

                {complexityAnalysis && (
                    <div className="analysis-section">
                        <h5>Complexity Analysis</h5>
                        {renderAnalysisData(complexityAnalysis)}
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

CharacterDevelopment.propTypes = {
    data: PropTypes.shape({
        femaleCharacterArcs: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        maleCharacterArcs: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        developmentComparison: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        growthPatterns: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        complexityAnalysis: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        recommendations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        failed: PropTypes.bool,
        parseError: PropTypes.bool,
        rawResponse: PropTypes.string,
        error: PropTypes.string,
    }),
    characters: PropTypes.arrayOf(PropTypes.shape({
        actorName: PropTypes.string,
        character: PropTypes.string,
        actorActress: PropTypes.string,
    })),
};

CharacterDevelopment.displayName = 'CharacterDevelopment';

export default CharacterDevelopment;
