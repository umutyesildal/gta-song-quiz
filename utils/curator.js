#!/usr/bin/env node

/**
 * GTA Song Quiz - Curator Tool
 * A simple interface to run the song curation tools
 */

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\n====================================');
  console.log('   GTA Song Quiz - Curator Tool     ');
  console.log('====================================\n');
  console.log('1. Analyze Songs - Get insights on song popularity and distribution');
  console.log('2. Extract Top 120 Songs - Create curated-songs.json automatically');
  console.log('3. Generate Curated Songs (Interactive) - Create curated-songs.json with manual selection');
  console.log('4. Update Helpers - Apply updated song selection algorithm');
  console.log('5. Exit\n');
  
  rl.question('Choose an option (1-5): ', (answer) => {
    switch (answer) {
      case '1':
        runAnalyzer();
        break;
      case '2':
        extractTopSongs();
        break;
      case '3':
        runInteractiveGenerator();
        break;
      case '4':
        updateHelpers();
        break;
      case '5':
        rl.close();
        console.log('Goodbye!');
        break;
      default:
        console.log('Invalid option. Please try again.');
        showMenu();
    }
  });
}

function runAnalyzer() {
  console.log('\nRunning Song Analyzer...\n');
  
  const analyzer = exec('node utils/analyze-songs.js');
  
  analyzer.stdout.pipe(process.stdout);
  analyzer.stderr.pipe(process.stderr);
  
  analyzer.on('exit', () => {
    rl.question('\nPress Enter to return to main menu...', () => {
      showMenu();
    });
  });
}

function extractTopSongs() {
  console.log('\nExtracting Top 120 Songs...\n');
  
  const extractor = exec('node utils/extract-top-songs.js');
  
  extractor.stdout.pipe(process.stdout);
  extractor.stderr.pipe(process.stderr);
  
  extractor.on('exit', () => {
    rl.question('\nPress Enter to return to main menu...', () => {
      showMenu();
    });
  });
}

function runInteractiveGenerator() {
  console.log('\nRunning Interactive Curated Songs Generator...\n');
  
  const generator = exec('node utils/generate-curated-songs.js');
  
  generator.stdout.pipe(process.stdout);
  generator.stderr.pipe(process.stderr);
  
  generator.on('exit', () => {
    rl.question('\nPress Enter to return to main menu...', () => {
      showMenu();
    });
  });
}

function updateHelpers() {
  console.log('\nUpdating helper functions to use curated song list...');
  
  // This would be an example of what could be done to update the helper functions
  console.log(`
This would update the getSongForDay function to use the curated list.
The following changes have already been made:

1. Modified getSongForDay function to be asynchronous
2. Updated it to first try loading curated-songs.json
3. Added logic to handle cycling through the songs
4. Implemented deterministic selection with different patterns after first cycle

These changes are already in place in your helpers.ts file.
`);
  
  rl.question('\nPress Enter to return to main menu...', () => {
    showMenu();
  });
}

// Start the application
showMenu();
