/**
 * Extract YouTube video ID from a YouTube URL
 */
export function extractYouTubeId(url: string): string {
  if (!url) return "";
  
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7] && match[7].length === 11 ? match[7] : "";
}

/**
 * Get today's date as a string in YYYY-MM-DD format (for internal use)
 */
export function getTodayString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

/**
 * Format date as human readable (e.g., "18 March" or "18 March 2025")
 */
export function formatDateReadable(dateStr: string, includeYear = false): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    ...(includeYear && { year: 'numeric' })
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Select a song based on the date
 */
export function getSongForDay(songs: any[], date: string): any {
  if (!songs || songs.length === 0) return null;
  
  // Get the top 2% most popular songs
  const topSongsCount = Math.max(Math.ceil(songs.length * 0.02), 10); // At least 10 songs
  const topSongs = songs.slice(0, topSongsCount);
  
  console.log(`Using top ${topSongsCount} songs (${(topSongsCount/songs.length*100).toFixed(2)}% of total)`);
  
  // Convert date string to a number for seed
  const dateParts = date.split('-');
  const dateNum = parseInt(dateParts.join(''), 10);
  
  // Use date as seed to get consistent song for the same day
  const index = dateNum % topSongs.length;
  return topSongs[index];
}

/**
 * Get random song from the list (for "Change Song" functionality)
 */
export function getRandomSong(songs: any[], excludeSongId?: string): any {
  if (!songs || songs.length === 0) return null;
  
  // Get the top 2% most popular songs
  const topSongsCount = Math.max(Math.ceil(songs.length * 0.02), 10);
  const topSongs = songs.slice(0, topSongsCount);
  
  // Filter out the current song if provided
  const availableSongs = excludeSongId 
    ? topSongs.filter(song => song.yt_vid_link !== excludeSongId) 
    : topSongs;
  
  if (availableSongs.length === 0) return topSongs[0];
  
  // Get random song
  const randomIndex = Math.floor(Math.random() * availableSongs.length);
  return availableSongs[randomIndex];
}

/**
 * Get random game options including the correct answer
 */
export function getGameOptions(allGames: string[], correctGame: string, count: number = 4): string[] {
  // Filter out the correct game and get other options
  const otherGames = allGames.filter(game => game !== correctGame);
  
  // Shuffle and take n-1 games
  const randomGames = [...otherGames]
    .sort(() => 0.5 - Math.random())
    .slice(0, count - 1);
  
  // Combine with correct game and shuffle again
  return [...randomGames, correctGame].sort(() => 0.5 - Math.random());
}
