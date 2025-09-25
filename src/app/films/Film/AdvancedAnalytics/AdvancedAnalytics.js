import React, { memo } from 'react';
import PropTypes from 'prop-types';
import FemaleAgencyAnalysis from './FemaleAgencyAnalysis';
import StereotypeDetection from './StereotypeDetection';
import IntersectionalityAnalysis from './IntersectionalityAnalysis';
import SentimentAnalysis from './SentimentAnalysis';
import TopicModeling from './TopicModeling';
import PowerDynamics from './PowerDynamics';
import VocabularyAnalysis from './VocabularyAnalysis';
import BiasDetection from './BiasDetection';
import CharacterDevelopment from './CharacterDevelopment';
import './AdvancedAnalytics.scss';

const AdvancedAnalytics = memo(({ enhancedAnalytics, characters }) => {
    // Check if enhanced analytics data exists
    if (!enhancedAnalytics || !enhancedAnalytics.analysisTimestamp) {
        return (
            <div className="advanced-analytics">
                <div className="advanced-analytics-header">
                    <h3>Advanced AI Analysis</h3>
                    <p className="no-data-message">
                        Advanced AI analysis is not available for this film.
                        This feature requires enhanced analytics processing.
                    </p>
                </div>
            </div>
        );
    }

    const {
        femaleAgency,
        stereotypes,
        intersectionality,
        sentiment,
        topics,
        powerDynamics,
        vocabulary,
        biasDetection,
        characterDevelopment,
        analysisTimestamp
    } = enhancedAnalytics;

    return (
        <div className="advanced-analytics">
            <div className="advanced-analytics-header">
                <h3>Advanced AI Analysis</h3>
                <p className="analysis-timestamp">
                    Analysis completed: {new Date(analysisTimestamp).toLocaleDateString()}
                </p>
            </div>

            <div className="analytics-grid">
                {femaleAgency && !femaleAgency.failed && <FemaleAgencyAnalysis data={femaleAgency} />}
                {stereotypes && !stereotypes.failed && <StereotypeDetection data={stereotypes} />}
                {intersectionality && !intersectionality.failed && <IntersectionalityAnalysis data={intersectionality} />}
                {sentiment && !sentiment.failed && <SentimentAnalysis data={sentiment} />}
                {topics && !topics.failed && <TopicModeling data={topics} />}
                {powerDynamics && !powerDynamics.failed && <PowerDynamics data={powerDynamics} />}
                {vocabulary && !vocabulary.failed && <VocabularyAnalysis data={vocabulary} />}
                {biasDetection && !biasDetection.failed && <BiasDetection data={biasDetection} />}
                {characterDevelopment && !characterDevelopment.failed && <CharacterDevelopment data={characterDevelopment} characters={characters} />}
            </div>
        </div>
    );
});

AdvancedAnalytics.propTypes = {
    enhancedAnalytics: PropTypes.shape({
        femaleAgency: PropTypes.object,
        stereotypes: PropTypes.object,
        intersectionality: PropTypes.object,
        sentiment: PropTypes.object,
        topics: PropTypes.object,
        powerDynamics: PropTypes.object,
        vocabulary: PropTypes.object,
        biasDetection: PropTypes.object,
        characterDevelopment: PropTypes.object,
        analysisTimestamp: PropTypes.string,
    }),
    characters: PropTypes.arrayOf(PropTypes.shape({
        actorName: PropTypes.string,
        character: PropTypes.string,
        actorActress: PropTypes.string,
    })),
};

AdvancedAnalytics.displayName = 'AdvancedAnalytics';

export default AdvancedAnalytics;
