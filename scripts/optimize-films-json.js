#!/usr/bin/env node

/**
 * Optimize films.json for lazy loading
 *
 * Creates:
 * - films-summary.json: Lightweight data for list view (~0.5 MB)
 * - films/{id}.json: Individual detail files with full data
 *
 * Usage:
 *   node scripts/optimize-films-json.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '../src/app/data/films.json');
const OUTPUT_DIR = path.join(__dirname, '../src/app/data');
const FILMS_DIR = path.join(OUTPUT_DIR, 'films');

// Fields to include in summary (lightweight list view)
const SUMMARY_FIELDS = [
  '_id',
  'title',
  'year',
  'genres',
  'rated',
  'rating',
  'metascore',
  'urlPoster',
  'idIMDB',
  'urlIMDB',
  'dateUploaded',
  'directors',
  'images',
  'bechdelResults', // Keep basic bechdel results for filtering
  'analyticsSummary', // Keep summary scores
];

function createSummary(film) {
  const summary = {};
  SUMMARY_FIELDS.forEach(field => {
    if (film[field] !== undefined) {
      summary[field] = film[field];
    }
  });

  // Add a simplified plot (first 200 chars)
  if (film.plot) {
    summary.plotSummary = film.plot.substring(0, 200) + (film.plot.length > 200 ? '...' : '');
  }

  return summary;
}

function main() {
  console.log('Reading films.json...');

  if (!fs.existsSync(INPUT_PATH)) {
    console.error('Error: films.json not found at', INPUT_PATH);
    console.log('Run "npm run export-data" first to export from MongoDB');
    process.exit(1);
  }

  const films = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  console.log(`Found ${films.length} films`);

  // Create films directory
  if (!fs.existsSync(FILMS_DIR)) {
    fs.mkdirSync(FILMS_DIR, { recursive: true });
  }

  // Create summary array and individual detail files
  const summaries = [];
  let totalDetailSize = 0;

  films.forEach((film, index) => {
    // Create summary
    const summary = createSummary(film);
    summaries.push(summary);

    // Create detail file
    const detailPath = path.join(FILMS_DIR, `${film._id}.json`);
    const detailContent = JSON.stringify(film, null, 2);
    fs.writeFileSync(detailPath, detailContent, 'utf8');
    totalDetailSize += detailContent.length;

    if ((index + 1) % 10 === 0) {
      console.log(`Processed ${index + 1}/${films.length} films...`);
    }
  });

  // Write summary file
  const summaryPath = path.join(OUTPUT_DIR, 'films-summary.json');
  const summaryContent = JSON.stringify(summaries, null, 2);
  fs.writeFileSync(summaryPath, summaryContent, 'utf8');

  // Calculate sizes
  const originalSize = fs.statSync(INPUT_PATH).size;
  const summarySize = summaryContent.length;

  console.log('\n=== Optimization Complete ===');
  console.log(`Original films.json: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`New films-summary.json: ${(summarySize / 1024).toFixed(2)} KB`);
  console.log(`Individual detail files: ${films.length} files (${(totalDetailSize / 1024 / 1024).toFixed(2)} MB total)`);
  console.log(`Size reduction for initial load: ${((1 - summarySize / originalSize) * 100).toFixed(1)}%`);
  console.log('\nFiles created:');
  console.log(`  ${summaryPath}`);
  console.log(`  ${FILMS_DIR}/*.json (${films.length} files)`);
}

main();
