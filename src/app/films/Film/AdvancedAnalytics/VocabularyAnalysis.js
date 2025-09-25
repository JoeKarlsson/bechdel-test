import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const VocabularyAnalysis = memo(({ data }) => {
    if (!data) {
        return null;
    }

    // Handle parse errors by showing raw response
    if (data.failed) {
        return (
            <div className="analysis-card vocabulary">
                <div className="card-header">
                    <h4>Vocabulary Analysis</h4>
                    <span className="card-icon">📝</span>
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
            <div className="analysis-card vocabulary">
                <div className="card-header">
                    <h4>Vocabulary Analysis</h4>
                    <span className="card-icon">📝</span>
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
        maleVocabulary = '',
        femaleVocabulary = '',
        vocabularyComparison = '',
        emotionalLanguage = '',
        professionalLanguage = '',
        recommendations = ''
    } = data || {};


    return (
        <div className="analysis-card vocabulary">
            <div className="card-header">
                <h4>Vocabulary Analysis</h4>
                <span className="card-icon">📝</span>
            </div>
            <div className="card-content">
                <div className="vocabulary-comparison">
                    <div className="vocabulary-section">
                        <h5>Male Vocabulary</h5>
                        <div className="vocabulary-content">
                            {maleVocabulary && renderAnalysisData(maleVocabulary)}
                        </div>
                    </div>

                    <div className="vocabulary-section">
                        <h5>Female Vocabulary</h5>
                        <div className="vocabulary-content">
                            {femaleVocabulary && renderAnalysisData(femaleVocabulary)}
                        </div>
                    </div>
                </div>

                {vocabularyComparison && (
                    <div className="analysis-section">
                        <h5>Vocabulary Comparison</h5>
                        {renderAnalysisData(vocabularyComparison)}
                    </div>
                )}

                {emotionalLanguage && (
                    <div className="analysis-section">
                        <h5>Emotional Language</h5>
                        {renderAnalysisData(emotionalLanguage)}
                    </div>
                )}

                {professionalLanguage && (
                    <div className="analysis-section">
                        <h5>Professional Language</h5>
                        {renderAnalysisData(professionalLanguage)}
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

VocabularyAnalysis.propTypes = {
    data: PropTypes.shape({
        maleVocabulary: PropTypes.string,
        femaleVocabulary: PropTypes.string,
        vocabularyComparison: PropTypes.string,
        emotionalLanguage: PropTypes.string,
        professionalLanguage: PropTypes.string,
        recommendations: PropTypes.string,
        failed: PropTypes.bool,
        parseError: PropTypes.bool,
        rawResponse: PropTypes.string,
        error: PropTypes.string,
    }),
};

VocabularyAnalysis.displayName = 'VocabularyAnalysis';

export default VocabularyAnalysis;
