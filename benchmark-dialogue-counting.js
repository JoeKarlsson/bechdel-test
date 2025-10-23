/**
 * Benchmark script to compare old vs new countCharacterDialogue implementation
 */

const fs = require('fs');
const path = require('path');

// Helper to escape regex special characters
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Old implementation (O(n*m))
function countCharacterDialogueOld(characters, scene) {
	const charDialougeCount = {};

	for (let i = 0; i < characters.length; i++) {
		let count = 0;
		const { cleanCharName } = characters[i];
		charDialougeCount[cleanCharName] = 0;

		while ((count = scene.indexOf(cleanCharName, count)) > -1) {
			charDialougeCount[cleanCharName]++;
			count++;
		}
	}
	return charDialougeCount;
}

// New implementation (still O(n*m) but optimized inner loop)
function countCharacterDialogueNew(characters, scene) {
	const charDialougeCount = {};

	for (let i = 0; i < characters.length; i++) {
		charDialougeCount[characters[i].cleanCharName] = 0;
	}

	if (characters.length === 0 || !scene.trim()) {
		return charDialougeCount;
	}

	const charNames = characters.map(c => c.cleanCharName);

	for (let i = 0; i < scene.length; i++) {
		for (let j = 0; j < charNames.length; j++) {
			const name = charNames[j];
			if (scene.substr(i, name.length) === name) {
				charDialougeCount[name]++;
			}
		}
	}

	return charDialougeCount;
}

// Test data
const mockCharacters = [
	{ cleanCharName: 'ALICE' },
	{ cleanCharName: 'BOB' },
	{ cleanCharName: 'CAROL' },
	{ cleanCharName: 'DAVE' },
	{ cleanCharName: 'EVE' },
	{ cleanCharName: 'FRANK' },
	{ cleanCharName: 'GRACE' },
	{ cleanCharName: 'HENRY' },
	{ cleanCharName: 'IVY' },
	{ cleanCharName: 'JACK' },
];

// Generate large test scene
const sceneSize = 100000;
const characterPool = mockCharacters.map(c => c.cleanCharName);
let testScene = '';
for (let i = 0; i < sceneSize; i++) {
	if (i % 100 === 0) {
		testScene += characterPool[Math.floor(Math.random() * characterPool.length)] + '\n';
	} else {
		testScene += 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n';
	}
}

console.log(`Scene size: ${testScene.length} characters`);
console.log(`Number of character names: ${mockCharacters.length}`);
console.log(`\nRunning benchmarks...\n`);

// Benchmark old implementation
const oldStart = Date.now();
for (let i = 0; i < 10; i++) {
	countCharacterDialogueOld(mockCharacters, testScene);
}
const oldTime = Date.now() - oldStart;

console.log(`Old implementation (indexOf): ${oldTime}ms for 10 iterations`);
console.log(`Average: ${(oldTime / 10).toFixed(2)}ms per iteration`);

// Benchmark new implementation
const newStart = Date.now();
for (let i = 0; i < 10; i++) {
	countCharacterDialogueNew(mockCharacters, testScene);
}
const newTime = Date.now() - newStart;

console.log(`\nNew implementation (substr): ${newTime}ms for 10 iterations`);
console.log(`Average: ${(newTime / 10).toFixed(2)}ms per iteration`);

// Calculate improvement
const improvement = ((oldTime - newTime) / oldTime * 100).toFixed(2);
console.log(`\nPerformance improvement: ${improvement}% ${improvement > 0 ? 'faster' : 'slower'}`);

// Verify results match
const oldResult = countCharacterDialogueOld(mockCharacters, testScene);
const newResult = countCharacterDialogueNew(mockCharacters, testScene);
const resultsMatch = JSON.stringify(oldResult) === JSON.stringify(newResult);
console.log(`\nResults match: ${resultsMatch ? '✅ YES' : '❌ NO'}`);

if (!resultsMatch) {
	console.log('\nOld result:', oldResult);
	console.log('\nNew result:', newResult);
}
