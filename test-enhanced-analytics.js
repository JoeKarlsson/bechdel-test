/**
 * Test script for enhanced analytics
 * This script tests the new enhanced analytics functionality
 */

const EnhancedAnalytics = require('./src/server/methods/enhancedAnalytics');
const scriptCleaner = require('./src/server/methods/scriptCleaner');
const fs = require('fs');

// Test script cleaning functionality
const testScriptCleaning = () => {
	console.log('Testing script cleaning...');
	
	const testScript = `
FADE IN:

INT. LIVING ROOM - DAY

SARAH sits on the couch, looking worried.

SARAH
I don't know what to do about this situation.

JOHN enters the room.

JOHN
What's wrong, honey?

SARAH
It's just... everything feels so overwhelming.

JOHN
You know I'm here for you, right?

SARAH
I know, but sometimes I feel like I'm just reacting to everything instead of taking control.

JOHN
That's not true. You're the strongest person I know.

SARAH
Thank you. That means a lot.

FADE OUT.

THE END
`;

	try {
		const cleanedData = scriptCleaner.cleanScript(testScript);
		console.log('Script cleaning successful!');
		console.log('Original length:', cleanedData.tokenReduction.original);
		console.log('Cleaned length:', cleanedData.tokenReduction.cleaned);
		console.log('Condensed length:', cleanedData.tokenReduction.condensed);
		console.log('Reduction percentage:', cleanedData.tokenReduction.reductionPercentage + '%');
		console.log('Character dialogue extracted:', cleanedData.characterDialogue.length, 'entries');
		return cleanedData;
	} catch (error) {
		console.error('Script cleaning failed:', error);
		return null;
	}
};

// Test enhanced analytics (requires API key)
const testEnhancedAnalytics = async (apiKey) => {
	if (!apiKey) {
		console.log('Skipping enhanced analytics test - no API key provided');
		return;
	}

	console.log('Testing enhanced analytics...');
	
	try {
		const enhancedAnalytics = new EnhancedAnalytics(apiKey);
		
		// Create test data
		const testCharacters = [
			{ name: 'SARAH', gender: 2 },
			{ name: 'JOHN', gender: 1 }
		];
		
		const testScriptPath = './test-script.txt';
		const testScript = `
SARAH
I don't know what to do about this situation.

JOHN
What's wrong, honey?

SARAH
It's just... everything feels so overwhelming.

JOHN
You know I'm here for you, right?

SARAH
I know, but sometimes I feel like I'm just reacting to everything instead of taking control.

JOHN
That's not true. You're the strongest person I know.

SARAH
Thank you. That means a lot.
`;
		
		// Write test script to file
		fs.writeFileSync(testScriptPath, testScript);
		
		// Run analysis
		const results = await enhancedAnalytics.analyzeScript(testScriptPath, testCharacters);
		
		console.log('Enhanced analytics successful!');
		console.log('Analysis timestamp:', results.analysisMetadata.analysisTimestamp);
		console.log('Available analyses:', Object.keys(results.enhancedAnalytics));
		
		// Clean up test file
		fs.unlinkSync(testScriptPath);
		
		return results;
	} catch (error) {
		console.error('Enhanced analytics test failed:', error);
		return null;
	}
};

// Main test function
const runTests = async () => {
	console.log('Starting enhanced analytics tests...\n');
	
	// Test script cleaning
	const cleanedData = testScriptCleaning();
	if (!cleanedData) {
		console.log('Script cleaning test failed, stopping tests');
		return;
	}
	
	console.log('\n' + '='.repeat(50) + '\n');
	
	// Test enhanced analytics if API key is provided
	const apiKey = process.env.CLAUDE_API_KEY;
	await testEnhancedAnalytics(apiKey);
	
	console.log('\nTests completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
	runTests().catch(console.error);
}

module.exports = {
	testScriptCleaning,
	testEnhancedAnalytics,
	runTests
};
