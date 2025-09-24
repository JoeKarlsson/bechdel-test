/**
 * Enhanced Analytics Module
 * Integrates script cleaning, Claude AI analysis, and data storage
 */

const scriptCleaner = require('./scriptCleaner');
const ClaudeAnalyzer = require('./claudeAnalyzer');
const handleError = require('../helper/handleError');

class EnhancedAnalytics {
	constructor(claudeApiKey) {
		this.claudeAnalyzer = new ClaudeAnalyzer(claudeApiKey);
	}

	/**
	 * Perform comprehensive script analysis
	 * @param {string} scriptPath - Path to the script file
	 * @param {Array} characters - Character data with gender information
	 * @param {string} processId - Process ID for progress tracking
	 * @returns {Object} Complete analytics results
	 */
	async analyzeScript(scriptPath, characters, processId = null) {
		try {
			// Update progress
			if (processId) {
				const cleanupManager = require('../helper/cleanupManager');
				cleanupManager.updateProcessStage(processId, 'cleaning_script');
				cleanupManager.setProcessMessage(processId, 'Cleaning script for AI analysis...');
			}

			// Read and clean the script
			const fs = require('fs');
			const rawScript = fs.readFileSync(scriptPath, 'utf8');
			const cleanedScriptData = scriptCleaner.cleanScript(rawScript);

			// Update progress
			if (processId) {
				const cleanupManager = require('../helper/cleanupManager');
				cleanupManager.updateProcessStage(processId, 'running_ai_analysis');
				cleanupManager.setProcessMessage(processId, 'Running advanced AI analysis...');
			}

			// Run Claude AI analysis
			const aiAnalysis = await this.claudeAnalyzer.analyzeScript(cleanedScriptData, characters);

			// Update progress
			if (processId) {
				const cleanupManager = require('../helper/cleanupManager');
				cleanupManager.updateProcessStage(processId, 'processing_results');
				cleanupManager.setProcessMessage(processId, 'Processing analysis results...');
			}

			// Combine all results
			const enhancedResults = {
				// Original Bechdel test results (will be added by existing system)
				bechdelResults: null, // This will be populated by the existing getBechdelResults function
				
				// Enhanced analytics
				enhancedAnalytics: {
					...aiAnalysis,
					scriptOptimization: {
						tokenReduction: cleanedScriptData.tokenReduction,
						originalLength: cleanedScriptData.originalScript.length,
						cleanedLength: cleanedScriptData.cleanedScript.length,
						condensedLength: cleanedScriptData.condensedScript.length
					},
					characterDialogue: cleanedScriptData.characterDialogue,
					keyScenes: scriptCleaner.extractKeyScenes(rawScript)
				},
				
				// Metadata
				analysisMetadata: {
					analysisTimestamp: new Date().toISOString(),
					processId: processId,
					scriptPath: scriptPath,
					characterCount: characters.length,
					femaleCharacterCount: characters.filter(c => c.gender === 2).length,
					maleCharacterCount: characters.filter(c => c.gender === 1).length
				}
			};

			return enhancedResults;

		} catch (error) {
			console.error('Enhanced analytics error:', error);
			handleError(error);
			throw error;
		}
	}

	/**
	 * Get analytics summary for quick overview
	 * @param {Object} enhancedResults - Full analytics results
	 * @returns {Object} Summary of key metrics
	 */
	getAnalyticsSummary(enhancedResults) {
		if (!enhancedResults || !enhancedResults.enhancedAnalytics) {
			return null;
		}

		const analytics = enhancedResults.enhancedAnalytics;
		
		return {
			overallScore: this.calculateOverallScore(analytics),
			keyMetrics: {
				femaleAgencyScore: analytics.femaleAgency?.agencyScore || 0,
				stereotypeScore: analytics.stereotypes?.stereotypeScore || 0,
				diversityScore: analytics.intersectionality?.diversityScore || 0,
				powerDynamicsScore: analytics.powerDynamics?.powerDynamicsScore || 0,
				biasScore: analytics.biasDetection?.biasScore || 0
			},
			recommendations: this.extractTopRecommendations(analytics),
			tokenOptimization: analytics.scriptOptimization?.tokenReduction || null
		};
	}

	/**
	 * Calculate overall gender representation score
	 * @param {Object} analytics - Analytics data
	 * @returns {number} Overall score (1-10)
	 */
	calculateOverallScore(analytics) {
		const scores = [
			analytics.femaleAgency?.agencyScore || 5,
			analytics.stereotypes?.stereotypeScore || 5,
			analytics.intersectionality?.diversityScore || 5,
			analytics.powerDynamics?.powerDynamicsScore || 5,
			analytics.biasDetection?.biasScore || 5
		];

		// Weighted average (stereotype and bias scores are inverted)
		const weightedScores = [
			scores[0], // female agency (higher is better)
			10 - scores[1], // stereotypes (lower is better)
			scores[2], // diversity (higher is better)
			scores[3], // power dynamics (higher is better)
			10 - scores[4] // bias (lower is better)
		];

		return Math.round(weightedScores.reduce((sum, score) => sum + score, 0) / weightedScores.length);
	}

	/**
	 * Extract top recommendations from all analyses
	 * @param {Object} analytics - Analytics data
	 * @returns {Array} Top recommendations
	 */
	extractTopRecommendations(analytics) {
		const recommendations = [];

		// Collect recommendations from all analyses
		Object.values(analytics).forEach(analysis => {
			if (analysis && analysis.recommendations) {
				if (Array.isArray(analysis.recommendations)) {
					recommendations.push(...analysis.recommendations);
				} else if (typeof analysis.recommendations === 'string') {
					recommendations.push(analysis.recommendations);
				}
			}
		});

		// Return top 5 unique recommendations
		return [...new Set(recommendations)].slice(0, 5);
	}

	/**
	 * Format results for database storage
	 * @param {Object} enhancedResults - Full analytics results
	 * @returns {Object} Formatted results for database
	 */
	formatForDatabase(enhancedResults) {
		return {
			enhancedAnalytics: enhancedResults.enhancedAnalytics,
			analyticsSummary: this.getAnalyticsSummary(enhancedResults),
			analysisMetadata: enhancedResults.analysisMetadata,
			lastUpdated: new Date()
		};
	}
}

module.exports = EnhancedAnalytics;
