import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { renderAnalysisData } from './AnalysisDataRenderer';

const TopicModeling = memo(({ data }) => {
    if (!data) {
        return null;
    }

    // Handle parse errors by showing raw response
    if (data.failed) {
        return (
            <div className="analysis-card topic-modeling">
                <div className="card-header">
                    <h4>Topic Modeling</h4>
                    <span className="card-icon">📚</span>
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
            <div className="analysis-card topic-modeling">
                <div className="card-header">
                    <h4>Topic Modeling</h4>
                    <span className="card-icon">📚</span>
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
        maleTopics = [],
        femaleTopics = [],
        topicDiversity = '',
        expertiseAreas = '',
        recommendations = ''
    } = data || {};


    return (
        <div className="analysis-card topic-modeling">
            <div className="card-header">
                <h4>Topic Modeling</h4>
                <span className="card-icon">📚</span>
            </div>
            <div className="card-content">
                <div className="topic-comparison">
                    <div className="topic-section">
                        <h5>Male Topics</h5>
                        <div className="topic-content">
                            {maleTopics && (
                                <div className="topic-tags">
                                    {maleTopics.map((topic, index) => (
                                        <span key={index} className="topic-tag male">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="topic-section">
                        <h5>Female Topics</h5>
                        <div className="topic-content">
                            {femaleTopics && (
                                <div className="topic-tags">
                                    {femaleTopics.map((topic, index) => (
                                        <span key={index} className="topic-tag female">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {topicDiversity && (
                    <div className="analysis-section">
                        <h5>Topic Diversity</h5>
                        {renderAnalysisData(topicDiversity)}
                    </div>
                )}

                {expertiseAreas && (
                    <div className="analysis-section">
                        <h5>Expertise Areas</h5>
                        {renderAnalysisData(expertiseAreas)}
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

TopicModeling.propTypes = {
    data: PropTypes.shape({
        maleTopics: PropTypes.arrayOf(PropTypes.string),
        femaleTopics: PropTypes.arrayOf(PropTypes.string),
        topicDiversity: PropTypes.string,
        expertiseAreas: PropTypes.string,
        recommendations: PropTypes.string,
        failed: PropTypes.bool,
        parseError: PropTypes.bool,
        rawResponse: PropTypes.string,
        error: PropTypes.string,
    }),
};

TopicModeling.displayName = 'TopicModeling';

export default TopicModeling;
