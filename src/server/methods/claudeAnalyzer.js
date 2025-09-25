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
            // Run analyses sequentially to avoid rate limiting
            const analyses = [
                { name: 'femaleAgency', method: () => this.analyzeFemaleAgency(scriptData, characters) },
                { name: 'stereotypes', method: () => this.detectStereotypes(scriptData, characters) },
                { name: 'intersectionality', method: () => this.analyzeIntersectionality(scriptData, characters) },
                { name: 'sentiment', method: () => this.analyzeSentiment(scriptData, characters) },
                { name: 'topics', method: () => this.analyzeTopics(scriptData, characters) },
                { name: 'powerDynamics', method: () => this.analyzePowerDynamics(scriptData, characters) },
                { name: 'vocabulary', method: () => this.analyzeVocabulary(scriptData, characters) },
                { name: 'biasDetection', method: () => this.detectBias(scriptData, characters) },
                { name: 'characterDevelopment', method: () => this.analyzeCharacterDevelopment(scriptData, characters) }
            ];

            const results = {};

            for (let i = 0; i < analyses.length; i++) {
                const analysis = analyses[i];
                try {
                    console.log(`Running ${analysis.name} analysis...`);
                    results[analysis.name] = await analysis.method();

                    // Add delay between requests to respect rate limits
                    if (i < analyses.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
                    }
                } catch (error) {
                    console.error(`Error in ${analysis.name} analysis:`, error.message);
                    // Continue with other analyses even if one fails
                    results[analysis.name] = { failed: true, error: error.message };
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

Provide a detailed analysis in plain text format covering:
- Agency Score (1-10 rating where 10 = highest agency)
- Plot-driving moments by female characters
- Reactive moments where female characters respond to others
- Decision-making patterns
- Goal pursuit analysis
- Recommendations for improving female agency

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

Provide a detailed analysis in plain text format covering:
- Detected stereotypes and tropes
- Character archetypes and their implications
- Problematic patterns in representation
- Stereotype Score (1-10 rating where 10 = most stereotypical)
- Recommendations for avoiding stereotypes

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

Provide a detailed analysis in plain text format covering:
- Diversity Score (1-10 rating of representation diversity)
- Intersectional analysis of female character identities
- Representation gaps identified
- Tokenism detection
- Recommendations for better intersectional representation

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

Provide a detailed analysis in plain text format covering:
- Male character emotional patterns and sentiment
- Female character emotional patterns and sentiment
- Comparison between male and female emotional expression
- Analysis of emotional range by gender
- Recommendations for balanced emotional representation

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

Provide a detailed analysis in plain text format covering:
- Topics primarily discussed by male characters
- Topics primarily discussed by female characters
- Analysis of topic diversity by gender
- Areas of expertise by gender
- Recommendations for balanced topic representation

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

Provide a detailed analysis in plain text format covering:
- Interruption patterns and who interrupts whom
- Analysis of questions vs commands by gender
- Speaking time distribution analysis
- Authority and leadership patterns
- Power Dynamics Score (1-10 rating of power balance)
- Recommendations for balanced power dynamics

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

Provide a detailed analysis in plain text format covering:
- Male character vocabulary patterns and language use
- Female character vocabulary patterns and language use
- Comparison of language sophistication between genders
- Analysis of emotional vocabulary usage
- Analysis of professional/technical language usage
- Recommendations for balanced vocabulary representation

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

Provide a detailed analysis in plain text format covering:
- Detected biases and their manifestations
- Analysis of recurring bias patterns
- Detection of microaggressions
- Analysis of systemic bias patterns
- Bias Score (1-10 rating where 10 = most biased)
- Recommendations for reducing bias

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

Provide a detailed analysis in plain text format covering:
- Female character development and arcs
- Male character development and arcs
- Comparison of character development by gender
- Analysis of character growth patterns
- Analysis of character complexity and depth
- Recommendations for improving character development

Format your response as clear, readable text paragraphs. Do not use JSON format.`;

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

            // Return the plain text response directly
            return content.trim();
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
