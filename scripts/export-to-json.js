#!/usr/bin/env node

/**
 * Export MongoDB film data to static JSON file
 *
 * Usage:
 *   npm run export-data
 *   MONGODB_URI=mongodb://192.168.0.50:27017/bechdelTest npm run export-data
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import the schema (relative path from scripts directory)
const filmSchema = require('../src/server/model/schema');

// Default MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bechdelTest';
const OUTPUT_PATH = path.join(__dirname, '../src/app/data/films.json');

async function exportFilms() {
  console.log('Connecting to MongoDB...');
  console.log(`URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')}`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');

    // Create the Film model
    const Film = mongoose.model('Film', mongoose.Schema(filmSchema));

    // Fetch all films sorted by popularity (rating + metascore)
    console.log('Fetching films...');
    const films = await Film.find({})
      .sort({ rating: -1, metascore: -1 })
      .lean()
      .exec();

    console.log(`Found ${films.length} films`);

    if (films.length === 0) {
      console.warn('Warning: No films found in database');
    }

    // Ensure the output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    }

    // Write to JSON file
    const jsonContent = JSON.stringify(films, null, 2);
    fs.writeFileSync(OUTPUT_PATH, jsonContent, 'utf8');

    console.log(`Successfully exported ${films.length} films to ${OUTPUT_PATH}`);
    console.log(`File size: ${(Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(2)} KB`);

    // Print a sample of film titles
    if (films.length > 0) {
      console.log('\nSample films:');
      films.slice(0, 5).forEach((film, i) => {
        console.log(`  ${i + 1}. ${film.title} (${film.year || 'N/A'})`);
      });
      if (films.length > 5) {
        console.log(`  ... and ${films.length - 5} more`);
      }
    }

  } catch (error) {
    console.error('Error exporting films:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the export
exportFilms();
