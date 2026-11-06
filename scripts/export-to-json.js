#!/usr/bin/env node

/**
 * Export MongoDB film data for the public site: one file per film in
 * data/films/<id>.json, which site/ builds from. Films no longer in the
 * database have their files removed.
 *
 * Usage:
 *   npm run export-data
 *   MONGODB_URI="mongodb://admin:password@localhost:27017/bechdelTest?authSource=admin" npm run export-data
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import the schema (relative path from scripts directory)
const filmSchema = require('../src/server/model/schema');

// Default MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bechdelTest';
const OUTPUT_DIR = path.join(__dirname, '../data/films');

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

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // One file per film, named by its database id
    const written = new Set();
    let bytes = 0;
    for (const film of films) {
      const name = `${film._id}.json`;
      const json = JSON.stringify(film, null, 2);
      fs.writeFileSync(path.join(OUTPUT_DIR, name), json, 'utf8');
      written.add(name);
      bytes += Buffer.byteLength(json, 'utf8');
    }

    // Drop files for films that are no longer in the database
    const removed = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.json') && !written.has(f));
    for (const f of removed) fs.unlinkSync(path.join(OUTPUT_DIR, f));

    console.log(`Exported ${films.length} films to ${OUTPUT_DIR} (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
    if (removed.length) console.log(`Removed ${removed.length} films no longer in the database`);

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
