#!/usr/bin/env node

/**
 * Script to generate a curated songs list file for GTA Song Quiz
 * 
 * This script reads the main songs.json file and helps you select songs
 * to create a curated-songs.json file with your favorite/most iconic songs.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Set up readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define file paths
const songsFilePath = path.join(__dirname, '../public/data/songs.json');
const outputFilePath = path.join(__dirname, '../public/data/curated-songs.json');

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to select a song
async function selectSong(songs, selectedIndices) {
  console.log('\n=== Available Songs ===');
  
  // Show songs in batches for better readability
  const batchSize = 10;
  const totalSongs = songs.length;
  let currentPosition = 0;
  
  while (currentPosition < totalSongs) {
    // Show a batch of songs
    for (let i = currentPosition; i < Math.min(currentPosition + batchSize, totalSongs); i++) {
      const song = songs[i];
      const isSelected = selectedIndices.includes(i);
      console.log(`[${i+1}] ${isSelected ? '✅' : '  '} "${song.song_title}" by ${song.artist} (${song.full_name})`);
    }
    
    console.log('\nCommands:');
    console.log('- Enter a number to select/deselect a song');
    console.log('- "n" for next page');
    console.log('- "p" for previous page');
    console.log('- "s" to search for a song');
    console.log('- "v" to view currently selected songs');
    console.log('- "d" when done selecting');
    console.log(`Page ${Math.floor(currentPosition/batchSize) + 1}/${Math.ceil(totalSongs/batchSize)}, Selected: ${selectedIndices.length} songs`);
    
    const answer = await askQuestion('\nEnter command: ');
    
    if (answer === 'd') {
      break;
    } else if (answer === 'n') {
      currentPosition = Math.min(currentPosition + batchSize, totalSongs - batchSize);
    } else if (answer === 'p') {
      currentPosition = Math.max(0, currentPosition - batchSize);
    } else if (answer === 's') {
      await searchAndSelect(songs, selectedIndices);
    } else if (answer === 'v') {
      await viewSelected(songs, selectedIndices);
    } else {
      // Try to parse as a song number
      const num = parseInt(answer, 10);
      if (!isNaN(num) && num > 0 && num <= songs.length) {
        const index = num - 1;
        if (selectedIndices.includes(index)) {
          selectedIndices.splice(selectedIndices.indexOf(index), 1);
          console.log(`Deselected: "${songs[index].song_title}" by ${songs[index].artist}`);
        } else {
          selectedIndices.push(index);
          console.log(`Selected: "${songs[index].song_title}" by ${songs[index].artist}`);
        }
      } else {
        console.log('Invalid input. Please try again.');
      }
    }
  }
  
  return selectedIndices;
}

// Search for songs
async function searchAndSelect(songs, selectedIndices) {
  const searchTerm = await askQuestion('Enter search term (song title, artist, or game): ').then(answer => answer.toLowerCase());
  
  const results = songs
    .map((song, index) => ({ song, index }))
    .filter(({ song }) => 
      song.song_title.toLowerCase().includes(searchTerm) ||
      song.artist.toLowerCase().includes(searchTerm) ||
      song.full_name.toLowerCase().includes(searchTerm)
    );
  
  if (results.length === 0) {
    console.log('No songs found matching your search.');
    return;
  }
  
  console.log(`\nFound ${results.length} songs:`);
  for (let i = 0; i < results.length; i++) {
    const { song, index } = results[i];
    const isSelected = selectedIndices.includes(index);
    console.log(`[${index+1}] ${isSelected ? '✅' : '  '} "${song.song_title}" by ${song.artist} (${song.full_name})`);
  }
  
  const answer = await askQuestion('\nEnter song number to select/deselect (or any other key to go back): ');
  const num = parseInt(answer, 10);
  
  if (!isNaN(num) && num > 0 && num <= songs.length) {
    const index = num - 1;
    if (selectedIndices.includes(index)) {
      selectedIndices.splice(selectedIndices.indexOf(index), 1);
      console.log(`Deselected: "${songs[index].song_title}" by ${songs[index].artist}`);
    } else {
      selectedIndices.push(index);
      console.log(`Selected: "${songs[index].song_title}" by ${songs[index].artist}`);
    }
  }
}

// View currently selected songs
async function viewSelected(songs, selectedIndices) {
  if (selectedIndices.length === 0) {
    console.log('No songs selected yet.');
    return;
  }
  
  console.log(`\nYou've selected ${selectedIndices.length} songs:`);
  
  // Sort by game then by song title for better organization
  const selectedSongs = selectedIndices
    .map(index => ({ song: songs[index], index }))
    .sort((a, b) => {
      if (a.song.full_name !== b.song.full_name) {
        return a.song.full_name.localeCompare(b.song.full_name);
      }
      return a.song.song_title.localeCompare(b.song.song_title);
    });
    
  let currentGame = null;
  
  for (const { song, index } of selectedSongs) {
    if (song.full_name !== currentGame) {
      currentGame = song.full_name;
      console.log(`\n--- ${currentGame} ---`);
    }
    console.log(`[${index+1}] "${song.song_title}" by ${song.artist}`);
  }
  
  // Analyze balance of selected songs
  const gameCount = {};
  for (const index of selectedIndices) {
    const gameName = songs[index].full_name;
    gameCount[gameName] = (gameCount[gameName] || 0) + 1;
  }
  
  console.log('\nDistribution by game:');
  for (const [game, count] of Object.entries(gameCount)) {
    const percentage = (count / selectedIndices.length * 100).toFixed(1);
    console.log(`${game}: ${count} songs (${percentage}%)`);
  }
  
  await askQuestion('\nPress Enter to continue...');
}

// Main function
async function main() {
  try {
    console.log('GTA Song Quiz - Curated Songs Generator\n');
    
    // Load the main songs file
    const data = JSON.parse(fs.readFileSync(songsFilePath, 'utf8'));
    
    if (!data.songs || !Array.isArray(data.songs)) {
      console.error('Invalid songs data format');
      process.exit(1);
    }
    
    console.log(`Loaded ${data.songs.length} songs from ${songsFilePath}`);
    
    // How many songs to select
    const targetNumber = await askQuestion('How many songs do you want in your curated list? (recommended: 120) ');
    const targetCount = parseInt(targetNumber, 10) || 120;
    
    console.log(`\nPlease select ${targetCount} songs for your curated list.`);
    console.log('You can navigate through the songs and select your favorites.');
    
    // Selected song indices
    let selectedIndices = [];
    
    // Start the selection process
    selectedIndices = await selectSong(data.songs, selectedIndices);
    
    // Check if we have enough songs
    if (selectedIndices.length === 0) {
      console.log('No songs selected. Exiting without creating a file.');
      process.exit(0);
    }
    
    if (selectedIndices.length < targetCount) {
      const confirm = await askQuestion(`You've only selected ${selectedIndices.length} songs, which is less than the target of ${targetCount}. Continue anyway? (y/n) `);
      if (confirm.toLowerCase() !== 'y') {
        console.log('Please select more songs. Starting selection again...');
        return await main();
      }
    }
    
    if (selectedIndices.length > targetCount) {
      const confirm = await askQuestion(`You've selected ${selectedIndices.length} songs, which is more than the target of ${targetCount}. Would you like to trim the list randomly? (y/n) `);
      if (confirm.toLowerCase() === 'y') {
        // Shuffle and trim
        selectedIndices = shuffleArray([...selectedIndices]).slice(0, targetCount);
        console.log(`List trimmed to ${selectedIndices.length} songs.`);
      }
    }
    
    // Sort indices to maintain original order
    selectedIndices.sort((a, b) => a - b);
    
    // Create the curated songs array
    const curatedSongs = selectedIndices.map(index => data.songs[index]);
    
    // Create indices array
    const indices = Array.from({ length: curatedSongs.length }, (_, i) => i);
    
    // Create the output object
    const output = {
      gameNames: data.gameNames,
      songs: curatedSongs,
      curatedIndex: {
        description: "This array maps dates to indices in the songs array for daily rotation",
        indices
      }
    };
    
    // Write the output file
    fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
    
    console.log(`\nSuccess! Created curated songs file with ${curatedSongs.length} songs at:`);
    console.log(outputFilePath);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Run the script
main();
