#!/usr/bin/env node

/**
 * Script to analyze songs in the GTA Song Quiz database
 * This helps identify the most iconic or popular songs to curate
 */

const fs = require('fs');
const path = require('path');

// Define file paths
const songsFilePath = path.join(__dirname, '../public/data/songs.json');

// Main function
function main() {
  try {
    console.log('GTA Song Quiz - Song Analyzer\n');
    
    // Load the main songs file
    const data = JSON.parse(fs.readFileSync(songsFilePath, 'utf8'));
    
    if (!data.songs || !Array.isArray(data.songs)) {
      console.error('Invalid songs data format');
      process.exit(1);
    }
    
    console.log(`Analyzing ${data.songs.length} songs from ${songsFilePath}\n`);
    
    // Count songs by game
    const gameCount = {};
    for (const song of data.songs) {
      gameCount[song.full_name] = (gameCount[song.full_name] || 0) + 1;
    }
    
    console.log('=== Songs by Game ===');
    for (const [game, count] of Object.entries(gameCount)) {
      console.log(`${game}: ${count} songs`);
    }
    console.log();
    
    // Count songs by radio station
    const stationCount = {};
    for (const song of data.songs) {
      if (song.radio_station) {
        stationCount[song.radio_station] = (stationCount[song.radio_station] || 0) + 1;
      }
    }
    
    console.log('=== Top Radio Stations ===');
    Object.entries(stationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([station, count]) => {
        console.log(`${station}: ${count} songs`);
      });
    console.log();
    
    // Calculate song popularity if view counts are available
    let songsWithViewCount = 0;
    for (const song of data.songs) {
      if (song.yt_view_count) {
        songsWithViewCount++;
        
        // Convert view count to number if it's not already
        if (typeof song.yt_view_count === 'string') {
          song.yt_view_count = parseInt(song.yt_view_count.replace(/,/g, ''), 10) || 0;
        }
        
        // Calculate views per year to normalize for older songs
        if (song.yt_pub_date) {
          const pubYear = new Date(song.yt_pub_date).getFullYear();
          const currentYear = new Date().getFullYear();
          const yearsOnline = Math.max(1, currentYear - pubYear);
          song.views_per_year = Math.round(song.yt_view_count / yearsOnline);
        }
      }
    }
    
    console.log(`Found ${songsWithViewCount} songs with view count data\n`);
    
    if (songsWithViewCount > 0) {
      // Sort by view count
      console.log('=== Top Songs by YouTube Views ===');
      data.songs
        .filter(song => song.yt_view_count)
        .sort((a, b) => b.yt_view_count - a.yt_view_count)
        .slice(0, 20)
        .forEach((song, index) => {
          const viewsFormatted = new Intl.NumberFormat().format(song.yt_view_count);
          console.log(`${index+1}. "${song.song_title}" by ${song.artist} (${song.full_name}) - ${viewsFormatted} views`);
        });
      console.log();
      
      // Sort by views per year if available
      const songsWithViewsPerYear = data.songs.filter(song => song.views_per_year);
      if (songsWithViewsPerYear.length > 0) {
        console.log('=== Top Songs by Views Per Year ===');
        songsWithViewsPerYear
          .sort((a, b) => b.views_per_year - a.views_per_year)
          .slice(0, 20)
          .forEach((song, index) => {
            const viewsFormatted = new Intl.NumberFormat().format(song.views_per_year);
            console.log(`${index+1}. "${song.song_title}" by ${song.artist} (${song.full_name}) - ${viewsFormatted} views/year`);
          });
        console.log();
      }
    }
    
    // Create recommendations for curated list
    console.log('=== Recommended Songs for Curated List ===');
    console.log('Based on a balanced selection across games:\n');
    
    // Set a target of 120 total songs
    const targetTotal = 120;
    
    // Calculate proportional allocation based on game song count
    const totalSongs = data.songs.length;
    const recommendations = {};
    let assignedCount = 0;
    
    // First pass: allocate by proportion
    for (const [game, count] of Object.entries(gameCount)) {
      const proportion = count / totalSongs;
      const recommendedCount = Math.floor(targetTotal * proportion);
      recommendations[game] = recommendedCount;
      assignedCount += recommendedCount;
    }
    
    // Second pass: assign remaining slots
    let remaining = targetTotal - assignedCount;
    const gamesBySongCount = Object.entries(gameCount).sort((a, b) => b[1] - a[1]);
    
    let i = 0;
    while (remaining > 0) {
      recommendations[gamesBySongCount[i % gamesBySongCount.length][0]]++;
      remaining--;
      i++;
    }
    
    // Show recommendations
    for (const [game, count] of Object.entries(recommendations)) {
      console.log(`${game}: ${count} songs (out of ${gameCount[game]} total)`);
    }
    
    console.log('\nTo generate a curated songs list, run:');
    console.log('node utils/generate-curated-songs.js');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main();
