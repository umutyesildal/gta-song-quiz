const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '../data-maker/combined_song_list_youtube.csv');
const outputPath = path.join(__dirname, '../public/data/songs.json');

try {
  console.log('Reading CSV file...');
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  
  const songs = [];
  const gameNames = new Set();
  const songsByGame = {};
  
  // Process each line (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle quoted values correctly (e.g. for values containing commas)
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && line[j+1] === '"') {
        currentValue += '"';
        j++; // Skip the next quote
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Add the last value
    
    if (values.length !== headers.length) {
      console.warn(`Line ${i} has incorrect number of fields (${values.length} instead of ${headers.length}). Skipping.`);
      continue;
    }
    
    const song = {};
    // Map each column to its respective field
    headers.forEach((header, index) => {
      const value = values[index];
      
      // Convert numeric fields
      if (header === 'yt_view_count' || header === 'yt_like_count') {
        song[header] = parseInt(value.replace(/[^\d]/g, '')) || 0;
      } else {
        song[header] = value;
      }
    });
    
    // Calculate popularity score based on views and likes
    // Views have a higher weight than likes (70% views, 30% likes)
    const viewScore = song.yt_view_count || 0;
    const likeScore = song.yt_like_count || 0;
    
    // Calculate years since publication
    const pubDate = song.yt_pub_date ? new Date(song.yt_pub_date) : null;
    const currentDate = new Date();
    const yearsSincePub = pubDate ? (currentDate.getFullYear() - pubDate.getFullYear()) : 1;
    
    // Calculate views per year to normalize for older videos
    song.views_per_year = Math.round(viewScore / Math.max(yearsSincePub, 1));
    
    // Calculate like/view ratio (if views > 0) to identify quality videos
    const likeViewRatio = viewScore > 0 ? likeScore / viewScore : 0;
    
    // Calculate final popularity score (views + likes ratio)
    song.popularity_score = (0.7 * song.views_per_year) + (0.3 * likeScore * 100 * likeViewRatio);
    
    // Add the song to our collection
    songs.push(song);
    
    // Track game names
    const gameName = song.full_name;
    gameNames.add(gameName);
    
    // Organize songs by game
    if (!songsByGame[gameName]) {
      songsByGame[gameName] = [];
    }
    songsByGame[gameName].push(song);
  }
  
  // Sort songs by popularity score
  songs.sort((a, b) => b.popularity_score - a.popularity_score);
  
  // Create the output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to the JSON file
  const output = {
    songs,
    gameNames: Array.from(gameNames),
    songsByGame
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Converted ${songs.length} songs across ${gameNames.size} games to ${outputPath}`);
  
  // Log some information about the data
  console.log('Top 5 most popular songs:');
  songs.slice(0, 5).forEach((song, index) => {
    console.log(`${index + 1}. "${song.song_title}" by ${song.artist} (${song.full_name}) - Score: ${Math.round(song.popularity_score)}`);
  });
} catch (error) {
  console.error('Error converting CSV to JSON:', error);
  process.exit(1);
}
