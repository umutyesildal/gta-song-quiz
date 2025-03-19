#!/usr/bin/env node

/**
 * Script to extract top songs by YouTube views
 * and create a curated-songs.json file
 */

const fs = require('fs');
const path = require('path');

// Define file paths
const songsFilePath = path.join(__dirname, '../public/data/songs.json');
const outputFilePath = path.join(__dirname, '../public/data/curated-songs.json');

// Main function
function main() {
  try {
    console.log('GTA Song Quiz - Top Songs Extractor\n');
    
    // Load the main songs file
    const data = JSON.parse(fs.readFileSync(songsFilePath, 'utf8'));
    
    if (!data.songs || !Array.isArray(data.songs)) {
      console.error('Invalid songs data format');
      process.exit(1);
    }
    
    console.log(`Loaded ${data.songs.length} songs from ${songsFilePath}\n`);
    
    // Normalize and calculate view counts
    const songsWithViewData = data.songs.map(song => {
      // Make a copy of the song object
      const songWithData = { ...song };
      
      // Convert view count to number if it's not already
      if (songWithData.yt_view_count) {
        if (typeof songWithData.yt_view_count === 'string') {
          songWithData.yt_view_count = parseInt(songWithData.yt_view_count.replace(/,/g, ''), 10) || 0;
        }
        
        // Calculate views per year to normalize for older songs
        if (songWithData.yt_pub_date) {
          const pubYear = new Date(songWithData.yt_pub_date).getFullYear();
          const currentYear = new Date().getFullYear();
          const yearsOnline = Math.max(1, currentYear - pubYear);
          songWithData.views_per_year = Math.round(songWithData.yt_view_count / yearsOnline);
        }
      } else {
        // If no view count, set to 0
        songWithData.yt_view_count = 0;
        songWithData.views_per_year = 0;
      }
      
      return songWithData;
    });
    
    // Sort by view count
    const sortedByViews = [...songsWithViewData]
      .sort((a, b) => b.yt_view_count - a.yt_view_count);
    
    // Ensure we have balanced representation from each game
    const gameRepresentation = {};
    for (const game of data.gameNames) {
      gameRepresentation[game] = 0;
    }
    
    // Calculate how many songs we want from each game to get 120 total
    const targetTotal = 120;
    const songsPerGame = Math.floor(targetTotal / data.gameNames.length);
    const remainder = targetTotal % data.gameNames.length;
    
    // Create a balanced list with top songs from each game
    const selectedSongs = [];
    
    // First, get the top songs for each game
    for (const game of data.gameNames) {
      const topSongsForGame = sortedByViews
        .filter(song => song.full_name === game)
        .slice(0, songsPerGame + (remainder > 0 ? 1 : 0));
        
      selectedSongs.push(...topSongsForGame);
      gameRepresentation[game] = topSongsForGame.length;
      
      // Decrement remainder if we added an extra song
      if (remainder > 0) {
        remainder--;
      }
    }
    
    // If we haven't reached 120 yet, add more songs from the most popular games
    while (selectedSongs.length < targetTotal) {
      // Find the game with the most songs
      const gamesToAdd = data.gameNames
        .sort((a, b) => {
          const countA = sortedByViews.filter(song => song.full_name === a).length;
          const countB = sortedByViews.filter(song => song.full_name === b).length;
          return countB - countA;
        });
        
      // Add the next most popular song from that game
      for (const game of gamesToAdd) {
        if (selectedSongs.length >= targetTotal) break;
        
        const songsInGame = sortedByViews.filter(song => song.full_name === game);
        const nextSong = songsInGame[gameRepresentation[game]];
        
        if (nextSong) {
          selectedSongs.push(nextSong);
          gameRepresentation[game]++;
        }
      }
    }
    
    // Trim to exactly 120 songs if needed
    while (selectedSongs.length > targetTotal) {
      selectedSongs.pop();
    }
    
    // Sort the final list by views
    const finalSongs = [...selectedSongs].sort((a, b) => b.yt_view_count - a.yt_view_count);
    
    // Remove the calculated fields we added
    const cleanedSongs = finalSongs.map(song => {
      // Keep only the original fields
      const { views_per_year, ...cleanSong } = song;
      return cleanSong;
    });
    
    // Create indices array
    const indices = Array.from({ length: cleanedSongs.length }, (_, i) => i);
    
    // Create the output object
    const output = {
      gameNames: data.gameNames,
      songs: cleanedSongs,
      curatedIndex: {
        description: "This array maps dates to indices in the songs array for daily rotation",
        indices
      }
    };
    
    // Write the output file
    fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
    
    // Print summary
    console.log('=== Top 120 Songs Selected ===\n');
    
    for (const [game, count] of Object.entries(gameRepresentation)) {
      console.log(`${game}: ${count} songs`);
    }
    
    console.log(`\nTotal: ${cleanedSongs.length} songs`);
    console.log(`\nTop 10 songs by views:`);
    
    cleanedSongs.slice(0, 10).forEach((song, index) => {
      const viewsFormatted = new Intl.NumberFormat().format(song.yt_view_count);
      console.log(`${index+1}. "${song.song_title}" by ${song.artist} (${song.full_name}) - ${viewsFormatted} views`);
    });
    
    console.log(`\nSuccess! Created curated songs file at:`);
    console.log(outputFilePath);
    console.log(`\nYou can now edit this file manually if you want to reorder or change songs.`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main();
