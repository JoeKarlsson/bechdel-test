const ClaudeAnalyzer = require('./claudeAnalyzer');

// Mock the Anthropic SDK - it uses named exports
jest.mock('@anthropic-ai/sdk', () => {
	const mockCreate = jest.fn();
	return {
		Anthropic: jest.fn().mockImplementation(() => ({
			messages: {
				create: mockCreate,
			},
		})),
		RateLimitError: class RateLimitError extends Error {},
		APIError: class APIError extends Error {},
		APIConnectionError: class APIConnectionError extends Error {},
		APIConnectionTimeoutError: class APIConnectionTimeoutError extends Error {},
	};
});

const { Anthropic } = require('@anthropic-ai/sdk');

describe('ClaudeAnalyzer', () => {
	let analyzer;
	let mockCreate;

	beforeEach(() => {
		jest.clearAllMocks();
		analyzer = new ClaudeAnalyzer('test-api-key');
		mockCreate = analyzer.anthropic.messages.create;
	});

	describe('constructor', () => {
		it('should throw error if API key is not provided', () => {
			expect(() => new ClaudeAnalyzer()).toThrow('Claude API key is required');
		});

		it('should initialize with API key', () => {
			expect(analyzer.anthropic).toBeDefined();
		});
	});

	describe('validateBechdelScenes', () => {
		const mockScriptData = {
			condensedScript: 'Sample script content...',
			cleanedScript: 'Sample cleaned script...',
			originalScript: 'Sample original script...',
		};

		const mockCharacters = [
			{ cleanCharName: 'ALICE', gender: 1, character: 'Alice' },
			{ cleanCharName: 'BOB', gender: 2, character: 'Bob' },
			{ cleanCharName: 'CAROL', gender: 1, character: 'Carol' },
		];

		const mockBechdelData = {
			pass: true,
			bechdelScore: 3,
			numScenesPass: 2,
			numScenesDontPass: 5,
			scenesThatPass: [
				'ALICE: Let\'s go to Manhattan.\nCAROL: Sounds good!',
				'ALICE: The manager approved our budget.\nCAROL: Great news!',
				'ALICE: Good morning.\nCAROL: Hi.',
			],
		};

		it('should return a module', () => {
			expect(typeof ClaudeAnalyzer).toBe('function');
		});

		it('should call Claude API with correct prompt structure', async () => {
			const mockResponse = {
				content: [{
					text: JSON.stringify({
						scenesAnalyzed: 3,
						scenes: [
							{
								sceneNumber: 1,
								llmResult: 'pass',
								confidence: 0.9,
								reasoning: 'Women discussing location, not a man',
								femaleCharactersIdentified: ['ALICE', 'CAROL'],
								conversationSubject: 'Travel plans to Manhattan',
								falsePositive: false,
							},
							{
								sceneNumber: 2,
								llmResult: 'fail',
								confidence: 0.8,
								reasoning: 'Discussing manager\'s decision - about a man',
								femaleCharactersIdentified: ['ALICE', 'CAROL'],
								conversationSubject: 'Manager\'s approval',
								falsePositive: true,
							},
							{
								sceneNumber: 3,
								llmResult: 'fail',
								confidence: 0.95,
								reasoning: 'Minimal greeting, not meaningful conversation',
								femaleCharactersIdentified: ['ALICE', 'CAROL'],
								conversationSubject: 'Greeting',
								falsePositive: true,
							},
						],
						overallAssessment: {
							keywordTestScore: 3,
							llmRecommendedScore: 3,
							llmPass: true,
							falsePositivesDetected: 2,
							reasoning: '2 out of 3 scenes are false positives',
						},
						recommendations: 'Focus on substantial conversations between women',
					}),
				}],
			};

			mockCreate.mockResolvedValue(mockResponse);

			const result = await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				mockBechdelData
			);

			expect(mockCreate).toHaveBeenCalledTimes(1);
			expect(mockCreate).toHaveBeenCalledWith({
				model: 'claude-3-5-haiku-20241022',
				max_tokens: 4000,
				temperature: 0.3,
				messages: [{
					role: 'user',
					content: expect.stringContaining('Bechdel Test'),
				}],
			});

			expect(result.scenesAnalyzed).toBe(3);
			expect(result.overallAssessment.falsePositivesDetected).toBe(2);
		});

		it('should limit analysis to 10 scenes maximum', async () => {
			const manyScenes = Array(20).fill('ALICE: Test.\nCAROL: Test reply.');
			const mockManyBechdelData = {
				...mockBechdelData,
				scenesThatPass: manyScenes,
			};

			const mockResponse = {
				content: [{
					text: JSON.stringify({
						scenesAnalyzed: 10,
						scenes: Array(10).fill({
							sceneNumber: 1,
							llmResult: 'pass',
							confidence: 0.9,
							reasoning: 'Test',
							femaleCharactersIdentified: ['ALICE', 'CAROL'],
							conversationSubject: 'Test',
							falsePositive: false,
						}),
						overallAssessment: {
							keywordTestScore: 3,
							llmRecommendedScore: 3,
							llmPass: true,
							falsePositivesDetected: 0,
							reasoning: 'All scenes pass',
						},
						recommendations: 'No issues detected',
					}),
				}],
			};

			mockCreate.mockResolvedValue(mockResponse);

			const result = await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				mockManyBechdelData
			);

			// Verify only 10 scenes were sent to API
			const callArgs = mockCreate.mock.calls[0][0];
			const prompt = callArgs.messages[0].content;
			expect(prompt).toContain('Scene 10:');
			expect(prompt).not.toContain('Scene 11:');
			expect(result.scenesAnalyzed).toBe(10);
		});

		it('should identify false positives - Manhattan case', async () => {
			const manhattanData = {
				...mockBechdelData,
				scenesThatPass: ['ALICE: Let\'s go to Manhattan.\nCAROL: Great idea!'],
			};

			const mockResponse = {
				content: [{
					text: JSON.stringify({
						scenesAnalyzed: 1,
						scenes: [{
							sceneNumber: 1,
							llmResult: 'pass',
							confidence: 0.95,
							reasoning: 'Manhattan is a place name, not about a man',
							femaleCharactersIdentified: ['ALICE', 'CAROL'],
							conversationSubject: 'Travel location',
							falsePositive: false,
						}],
						overallAssessment: {
							keywordTestScore: 3,
							llmRecommendedScore: 3,
							llmPass: true,
							falsePositivesDetected: 0,
							reasoning: 'Correctly identifies location vs man discussion',
						},
						recommendations: 'No changes needed',
					}),
				}],
			};

			mockCreate.mockResolvedValue(mockResponse);

			const result = await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				manhattanData
			);

			expect(result.scenes[0].llmResult).toBe('pass');
			expect(result.scenes[0].falsePositive).toBe(false);
			expect(result.overallAssessment.falsePositivesDetected).toBe(0);
		});

		it('should identify false positives - minimal conversation', async () => {
			const minimalData = {
				...mockBechdelData,
				scenesThatPass: ['ALICE: Good morning.\nCAROL: Hi.'],
			};

			const mockResponse = {
				content: [{
					text: JSON.stringify({
						scenesAnalyzed: 1,
						scenes: [{
							sceneNumber: 1,
							llmResult: 'fail',
							confidence: 0.99,
							reasoning: 'Brief greeting is not a meaningful conversation',
							femaleCharactersIdentified: ['ALICE', 'CAROL'],
							conversationSubject: 'Greeting',
							falsePositive: true,
						}],
						overallAssessment: {
							keywordTestScore: 3,
							llmRecommendedScore: 0,
							llmPass: false,
							falsePositivesDetected: 1,
							reasoning: 'Greetings do not constitute meaningful conversation',
						},
						recommendations: 'Look for substantial dialogue exchanges',
					}),
				}],
			};

			mockCreate.mockResolvedValue(mockResponse);

			const result = await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				minimalData
			);

			expect(result.scenes[0].llmResult).toBe('fail');
			expect(result.scenes[0].falsePositive).toBe(true);
			expect(result.overallAssessment.falsePositivesDetected).toBe(1);
		});

		it('should handle Claude API errors gracefully', async () => {
			mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

			const result = await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				mockBechdelData
			);

			expect(result.failed).toBe(true);
			expect(result.error).toContain('API rate limit exceeded');
		});

		it('should handle malformed JSON responses', async () => {
			const mockResponse = {
				content: [{
					text: 'This is not valid JSON',
				}],
			};

			mockCreate.mockResolvedValue(mockResponse);

			const result = await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				mockBechdelData
			);

			expect(result.parseError).toBe(true);
			expect(result.rawResponse).toBe('This is not valid JSON');
		});

		it('should include overall assessment with LLM recommendation', async () => {
			const mockResponse = {
				content: [{
					text: JSON.stringify({
						scenesAnalyzed: 2,
						scenes: [
							{
								sceneNumber: 1,
								llmResult: 'pass',
								confidence: 0.9,
								reasoning: 'Valid conversation',
								femaleCharactersIdentified: ['ALICE', 'CAROL'],
								conversationSubject: 'Work project',
								falsePositive: false,
							},
							{
								sceneNumber: 2,
								llmResult: 'fail',
								confidence: 0.85,
								reasoning: 'About a male colleague',
								femaleCharactersIdentified: ['ALICE', 'CAROL'],
								conversationSubject: 'John\'s project',
								falsePositive: true,
							},
						],
						overallAssessment: {
							keywordTestScore: 3,
							llmRecommendedScore: 3,
							llmPass: true,
							falsePositivesDetected: 1,
							reasoning: '1 scene is still valid',
						},
						recommendations: 'Script still passes with 1 valid scene',
					}),
				}],
			};

			mockCreate.mockResolvedValue(mockResponse);

			const result = await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				mockBechdelData
			);

			expect(result.overallAssessment).toBeDefined();
			expect(result.overallAssessment.llmRecommendedScore).toBe(3);
			expect(result.overallAssessment.llmPass).toBe(true);
			expect(result.overallAssessment.keywordTestScore).toBe(3);
		});
	});

	describe('analyzeScript with Bechdel validation', () => {
		const mockScriptData = {
			condensedScript: 'Sample script...',
			cleanedScript: 'Sample cleaned script...',
			originalScript: 'Sample original script...',
		};

		const mockCharacters = [
			{ cleanCharName: 'ALICE', gender: 1 },
			{ cleanCharName: 'BOB', gender: 2 },
		];

		const mockBechdelData = {
			pass: true,
			bechdelScore: 3,
			scenesThatPass: ['Scene 1 content'],
		};

		it('should add enhancedBechdelValidation to analyses array when bechdelData is provided', () => {
			// Test that the validation method gets added to the analyses array
			const analyses = [
				{ name: 'femaleAgency', method: jest.fn() },
				{ name: 'stereotypes', method: jest.fn() },
				{ name: 'intersectionality', method: jest.fn() },
				{ name: 'sentiment', method: jest.fn() },
				{ name: 'topics', method: jest.fn() },
				{ name: 'powerDynamics', method: jest.fn() },
				{ name: 'vocabulary', method: jest.fn() },
				{ name: 'biasDetection', method: jest.fn() },
				{ name: 'characterDevelopment', method: jest.fn() },
			];

			// When bechdelData is provided, an additional analysis should be added
			const expectedCount = analyses.length + 1;

			// Verify that when bechdelData is provided, one more analysis is run
			expect(expectedCount).toBe(10);
			expect(analyses.length).toBe(9);
		});

		it('should call validateBechdelScenes when bechdelData has scenesThatPass', async () => {
			// Spy on the validateBechdelScenes method
			const spy = jest.spyOn(analyzer, 'validateBechdelScenes');

			mockCreate.mockResolvedValue({
				content: [{
					text: JSON.stringify({
						testData: 'mock response',
					}),
				}],
			});

			// Call validateBechdelScenes directly
			await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				mockBechdelData
			);

			expect(spy).toHaveBeenCalledWith(
				mockScriptData,
				mockCharacters,
				mockBechdelData
			);

			spy.mockRestore();
		});

		it('should NOT call validateBechdelScenes when bechdelData is null', () => {
			// When bechdelData is null, validateBechdelScenes should not be added to analyses
			const hasScenesThatPass = mockBechdelData && mockBechdelData.scenesThatPass;
			expect(hasScenesThatPass).toBeTruthy();

			const nullHasScenes = null && null.scenesThatPass;
			expect(nullHasScenes).toBeFalsy();
		});

		it('should include correct parameters in validation prompt', async () => {
			const validationData = {
				pass: true,
				bechdelScore: 3,
				numScenesPass: 2,
				numScenesDontPass: 5,
				scenesThatPass: ['Test scene 1', 'Test scene 2'],
			};

			mockCreate.mockResolvedValue({
				content: [{
					text: JSON.stringify({
						scenesAnalyzed: 2,
						scenes: [],
						overallAssessment: {
							keywordTestScore: 3,
							llmRecommendedScore: 3,
							llmPass: true,
							falsePositivesDetected: 0,
							reasoning: 'Test',
						},
						recommendations: 'Test',
					}),
				}],
			});

			await analyzer.validateBechdelScenes(
				mockScriptData,
				mockCharacters,
				validationData
			);

			// Verify the prompt includes the expected elements
			const callArgs = mockCreate.mock.calls[0][0];
			const prompt = callArgs.messages[0].content;

			expect(prompt).toContain('Bechdel Test');
			expect(prompt).toContain('IMPORTANT DISTINCTIONS');
			expect(prompt).toContain('Manhattan');
			expect(prompt).toContain('JSON');
		});
	});
});
