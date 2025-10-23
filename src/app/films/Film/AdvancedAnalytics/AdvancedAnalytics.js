import React, { memo, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import './AdvancedAnalytics.scss';

// Lazy load analysis components for better performance
const FemaleAgencyAnalysis = lazy(() => import('./FemaleAgencyAnalysis'));
const StereotypeDetection = lazy(() => import('./StereotypeDetection'));
const IntersectionalityAnalysis = lazy(() => import('./IntersectionalityAnalysis'));
const SentimentAnalysis = lazy(() => import('./SentimentAnalysis'));
const TopicModeling = lazy(() => import('./TopicModeling'));
const PowerDynamics = lazy(() => import('./PowerDynamics'));
const VocabularyAnalysis = lazy(() => import('./VocabularyAnalysis'));
const BiasDetection = lazy(() => import('./BiasDetection'));
const CharacterDevelopment = lazy(() => import('./CharacterDevelopment'));

// Loading skeleton for analysis cards
const AnalysisCardSkeleton = () => (
	<div className="analysis-card skeleton">
		<div className="card-header skeleton-header">
			<div className="skeleton-title" />
			<div className="skeleton-icon" />
		</div>
		<div className="card-content skeleton-content">
			<div className="skeleton-score" />
			<div className="skeleton-line" />
			<div className="skeleton-line short" />
			<div className="skeleton-line" />
		</div>
	</div>
);

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
				{femaleAgency && !femaleAgency.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<FemaleAgencyAnalysis data={femaleAgency} />
					</Suspense>
				)}
				{stereotypes && !stereotypes.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<StereotypeDetection data={stereotypes} />
					</Suspense>
				)}
				{intersectionality && !intersectionality.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<IntersectionalityAnalysis data={intersectionality} />
					</Suspense>
				)}
				{sentiment && !sentiment.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<SentimentAnalysis data={sentiment} />
					</Suspense>
				)}
				{topics && !topics.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<TopicModeling data={topics} />
					</Suspense>
				)}
				{powerDynamics && !powerDynamics.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<PowerDynamics data={powerDynamics} />
					</Suspense>
				)}
				{vocabulary && !vocabulary.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<VocabularyAnalysis data={vocabulary} />
					</Suspense>
				)}
				{biasDetection && !biasDetection.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<BiasDetection data={biasDetection} />
					</Suspense>
				)}
				{characterDevelopment && !characterDevelopment.failed && (
					<Suspense fallback={<AnalysisCardSkeleton />}>
						<CharacterDevelopment data={characterDevelopment} characters={characters} />
					</Suspense>
				)}
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
