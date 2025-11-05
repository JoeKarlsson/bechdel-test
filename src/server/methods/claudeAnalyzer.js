/**
 * Claude API Integration Module
 * Handles advanced analytics using Claude AI for film script analysis
 */

const { Anthropic, RateLimitError, APIError, APIConnectionError, APIConnectionTimeoutError } = require('@anthropic-ai/sdk');

class ClaudeAnalyzer {
	constructor(apiKey) {
		if (!apiKey) {
			throw new Error('Claude API key is required');
		}

		this.anthropic = new Anthropic({
			apiKey,
		});
	}

	/**
     * Analyze script using batched API calls for better performance
     * Reduces from 10 sequential calls to 3 batched calls (~60-75% faster)
     *
     * @param {Object} scriptData - Cleaned script data
     * @param {Array} characters - Character data with gender information
     * @param {Object} bechdelData - Original Bechdel test results for validation
     * @returns {Object} Advanced analytics results
     */
	async analyzeScript(scriptData, characters, bechdelData = null) {
		try {
			const results = {};

			// BATCH 1: Character & Narrative Analysis
			console.log('Running Batch 1: Character & Narrative Analysis...');
			try {
				const batch1 = await this.analyzeBatch1_CharacterNarrative(scriptData, characters);
				Object.assign(results, batch1);
				await new Promise(resolve => setTimeout(resolve, 2000)); // Delay before next batch
			} catch (error) {
				console.error('Error in Batch 1:', error.message);
				results.femaleAgency = { failed: true, error: error.message };
				results.characterDevelopment = { failed: true, error: error.message };
				results.sentiment = { failed: true, error: error.message };
				results.topics = { failed: true, error: error.message };
			}

			// BATCH 2: Social Dynamics & Representation
			console.log('Running Batch 2: Social Dynamics & Representation...');
			try {
				const batch2 = await this.analyzeBatch2_SocialDynamics(scriptData, characters);
				Object.assign(results, batch2);
				await new Promise(resolve => setTimeout(resolve, 2000)); // Delay before next batch
			} catch (error) {
				console.error('Error in Batch 2:', error.message);
				results.stereotypes = { failed: true, error: error.message };
				results.intersectionality = { failed: true, error: error.message };
				results.powerDynamics = { failed: true, error: error.message };
				results.vocabulary = { failed: true, error: error.message };
				results.biasDetection = { failed: true, error: error.message };
			}

			// BATCH 3: Enhanced Bechdel Validation (conditional)
			if (bechdelData && bechdelData.scenesThatPass) {
				console.log('Running Batch 3: Enhanced Bechdel Validation...');
				try {
					results.enhancedBechdelValidation = await this.validateBechdelScenes(scriptData, characters, bechdelData);
				} catch (error) {
					console.error('Error in Bechdel validation:', error.message);
					results.enhancedBechdelValidation = { failed: true, error: error.message };
				}
			}

			return {
				...results,
				analysisTimestamp: new Date().toISOString()
			};
		} catch (error) {
			console.error('Error in Claude analysis:', error);
			throw new Error(`Claude analysis failed: ${error.message}`);
		}
	}

	/**
     * Batch 1: Character & Narrative Analysis
     * Combines femaleAgency, characterDevelopment, sentiment, and topics into one API call
     */
	async analyzeBatch1_CharacterNarrative(scriptData, characters) {
		const prompt = `Analyze this movie script for character and narrative elements. Provide comprehensive analysis in the following JSON structure.

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

Female characters:
${JSON.stringify(characters.filter(c => c.gender === 2), null, 2)}

You must respond with valid JSON in this EXACT structure (all fields required):
{
    "femaleAgency": {
        "agencyScore": <number 1-10>,
        "plotDrivingMoments": [<string>, <string>, ...],
        "reactiveMoments": [<string>, <string>, ...],
        "decisionMaking": "<string analysis>",
        "goalPursuit": "<string analysis>",
        "recommendations": "<string with recommendations>"
    },
    "characterDevelopment": {
        "femaleCharacterDevelopment": "<string analysis>",
        "maleCharacterDevelopment": "<string analysis>",
        "developmentComparison": "<string comparison>",
        "growthPatterns": "<string analysis>",
        "complexityDepth": {
            "female": "<string>",
            "male": "<string>"
        },
        "recommendations": "<string with recommendations>"
    },
    "sentiment": {
        "maleEmotionalPatterns": "<string analysis>",
        "femaleEmotionalPatterns": "<string analysis>",
        "comparison": "<string comparison analysis>",
        "emotionalRange": {
            "male": "<string>",
            "female": "<string>"
        },
        "recommendations": "<string with recommendations>"
    },
    "topics": {
        "maleTopics": [<string>, <string>, ...],
        "femaleTopics": [<string>, <string>, ...],
        "topicDiversity": {
            "male": "<string analysis>",
            "female": "<string analysis>"
        },
        "expertise": {
            "male": "<string>",
            "female": "<string>"
        },
        "recommendations": "<string with recommendations>"
    }
}

Respond only with the JSON object, no additional text.`;

		const response = await this.callClaude(prompt, 'batch1_character_narrative');
		return response;
	}

	/**
     * Batch 2: Social Dynamics & Representation
     * Combines stereotypes, intersectionality, powerDynamics, vocabulary, and biasDetection
     */
	async analyzeBatch2_SocialDynamics(scriptData, characters) {
		const prompt = `Analyze this movie script for social dynamics and representation. Provide comprehensive analysis in the following JSON structure.

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

Female characters:
${JSON.stringify(characters.filter(c => c.gender === 2), null, 2)}

You must respond with valid JSON in this EXACT structure (all fields required):
{
    "stereotypes": {
        "stereotypeScore": <number 1-10 where 10 is most stereotypical>,
        "detectedStereotypes": [<string>, <string>, ...],
        "characterArchetypes": {
            "archetype1": "description",
            "archetype2": "description"
        },
        "problematicPatterns": [<string>, <string>, ...],
        "recommendations": "<string with recommendations>"
    },
    "intersectionality": {
        "diversityScore": <number 1-10>,
        "identityAnalysis": "<string analysis of intersectional identities>",
        "representationGaps": [<string>, <string>, ...],
        "tokenismDetected": "<boolean or string analysis>",
        "recommendations": "<string with recommendations>"
    },
    "powerDynamics": {
        "powerDynamicsScore": <number 1-10 where 5 is balanced>,
        "interruptionPatterns": [<string>, <string>, ...],
        "questionCommandAnalysis": "<string analysis>",
        "speakingTimeAnalysis": "<string analysis>",
        "authorityPatterns": [<string>, <string>, ...],
        "recommendations": "<string with recommendations>"
    },
    "vocabulary": {
        "maleVocabulary": "<string analysis>",
        "femaleVocabulary": "<string analysis>",
        "sophisticationComparison": "<string comparison>",
        "emotionalVocabulary": {
            "male": "<string>",
            "female": "<string>"
        },
        "technicalLanguage": {
            "male": "<string>",
            "female": "<string>"
        },
        "recommendations": "<string with recommendations>"
    },
    "biasDetection": {
        "biasScore": <number 1-10 where 10 is most biased>,
        "detectedBiases": [<string>, <string>, ...],
        "biasPatterns": [<string>, <string>, ...],
        "microaggressions": [<string>, <string>, ...],
        "systemicBias": "<string analysis>",
        "recommendations": "<string with recommendations>"
    }
}

Respond only with the JSON object, no additional text.`;

		const response = await this.callClaude(prompt, 'batch2_social_dynamics');
		return response;
	}

	/**
     * Analyze female agency in the script
     */
	async analyzeFemaleAgency(scriptData, characters) {
		const prompt = `Analyze the following movie script for female agency. Focus on:
1. When female characters drive the plot vs. react to male characters
2. Female characters making decisions that affect the story
3. Female characters initiating actions vs. responding to others
4. Female characters having goals and pursuing them actively

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters with gender info:
${JSON.stringify(characters.filter(c => c.gender === 2), null, 2)}

You must respond with valid JSON in this exact structure:
{
    "agencyScore": <number 1-10>,
    "plotDrivingMoments": [<string>, <string>, ...],
    "reactiveMoments": [<string>, <string>, ...],
    "decisionMaking": "<string analysis>",
    "goalPursuit": "<string analysis>",
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'female_agency');
	}

	/**
     * Detect female character stereotypes
     */
	async detectStereotypes(scriptData, characters) {
		const prompt = `Analyze the following movie script for female character stereotypes and tropes. Look for:
1. Common stereotypes: damsel in distress, femme fatale, manic pixie dream girl, etc.
2. Character archetypes: mother, wife, girlfriend, secretary, etc.
3. Dialogue patterns that reinforce stereotypes
4. Character motivations and roles

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Female characters:
${JSON.stringify(characters.filter(c => c.gender === 2), null, 2)}

You must respond with valid JSON in this exact structure:
{
    "stereotypeScore": <number 1-10 where 10 is most stereotypical>,
    "detectedStereotypes": [<string>, <string>, ...],
    "characterArchetypes": {
        "archetype1": "description",
        "archetype2": "description"
    },
    "problematicPatterns": [<string>, <string>, ...],
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'stereotype_detection');
	}

	/**
     * Analyze intersectionality
     */
	async analyzeIntersectionality(scriptData, characters) {
		const prompt = `Analyze the following movie script for intersectionality in female character representation. Consider:
1. Race, ethnicity, age, class, sexuality, disability representation
2. How different identities intersect in female characters
3. Representation diversity among female characters
4. Tokenism vs. meaningful representation

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

You must respond with valid JSON in this exact structure:
{
    "diversityScore": <number 1-10>,
    "identityAnalysis": "<string analysis of intersectional identities>",
    "representationGaps": [<string>, <string>, ...],
    "tokenismDetected": "<boolean or string analysis>",
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'intersectionality');
	}

	/**
     * Analyze sentiment of dialogue by gender
     */
	async analyzeSentiment(scriptData, characters) {
		const prompt = `Analyze the emotional tone and sentiment of dialogue by gender in this movie script. Focus on:
1. Emotional range of male vs female characters
2. Sentiment patterns in dialogue
3. Emotional agency and expression
4. Stereotypical emotional patterns

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

You must respond with valid JSON in this exact structure:
{
    "maleEmotionalPatterns": "<string analysis>",
    "femaleEmotionalPatterns": "<string analysis>",
    "comparison": "<string comparison analysis>",
    "emotionalRange": {
        "male": "<string>",
        "female": "<string>"
    },
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'sentiment_analysis');
	}

	/**
     * Analyze topics discussed by gender
     */
	async analyzeTopics(scriptData, characters) {
		const prompt = `Analyze the topics and subjects discussed by male vs female characters in this movie script. Focus on:
1. What topics each gender discusses
2. Subject matter expertise by gender
3. Conversation themes and focus areas
4. Topic diversity by gender

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

You must respond with valid JSON in this exact structure:
{
    "maleTopics": [<string>, <string>, ...],
    "femaleTopics": [<string>, <string>, ...],
    "topicDiversity": {
        "male": "<string analysis>",
        "female": "<string analysis>"
    },
    "expertise": {
        "male": "<string>",
        "female": "<string>"
    },
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'topic_analysis');
	}

	/**
     * Analyze power dynamics
     */
	async analyzePowerDynamics(scriptData, characters) {
		const prompt = `Analyze power dynamics and conversational patterns in this movie script. Focus on:
1. Who interrupts whom
2. Who asks questions vs gives commands
3. Speaking time and frequency
4. Authority and leadership patterns
5. Decision-making power

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

You must respond with valid JSON in this exact structure:
{
    "powerDynamicsScore": <number 1-10 where 5 is balanced>,
    "interruptionPatterns": [<string>, <string>, ...],
    "questionCommandAnalysis": "<string analysis>",
    "speakingTimeAnalysis": "<string analysis>",
    "authorityPatterns": [<string>, <string>, ...],
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'power_dynamics');
	}

	/**
     * Analyze vocabulary differences
     */
	async analyzeVocabulary(scriptData, characters) {
		const prompt = `Analyze vocabulary and language patterns by gender in this movie script. Focus on:
1. Word choice differences between genders
2. Language complexity and sophistication
3. Emotional vocabulary usage
4. Professional/technical language usage
5. Swearing and informal language patterns

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

You must respond with valid JSON in this exact structure:
{
    "maleVocabulary": "<string analysis>",
    "femaleVocabulary": "<string analysis>",
    "sophisticationComparison": "<string comparison>",
    "emotionalVocabulary": {
        "male": "<string>",
        "female": "<string>"
    },
    "technicalLanguage": {
        "male": "<string>",
        "female": "<string>"
    },
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'vocabulary_analysis');
	}

	/**
     * Detect subtle gender biases
     */
	async detectBias(scriptData, characters) {
		const prompt = `Detect subtle gender biases in this movie script. Look for:
1. Implicit biases in character descriptions
2. Subtle language patterns that reinforce gender roles
3. Unconscious bias in dialogue and actions
4. Microaggressions and subtle discrimination
5. Systemic bias patterns

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

You must respond with valid JSON in this exact structure:
{
    "biasScore": <number 1-10 where 10 is most biased>,
    "detectedBiases": [<string>, <string>, ...],
    "biasPatterns": [<string>, <string>, ...],
    "microaggressions": [<string>, <string>, ...],
    "systemicBias": "<string analysis>",
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'bias_detection');
	}


	/**
     * Analyze character development over time
     */
	async analyzeCharacterDevelopment(scriptData, characters) {
		const prompt = `Analyze character development and growth over time in this movie script. Focus on:
1. Character arcs for female vs male characters
2. Growth and change patterns
3. Character agency development
4. Character complexity and depth
5. Character relationships and dynamics

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

You must respond with valid JSON in this exact structure:
{
    "femaleCharacterDevelopment": "<string analysis>",
    "maleCharacterDevelopment": "<string analysis>",
    "developmentComparison": "<string comparison>",
    "growthPatterns": "<string analysis>",
    "complexityDepth": {
        "female": "<string>",
        "male": "<string>"
    },
    "recommendations": "<string with recommendations>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'character_development');
	}

	/**
     * Validate Bechdel test results with LLM analysis
     * Re-evaluates scenes that passed the keyword-based test for false positives
     */
	async validateBechdelScenes(scriptData, characters, bechdelData) {
		// Limit to analyzing up to 10 scenes that passed (for cost/time)
		const scenesToAnalyze = bechdelData.scenesThatPass.slice(0, 10);

		const prompt = `You are analyzing film scenes for the Bechdel Test. I've run a keyword-based analysis that marked these scenes as PASSING. Please re-evaluate each scene to identify false positives.

THE BECHDEL TEST CRITERIA:
1. Two or more named women characters
2. Who have a conversation with each other (meaningful dialogue, not just "hi" or "okay")
3. About something OTHER than a man/men

IMPORTANT DISTINCTIONS:
- "Let's go to Manhattan" = NOT about a man (just a place name)
- "The manager approved our budget" = Debatable - if discussing the budget/work, NOT about a man; if discussing the manager personally, IS about a man
- "John's promotion means we get new resources" = ABOUT a man (his promotion is the focus)
- Brief greetings like "Good morning" / "Hi" = NOT a meaningful conversation
- One woman talking while another just says "uh-huh" / "yeah" = NOT a real conversation

Female characters in this film:
${JSON.stringify(characters.filter(c => c.gender === 1).map(c => c.cleanCharName), null, 2)}

SCENES TO ANALYZE:
${scenesToAnalyze.map((scene, i) => `
Scene ${i + 1}:
${scene.substring(0, 1000)}
---`).join('\n')}

You must respond with valid JSON in this exact structure:
{
    "scenesAnalyzed": ${scenesToAnalyze.length},
    "scenes": [
        {
            "sceneNumber": <number 1-${scenesToAnalyze.length}>,
            "llmResult": "<pass or fail>",
            "confidence": <number 0-1>,
            "reasoning": "<brief explanation>",
            "femaleCharactersIdentified": [<string>, <string>],
            "conversationSubject": "<brief description>",
            "falsePositive": <boolean>
        }
    ],
    "overallAssessment": {
        "keywordTestScore": ${bechdelData.bechdelScore},
        "llmRecommendedScore": <number 0-3>,
        "llmPass": <boolean>,
        "falsePositivesDetected": <number>,
        "reasoning": "<overall assessment>"
    },
    "recommendations": "<string with recommendations for improving accuracy>"
}

Respond only with the JSON object, no additional text.`;

		return await this.callClaude(prompt, 'bechdel_validation');
	}

	/**
     * Make API call to Claude
     */
	async callClaude(prompt, analysisType) {
		try {
			const response = await this.anthropic.messages.create({
				model: 'claude-3-5-haiku-20241022',
				max_tokens: 4000,
				temperature: 0.3,
				messages: [{
					role: 'user',
					content: prompt
				}]
			});

			const content = response.content[0].text;

			// Try to parse as JSON
			try {
				const jsonMatch = content.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					return JSON.parse(jsonMatch[0]);
				}
				// If no JSON found, return raw response with parse error flag
				console.warn(`No JSON found in response for ${analysisType}`);
				return {
					parseError: true,
					rawResponse: content.trim()
				};
			} catch (parseError) {
				console.error(`JSON parse error for ${analysisType}:`, parseError.message);
				return {
					parseError: true,
					rawResponse: content.trim()
				};
			}
		} catch (error) {
			// Enhanced error handling with specific error types
			if (error instanceof RateLimitError) {
				console.error(`⚠️  RATE LIMIT ERROR for ${analysisType}:`, {
					message: error.message,
					status: error.status,
					headers: error.headers
				});
				return {
					analysisType,
					errorType: 'rate_limit',
					error: error.message,
					status: error.status,
					retryAfter: error.headers?.['retry-after'],
					failed: true
				};
			} else if (error instanceof APIConnectionTimeoutError) {
				console.error(`⏱️  TIMEOUT ERROR for ${analysisType}:`, error.message);
				return {
					analysisType,
					errorType: 'timeout',
					error: error.message,
					failed: true
				};
			} else if (error instanceof APIConnectionError) {
				console.error(`🌐 CONNECTION ERROR for ${analysisType}:`, error.message);
				return {
					analysisType,
					errorType: 'connection',
					error: error.message,
					failed: true
				};
			} else if (error instanceof APIError) {
				console.error(`❌ API ERROR for ${analysisType}:`, {
					message: error.message,
					status: error.status,
					type: error.type
				});
				return {
					analysisType,
					errorType: 'api_error',
					error: error.message,
					status: error.status,
					type: error.type,
					failed: true
				};
			} else {
				console.error(`🔥 UNEXPECTED ERROR for ${analysisType}:`, error);
				return {
					analysisType,
					errorType: 'unknown',
					error: error.message,
					failed: true
				};
			}
		}
	}
}

module.exports = ClaudeAnalyzer;
