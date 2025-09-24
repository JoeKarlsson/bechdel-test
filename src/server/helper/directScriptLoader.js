const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const processScript = require('../methods/processScript');
const meta = require('./meta');
const handleError = require('./handleError');

// Database connection setup
const connectToDatabase = async () => {
    const { isDeveloping, MONGODB_URI } = meta;

    if (isDeveloping) {
        try {
            await mongoose.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Connected to MongoDB Atlas!');
        } catch (error) {
            console.error('Database connection error:', error);
            handleError(error);
        }
    } else {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
        };
        try {
            await mongoose.connect(process.env.MONGODB_URI, options);
            console.log('Connected to MongoDB!');
        } catch (error) {
            console.error('Database connection error:', error);
            handleError(error);
        }
    }
};

// Extract title from file path
const extractTitle = (filePath) => {
    const title = path.parse(filePath).name;
    return title;
};

// Get list of available scripts
const getAvailableScripts = () => {
    const scriptsDir = path.join(__dirname, '../../../scripts');
    try {
        const files = fs.readdirSync(scriptsDir);
        return files.filter(file => file.endsWith('.txt'));
    } catch (error) {
        console.error('Error reading scripts directory:', error);
        return [];
    }
};

// Process a single script
const processScriptDirectly = async (scriptPath, title) => {
    try {
        console.log(`Processing script: ${title}`);
        console.log(`Script path: ${scriptPath}`);

        // Check if script file exists
        if (!fs.existsSync(scriptPath)) {
            throw new Error(`Script file not found: ${scriptPath}`);
        }

        const result = await processScript(scriptPath, title, true); // Use enhanced test for direct loading
        console.log('Script processed successfully!');
        console.log('Result:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('Error processing script:', error);
        throw error;
    }
};

// Interactive script selection
const selectScript = (availableScripts) => {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\nAvailable scripts:');
        availableScripts.forEach((script, index) => {
            console.log(`${index + 1}. ${script}`);
        });

        const askForSelection = () => {
            rl.question('\nEnter the number of the script to load (or press Enter for first script): ', (answer) => {
                const selection = answer.trim();

                if (selection === '') {
                    // Default to first script
                    rl.close();
                    resolve(availableScripts[0]);
                    return;
                }

                const index = parseInt(selection, 10) - 1;

                if (isNaN(index) || index < 0 || index >= availableScripts.length) {
                    console.log('Invalid selection. Please try again.');
                    askForSelection();
                } else {
                    rl.close();
                    resolve(availableScripts[index]);
                }
            });
        };

        askForSelection();
    });
};

// Main function to load script directly
const loadScriptDirectly = async (scriptName) => {
    try {
        // Connect to database first
        await connectToDatabase();

        let scriptPath;
        let title;

        if (scriptName) {
            // Use provided script name
            scriptPath = path.join(__dirname, '../../../scripts', scriptName);
            title = extractTitle(scriptName);
        } else {
            // List available scripts and let user choose
            const availableScripts = getAvailableScripts();

            if (availableScripts.length === 0) {
                throw new Error('No scripts found in scripts directory');
            }

            // Interactive selection
            const selectedScript = await selectScript(availableScripts);
            scriptPath = path.join(__dirname, '../../../scripts', selectedScript);
            title = extractTitle(selectedScript);

            console.log(`Selected script: ${selectedScript}`);
        }

        // Process the script
        const result = await processScriptDirectly(scriptPath, title);

        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed.');

        return result;
    } catch (error) {
        console.error('Error in loadScriptDirectly:', error);
        // Ensure database connection is closed even on error
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Handle command line arguments
const main = async () => {
    const args = process.argv.slice(2);
    const scriptName = args[0]; // First argument is the script name

    console.log('=== Direct Script Loader ===');
    console.log('This script loads a movie script directly into the backend without using API endpoints.');
    console.log('');

    await loadScriptDirectly(scriptName);
};

// Run if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    loadScriptDirectly,
    processScriptDirectly,
    getAvailableScripts,
    extractTitle,
    selectScript
};
