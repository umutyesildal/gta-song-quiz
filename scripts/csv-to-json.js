const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '../data-maker/songs_data.csv');
const outputPath = path.join(__dirname, '../public/data/songs.json');

try {
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n');
  const headers = lines[0].split(';');
  
  const songs = [];
  const radioStations = new Set();
  const songsByStation = {};
  
  // Process each line (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(';');
    if (values.length !== headers.length) {
      console.warn(`Line ${i} has incorrect number of fields. Skipping.`);
      continue;
    }
    
    const song = {};
    // Map each column to its respective field
    headers.forEach((header, index) => {
      const value = values[index];
      
      // Convert numeric fields
      if (header === 'yt_view_count' || header === 'yt_like_count') {
        song[header] = parseInt(value) || 0;
      } else {
        song[header] = value;
      }
    });
    
    // Add the song to our collection
    songs.push(song);
    
    // Track radio stations
    const station = song.radio_station;
    radioStations.add(station);
    
    // Organize songs by station
    if (!songsByStation[station]) {
      songsByStation[station] = [];
    }
    songsByStation[station].push(song);
  }
  
  // Create the output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to the JSON file
  const output = {
    songs,
    radioStations: Array.from(radioStations),
    songsByStation
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Converted ${songs.length} songs across ${radioStations.size} radio stations to ${outputPath}`);
} catch (error) {
  console.error('Error converting CSV to JSON:', error);
  process.exit(1);
}
