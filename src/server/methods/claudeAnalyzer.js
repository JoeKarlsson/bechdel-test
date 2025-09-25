/**
 * Claude API Integration Module
 * Handles advanced analytics using Claude AI for film script analysis
 */

const Anthropic = require('@anthropic-ai/sdk');

class ClaudeAnalyzer {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Claude API key is required');
        }

        this.anthropic = new Anthropic({
            apiKey: apiKey,
        });
    }

    /**
     * Analyze script for advanced gender analytics
     * @param {Object} scriptData - Cleaned script data
     * @param {Array} characters - Character data with gender information
     * @returns {Object} Advanced analytics results
     */
    async analyzeScript(scriptData, characters) {
        try {
            const analysisPromises = [
                this.analyzeFemaleAgency(scriptData, characters),
                this.detectStereotypes(scriptData, characters),
                this.analyzeIntersectionality(scriptData, characters),
                this.analyzeSentiment(scriptData, characters),
                this.analyzeTopics(scriptData, characters),
                this.analyzePowerDynamics(scriptData, characters),
                this.analyzeVocabulary(scriptData, characters),
                this.detectBias(scriptData, characters),
                this.generateImprovements(scriptData, characters),
                this.analyzeCharacterDevelopment(scriptData, characters)
            ];

            const results = await Promise.all(analysisPromises);

            return {
                femaleAgency: results[0],
                stereotypes: results[1],
                intersectionality: results[2],
                sentiment: results[3],
                topics: results[4],
                powerDynamics: results[5],
                vocabulary: results[6],
                biasDetection: results[7],
                improvements: results[8],
                characterDevelopment: results[9],
                analysisTimestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error in Claude analysis:', error);
            throw new Error(`Claude analysis failed: ${error.message}`);
        }
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

Provide analysis in JSON format with:
- agencyScore: 1-10 rating of female agency
- plotDrivingMoments: Array of moments where females drive plot
- reactiveMoments: Array of moments where females only react
- decisionMaking: Analysis of female decision-making patterns
- goalPursuit: Analysis of female characters pursuing goals
- recommendations: Suggestions for improving female agency`;

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

Provide analysis in JSON format with:
- detectedStereotypes: Array of identified stereotypes
- characterArchetypes: Mapping of characters to archetypes
- problematicPatterns: Array of problematic patterns found
- stereotypeScore: 1-10 rating (10 = most stereotypical)
- recommendations: Suggestions for avoiding stereotypes`;

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

Provide analysis in JSON format with:
- diversityScore: 1-10 rating of representation diversity
- intersectionalAnalysis: Analysis of intersecting identities
- representationGaps: Identified gaps in representation
- tokenismDetection: Detection of token characters
- recommendations: Suggestions for better intersectional representation`;

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

Provide analysis in JSON format with:
- maleSentimentAnalysis: Analysis of male character emotional patterns
- femaleSentimentAnalysis: Analysis of female character emotional patterns
- sentimentComparison: Comparison between genders
- emotionalRange: Analysis of emotional range by gender
- recommendations: Suggestions for balanced emotional representation`;

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

Provide analysis in JSON format with:
- maleTopics: Topics primarily discussed by male characters
- femaleTopics: Topics primarily discussed by female characters
- topicDiversity: Analysis of topic diversity by gender
- expertiseAreas: Areas of expertise by gender
- recommendations: Suggestions for balanced topic representation`;

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

Provide analysis in JSON format with:
- interruptionPatterns: Analysis of who interrupts whom
- questionCommandAnalysis: Analysis of questions vs commands by gender
- speakingTimeAnalysis: Analysis of speaking time distribution
- authorityPatterns: Analysis of authority and leadership
- powerDynamicsScore: 1-10 rating of power balance
- recommendations: Suggestions for balanced power dynamics`;

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

Provide analysis in JSON format with:
- maleVocabulary: Analysis of male character vocabulary patterns
- femaleVocabulary: Analysis of female character vocabulary patterns
- vocabularyComparison: Comparison of language sophistication
- emotionalLanguage: Analysis of emotional vocabulary usage
- professionalLanguage: Analysis of professional/technical language
- recommendations: Suggestions for balanced vocabulary representation`;

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

Provide analysis in JSON format with:
- detectedBiases: Array of detected biases
- biasPatterns: Analysis of recurring bias patterns
- microaggressions: Detection of microaggressions
- systemicBias: Analysis of systemic bias patterns
- biasScore: 1-10 rating (10 = most biased)
- recommendations: Suggestions for reducing bias`;

        return await this.callClaude(prompt, 'bias_detection');
    }

    /**
     * Generate script improvement suggestions
     */
    async generateImprovements(scriptData, characters) {
        const prompt = `Generate specific suggestions for improving gender representation in this movie script. Focus on:
1. Concrete ways to improve female character agency
2. Suggestions for reducing stereotypes
3. Ways to improve dialogue and character development
4. Specific scene improvements
5. Character arc improvements

Script excerpt:
${scriptData.condensedScript.substring(0, 8000)}

Characters:
${JSON.stringify(characters, null, 2)}

Provide analysis in JSON format with:
- characterImprovements: Specific character improvement suggestions
- dialogueImprovements: Suggestions for improving dialogue
- sceneImprovements: Suggestions for specific scene improvements
- plotImprovements: Suggestions for plot-level improvements
- overallRecommendations: High-level recommendations
- implementationPriority: Priority ranking of improvements`;

        return await this.callClaude(prompt, 'improvements');
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

Provide analysis in JSON format with:
- femaleCharacterArcs: Analysis of female character development
- maleCharacterArcs: Analysis of male character development
- developmentComparison: Comparison of character development by gender
- growthPatterns: Analysis of character growth patterns
- complexityAnalysis: Analysis of character complexity
- recommendations: Suggestions for improving character development`;

        return await this.callClaude(prompt, 'character_development');
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

			// Try to parse as JSON, fallback to text if parsing fails
			try {
				// Clean up the content to make it more JSON-friendly
				let cleanedContent = content.trim();
				
				// Remove any markdown formatting
				cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
				
				// Try to extract JSON from the content if it's embedded in text
				const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					cleanedContent = jsonMatch[0];
				}
				
				return JSON.parse(cleanedContent);
			} catch (parseError) {
				console.warn(`Failed to parse JSON for ${analysisType}, returning text:`, parseError);
				return {
					analysisType: analysisType,
					rawResponse: content,
					parseError: true,
					summary: content.substring(0, 200) + '...' // Provide a summary
				};
			}
        } catch (error) {
            console.error(`Claude API error for ${analysisType}:`, error);
            return {
                analysisType: analysisType,
                error: error.message,
                failed: true
            };
        }
    }
}

module.exports = ClaudeAnalyzer;
