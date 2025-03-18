import { Song, QuizQuestion } from '@/types';

// Generate a quiz with weighted song selection based on popularity
export function generateQuiz(
  songs: Song[], 
  gameNames: string[], 
  mode: 'regular' | 'pro', 
  questionCount: number = 5
): QuizQuestion[] {
  // Safety check for input data
  if (!songs || songs.length === 0 || !gameNames || gameNames.length === 0) {
    console.error("Invalid input data for quiz generation", { songs: songs?.length, gameNames: gameNames?.length });
    return [];
  }

  try {
    // Sort songs by popularity score
    const sortedSongs = [...songs].sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
    
    // Select songs based on mode
    let availableSongs;
    if (mode === 'regular') {
      // For regular mode, use the top 20% most popular songs
      const cutoff = Math.max(Math.floor(sortedSongs.length * 0.2), questionCount * 2);
      availableSongs = sortedSongs.slice(0, cutoff);
    } else {
      // For pro mode, use less popular songs from top 80%
      const cutoff = Math.floor(sortedSongs.length * 0.2);
      availableSongs = sortedSongs.slice(cutoff);
    }
    
    console.log(`Available songs for selection: ${availableSongs.length}`);
    
    // Simple random selection as a fallback
    if (availableSongs.length === 0) {
      console.error("No available songs after filtering");
      return [];
    }

    // Ensure we have songs from multiple games for better quiz diversity
    const gameMap = new Map<string, Song[]>();
    
    // Group songs by game
    availableSongs.forEach(song => {
      if (!gameMap.has(song.full_name)) {
        gameMap.set(song.full_name, []);
      }
      gameMap.get(song.full_name)?.push(song);
    });
    
    // Make sure we have at least 3 different games
    if (gameMap.size < 3) {
      console.warn("Not enough different games in the dataset, quiz may have limited diversity");
    }
    
    // Select songs ensuring diversity
    const selectedSongs: Song[] = [];
    const selectedGameCounts = new Map<string, number>();
    
    // First pass - try to get one song from each game
    for (const [gameName, gameSongs] of gameMap.entries()) {
      if (selectedSongs.length < questionCount) {
        // Pick a random song from this game
        const randomIndex = Math.floor(Math.random() * gameSongs.length);
        selectedSongs.push(gameSongs[randomIndex]);
        selectedGameCounts.set(gameName, 1);
      }
    }
    
    // If we still need more songs, add additional from any game
    if (selectedSongs.length < questionCount) {
      const remainingSongs = availableSongs.filter(song => 
        !selectedSongs.includes(song)
      );
      
      // Shuffle remaining songs
      const shuffled = [...remainingSongs].sort(() => 0.5 - Math.random());
      
      for (const song of shuffled) {
        if (selectedSongs.length >= questionCount) break;
        
        const gameName = song.full_name;
        const currentCount = selectedGameCounts.get(gameName) || 0;
        
        // Try to limit to max 2 songs per game for better variety
        if (currentCount < 2) {
          selectedSongs.push(song);
          selectedGameCounts.set(gameName, currentCount + 1);
        }
      }
    }
    
    // If we still don't have enough, just add any songs
    if (selectedSongs.length < questionCount) {
      const remainingSongs = availableSongs.filter(song => 
        !selectedSongs.includes(song)
      );
      
      const shuffled = [...remainingSongs].sort(() => 0.5 - Math.random());
      
      while (selectedSongs.length < questionCount && shuffled.length > 0) {
        selectedSongs.push(shuffled.pop()!);
      }
    }
    
    // Shuffle the selected songs
    selectedSongs.sort(() => 0.5 - Math.random());
    
    console.log(`Selected ${selectedSongs.length} songs for quiz`);

    // Create quiz questions
    const quizQuestions: QuizQuestion[] = [];
    
    // For each song, create a question with multiple choice options
    for (const song of selectedSongs) {
      // Get all game names except the correct one
      const otherGames = gameNames.filter(game => game !== song.full_name);
      
      // Choose 3 random incorrect games
      const randomIncorrectGames = otherGames
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Combine correct and incorrect games
      const options = [song.full_name, ...randomIncorrectGames];
      
      // Shuffle options
      const shuffledOptions = options.sort(() => 0.5 - Math.random());
      
      quizQuestions.push({
        song,
        options: shuffledOptions,
        correctAnswer: song.full_name,
        questionType: 'game' // Add this to indicate it's a game name question
      });
    }
    
    console.log(`Created ${quizQuestions.length} quiz questions`);
    return quizQuestions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
}
