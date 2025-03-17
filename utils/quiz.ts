import { Song, QuizQuestion } from '@/types';

// Generate a quiz with weighted song selection based on popularity
export function generateQuiz(
  songs: Song[], 
  radioStations: string[], 
  mode: 'regular' | 'pro', 
  questionCount: number = 5
): QuizQuestion[] {
  // Safety check for input data
  if (!songs || songs.length === 0 || !radioStations || radioStations.length === 0) {
    console.error("Invalid input data for quiz generation", { songs: songs?.length, radioStations: radioStations?.length });
    return [];
  }

  try {
    // Calculate the maximum view and like counts
    const maxViewCount = Math.max(...songs.map(song => song.yt_view_count || 0));
    
    // Check if we have any like counts at all
    const hasLikes = songs.some(song => song.yt_like_count && song.yt_like_count > 0);
    
    // Calculate scores based on what data we have
    const songsWithScore = songs.map(song => {
      let combinedScore;
      
      // If we have likes, use combined view/like score, otherwise just use view count
      if (hasLikes) {
        const maxLikeCount = Math.max(...songs.map(song => song.yt_like_count || 0));
        const alpha = 0.5;
        const beta = 0.5;
        combinedScore = alpha * ((song.yt_view_count || 0) / maxViewCount) + 
                         beta * ((song.yt_like_count || 0) / maxLikeCount);
      } else {
        // Fall back to just using views for scoring if likes are not available
        combinedScore = (song.yt_view_count || 0) / maxViewCount;
      }
      
      return {
        ...song,
        combinedScore: isNaN(combinedScore) ? 0.01 : combinedScore // Always ensure a minimal score
      };
    });
    
    // Sort songs based on combined score for filtering
    const sortedSongs = [...songsWithScore].sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
    
    // Select songs based on mode
    let availableSongs;
    if (mode === 'regular') {
      // For regular mode, use the top 30% most popular songs
      // Ensure we have at least questionCount*2 songs to choose from
      const cutoff = Math.max(Math.floor(sortedSongs.length * 0.3), questionCount * 2);
      availableSongs = sortedSongs.slice(0, cutoff);
    } else {
      // For pro mode, use all songs but with weighted selection
      availableSongs = sortedSongs;
    }
    
    console.log(`Available songs for selection: ${availableSongs.length}`);
    
    // Simple random selection as a fallback
    if (availableSongs.length === 0) {
      console.error("No available songs after filtering");
      return [];
    }

    // Use random selection with higher preference for popular songs
    const selectedSongs: Song[] = [];
    const uniqueTitles = new Set<string>();
    
    // Shuffle a bit to avoid selecting only the top songs
    const shuffled = [...availableSongs].sort(() => 0.5 - Math.random());
    
    // Make sure we have at least questionCount songs
    for (const song of shuffled) {
      const key = `${song.song_title}-${song.artist}`;
      if (!uniqueTitles.has(key) && selectedSongs.length < questionCount) {
        uniqueTitles.add(key);
        selectedSongs.push(song);
      }
      
      if (selectedSongs.length >= questionCount) break;
    }
    
    console.log(`Selected ${selectedSongs.length} songs for quiz`);

    // Create quiz questions
    const quizQuestions: QuizQuestion[] = [];
    
    // For each song, create a question with multiple choice options
    for (const song of selectedSongs) {
      // Get all stations except the correct one
      const otherStations = radioStations.filter(station => station !== song.radio_station);
      
      // Choose 3 random incorrect stations
      const randomIncorrectStations = otherStations
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Combine correct and incorrect stations
      const options = [song.radio_station, ...randomIncorrectStations];
      
      // Shuffle options
      const shuffledOptions = options.sort(() => 0.5 - Math.random());
      
      quizQuestions.push({
        song,
        options: shuffledOptions,
        correctAnswer: song.radio_station
      });
    }
    
    console.log(`Created ${quizQuestions.length} quiz questions`);
    return quizQuestions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
}
