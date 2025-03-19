import { Song } from "@/types";

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
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
 * Get the song for today (or any specific date) using the curated list
 */
export async function getSongForDay(songs: Song[], dateString: string): Promise<Song | null> {
  if (!songs || songs.length === 0) return null;
  
  try {
    // Try to fetch the curated songs list
    const response = await fetch("/data/curated-songs.json");
    
    if (response.ok) {
      const curatedData = await response.json();
      
      if (curatedData.songs && curatedData.songs.length > 0) {
        // Use today's date instead of the specific dateString for consistency
        const today = new Date();
        // Important: Changed the start date to March 19, 2025
        const startDate = new Date('2025-03-19');
        
        // Calculate day number from today
        const currentDate = new Date(dateString);
        // Get the difference in days (can be negative if today is before start date)
        const dayDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        
        // If today is before the start date, use the first song
        if (dayDiff < 0) {
          return curatedData.songs[0];
        }
        
        // First cycle: go through songs in order
        const totalSongs = curatedData.songs.length;
        const cycleCount = Math.floor(dayDiff / totalSongs);
        const indexInCycle = dayDiff % totalSongs;
        
        if (cycleCount === 0) {
          // First cycle - use sequential order
          return curatedData.songs[indexInCycle];
        } else {
          // Subsequent cycles - use a deterministic shuffle based on cycle number
          const shuffledIndex = getShuffledIndex(indexInCycle, cycleCount, totalSongs);
          return curatedData.songs[shuffledIndex];
        }
      }
    }
    
    // If curated songs aren't available or there's an error, fall back to the original method
    console.log("Falling back to full song list method");
  } catch (error) {
    console.error("Error loading curated songs:", error);
    // Fall back to original method below
  }
  
  // Original fallback method using the full songs list
  const dateValue = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = dateValue % songs.length;
  return songs[index];
}

/**
 * Get a shuffled but deterministic index for subsequent cycles
 */
function getShuffledIndex(index: number, cycleNumber: number, totalCount: number): number {
  // Use the cycle number as a seed for our shuffle algorithm
  const seed = cycleNumber * 17; // Arbitrary prime multiplier
  
  // Apply a simple hash function that will give different but deterministic results for each cycle
  const hashedIndex = (index * 31 + seed) % totalCount;
  
  return hashedIndex;
}

/**
 * Calculate difference in days between two date strings
 */
function getDaysDifference(dateStart: string, dateEnd: string): number {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Shuffle an array in-place using Fisher-Yates algorithm
 */
function shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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
