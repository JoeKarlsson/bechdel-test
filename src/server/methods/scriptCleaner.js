/**
 * Script Cleaner Module
 * Cleans and optimizes movie scripts to reduce token usage for AI analysis
 */

/**
 * Clean and optimize a movie script for AI analysis
 * @param {string} script - Raw movie script text
 * @returns {Object} Cleaned script data with reduced token count
 */
const cleanScript = (script) => {
    if (!script || typeof script !== 'string') {
        throw new Error('Invalid script input');
    }

    // Remove common script formatting that doesn't add value for analysis
    let cleanedScript = script
        // Remove page numbers and headers
        .replace(/^\s*\d+\s*$/gm, '')
        .replace(/^\s*FADE IN:?\s*$/gmi, '')
        .replace(/^\s*FADE OUT:?\s*$/gmi, '')
        .replace(/^\s*THE END\s*$/gmi, '')
        .replace(/^\s*END\s*$/gmi, '')
        // Remove excessive whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/^\s+$/gm, '')
        // Remove parentheticals that are just directions (keep emotional ones)
        .replace(/\([^)]*(?:beat|pause|looks|turns|walks|sits|stands)[^)]*\)/gi, '')
        // Remove camera directions
        .replace(/^\s*(?:CLOSE UP|WIDE SHOT|MEDIUM SHOT|CUT TO|DISSOLVE TO|PAN TO|ZOOM IN|ZOOM OUT):?\s*$/gmi, '')
        // Remove transition directions
        .replace(/^\s*(?:CUT TO|DISSOLVE TO|FADE TO|SMASH CUT TO):?\s*$/gmi, '')
        // Clean up scene headers but keep essential info
        .replace(/^(INT\.|EXT\.|INTERIOR|EXTERIOR)\s+/gmi, '')
        // Remove time of day from scene headers
        .replace(/\s*-\s*(?:DAY|NIGHT|MORNING|EVENING|DAWN|DUSK)\s*$/gmi, '')
        // Remove excessive punctuation
        .replace(/[.]{3,}/g, '...')
        .replace(/[!]{2,}/g, '!')
        .replace(/[?]{2,}/g, '?')
        // Remove stage directions in brackets
        .replace(/\[[^\]]*\]/g, '')
        // Remove character name formatting but keep the names
        .replace(/^\s*([A-Z][A-Z\s]+)\s*$/gm, '$1')
        // Remove excessive dashes
        .replace(/[-]{3,}/g, '---')
        .trim();

    // Extract character names and dialogue more efficiently
    const characterDialogue = extractCharacterDialogue(cleanedScript);

    // Create a condensed version for AI analysis
    const condensedScript = createCondensedScript(characterDialogue);

    // Calculate token reduction
    const originalLength = script.length;
    const cleanedLength = cleanedScript.length;
    const condensedLength = condensedScript.length;

    return {
        originalScript: script,
        cleanedScript: cleanedScript,
        condensedScript: condensedScript,
        characterDialogue: characterDialogue,
        tokenReduction: {
            original: originalLength,
            cleaned: cleanedLength,
            condensed: condensedLength,
            reductionPercentage: Math.round(((originalLength - condensedLength) / originalLength) * 100)
        }
    };
};

/**
 * Extract character dialogue from script
 * @param {string} script - Cleaned script text
 * @returns {Array} Array of dialogue objects
 */
const extractCharacterDialogue = (script) => {
    const lines = script.split('\n');
    const dialogue = [];
    let currentCharacter = null;
    let currentDialogue = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if line is a character name (all caps, not empty, not scene direction)
        if (line && line === line.toUpperCase() && line.length > 1 && line.length < 50 &&
            !line.includes('.') && !line.includes('(') && !line.includes(')') &&
            !isSceneDirection(line)) {

            // Save previous dialogue if exists
            if (currentCharacter && currentDialogue.trim()) {
                dialogue.push({
                    character: currentCharacter,
                    dialogue: currentDialogue.trim()
                });
            }

            currentCharacter = line;
            currentDialogue = '';
        } else if (currentCharacter && line) {
            // This is dialogue
            currentDialogue += (currentDialogue ? ' ' : '') + line;
        }
    }

    // Add the last dialogue
    if (currentCharacter && currentDialogue.trim()) {
        dialogue.push({
            character: currentCharacter,
            dialogue: currentDialogue.trim()
        });
    }

    return dialogue;
};

/**
 * Check if a line is a scene direction
 * @param {string} line - Line to check
 * @returns {boolean} True if scene direction
 */
const isSceneDirection = (line) => {
    const sceneKeywords = [
        'INT', 'EXT', 'INTERIOR', 'EXTERIOR', 'SCENE', 'ACT', 'CHAPTER',
        'FADE', 'CUT', 'DISSOLVE', 'PAN', 'ZOOM', 'CLOSE', 'WIDE', 'MEDIUM'
    ];

    return sceneKeywords.some(keyword => line.includes(keyword));
};

/**
 * Create a condensed script for AI analysis
 * @param {Array} characterDialogue - Array of dialogue objects
 * @returns {string} Condensed script text
 */
const createCondensedScript = (characterDialogue) => {
    // Group dialogue by character to reduce repetition
    const characterGroups = {};

    characterDialogue.forEach(item => {
        if (!characterGroups[item.character]) {
            characterGroups[item.character] = [];
        }
        characterGroups[item.character].push(item.dialogue);
    });

    // Create condensed format
    let condensed = '';
    Object.keys(characterGroups).forEach(character => {
        condensed += `${character}:\n`;
        characterGroups[character].forEach(dialogue => {
            condensed += `  "${dialogue}"\n`;
        });
        condensed += '\n';
    });

    return condensed.trim();
};

/**
 * Extract key scenes for focused analysis
 * @param {string} script - Original script
 * @returns {Array} Array of key scenes
 */
const extractKeyScenes = (script) => {
    const scenes = script.split(/(?:INT\.|EXT\.|INTERIOR|EXTERIOR)/i);
    const keyScenes = [];

    scenes.forEach((scene, index) => {
        if (scene.trim().length > 100) { // Only include substantial scenes
            const dialogue = extractCharacterDialogue(scene);
            if (dialogue.length > 0) {
                keyScenes.push({
                    sceneNumber: index,
                    content: scene.trim(),
                    dialogue: dialogue,
                    characterCount: new Set(dialogue.map(d => d.character)).size
                });
            }
        }
    });

    return keyScenes;
};

module.exports = {
    cleanScript,
    extractCharacterDialogue,
    extractKeyScenes,
    createCondensedScript
};
