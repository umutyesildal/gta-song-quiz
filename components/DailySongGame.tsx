"use client";

import React, { useState, useEffect } from "react";
import SongDisplay from "./SongDisplay";
import GameOptions from "./GameOptions";
import {
  getSongForDay,
  getTodayString,
  getGameOptions,
  formatDateReadable,
} from "@/utils/helpers";
import { Song } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface DailySongGameProps {
  songs: Song[];
  gameNames: string[];
}

type GameState = "loading" | "playing" | "guessed" | "error";

const DailySongGame: React.FC<DailySongGameProps> = ({ songs, gameNames }) => {
  const [todaySong, setTodaySong] = useState<Song | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>("loading");
  const [todayDate, setTodayDate] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const MAX_ATTEMPTS = 2;

  // Load today's song and check if user already played
  useEffect(() => {
    const today = getTodayString();
    setTodayDate(today);

    try {
      // Get today's song
      const songForToday = getSongForDay(songs, today);

      if (!songForToday) {
        setGameState("error");
        return;
      }

      setTodaySong(songForToday);

      // Get game options - randomize them properly
      const gameOpts = getGameOptions(gameNames, songForToday.full_name);
      setOptions(gameOpts);

      // Check if user already played today
      const savedProgress = localStorage.getItem(`gta-song-day-${today}`);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);

          // Only set these values if the game was actually completed
          if (progress.gameComplete === true) {
            setSelectedAnswer(progress.selectedAnswer);
            setIsCorrect(progress.isCorrect);
            setGameState("guessed");

            // Restore wrong guesses
            if (progress.wrongGuesses && Array.isArray(progress.wrongGuesses)) {
              setWrongGuesses(progress.wrongGuesses);
            }

            // Also restore hint state if it was used
            if (progress.hintUsed) {
              setShowHint(true);
            }

            // Restore attempt count
            if (
              typeof progress.attempts === "number" &&
              progress.attempts > 0
            ) {
              setAttempts(progress.attempts);
            } else {
              setAttempts(0);
            }
          } else {
            // User started but didn't finish
            setGameState("playing");

            // Restore partial progress like hints used or attempts
            if (progress.hintUsed) {
              setShowHint(true);
            }

            if (
              typeof progress.attempts === "number" &&
              progress.attempts > 0
            ) {
              setAttempts(progress.attempts);
            } else {
              setAttempts(0);
            }

            if (progress.wrongGuesses && Array.isArray(progress.wrongGuesses)) {
              setWrongGuesses(progress.wrongGuesses);
            }
          }
        } catch (e) {
          console.error("Error parsing saved progress:", e);
          // Reset to fresh state if we can't parse the saved progress
          setGameState("playing");
          setAttempts(0);
          setWrongGuesses([]);
          setShowHint(false);
        }
      } else {
        // Fresh game - no saved progress
        setGameState("playing");
        setAttempts(0);
        setWrongGuesses([]);
        setShowHint(false);
        setSelectedAnswer(null);
      }
    } catch (error) {
      console.error("Failed to setup daily song:", error);
      setGameState("error");
    }
  }, [songs, gameNames]);

  // Handle game option selection
  const handleSelectOption = (option: string) => {
    if (gameState !== "playing" || !todaySong) return;

    const correct = option === todaySong.full_name;

    if (correct) {
      // Correct answer
      setSelectedAnswer(option);
      setIsCorrect(true);
      setGameState("guessed");

      // Show success feedback with animation
      setFeedback("Correct!");

      // Store in localStorage
      localStorage.setItem(
        `gta-song-day-${todayDate}`,
        JSON.stringify({
          date: todayDate,
          selectedAnswer: option,
          wrongGuesses,
          isCorrect: true,
          hintUsed: showHint,
          attempts: attempts + 1,
          gameComplete: true,
        })
      );

      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    } else {
      // Incorrect answer - add to wrong guesses array
      const updatedWrongGuesses = [...wrongGuesses, option];
      setWrongGuesses(updatedWrongGuesses);
      setAttempts((prev) => prev + 1);

      if (attempts + 1 >= MAX_ATTEMPTS) {
        // Out of attempts
        setSelectedAnswer(option);
        setIsCorrect(false);
        setGameState("guessed");
        setFeedback(`Incorrect! The answer is ${todaySong.full_name}`);

        // Store in localStorage
        localStorage.setItem(
          `gta-song-day-${todayDate}`,
          JSON.stringify({
            date: todayDate,
            selectedAnswer: option,
            wrongGuesses: updatedWrongGuesses,
            isCorrect: false,
            hintUsed: showHint,
            attempts: attempts + 1,
            gameComplete: true,
          })
        );

        setTimeout(() => {
          setFeedback(null);
        }, 3000);
      } else {
        // Still have attempts left
        setFeedback(`Incorrect! Try again.`);

        // For incomplete game, save partial progress
        localStorage.setItem(
          `gta-song-day-${todayDate}`,
          JSON.stringify({
            date: todayDate,
            wrongGuesses: updatedWrongGuesses,
            hintUsed: showHint,
            attempts: attempts + 1,
            gameComplete: false,
          })
        );

        setTimeout(() => {
          setFeedback(null);
        }, 2000);
      }
    }
  };

  // Toggle hint to show radio station
  const handleShowHint = () => {
    setShowHint(true);

    // Save that the user viewed the hint
    localStorage.setItem(
      `gta-song-day-${todayDate}`,
      JSON.stringify({
        date: todayDate,
        wrongGuesses,
        hintUsed: true,
        attempts,
        gameComplete: false,
      })
    );
  };

  // Share result
  const handleShare = () => {
    if (!todaySong) return;

    const emojiResult = isCorrect ? "🎮 ✅" : "🎮 ❌";
    const attemptsText = `(${attempts}/${MAX_ATTEMPTS} attempts)`;
    const hintText = showHint ? " 🔍" : "";

    const shareText = `GTA Song of the Day - ${formatDateReadable(
      todayDate,
      false
    )}\n\n"${todaySong.song_title}" by ${
      todaySong.artist
    }\n\n${emojiResult} ${attemptsText}${hintText}`;

    if (navigator.share) {
      navigator
        .share({
          title: "GTA Song of the Day",
          text: shareText,
        })
        .catch(console.error);
    } else {
      // Fallback to clipboard copy
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert("Result copied to clipboard!");
        })
        .catch(console.error);
    }
  };

  if (gameState === "loading") {
    return (
      <div className="text-center p-6 gta-container rounded-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-12 h-12 border-4 border-gta-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading today's song...</p>
        </motion.div>
      </div>
    );
  }

  if (gameState === "error" || !todaySong) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="gta-container p-6 rounded-lg text-center"
      >
        <h2 className="gta-title text-2xl mb-4">Error Loading Today's Song</h2>
        <p className="mb-6 text-gray-400">
          Something went wrong. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gta-yellow text-black rounded font-medium"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="gta-container p-6 rounded-lg w-full max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <motion.h2
            initial={{ x: -10 }}
            animate={{ x: 0 }}
            className="text-lg font-medium text-gray-300"
          >
            Song of the Day
          </motion.h2>
          {/* Only show attempts badge if attempts is greater than 0 */}
          {attempts > 0 && gameState === "playing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-1 bg-orange-500 bg-opacity-20 text-orange-300 text-xs rounded-full"
            >
              {attempts}/{MAX_ATTEMPTS}
            </motion.div>
          )}
        </div>
        <motion.span
          initial={{ x: 10 }}
          animate={{ x: 0 }}
          className="px-3 py-1 border border-zinc-700 bg-zinc-800 text-sm rounded-full text-gray-300"
        >
          {formatDateReadable(todayDate, false)}
        </motion.span>
      </div>

      {/* Video and song info */}
      <SongDisplay
        videoUrl={todaySong.yt_vid_link}
        songTitle={todaySong.song_title}
        artist={todaySong.artist}
        radioStation={todaySong.radio_station}
        showDetails={true}
        showRadioStation={showHint}
      />

      {/* Hint button */}
      <div className="flex justify-start mb-6">
        {gameState === "playing" && !showHint && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShowHint}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-gray-300 rounded text-sm font-medium"
          >
            Show Hint
          </motion.button>
        )}
      </div>

      {/* Game options */}
      <GameOptions
        options={options}
        onSelect={handleSelectOption}
        correctAnswer={
          gameState === "guessed" ? todaySong.full_name : undefined
        }
        wrongGuesses={wrongGuesses}
        disabled={gameState === "guessed"}
      />

      {/* Feedback message */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3 rounded-lg text-center mb-6 ${
              isCorrect || gameState !== "guessed"
                ? "bg-green-900 bg-opacity-20 text-green-300"
                : "bg-red-900 bg-opacity-20 text-red-300"
            }`}
          >
            <p>{feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share button (removed "Try Another Song" button) */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {gameState === "guessed" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="px-5 py-3 bg-zinc-800 border border-zinc-700 text-white rounded font-medium"
          >
            Share Result
          </motion.button>
        )}
      </div>

      {/* Message for guessed state */}
      {gameState === "guessed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          Come back tomorrow for a new song!
        </motion.div>
      )}
    </motion.div>
  );
};

export default DailySongGame;
