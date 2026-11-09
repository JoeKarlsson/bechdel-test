/**
 * The AI second opinion: three prompts per film, sent through the LiteLLM
 * gateway's OpenAI-compatible chat completions endpoint.
 */

// Reasoning tokens count against this, so leave room beyond the JSON itself
const MAX_TOKENS = 8000;

class AiAnalyzer {
	/**
	 * @param {Object} config
	 * @param {string} config.baseUrl - LiteLLM gateway, e.g. http://192.168.0.230:4000
	 * @param {string} config.apiKey - LiteLLM virtual key
	 * @param {string} config.model - LiteLLM model alias, e.g. cloud-coder
	 */
	constructor({ baseUrl, apiKey, model } = {}) {
		if (!baseUrl || !apiKey || !model) {
			throw new Error('AiAnalyzer needs baseUrl, apiKey and model');
		}
		this.baseUrl = baseUrl.replace(/\/+$/, '');
		this.apiKey = apiKey;
		this.model = model;
		// The deployment LiteLLM actually routed to, recorded with each film
		this.servedModel = null;
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
			console.error('Error in AI analysis:', error);
			throw new Error(`AI analysis failed: ${error.message}`, { cause: error });
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
${JSON.stringify(characters.filter(c => c.gender === 1), null, 2)}

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

		const response = await this.callModel(prompt, 'batch1_character_narrative');
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
${JSON.stringify(characters.filter(c => c.gender === 1), null, 2)}

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

		const response = await this.callModel(prompt, 'batch2_social_dynamics');
		return response;
	}

	/**
     * Validate Bechdel test results with LLM analysis
     * Re-evaluates scenes that passed the keyword-based test for false positives
     */
	async validateBechdelScenes(scriptData, characters, bechdelData) {
		// Limit to analyzing up to 10 scenes that passed (for cost/time)
		const scenesToAnalyze = bechdelData.scenesThatPass.slice(0, 10);

		// If no scenes passed the keyword test, return a helpful message instead of calling the LLM
		if (scenesToAnalyze.length === 0) {
			return {
				scenesAnalyzed: 0,
				scenes: [],
				overallAssessment: {
					keywordTestScore: bechdelData.bechdelScore,
					llmRecommendedScore: bechdelData.bechdelScore,
					llmPass: false,
					falsePositivesDetected: 0,
					reasoning: `This film scored ${bechdelData.bechdelScore}/3 on the keyword-based Bechdel test with zero scenes passing all three criteria. The LLM validation feature is designed to re-evaluate scenes that passed the keyword test to detect false positives. Since no scenes passed the initial test, LLM validation is not applicable for this film.`
				},
				recommendations: bechdelData.bechdelScore === 0
					? 'This film has no named female characters. Consider adding female characters with speaking roles.'
					: bechdelData.bechdelScore === 1
						? 'This film has named female characters but they do not have conversations with each other. Consider adding dialogue between female characters.'
						: 'This film has conversations between female characters, but they only discuss men. Consider adding conversations between female characters about topics other than men (their work, goals, interests, etc.).'
			};
		}

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

		return await this.callModel(prompt, 'bechdel_validation');
	}

	/**
	 * One chat completion through the gateway. Returns the parsed JSON, or an
	 * object with failed/parseError set (the caller fails the film on either).
	 */
	async callModel(prompt, analysisType) {
		let response;
		try {
			response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model: this.model,
					max_tokens: MAX_TOKENS,
					temperature: 0.3,
					response_format: { type: 'json_object' },
					messages: [{ role: 'user', content: prompt }],
				}),
			});
		} catch (error) {
			return { analysisType, failed: true, error: `gateway unreachable: ${error.message}` };
		}

		const body = await response.json().catch(() => null);
		if (!response.ok) {
			return { analysisType, failed: true, status: response.status, error: body?.error?.message || `HTTP ${response.status}` };
		}
		this.servedModel = response.headers.get('x-litellm-model-name') || body.model;

		const choice = body.choices?.[0];
		if (choice?.finish_reason === 'length') {
			return { analysisType, failed: true, error: `reply cut off at ${MAX_TOKENS} tokens` };
		}
		const content = choice?.message?.content || '';
		const jsonMatch = content.match(/\{[\s\S]*\}/);
		try {
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0]);
			}
		} catch (parseError) {
			console.error(`JSON parse error for ${analysisType}:`, parseError.message);
		}
		return { parseError: true, rawResponse: content.trim() };
	}
}

module.exports = AiAnalyzer;
