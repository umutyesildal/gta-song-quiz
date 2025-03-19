import { Song, QuizQuestion } from "@/types";
import { extractYouTubeId } from "./helpers";

/**
 * Generates a quiz with random songs from the dataset
 * @param songs The full songs database
 * @param gameNames List of all GTA game names
 * @param mode Quiz mode (regular or pro)
 * @param count Number of questions to generate
 * @returns Array of quiz questions
 */
export function generateQuiz(
  songs: Song[],
  gameNames: string[],
  mode: "regular" | "pro" = "regular",
  count: number = 5
): QuizQuestion[] {
  // Group songs by game
  const songsByGame = songs.reduce((acc, song) => {
    if (!acc.has(song.full_name)) {
      acc.set(song.full_name, []);
    }
    acc.get(song.full_name)?.push(song);
    return acc;
  }, new Map<string, Song[]>());

  // Ensure we have enough games with songs for the quiz
  if (songsByGame.size < count) {
    count = songsByGame.size;
  }

  // Create an array of available games
  // Fix: Convert Map iterator to Array before using it
  const availableGames = Array.from(songsByGame.keys());

  // Randomly select games for the quiz
  const selectedGames = new Set<string>();

  // Ensure we don't pick the same game twice
  while (selectedGames.size < count) {
    const randomIndex = Math.floor(Math.random() * availableGames.length);
    selectedGames.add(availableGames[randomIndex]);
  }

  // Create quiz questions
  const questions: QuizQuestion[] = [];

  // Fix: Use Array.from to convert Set to an array before using forEach
  Array.from(selectedGames).forEach((gameName) => {
    const songsForGame = songsByGame.get(gameName) || [];
    
    if (songsForGame.length === 0) return;

    // Pick a random song from this game
    const randomSongIndex = Math.floor(Math.random() * songsForGame.length);
    const selectedSong = songsForGame[randomSongIndex];

    // Generate question options (including the correct answer)
    const otherGames = gameNames.filter((name) => name !== gameName);
    const shuffledOtherGames = otherGames.sort(() => 0.5 - Math.random());
    
    // Take 3 other random games as wrong answers
    const wrongOptions = shuffledOtherGames.slice(0, 3);
    
    // Combine correct and wrong answers, then shuffle
    const allOptions = [gameName, ...wrongOptions].sort(() => 0.5 - Math.random());

    // Add the question with the questionType property
    questions.push({
      song: selectedSong,
      options: allOptions,
      correctAnswer: gameName,
      questionType: 'game'  // Adding the missing property
    });
  });

  return questions;
}
